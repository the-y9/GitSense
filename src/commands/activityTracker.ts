import * as vscode from 'vscode';

export function trackActivity(){

    let codeSaved = '';
    let previousFilePath = '';

    vscode.workspace.onDidSaveTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        // console.log("editor is", editor);
        if (!editor) {
            return;
        }
        const text = editor.document.getText();
        const filePath = editor.document.fileName;

        if(filePath === previousFilePath){
            codeSaved = "file path is: " + filePath + "\n" +  "the code is:" + text;
        }else{
            codeSaved += "\n\n" + "file path is: " + filePath + "\n" +  "the code is:" + text;
        }
        previousFilePath = filePath;
        console.log('Code saved:', codeSaved);
    });
}