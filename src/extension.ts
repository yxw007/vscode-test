import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const logProvider = new LogProvider();

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

	// 创建一个左边侧边栏按钮
	vscode.window.registerTreeDataProvider('logView', logProvider);
}

export function deactivate() { }

class LogProvider implements vscode.TreeDataProvider<LogItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<LogItem | undefined | void> = new vscode.EventEmitter<LogItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<LogItem | undefined | void> = this._onDidChangeTreeData.event;

	private logs: LogItem[] = [];

	getTreeItem(element: LogItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: LogItem): Thenable<LogItem[]> {
		if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve(this.logs);
		}
	}

	addLog(message: string) {
		this.logs.push(new LogItem(message));
		this._onDidChangeTreeData.fire();
	}

	sortLogs(order: 'asc' | 'desc') {
		this.logs.sort((a, b) => order === 'asc' ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label));
		this._onDidChangeTreeData.fire();
	}

	clearLogs() {
		this.logs = [];
		this._onDidChangeTreeData.fire();
	}
}

class LogItem extends vscode.TreeItem {
	constructor(public readonly label: string) {
		super(label);
	}
}
