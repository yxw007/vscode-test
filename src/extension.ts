import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const provider = new LogProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("logView", provider));

	// 注册命令以添加随机日志
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.addRandomLog', () => {
			const log = `
Random log entry at ${new Date().toLocaleTimeString()}
[translate ] Translate Failed: from=auto,to=zh,engine=baidu,translate text: 
--------------------
Show Commit
--------------------
 error: Translate fail ! Translate fail ! error_code:54003, error_msg: Invalid Access Limit
extensionHostProcess.js:162
Translate-next: Translate fail ! error_code:54003, error_msg: Invalid Access Limit
Error: Translate fail ! error_code:54003, error_msg: Invalid Access Limit
    at Object.translate (e:\Project\translate-ide\vscode-extension\node_modules\@yxw007\translate\src\engines\baidu.ts:51:15)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
			`;
			provider.addLog(log);
		})
	);

	// 注册排序日志命令
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.sortLogsAsc', () => {
			provider.sortLogs('asc');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.sortLogsDesc', () => {
			provider.sortLogs('desc');
		})
	);

	// 注册清除日志命令
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.clearLogs', () => {
			provider.clearLogs();
		})
	);

}

export function deactivate() { }

class LogProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'logView';
	private _view?: vscode.WebviewView;
	private _logs: string[] = [];
	private _logOrder: 'asc' | 'desc' = 'asc';

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.getWebviewContent(webviewView.webview);
		if (this._logs.length > 0) {
			this.postMessage();
		}
	}

	addLog(message: string) {
		this._logs.push(message);
		this.postMessage();
	}

	sortLogs(order: 'asc' | 'desc') {
		if (this._logOrder === order) {
			return;
		}
		this._logOrder = order;
		this._logs.reverse();
		this.postMessage();
	}

	clearLogs() {
		this._logs.length = 0
		this.postMessage();
	}

	private postMessage() {
		if (this._view) {
			this._view.webview.postMessage({ logs: this._logs });
		}
	}

	private getWebviewContent(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'main.js'));
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'reset.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'main.css'));
		const nonce = getNonce();

		return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Translate Logs</title>
								<link href="${styleResetUri}" rel="stylesheet">
								<link href="${styleMainUri}" rel="stylesheet">
            </head>
            <body>
                <pre id="logContainer"></pre>
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
