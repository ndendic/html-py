import * as vscode from 'vscode';

export interface HtmlRegion {
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
    content: string;
    rawContent: string;
}

/**
 * Extracts HTML regions from Python source code
 */
export class HtmlExtractor {
    private static readonly HTML_PATTERNS = [
        // my: html = """..."""
        /\b([A-Za-z_][\w]*)\s*:\s*html\s*=\s*(?:[rRfFbBuUtT]{0,2})?("""|''')/g,
        // my_html = """..."""
        /\b([A-Za-z_][\w]*_html)\s*=\s*(?:[rRfFbBuUtT]{0,2})?("""|''')/g,
        // html = """...""" or div = """..."""
        /\b(html|div|section|template)\s*[:=]\s*(?:[rRfFbBuUtT]{0,2})?("""|''')/g,
    ];

    /**
     * Find all HTML regions in a document
     */
    public static extractHtmlRegions(document: vscode.TextDocument): HtmlRegion[] {
        const text = document.getText();
        const regions: HtmlRegion[] = [];

        for (const pattern of this.HTML_PATTERNS) {
            const regex = new RegExp(pattern);
            let match: RegExpExecArray | null;

            while ((match = regex.exec(text)) !== null) {
                const delimiter = match[2]; // """ or '''
                const startOffset = match.index + match[0].length;
                
                // Find the closing delimiter
                const endDelimiterIndex = text.indexOf(delimiter, startOffset);
                if (endDelimiterIndex === -1) {
                    continue; // Unclosed string, skip
                }

                const startPos = document.positionAt(startOffset);
                const endPos = document.positionAt(endDelimiterIndex);
                
                const rawContent = text.substring(startOffset, endDelimiterIndex);
                const content = this.processHtmlContent(rawContent);

                regions.push({
                    startLine: startPos.line,
                    startChar: startPos.character,
                    endLine: endPos.line,
                    endChar: endPos.character,
                    content,
                    rawContent
                });
            }
        }

        return regions;
    }

    /**
     * Check if a position is within an HTML region
     */
    public static isInHtmlRegion(
        position: vscode.Position,
        regions: HtmlRegion[]
    ): HtmlRegion | null {
        for (const region of regions) {
            const start = new vscode.Position(region.startLine, region.startChar);
            const end = new vscode.Position(region.endLine, region.endChar);
            const range = new vscode.Range(start, end);

            if (range.contains(position)) {
                return region;
            }
        }
        return null;
    }

    /**
     * Process HTML content - unescape and normalize indentation
     */
    private static processHtmlContent(rawContent: string): string {
        // Unescape Python string literals
        let content = rawContent
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\');

        // Strip common leading whitespace while preserving relative indentation
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        
        if (nonEmptyLines.length === 0) {
            return content;
        }

        // Find minimum indentation
        const minIndent = Math.min(
            ...nonEmptyLines.map(line => {
                const match = line.match(/^(\s*)/);
                return match ? match[1].length : 0;
            })
        );

        // Remove minimum indentation from all lines
        const normalized = lines.map(line => {
            if (line.trim().length === 0) {
                return '';
            }
            return line.substring(minIndent);
        }).join('\n');

        return normalized;
    }

    /**
     * Get the leading whitespace that was removed during processing
     */
    public static getIndentation(rawContent: string): number {
        const lines = rawContent.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        
        if (nonEmptyLines.length === 0) {
            return 0;
        }

        const minIndent = Math.min(
            ...nonEmptyLines.map(line => {
                const match = line.match(/^(\s*)/);
                return match ? match[1].length : 0;
            })
        );

        return minIndent;
    }
}
