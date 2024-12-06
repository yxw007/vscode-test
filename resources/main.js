(() => {
	const vscode = acquireVsCodeApi();
	const _container = document.getElementById("logContainer");

	window.addEventListener("message", event => {
		debugger
		const { logs } = event.data;
		console.log("webview receive message:", logs);
		updateWebview(logs);
	});

	function updateWebview(logs = []) {
		if (!_container) {
			console.error("not found logContainer");
			return;
		}
		_container.innerHTML = logs.join("\n");
	}
})();
