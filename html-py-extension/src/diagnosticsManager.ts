import * as vscode from 'vscode';
import { VirtualDocumentProvider } from './virtualDocumentProvider';
import { PositionMapper } from './positionMapper';

/**
 * Manages diagnostics for HTML regions in Python files
 */
export class DiagnosticsManager {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private virtualDocuments = new Map<string, vscode.Uri>();

    constructor(private virtualProvider: VirtualDocumentProvider) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('html-py');
    }

    /**
     * Set up diagnostic monitoring for a Python document
     */
    public async monitorDocument(pythonDocument: vscode.TextDocument): Promise<void> {
        // Create/update virtual documents
        const virtualUri = this.virtualProvider.createVirtualDocument(pythonDocument);
        
        if (virtualUri) {
            this.virtualDocuments.set(pythonDocument.uri.toString(), virtualUri);
            
            // Open the virtual document to activate HTML language features
            try {
                await vscode.workspace.openTextDocument(virtualUri);
            } catch (error) {
                // Virtual document might not be ready yet, that's okay
            }
        }

        // Update diagnostics
        this.updateDiagnostics(pythonDocument);
    }

    /**
     * Update diagnostics for a Python document by fetching diagnostics from virtual HTML
     */
    public async updateDiagnostics(pythonDocument: vscode.TextDocument): Promise<void> {
        const virtualUri = this.virtualDocuments.get(pythonDocument.uri.toString());
        
        if (!virtualUri) {
            return;
        }

        // Get diagnostics from the virtual HTML document
        const htmlDiagnostics = vscode.languages.getDiagnostics(virtualUri);
        
        if (htmlDiagnostics.length === 0) {
            this.diagnosticCollection.delete(pythonDocument.uri);
            return;
        }

        // Map diagnostics back to Python document
        const region = this.virtualProvider.getRegion(pythonDocument.uri, 0);
        if (!region) {
            return;
        }

        const mappedDiagnostics = htmlDiagnostics.map(diagnostic => {
            const mappedRange = PositionMapper.rangeToPython(diagnostic.range, region);
            
            return new vscode.Diagnostic(
                mappedRange,
                `[HTML] ${diagnostic.message}`,
                diagnostic.severity
            );
        });

        this.diagnosticCollection.set(pythonDocument.uri, mappedDiagnostics);
    }

    /**
     * Clear diagnostics for a document
     */
    public clearDiagnostics(pythonUri: vscode.Uri): void {
        this.diagnosticCollection.delete(pythonUri);
        this.virtualDocuments.delete(pythonUri.toString());
    }

    /**
     * Dispose of all resources
     */
    public dispose(): void {
        this.diagnosticCollection.dispose();
        this.virtualDocuments.clear();
    }
}
