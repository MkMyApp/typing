	function updateSettings() {
		TITLE_MSG = document.getElementById("TITLE_MSG").value;
		START_MSG = document.getElementById("START_MSG").value;
		INPUT_MSG = document.getElementById("INPUT_MSG").value;
		RANDOM    = Number(document.getElementById("RANDOM").value);
		WIDTH     = document.getElementById("WIDTH").value;
		init();
		document.getElementById("editor").focus();
	}
	window.addEventListener('DOMContentLoaded', () => {
	    updateSettings();
	});
