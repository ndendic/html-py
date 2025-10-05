import * as vscode from 'vscode';
import { VirtualDocumentProvider } from './virtualDocumentProvider';
import { PositionMapper } from './positionMapper';

/**
 * Provides HTML completions within Python string literals
 */
export class HtmlCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private virtualProvider: VirtualDocumentProvider) {}

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null> {
        // Check if we're in an HTML region
        const regionInfo = this.virtualProvider.getRegionAtPosition(document, position);
        if (!regionInfo) {
            return null;
        }

        const { region, index } = regionInfo;

        // Create virtual document
        const virtualUri = await this.getOrCreateVirtualDocument(document, index);
        if (!virtualUri) {
            return null;
        }

        // Map position to virtual document
        const virtualPosition = PositionMapper.pythonToVirtual(position, region);

        // Get completions from HTML language service
        try {
            const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
                'vscode.executeCompletionItemProvider',
                virtualUri,
                virtualPosition,
                context.triggerCharacter
            );

            if (!completions) {
                return null;
            }

            // Map completion ranges back to Python document if needed
            const items = Array.isArray(completions) ? completions : completions.items;
            
            return items.map(item => {
                const newItem = { ...item };
                
                // Map the range if present
                if (item.range) {
                    const range = item.range instanceof vscode.Range 
                        ? item.range 
                        : item.range.replacing;
                    
                    newItem.range = PositionMapper.rangeToPython(range, region);
                }

                return newItem;
            });
        } catch (error) {
            console.error('Error getting HTML completions:', error);
            return null;
        }
    }

    private async getOrCreateVirtualDocument(
        pythonDocument: vscode.TextDocument,
        index: number
    ): Promise<vscode.Uri | null> {
        const region = this.virtualProvider.getRegion(pythonDocument.uri, index);
        if (!region) {
            return null;
        }

        // Create or update virtual document
        this.virtualProvider.updateVirtualDocument(pythonDocument);
        
        // Generate the virtual URI
        const baseName = pythonDocument.uri.path.split('/').pop()?.replace('.py', '') || 'untitled';
        return vscode.Uri.parse(
            `${VirtualDocumentProvider.scheme}://html/${baseName}-${index}.html`
        );
    }
}
