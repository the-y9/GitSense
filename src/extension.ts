import * as vscode from 'vscode';
import { trackActivity } from './commands/activityTracker';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "gitime" is now active!');
	trackActivity();

	const disposable = vscode.commands.registerCommand('gitime.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Gitime!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
