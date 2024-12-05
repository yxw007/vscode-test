(() => {

	const vscode = acquireVsCodeApi();
	const logs = [];

	function sortLogs(order) {
		logs.sort((a, b) => order === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
		updateWebview();
	}

	function clearLogs() {
		logs.length = 0
		updateWebview();
	}

	function addLog(message) {
		this.logs.push(message);
		this.updateWebview();
	}

	function updateWebview() {

	}

})();
