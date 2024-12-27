import * as vscode from "vscode";
const { Octokit } = require("@octokit/rest");
export class GithubService {

  public Info: {
    token: string | undefined;
    username: string | undefined;
    octokit: any;
    git: any;
  };

  constructor(private context: vscode.ExtensionContext) {
    this.Info = {
      token: undefined,
      username: undefined,
      octokit: undefined,
      git: undefined,
    };
  }

  //! Getting token and storing key information of User
  //! This getToken method will run only 1 time when the extension is activated and for updation we use updateToken method
  public async getToken() {

    let token = await this.context.secrets.get("githubPAT");
    console.log("token is:", token );

    if(!token){
      token = await vscode.window.showInputBox({
        prompt:
          "Enter your github personal access token (PAT) with access to repo",
        placeHolder: "ghp_xxx...",
        ignoreFocusOut: true,
        password: true,
      });
      if (!token) {
        return vscode.window.showWarningMessage("PAT is required, run `Update Token` to enter PAT");
      }
      await this.context.secrets.store("githubPAT", token);
    }

    this.Info.token = token;
    this.Info.octokit = new Octokit({ auth: token });

    try {
      const { data } = await this.Info.octokit.users.getAuthenticated();
      this.Info.username = data.login;
      if (!this.Info.username) {
         return vscode.window.showErrorMessage(
          "Error setting Github, Kindly check you PAT and run `Update Token` again to enter PAT"
        );
      }
      console.log("Username is:", this.Info.username);
      vscode.window.showInformationMessage(`Github account ${this.Info.username} set for Gitime Extension`);
      this.createRepo();
    } catch (error) {
      console.log("Error setting username", error);
      await this.context.secrets.delete("githubPAT");
      return vscode.window.showErrorMessage(
        "Error setting Github, Kindly check you PAT and run `Update Token` again to enter PAT"
      );
    }
  }

  //! Method to update the token
  public async updateToken(){
    let token = await this.context.secrets.get("githubPAT");
    console.log("token is:", token );
    await this.context.secrets.delete("githubPAT");
    token = await this.context.secrets.get("githubPAT");
    console.log("Token after deletion is ", token );

    this.Info.token = undefined;
    this.Info.username = undefined;
    this.Info.octokit = undefined;

     token = await vscode.window.showInputBox({
      prompt:
        "Enter your github personal access token (PAT) with access to repo",
      placeHolder: "ghp_xxx...",
      ignoreFocusOut: true,
      password: true,
    });
    if (!token) {
      return vscode.window.showWarningMessage("PAT is required, run `Update Token` again to enter PAT");
    }
    await this.context.secrets.store("githubPAT", token);

    this.Info.token = token;
    this.Info.octokit = new Octokit({ auth: token });

    try {
      const { data } = await this.Info.octokit.users.getAuthenticated();
      this.Info.username = data.login;
      if (!this.Info.username) {
        return vscode.window.showErrorMessage(
          "Error setting Github, Kindly check you PAT and run `Update Token` again to enter PAT"
        );
      }
      console.log("Username is:", this.Info.username);
      vscode.window.showInformationMessage(`Github account ${this.Info.username} set for Gitime Extension`);
      this.createRepo();
    } catch (error) {
      console.log("Error setting username", error);
      await this.context.secrets.delete("githubPAT");
      return vscode.window.showErrorMessage(
        "Error setting Github, Kindly check you PAT and run `Update Token` again to enter PAT"
      );
    }
  }

  //! Creating repository for summaries
  public async createRepo() {

    if (!this.Info.octokit || !this.Info.username) {
      return vscode.window.showErrorMessage(
        "Error setting Github, Kindly check you PAT"
      );
    }
    let repoExists = false;

    try {

      await this.Info.octokit.repos.get({  //! Checking if repo exists
        owner: this.Info.username,
        repo: "AutoGitime",
      });
      repoExists = true;
      console.log("Repository already exists");
    } catch (error) {
      console.log("Repo not exist | Error getting repository:", error);
    }

    if(repoExists){   //! If repo exist move to initializeRepo method else create a new repo
      await this.initializeRepo();
    }else{
      try {
        await this.Info.octokit.repos.createForAuthenticatedUser({
          name: "AutoGitime",
          private: false,
          description:
            "Repository for tracking code activity via Gitime extension",
        });
        console.log("Created new repository: AutoGitime");
        this.initializeRepo();
      } catch (error) {
        console.log("Error creating repository:", error);
      }
    }
  }

  //! Initializing repository with Readme.md file
  public async initializeRepo() {
    if(!this.Info.octokit || !this.Info.username){
      return vscode.window.showErrorMessage("Error setting Github, Kindly check you PAT");
    }

    try {
      try {
        await this.Info.octokit.repos.getContent({
          owner: this.Info.username!,
          repo: "AutoGitime",
          path: "README.md"
        });
      } catch (error) {
        await this.Info.octokit.repos.createOrUpdateFileContents({
          owner: this.Info.username!,
          repo: "AutoGitime",
          path: "README.md",
          message: "Initialize gitime repository",
          content: Buffer.from("# Gitime\nTracking my coding activity using VS Code extension").toString("base64")
        });
      }
    } catch (error) {
      console.error("Error initializing repository:", error);
      vscode.window.showErrorMessage("Failed to initialize repository");
    }
  }

