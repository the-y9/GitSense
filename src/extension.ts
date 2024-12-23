import * as vscode from 'vscode';
import { generateSummary } from './utils/summaryGeneration';
import { githubService } from './utils/githubApi';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "gitime" is now active!');

	githubService.getToken();

	const disposable = vscode.commands.registerCommand('gitime.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Gitime!');
	});
	const newCommand = vscode.commands.registerCommand('gitime.summary', async() => {
		const summary = await generateSummary();
		vscode.window.showInformationMessage(summary || "No summary generated.");
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(newCommand);
}

export function deactivate() {}
