import * as vscode from 'vscode';
import { VirtualDocumentProvider } from './virtualDocumentProvider';
import { HtmlCompletionProvider } from './completionProvider';
import { DiagnosticsManager } from './diagnosticsManager';

let virtualProvider: VirtualDocumentProvider;
let diagnosticsManager: DiagnosticsManager;
let changeTimeout: NodeJS.Timeout | undefined;

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('HTML-PY extension is now active');

    // Create virtual document provider
    virtualProvider = new VirtualDocumentProvider();
    
    // Register the virtual document provider
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(
            VirtualDocumentProvider.scheme,
            virtualProvider
        )
    );

    // Create diagnostics manager
    diagnosticsManager = new DiagnosticsManager(virtualProvider);
    context.subscriptions.push(diagnosticsManager);

    // Register completion provider for Python files
    const completionProvider = new HtmlCompletionProvider(virtualProvider);
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'python' },
            completionProvider,
            '<', '/', ' ', '=', '"', "'"
        )
    );

    // Monitor open Python documents
    vscode.workspace.textDocuments.forEach(document => {
        if (document.languageId === 'python') {
            processDocument(document);
        }
    });

    // Listen for document open events
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (document.languageId === 'python') {
                processDocument(document);
            }
        })
    );

    // Listen for document changes with debouncing
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'python') {
                // Clear existing timeout
                if (changeTimeout) {
                    clearTimeout(changeTimeout);
                }

                // Debounce updates to avoid excessive processing
                changeTimeout = setTimeout(() => {
                    processDocument(event.document);
                }, 300);
            }
        })
    );

    // Listen for document close events
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(document => {
            if (document.languageId === 'python') {
                virtualProvider.clearCache(document.uri);
                diagnosticsManager.clearDiagnostics(document.uri);
            }
        })
    );

    // Enable Emmet in Python files for HTML regions
    vscode.workspace.getConfiguration('emmet').update(
        'includeLanguages',
        { python: 'html' },
        vscode.ConfigurationTarget.Global
    );

    console.log('HTML-PY extension setup complete');
}

/**
 * Process a Python document to extract HTML and set up tooling
 */
async function processDocument(document: vscode.TextDocument): Promise<void> {
    try {
        // Update virtual document
        virtualProvider.updateVirtualDocument(document);

        // Update diagnostics
        await diagnosticsManager.monitorDocument(document);
    } catch (error) {
        console.error('Error processing document:', error);
    }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
    if (changeTimeout) {
        clearTimeout(changeTimeout);
    }
    console.log('HTML-PY extension deactivated');
}
