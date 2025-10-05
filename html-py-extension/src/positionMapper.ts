import * as vscode from 'vscode';
import { HtmlRegion } from './htmlExtractor';

/**
 * Maps positions between Python source and virtual HTML documents
 */
export class PositionMapper {
    /**
     * Convert a position in the Python document to a position in the virtual HTML document
     */
    public static pythonToVirtual(
        pythonPos: vscode.Position,
        region: HtmlRegion
    ): vscode.Position {
        // Calculate the line offset within the HTML region
        const lineOffset = pythonPos.line - region.startLine;
        
        if (lineOffset < 0) {
            return new vscode.Position(0, 0);
        }

        // For the first line of the HTML region, adjust for the starting character
        if (lineOffset === 0) {
            const charOffset = pythonPos.character - region.startChar;
            return new vscode.Position(0, Math.max(0, charOffset));
        }

        // For subsequent lines, just use the line offset
        const lines = region.rawContent.split('\n');
        if (lineOffset >= lines.length) {
            return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
        }

        return new vscode.Position(lineOffset, pythonPos.character);
    }

    /**
     * Convert a position in the virtual HTML document back to the Python document
     */
    public static virtualToPython(
        virtualPos: vscode.Position,
        region: HtmlRegion
    ): vscode.Position {
        // Add the region's starting line
        const pythonLine = region.startLine + virtualPos.line;
        
        // For the first line, add the starting character offset
        if (virtualPos.line === 0) {
            return new vscode.Position(pythonLine, region.startChar + virtualPos.character);
        }

        // For subsequent lines, use the character position as-is
        return new vscode.Position(pythonLine, virtualPos.character);
    }

    /**
     * Convert a range from Python to virtual HTML
     */
    public static rangeToVirtual(
        pythonRange: vscode.Range,
        region: HtmlRegion
    ): vscode.Range {
        const start = this.pythonToVirtual(pythonRange.start, region);
        const end = this.pythonToVirtual(pythonRange.end, region);
        return new vscode.Range(start, end);
    }

    /**
     * Convert a range from virtual HTML back to Python
     */
    public static rangeToPython(
        virtualRange: vscode.Range,
        region: HtmlRegion
    ): vscode.Range {
        const start = this.virtualToPython(virtualRange.start, region);
        const end = this.virtualToPython(virtualRange.end, region);
        return new vscode.Range(start, end);
    }
}
