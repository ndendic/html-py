import * as vscode from 'vscode';
import { HtmlExtractor, HtmlRegion } from './htmlExtractor';

/**
 * Provides virtual HTML documents for embedded HTML in Python files
 */
export class VirtualDocumentProvider implements vscode.TextDocumentContentProvider {
    static scheme = 'html-py-virtual';
    
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private cache = new Map<string, string>();
    private regionCache = new Map<string, HtmlRegion[]>();

    readonly onDidChange = this._onDidChange.event;

    /**
     * Provide content for a virtual document
     */
    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.cache.get(uri.toString()) || '';
    }

    /**
     * Create a virtual document for a Python file
     */
    public createVirtualDocument(pythonDocument: vscode.TextDocument): vscode.Uri | null {
        const regions = HtmlExtractor.extractHtmlRegions(pythonDocument);
        
        if (regions.length === 0) {
            return null;
        }

        // For now, use the first HTML region found
        // In a more sophisticated implementation, we could handle multiple regions
        const region = regions[0];
        
        const virtualUri = this.getVirtualUri(pythonDocument.uri, 0);
        this.cache.set(virtualUri.toString(), region.content);
        this.regionCache.set(pythonDocument.uri.toString(), regions);
        
        return virtualUri;
    }

    /**
     * Update virtual document when Python document changes
     */
    public updateVirtualDocument(pythonDocument: vscode.TextDocument): void {
        const regions = HtmlExtractor.extractHtmlRegions(pythonDocument);
        this.regionCache.set(pythonDocument.uri.toString(), regions);

        if (regions.length > 0) {
            const region = regions[0];
            const virtualUri = this.getVirtualUri(pythonDocument.uri, 0);
            this.cache.set(virtualUri.toString(), region.content);
            this._onDidChange.fire(virtualUri);
        }
    }

    /**
     * Get the HTML region for a specific virtual document
     */
    public getRegion(pythonUri: vscode.Uri, index: number = 0): HtmlRegion | null {
        const regions = this.regionCache.get(pythonUri.toString());
        return regions && regions[index] ? regions[index] : null;
    }

    /**
     * Get all HTML regions for a Python document
     */
    public getRegions(pythonUri: vscode.Uri): HtmlRegion[] {
        return this.regionCache.get(pythonUri.toString()) || [];
    }

    /**
     * Find which region contains a specific position
     */
    public getRegionAtPosition(
        pythonDocument: vscode.TextDocument,
        position: vscode.Position
    ): { region: HtmlRegion; index: number } | null {
        const regions = this.getRegions(pythonDocument.uri);
        const region = HtmlExtractor.isInHtmlRegion(position, regions);
        
        if (region) {
            const index = regions.indexOf(region);
            return { region, index };
        }
        
        return null;
    }

    /**
     * Generate a unique URI for a virtual HTML document
     */
    private getVirtualUri(pythonUri: vscode.Uri, index: number): vscode.Uri {
        const baseName = pythonUri.path.split('/').pop()?.replace('.py', '') || 'untitled';
        return vscode.Uri.parse(
            `${VirtualDocumentProvider.scheme}://html/${baseName}-${index}.html`
        );
    }

    /**
     * Clear cache for a Python document
     */
    public clearCache(pythonUri: vscode.Uri): void {
        this.regionCache.delete(pythonUri.toString());
        
        // Clear all virtual documents associated with this Python file
        const prefix = pythonUri.toString();
        for (const key of this.cache.keys()) {
            if (key.includes(prefix)) {
                this.cache.delete(key);
            }
        }
    }
}
