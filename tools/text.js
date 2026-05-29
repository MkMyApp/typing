let currentFileName = "text.txt";
let modified = false;
let fileHandle = null; // ファイルハンドルを保持する変数

// ファイル名とタイトルの表示更新
function updateFileName(){
  document.getElementById("filename").textContent =
    "File: " + currentFileName;

  document.getElementById("title").textContent =
    "Text: " + currentFileName;
}

// 変更マーク（*）の表示更新
function updateModified(){
  document.getElementById("modified").textContent =
    modified ? "*" : "";
}

// 行数・文字数の表示更新
function updateStatus(){
  const text = document.getElementById("text").value;
  const lines = text.length === 0 ? 1 : text.split("\n").length;
  const chars = text.length;

  document.getElementById("linecount").textContent = "Line: " + lines;
  document.getElementById("charcount").textContent = "Chars: " + chars;
}

// 変更フラグを立てる
function setModified(){
  modified = true;
  updateModified();
}

// ファイルを開く
async function loadFile(){
  try{
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt", ".mml", ".html"] }
      }]
    });

    fileHandle = handle; // ハンドルを保存
    currentFileName = handle.name;
    updateFileName();

    const file = await handle.getFile();
    const text = await file.text();

    document.getElementById("text").value = text;

    modified = false;
    updateModified();
    updateStatus();

  }catch(e){
    console.log(e);
  }
}

// 【Saveボタン用】上書き保存（ハンドルがなければ名前を付けて保存）
async function saveFile(){
  try{
    if (!fileHandle) {
      return await saveFileAs(); // ハンドルがなければ「別名保存」へ
    }

    const text = document.getElementById("text").value;
    
    // 書き込み権限の確認
    const options = { mode: 'readwrite' };
    if (await fileHandle.queryPermission(options) !== 'granted') {
      if (await fileHandle.requestPermission(options) !== 'granted') {
        alert("書き込み権限がありません");
        return;
      }
    }

    const writable = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();

    modified = false;
    updateModified();
    updateStatus();
    alert("保存しました");

  }catch(e){
    console.error(e);
    alert("保存に失敗しました: " + e.message);
  }
}

// 【Save Asボタン用】名前を付けて保存
async function saveFileAs(){
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: currentFileName,
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt", ".mml", ".html"] }
      }]
    });

    fileHandle = handle; // 新しいハンドルを保持
    currentFileName = handle.name;
    updateFileName();

    const text = document.getElementById("text").value;
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();

    modified = false;
    updateModified();
    updateStatus();
    alert("名前を付けて保存しました");
  } catch (e) {
    console.log(e);
  }
}

// テキスト整形処理
function processText(text) {
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/^\/\/\s?/gm, '  ');
  text = text.replace(/\t/g, '  ');
  text = text.replace(/　/g, ' '); 
  return text;
}

// 整形実行
async function editText() {
  let text = document.getElementById("text").value;
  text = processText(text);
  document.getElementById("text").value = text;
  setModified();
}

// 入力イベント
document.getElementById("text").addEventListener("input", function(){
  setModified();
  updateStatus();
});

const textarea = document.getElementById("text");

// ドラッグオーバー
textarea.addEventListener("dragover", function(e){
  e.preventDefault();
});

// ドロップ処理
textarea.addEventListener("drop", async function(e){
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 0) return;
  const file = files[0];

  if (!file.type.startsWith("text") && !file.name.match(/\.(txt|mml|html)$/)) {
    alert("テキストファイルのみ対応しています");
    return;
  }

  fileHandle = null; // ドロップ時は上書き不可にする
  currentFileName = file.name;
  updateFileName();

  const text = await file.text();
  document.getElementById("text").value = text;

  modified = false;
  updateModified();
  updateStatus();
});

// クリア処理
function clearText() {
  if (confirm("テキストを消去しますか？")) {
    const textarea = document.getElementById("text");
    textarea.value = "";
    
    fileHandle = null;
    currentFileName = "(none)";
    updateFileName();
    
    modified = false;
    updateModified();
    updateStatus();
  }
}

function countMax() {
  const target = document.getElementById("text"); // texts[1] から修正[cite: 2]
  if (!target) return;

  let text = "";
  const start = target.selectionStart;
  const end = target.selectionEnd;

  if (start !== end) {
    text = target.value.substring(start, end);
  } else {
    text = target.value;
  }

  const lines = text.split("\n");
  let maxVisualWidth = 0;

  for (let i = 0; i < lines.length; i++) {
    let currentWidth = 0;
    for (let j = 0; j < lines[i].length; j++) {
      // 文字コードが 0x7f 以下なら半角(1)、それ以外は全角(2)とみなす簡易判定
      const charCode = lines[i].charCodeAt(j);
      currentWidth += (charCode <= 0x7f) ? 1 : 2;
    }
    
    if (currentWidth > maxVisualWidth) {
      maxVisualWidth = currentWidth;
    }
  }

  const maxLabel = document.getElementById("maxLength");
  if (maxLabel) {
    const prefix = (start !== end) ? "selMax: " : "maxLen: ";
    // 単位を ch（あるいは桁数）として表示
    maxLabel.textContent = prefix + maxVisualWidth + "ch";
  }
}

function loadType() {
const textarea = document.getElementById("text");
textarea.value = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="style.css">
  <title>タイピング練習</title>
</head>
<body>
<script>
  const START_MSG = "Enter⏎でスタート"
  const INPUT_MSG = "英数 かな 確認"
  const RANDOM = 0
  const WIDTH = "25ch"
</script>
<!---5----10---15---20---25---30---35---40--->
<textarea id="txtdata" hidden>

</textarea>
<!---5----10---15---20---25---30---35---40--->
  <div id="title"></div>
  <div id="result"></div>
  <div id="target" class="line" 
    style="text-align:center"></div>
  <textarea id="editor" class="line" 
    spellcheck="false" rows="1">
  </textarea>
  <script src="typing.js" defer></script>
<!--
<div id="exp"></div>
<img src=".png" style="width:800px;">
-->
</body>
</html>
`;
}
