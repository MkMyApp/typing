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

// 半角スペースを全角スペースに置換
function zenSpc() {
  const textArea = document.getElementById('txtdata');
  // 半角スペースを全角スペースに置換
  textArea.value = textArea.value.replace(/ /g, '　');
};

// 全角スペースを半角スペースに置換
function hanSpc() {
  const textArea = document.getElementById('txtdata');
  // 全角スペースを半角スペースに置換
  textArea.value = textArea.value.replace(/　/g, ' ');
};

function dedupeLines() {
  const textarea = document.getElementById("txtdata");
  
  // 改行コードの統一と行分割
  const lines = textarea.value.replace(/\r\n/g, '\n').split('\n');
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    // 空白行はそのまま追加、そうでなければ重複チェック
    if (line.trim() === '' || !seen.has(line)) {
      result.push(line);
      seen.add(line);
    }
  }

  textarea.value = result.join('\n');
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

window.addEventListener('DOMContentLoaded', () => {
    updateSettings();
});
		
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

// 3. 各パーツを定義
const header = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="style.css">
<title>問題作成</title>
</head>
<body>
<div id="title"></div>
<div id="result"></div>
<div id="target" class="line"></div>
<textarea id="editor" class="line" spellcheck="false"></textarea>
<script src="typing.js" defer></script>
`;

const configText = `<script>
const TITLE_MSG = "${titleMsg}";
const START_MSG = "${startMsg}";
const INPUT_MSG = "${inputMsg}";
const RANDOM = "${randomVal}";
const WIDTH = "${widthVal}";
<\/script>
`;

const scaleText = `<!-------10--------20--------30--------40-->\n` 
const headText = `<textarea id="txtdata" hidden>\n`;
let textVal = textArea.value;
if (textVal.length > 0 && !textVal.endsWith('\n')) {textVal += '\n';}
const footText = `</textarea>\n`;

const footer = `</body>\n</html>\n`;


// 4. 全てを連結して出力
textComp.value = header + configText + scaleText + headText + textVal + footText + scaleText + footer;

}

// ダイアログを開いて保存する
async function saveFile() {
  const text = document.getElementById("txtComp").value;

  try {
    // 常にファイル保存ダイアログを開く
    const handle = await window.showSaveFilePicker({
      suggestedName: "type.html", // ここを修正しました
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".html"] }
      }]
    });

    // 書き込み処理
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();

  } catch (e) {
    // ユーザーがキャンセルした場合
    console.log("保存がキャンセルされました", e);
  }
}
