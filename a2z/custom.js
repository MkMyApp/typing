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
		
	function toUpperText() {
	  const textArea = document.getElementById('txtdata');
	  textArea.value = textArea.value.toUpperCase();
	};

	function toLowerText() {
	  const textArea = document.getElementById('txtdata');
	  textArea.value = textArea.value.toLowerCase();
	};
		
  function showSettings() {
  document.getElementById("custom").style.display = "block";
  document.getElementById("type").style.display = "none";

  }

  function updateSettings() {
	  document.title = document.getElementById("TITLE_MSG").value;
	  START_MSG = document.getElementById("START_MSG").value;
	  INPUT_MSG = document.getElementById("INPUT_MSG").value;
	  RANDOM    = Number(document.getElementById("RANDOM").value);
	  WIDTH     = document.getElementById("WIDTH").value;

	  init();
    
    document.getElementById("txtComp").style.display = "none";
	  document.getElementById("custom").style.display = "none";
	  document.getElementById("type").style.display = "block";
	  document.getElementById("editor").focus();
  }

function composeText() {

// 1. 各項目の値を取得
const titleMsg = document.getElementById('TITLE_MSG').value;
const startMsg = document.getElementById('START_MSG').value;
const inputMsg = document.getElementById('INPUT_MSG').value;
const randomVal = document.getElementById('RANDOM').value;
const widthVal = document.getElementById('WIDTH').value;

// 2. テキストエリアの要素を取得
const textArea = document.getElementById('txtdata');
const textComp = document.getElementById('txtComp');

// 3. 追加したい「const部分」を組み立てる
const configText = `<script>
const TITLE_MSG = "${titleMsg}";
const START_MSG = "${startMsg}";
const INPUT_MSG = "${inputMsg}";
const RANDOM = "${randomVal}";
const WIDTH = "${widthVal}";
<\/script>\n`;

const scaleText = `<!-------10--------20--------30--------40--------->\n`
const headText = `<textarea id="txtdata" hidden>\n`;

const footText = `</textarea>\n`;

const textVal = textArea.value;

// テキストエリアに合成結果を出力
textComp.value = configText + scaleText + headText + textVal + footText + scaleText;
textComp.style.display = "block";
}
