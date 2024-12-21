// import * as vscode from 'vscode';

// export function trackActivity(){

//     let codeSaved = '';
//     let previousFilePath = '';

//     vscode.workspace.onDidSaveTextDocument((event) => {
//         const editor = vscode.window.activeTextEditor;
//         // console.log("editor is", editor);
//         if (!editor) {
//             return;
//         }
//         const text = editor.document.getText();
//         const filePath = editor.document.fileName;

//         if(filePath === previousFilePath){
//             codeSaved = "file path is: " + filePath + "\n" +  "the code is:" + text;
//         }else{
//             codeSaved += "\n\n" + "file path is: " + filePath + "\n" +  "the code is:" + text;
//         }
//         previousFilePath = filePath;
//         console.log('Code saved:', codeSaved);
//     });
// }


//! Better approach

import * as vscode from 'vscode';

interface CodeChange {
    filePath: string;
    content: string;
    timestamp: number;
}

export class ActivityTracker {
    private codeHistory: CodeChange[] = [];
    private maxHistorySize: number = 100; // Configurable maximum history size
    
    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        vscode.workspace.onDidSaveTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            
            this.trackChange(editor);
        });
    }

    private trackChange(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        const filePath = editor.document.fileName;
        
        const change: CodeChange = {
            filePath,
            content: text,
            timestamp: Date.now()
        };

        this.codeHistory.push(change);

        // Maintain history size limit
        if (this.codeHistory.length > this.maxHistorySize) {
            this.codeHistory.shift(); // Remove oldest entry
        }

        console.log('New code change tracked:', change);
    }

    public getChangesInLastHour(): CodeChange[] {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return this.codeHistory.filter(change => change.timestamp >= oneHourAgo);
    }

    public getChangesByFilePath(filePath: string): CodeChange[] {
        return this.codeHistory.filter(change => change.filePath === filePath);
    }

    public getAllChanges(): CodeChange[] {
        return [...this.codeHistory];
    }

    public getFormattedSummary(): string {
        let summary = '';
        
        for (const change of this.codeHistory) {
            summary += `\nFile Path: ${change.filePath}\n`;
            summary += `Timestamp: ${new Date(change.timestamp).toISOString()}\n`;
            summary += `Code:\n${change.content}\n`;
            summary += '----------------------------------------\n';
        }
        
        return summary;
    }

    public clearHistory() {
        this.codeHistory = [];
    }
}

// Usage example
export function initializeActivityTracker(): ActivityTracker {
    const tracker = new ActivityTracker();
    return tracker;
}