  //! Method to save the summary in the repository
  public async saveSummary(summary: string) {
    if (!this.Info.octokit || !this.Info.username) {
      console.log("No octokit or username found");
      return vscode.window.showErrorMessage("GitHub service not initialized, Kindly check PAT and run `Update Token` to enter PAT");
    }
    try {
      const date = new Date();
      const fileName = `summaries/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}.md`;
      
      let currentContent = '';
      let fileSha;
      
      try {
        const response = await this.Info.octokit.repos.getContent({ //! Try to get existing content
          owner: this.Info.username,
          repo: "AutoGitime",
          path: fileName
        });
        
        if ('content' in response.data) {
          currentContent = Buffer.from(response.data.content, 'base64').toString();
          fileSha = response.data.sha;
        }
        console.log("Fethced existing content");

      } catch {
        console.log("File doesn't exist yet, creating it");
      }

      //! Format new content
      const timeString = date.toLocaleTimeString();
      const newContent = currentContent ? 
        `${currentContent}\n\n## ${timeString}\n${summary}` :
        `# Activity Summary for ${date.toLocaleDateString()}\n\n## ${timeString}\n${summary}`;

      //! Create or update file
      await this.Info.octokit.repos.createOrUpdateFileContents({
        owner: this.Info.username,
        repo: "AutoGitime",
        path: fileName,
        message: `Add activity summary for ${timeString}`,
        content: Buffer.from(newContent).toString('base64'),
        ...(fileSha ? { sha: fileSha } : {})
      });

      console.log("Successfully saved summary in account: ", this.Info.username);
      vscode.window.showInformationMessage(`Successfully commited and pushed activity summary in ${this.Info.username}'s account`);
    } catch (error) {
      console.error("Failed to save summary:", error);
      vscode.window.showErrorMessage("Failed to save activity summary");
    }
  }
}

export function initializeGithubService(context: vscode.ExtensionContext) {
  const githubService = new GithubService(context);
  return githubService;
}

// export const githubService = initializeGithubService();

// export class GitHubService {
//     private octokit: Octokit;
//     private readonly repoName = 'gitime';
//     private timer: NodeJS.Timer | null = null;

//     constructor() {
//         // Initialize without token first
//         this.octokit = new Octokit();
//     }

//     // Setup method to be called when extension activates
//     async setup() {
//         const token = await this.getOrRequestToken();
//         this.octokit = new Octokit({ auth: token });
//         await this.ensureRepositoryExists();
//         this.startAutoCommits();
//     }

//     private async getOrRequestToken(): Promise<string> {
//         // First check if token exists in settings
//         const config = vscode.workspace.getConfiguration('gitime');
//         let token = config.get<string>('githubToken');

//         if (!token) {
//             // If no token, prompt user
//             token = await vscode.window.showInputBox({
//                 prompt: 'Please enter your GitHub Personal Access Token (needs repo access)',
//                 password: true, // Hides the input
//                 ignoreFocusOut: true, // Keeps prompt open when focus is lost
//                 placeHolder: 'ghp_xxx...',
//                 validateInput: (input) => {
//                     return input.startsWith('ghp_') ? null : 'Token should start with ghp_';
//                 }
//             });

//             if (!token) {
//                 throw new Error('GitHub token is required for this extension to work');
//             }

//             // Save token in VSCode settings
//             await config.update('githubToken', token, true);
//         }

//         return token;
//     }

//     private async ensureRepositoryExists() {
//         try {
//             const { data: user } = await this.octokit.users.getAuthenticated();

//             try {
//                 // Check if repo exists
//                 await this.octokit.repos.get({
//                     owner: user.login,
//                     repo: this.repoName
//                 });
//                 console.log('Repository already exists');
//             } catch {
//                 // Create new repository if it doesn't exist
//                 await this.octokit.repos.createForAuthenticatedUser({
//                     name: this.repoName,
//                     private: true,
//                     description: 'Automated code activity tracking and summaries',
//                     auto_init: true // Creates with a README
//                 });
//                 console.log('Created new repository: gitime');
//                 vscode.window.showInformationMessage('Created new gitime repository in your GitHub account');
//             }
//         } catch (error) {
//             vscode.window.showErrorMessage(`Failed to setup GitHub repository: ${error.message}`);
//             throw error;
//         }
//     }

//     async commitSummary(summary: string) {
//         try {
//             const { data: user } = await this.octokit.users.getAuthenticated();
//             const date = new Date().toISOString();
//             const fileName = `summaries/${date.split('T')[0]}/${date.split('T')[1].split('.')[0].replace(/:/g, '-')}.md`;

//             // Get the default branch
//             const { data: repo } = await this.octokit.repos.get({
//                 owner: user.login,
//                 repo: this.repoName
//             });

//             try {
//                 // Create or update the file
//                 await this.octokit.repos.createOrUpdateFileContents({
//                     owner: user.login,
//                     repo: this.repoName,
//                     path: fileName,
//                     message: `Update coding activity summary for ${date}`,
//                     content: Buffer.from(summary).toString('base64'),
//                     branch: repo.default_branch
//                 });

//                 console.log('Successfully committed summary');
//             } catch (error) {
//                 console.error('Error committing summary:', error);
//                 throw error;
//             }
//         } catch (error) {
//             vscode.window.showErrorMessage(`Failed toGitime summary: ${error.message}`);
//             throw error;
//         }
//     }

//     private startAutoCommits() {
//         // Clear any existing timer
//         if (this.timer) {
//             clearInterval(this.timer);
//         }

//         // Set up hourly commits
//         this.timer = setInterval(async () => {
//             try {
//                 // This will be called from your main extension file
//                 vscode.commands.executeCommand('gitime.createHourlySummary');
//             } catch (error) {
//                 console.error('Error in auto-commit:', error);
//             }
//         }, 60 * 60 * 1000); // Run every hour
//     }

//     // Cleanup method to be called when extension deactivates
//     dispose() {
//         if (this.timer) {
//             clearInterval(this.timer);
//         }
//     }
// }
