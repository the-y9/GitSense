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

// import * as vscode from 'vscode';

// interface CodeChange {
//     filePath: string;
//     content: string;
//     timestamp: number;
// }

// export class ActivityTracker {
//     private codeHistory: CodeChange[] = [];
//     private maxHistorySize: number = 100; // Configurable maximum history size
    
//     constructor() {
//         this.setupEventListeners();
//     }

//     private setupEventListeners() {
//         vscode.workspace.onDidSaveTextDocument((event) => {
//             const editor = vscode.window.activeTextEditor;
//             if (!editor) {
//                 return;
//             }
            
//             this.trackChange(editor);
//         });
//     }

//     private trackChange(editor: vscode.TextEditor) {
//         const text = editor.document.getText();
//         const filePath = editor.document.fileName;
        
//         const change: CodeChange = {
//             filePath,
//             content: text,
//             timestamp: Date.now()
//         };

//         this.codeHistory.push(change);
//         console.log("code history is", this.codeHistory);

//         // Maintain history size limit
//         if (this.codeHistory.length > this.maxHistorySize) {
//             this.codeHistory.shift(); // Remove oldest entry
//         }

//         console.log('New code change tracked:', change);
//     }

//     public getChangesInLastHour(): CodeChange[] {
//         const oneHourAgo = Date.now() - (60 * 60 * 1000);
//         return this.codeHistory.filter(change => change.timestamp >= oneHourAgo);
//     }

//     public getChangesByFilePath(filePath: string): CodeChange[] {
//         return this.codeHistory.filter(change => change.filePath === filePath);
//     }

//     public getAllChanges(): CodeChange[] {
//         return [...this.codeHistory];
//     }

//     public getFormattedSummary(): string {
//         let summary = '';
        
//         for (const change of this.codeHistory) {
//             summary += `\nFile Path: ${change.filePath}\n`;
//             summary += `Timestamp: ${new Date(change.timestamp).toISOString()}\n`;
//             summary += `Code:\n${change.content}\n`;
//             summary += '----------------------------------------\n';
//         }
        
//         return summary;
//     }

//     public clearHistory() {
//         this.codeHistory = [];
//     }
// }

// // Usage example
// export function initializeActivityTracker(): ActivityTracker {
//     const tracker = new ActivityTracker();
//     return tracker;
// }

import * as vscode from 'vscode';

interface codeChange {
    filepath: string;
    content: string;
    timestamp: number;
}

export class ActivityTracker {
    private codeHistory: codeChange[] =[];
    private maxHistorySize: number = 100;

    constructor(){
        this.setupEventListeners();
    }

    //! this method sets up the event listeners that will track the changes
    private setupEventListeners(){
        vscode.workspace.onDidSaveTextDocument((e)=>{
            const editor = vscode.window.activeTextEditor;

            if(!editor){
                return;
            }
            this.trackChange(editor);
        });
    }

    //! this method tracks the change done by the user in their file and stores it in the codeHistory array
    private trackChange(editor: vscode.TextEditor){
        const text = editor.document.getText();
        const filepath = editor.document.fileName;

        const change: codeChange = {
            filepath,
            content: text,
            timestamp: Date.now()
        };
        
        this.codeHistory.push(change);
        console.log("code history is", this.codeHistory);

        if(this.codeHistory.length > this.maxHistorySize){
            this.codeHistory.shift();
        }
    }

    //! this method returns all the changes available in the codeHistory array
    public getAllChanges(): codeChange[]{
        return [...this.codeHistory];
    }

    //! this method returns the summary so that it can be analyzed by AI
    public getFormattedSummary(): string{
        let summary = '';

        for(const change of this.codeHistory){
            summary += `\nFile Path: ${change.filepath}\n`;
            summary += `Timestamp: ${new Date(change.timestamp).toLocaleString()}\n`;
            summary += `Code:\n${change.content}\n`;
            summary += '----------------------------------------\n';
        }

        return summary;
    }

    //! this method clears the history of the codeHistory array
    public clearHistory(){
        this.codeHistory = [];
    }
}

export function initializeActivityTracker(): ActivityTracker {
    const tracker = new ActivityTracker();
    return tracker;
}

export const tracker = initializeActivityTracker();