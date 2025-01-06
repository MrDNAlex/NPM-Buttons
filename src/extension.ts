import * as vscode from 'vscode';
import fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('npm-scripts.showTab', () => {

            // Create a Panel Object (New Tab)
            const panel = vscode.window.createWebviewPanel(
                //Name of the Panel/Tab
                'npmScripts',
                'NPM Scripts',
                vscode.ViewColumn.One,
                {
                    //Very Important, Need to Enable Scripts
                    enableScripts: true
                }
            );

            //Get the Root Path of the Project that is Oppened, and then get the package.json file
            const rootPath = vscode.workspace.rootPath;
            const packageJson = rootPath + '/package.json';

            //Check if the package.json file exists, if not Display a Not Found Page
            if (!fs.existsSync(packageJson)) {
                console.log('No package json');
                panel.webview.html = GetNotFoundPage();
                vscode.window.showErrorMessage('No package.json file found');
                return;
            }

            //Get Contents of the Scripts Body from the package.json file
            const scripts = require(packageJson).scripts;

            //Define an Array of Buttons to be Displayed, Each Button is named after the Script
            let buttonsHtml = '';
            for (const [script, command] of Object.entries(scripts)) {
                buttonsHtml += `<button onclick="runScript('${script}')">${script}</button>`;
            }

            try 
            {
                //Get the HTML Page with functionality for each Button
                panel.webview.html = GetPageView(buttonsHtml);

                //Add a Message Listener to the Panel
                panel.webview.onDidReceiveMessage(
                    message => {
                        //Check if the Message Command is runScript, if so, Run the Script
                        if (message.command === 'runScript') {
                            //Add a Info Popup box in the Bottom Right Corner saying the Script that is Run
                            vscode.window.showInformationMessage(`Running script: ${message.script}`);

                            //Create a Terminal Instance
                            const terminal = vscode.window.createTerminal(`NPM Buttons: ${message.script}`);
                            
                            //Send the Command to the Terminal
                            terminal.sendText(`npm run ${message.script}`);

                            //Show the Terminal (Open it and make it Visible to the User)
                            terminal.show();
                        }
                    },
                    undefined,
                    context.subscriptions
                );
            } catch (error) {
                //Show the Error Page if something goes wrong
                panel.webview.html = GetErrorPage();
                vscode.window.showErrorMessage('An Error Occurred with the Extension');
            }
            
        })
    );

    //Register the Command to Show the NPM Scripts
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showNpmScripts', () => {
            vscode.commands.executeCommand('npm-scripts.showTab');
        })
    );

}

//Function returning the HTML for the Not Found Page
function GetNotFoundPage ()
{
    return `
        <!DOCTYPE html>
        <html>
        <body>
            <h1>NPM Scripts Not Found</h1>
            <h2>Open a Project with a Package.Json file to use the Extension</h2>
        </body>
        </html>
            `;
}

//Function returning the HTML for the Error Page
function GetErrorPage ()
{
    return `
        <!DOCTYPE html>
        <html>
        <body>
            <h1>NPM Scripts Error</h1>
            <h2>Something went wrong with the Extension</h2>
        </body>
        </html>
            `;
}

//Function returning the HTML for the Regular Populated Page
function GetPageView (buttonsHtml: string)
{
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                button {
                    margin: 5px;
                    padding: 10px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <h1>NPM Scripts</h1>
            ${buttonsHtml}
            <script>
                const vscode = acquireVsCodeApi();
                function runScript(script) {
                    vscode.postMessage({ command: 'runScript', script });
                }
            </script>
        </body>
        </html>
            `;
}

// this method is called when your extension is deactivated
export function deactivate() {}
