// ファイルを開く
async function loadText(){
  try{
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt"] }
      }]
    });

    const file = await handle.getFile();
    const text = await file.text();

    document.getElementById("txtdata").value = text;

  }catch(e){
    console.log(e);
  }
}

// ダイアログを開いて保存する
async function saveText() {
	let currentFileName = "temp.txt";
  const text = document.getElementById("txtdata").value;

  try {
    // 常にファイル保存ダイアログを開く
    const handle = await window.showSaveFilePicker({
      suggestedName: currentFileName,
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt"] }
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

function replaceText() {
  const fromStr = document.getElementById('fromChars').value;
  const toStr = document.getElementById('toChars').value;
  const textArea = document.getElementById('txtdata');
  const msg = document.getElementById('msg');

  // 変換元が空の場合は処理しない
  if (fromStr === '') {
    msg.innerHTML = `⚠️Err 置換対象が空です`;
    return;
  }

  //replaceAllを使用して一致するすべての文字列を置換
  textArea.value = textArea.value.replaceAll(fromStr, toStr);
  msg.innerHTML = "✅OK 置換完了";
}

function convert() {
    const fromStr = document.getElementById('fromChars').value;
    const toStr = document.getElementById('toChars').value;
    const msg = document.getElementById('msg');

    // 文字数の一致判定
    if (fromStr.length !== toStr.length) {
        msg.innerHTML = `⚠️Err 文字列長不一致`;
        return;
    }
    msg.innerHTML = "✅OK 変換完了";

    // マッピング作成
    const map = {};
    for (let i = 0; i < fromStr.length; i++) {
        map[fromStr[i]] = toStr[i];
    }

    // 変換実行
    const input = document.getElementById('txtdata').value;
    const output = input.split('').map(char => map[char] || char).join('');
    document.getElementById('txtdata').value = output;
}

function repText() {
  const textArea = document.getElementById('txtdata');
  const text = textArea.value;

  // ラジオボタンで選択されている値（スペース、カンマ、コロン）を取得
  const selectedRadio = document.querySelector('input[name="sepchr"]:checked');
  const separator = selectedRadio ? selectedRadio.value : " ";

  // 正規表現の特殊文字をエスケープして置換を実行
  const regex = new RegExp(separator.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'), 'g');
  const replacedText = text.replace(regex, '\n');

  textArea.value = replacedText;
}

function catText() {
  const textArea = document.getElementById('txtdata');
  const text = textArea.value;

  // ラジオボタンで選択されている値（スペース、カンマ、コロン）を取得
  const selectedRadio = document.querySelector('input[name="sepchr"]:checked');
  const separator = selectedRadio ? selectedRadio.value : " ";

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

//重複する行を削除
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

//文字列の長さ順にソート
function sortByLength() {
  const el = document.getElementById('txtdata');
  const lines = el.value.split('\n').filter(line => line.trim() !== '');
  lines.sort((a, b) => a.length - b.length);
  el.value = lines.join('\n');
}

// テキストを整形する処理
function formatText() {
  const el = document.getElementById('txtdata');
  let text = el.value;

//text = text.replaceAll("\t", "  ");
  text = text.replace(/^[ \t\u3000]+/gm, "");
  text = text.replace(/[ \t\u3000]+$/gm, "");
  el.value = text;
}

// 行数をカウントして問題数(input)に設定する関数
function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  
  // 改行で分割して配列にする
  const lines = txtdata.split('\n');
  
  // 空白を除いた純粋な問題行だけを数える場合（おすすめ）
  const validLines = lines.filter(line => line.trim() !== "");
  
  // もし空行も含めて完全に改行の数で数えたい場合は、下の1行のコメントアウトを解除
  // const validLines = lines;

  // 問題数のinputに件数を反映
  document.getElementById("RANDOM").value = validLines.length;
}

// 文字列の半角換算での長さを返す関数（全角=2, 半角=1）
function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    // シフトJIS換算などで全角になる文字コードの判定（簡易版）
    if (str.charCodeAt(i) >= 0x0020 && str.charCodeAt(i) <= 0x007e) {
      length += 1; // 半角
    } else {
      length += 2; // 全角
    }
  }
  return length;
}

// 最長行の文字数を判定して、(最長値 + 5) + "ch" をinputに代入する関数
function setMaxLength() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  
  let maxLen = 0;
  
  // 各行の長さを半角換算で比較し、最大のものを探す
  lines.forEach(line => {
    const currentLen = getByteLength(line);
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  });

  // 数値 + 5 に "ch" をつける
  const resultWidth = (maxLen + 5) + "ch";

  // 文字幅のinputに代入
  document.getElementById("WIDTH").value = resultWidth;
}

function updateSettings() {
	TITLE_MSG = document.getElementById("TITLE_MSG").value;
	START_MSG = document.getElementById("START_MSG").value;
	INPUT_MSG = document.getElementById("INPUT_MSG").value;
	RANDOM    = Number(document.getElementById("RANDOM").value);
	WIDTH     = document.getElementById("WIDTH").value;
  IME       = document.getElementById("IME").value;
	init();
	typeStarted = false;
	document.getElementById("editor").focus();
}

window.addEventListener('DOMContentLoaded', () => {
    updateSettings();
});

function adjustTextareaHeight(id) {
      const textarea = document.getElementById(id);
      
      if (textarea) {
        // 一度高さをリセット（縮む場合にも対応させるため）
        textarea.style.height = 'auto';
        
        // スクロールする領域の高さ（scrollHeight）を新しい高さとして設定
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }

function clrText(id) {
	const textArea = document.getElementById(id);
	textArea.value = "";
	adjustTextareaHeight(id);
}

function composeText() {
// 1. 各項目の値を取得
const titleMsg = document.getElementById('TITLE_MSG').value;
const startMsg = document.getElementById('START_MSG').value;
const inputMsg = document.getElementById('INPUT_MSG').value;
const randomVal = document.getElementById('RANDOM').value;
const widthVal = document.getElementById('WIDTH').value;
const imeVal = document.getElementById('IME').value;

// 2. テキストエリアの要素を取得
const textArea = document.getElementById('txtdata');
const textComp = document.getElementById('txtComp');

// 3. 各パーツを定義
const header = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="style.css">
<title>タイピング練習</title>
</head>
<body>
<div id="title"></div>
<div id="result"></div>
<div id="target" class="line"></div>
<textarea id="editor" class="line" spellcheck="false"></textarea>
`;

const configText = `<script>
const TITLE_MSG = "${titleMsg}";
const START_MSG = "${startMsg}";
const INPUT_MSG = "${inputMsg}";
const RANDOM = "${randomVal}";
const WIDTH = "${widthVal}";
const IME = "${imeVal}";
<\/script>
`;

const scaleText = `<!-------10--------20--------30--------40-->\n` 
const headText = `<textarea id="txtdata" hidden>\n`;
let textVal = textArea.value;
if (textVal.length > 0 && !textVal.endsWith('\n')) {textVal += '\n';}
const footText = `</textarea>\n`;

const footer = `<script src="typing.js"></script>\n</body>\n</html>\n`;


// 4. 全てを連結して出力
textComp.value = header + configText + scaleText + headText + textVal + footText + scaleText + footer;

adjustTextareaHeight('txtComp');
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

window.addEventListener('DOMContentLoaded', () => {
  const txtdataArea = document.getElementById("txtdata");

  if (txtdataArea) {
    // ドラッグオーバー
    txtdataArea.addEventListener("dragover", function(e) {
      e.preventDefault();
    });

    // ドロップ処理
    txtdataArea.addEventListener("drop", async function(e) {
      e.preventDefault();
      
      const files = e.dataTransfer.files;
      if (files.length === 0) return;
      const file = files[0];

      // テキスト形式、または拡張子が .txt か .html の場合のみ受け付ける
      if (!file.type.startsWith("text/") && !file.name.match(/\.(txt|html)$/)) {
        alert("テキストファイル（.txt / .html）のみ対応しています");
        return;
      }

      // ファイルをテキストとして読み込み
      const text = await file.text();
      txtdataArea.value = text;

    });
  }
});

