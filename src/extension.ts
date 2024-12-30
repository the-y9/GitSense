import * as vscode from 'vscode';
import { pushSummary } from './utils/summaryGeneration';
import { GithubService } from './utils/githubApi';
import { initializeGithubService } from './utils/githubApi';
import { getEnv } from './utils/summaryGeneration';
import { tracker } from './utils/activityTracker';

let githubService: GithubService;

export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "GitSense" is now active!');

	githubService = initializeGithubService(context);
    // await githubService.getToken();
    await githubService.checkSession();
	getEnv(context);
	pushSummary(githubService);
	

	const disposable = vscode.commands.registerCommand('gitsense.runGitSense', () => {
		vscode.window.showInformationMessage('GitSense is running!');
	});

	const disposable2 = vscode.commands.registerCommand('gitsense.updateToken', () => {
		githubService.updateToken();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {
	tracker.dispose();
}
