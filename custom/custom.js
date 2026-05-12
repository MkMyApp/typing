  let START_MSG = "Enter⏎でスタート"
  let INPUT_MSG = "英数 かな"
  let RANDOM = 10
  let WIDTH = "25ch"
  
  function showSettings() {
  const customDiv = document.getElementById("custom");
  customDiv.style.display = "";
  const typeDiv = document.getElementById("type");
  typeDiv.style.display = "none";

  }

  function updateSettings() {
	  document.title = document.getElementById("TITLET_MSG").value;
	  START_MSG = document.getElementById("START_MSG").value;
	  INPUT_MSG = document.getElementById("INPUT_MSG").value;
	  RANDOM    = Number(document.getElementById("RANDOM").value);
	  WIDTH     = document.getElementById("WIDTH").value;

	  init();
	  
	  const customDiv = document.getElementById("custom");
	  customDiv.style.display = "none";
	  const typeDiv = document.getElementById("type");
	  typeDiv.style.display = "";

	  const editor = document.getElementById("editor");
	  editor.focus();
  }
