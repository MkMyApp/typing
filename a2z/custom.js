			function repText() {
		    const textArea = document.getElementById('txtdata');
		    const text = textArea.value;

		    const separator = " ";

		    const regex = new RegExp(separator.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'), 'g');
		    
		    const replacedText = text.replace(regex, '\n');

		    textArea.value = replacedText;
		}

		function catText() {
		    const textArea = document.getElementById('txtdata');
		    const text = textArea.value;

				const separator = " ";

		    const lines = text.split(/\r?\n/);
		    const replacedText = lines.map(line => line.trim()).join(separator);

		    textArea.value = replacedText;
		}
		
		function updateSettings() {
			TITLE_MSG = document.getElementById("TITLE_MSG").value;
			START_MSG = document.getElementById("START_MSG").value;
			INPUT_MSG = document.getElementById("INPUT_MSG").value;
			RANDOM    = Number(document.getElementById("RANDOM").value);
			WIDTH     = document.getElementById("WIDTH").value;
			init();
			document.getElementById("editor").focus();
		}

		updateSettings();
