import * as vscode from 'vscode';
import { pushSummary } from './utils/summaryGeneration';
import { GithubService } from './utils/githubApi';
import { initializeGithubService } from './utils/githubApi';

let githubService: GithubService;

export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "gitime" is now active!');

	githubService = initializeGithubService(context);
    await githubService.getToken();

	pushSummary(githubService);
	

	const disposable = vscode.commands.registerCommand('gitime.startGitime', () => {
		vscode.window.showInformationMessage('Gitime is in action!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
