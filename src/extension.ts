import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('npm-scripts.showTab', () => {

			console.log('registering Command');

            const panel = vscode.window.createWebviewPanel(
                'npmScripts',
                'NPM Scripts',
                vscode.ViewColumn.One,
                {}
            );

			console.log('panel created');

            //console.log(vscode.workspace.textDocuments);

            const rootPath = vscode.workspace.rootPath;


            if (!rootPath) {
                console.log('No root path');
                

                panel.webview.html = `
                <!DOCTYPE html>
                <html>
                <body>
                    <h1>NPM Scripts Not Found</h1>
                    <h2>Open a Project with a Package.Json file to use the Extension</h2>
                </body>
                </html>
                `;

                return;

            }

            const packageJson = rootPath + '/package.json';

            console.log(`Hello : ${packageJson}`);

            const scripts = require(packageJson).scripts;

            let buttonsHtml = '';
            for (const [script, command] of Object.entries(scripts)) {
                buttonsHtml += `<button onclick="runScript('${script}')">${script}</button>`;
            }

			console.log("Buttons created");

            panel.webview.html = `
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
                    vscode.window.showInformationMessage('Button Pressed');
                        const vscode = acquireVsCodeApi();
                        function runScript(script) {
                            panel.webview.postMessage({ command: 'runScript', script: 'start' });
                        }
                    </script>
                </body>
                </html>
            `;

			console.log('html created');

            vscode.window.showInformationMessage('NPM Scripts Tab Opened');
            

            panel.webview.onDidReceiveMessage(
                message => {
                    console.log('message received');

                    console.log(message);

                    console.log(message.command);

                    if (message.command === 'runScript') {
                        vscode.window.showInformationMessage(`Running script: ${message.script}`);
                        const terminal = vscode.window.createTerminal(`NPM: ${message.script}`);
                        terminal.sendText(`npm run ${message.script}`);
                        terminal.show();
                    }
                },
                undefined,
                context.subscriptions
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showNpmScripts', () => {
            vscode.commands.executeCommand('npm-scripts.showTab');
        })
    );
}

export function deactivate() {}
