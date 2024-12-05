import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const logProvider = new LogProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("Translate.Logs", logProvider));

	// 注册命令以添加随机日志
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.addRandomLog', () => {
			const log = `Random log entry at ${new Date().toLocaleTimeString()}`;
			logProvider.addLog(log);
		})
	);

	// 注册排序日志命令
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.sortLogsAsc', () => {
			logProvider.sortLogs('asc');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.sortLogsDesc', () => {
			logProvider.sortLogs('desc');
		})
	);

	// 注册清除日志命令
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.clearLogs', () => {
			logProvider.clearLogs();
		})
	);

}

export function deactivate() { }

class LogProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.getWebviewContent(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'sort':
						this.sortLogs(message.order);
						break;
					case 'clear':
						this.clearLogs();
						break;
				}
			}
		);
	}

	addLog(message: string) {
		if (this._view) {
			this._view.webview.postMessage({ command: 'addLog', message });
		}
	}

	sortLogs(order: 'asc' | 'desc') {
		if (this._view) {
			this._view.webview.postMessage({ command: 'sort', order });
		}
	}

	clearLogs() {
		if (this._view) {
			this._view.webview.postMessage({ command: 'clear' });
		}
	}

	private getWebviewContent(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const nonce = getNonce();

		return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Translate Logs</title>
								<link href="${styleResetUri}" rel="stylesheet">
            </head>
            <body>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>Log Panel</h1>
                    <div>
                        <button onclick="sortLogs('asc')">Sort Asc</button>
                        <button onclick="sortLogs('desc')">Sort Desc</button>
                        <button onclick="clearLogs()">Clear</button>
                    </div>
                </div>
                <div id="logContainer">logContainer</div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
