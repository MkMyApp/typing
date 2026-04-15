let currentFileName = "text.txt";
let modified = false;

function updateFileName(){
  document.getElementById("filename").textContent =
    "File: " + currentFileName;

  document.getElementById("title").textContent =
    "Text: " + currentFileName;
}

function updateModified(){
  document.getElementById("modified").textContent =
    modified ? "*" : "";
}

function updateStatus(){
  const text = document.getElementById("text").value;

  const lines = text.split("\n").length;
  const chars = text.length;

  document.getElementById("linecount").textContent =
    "Line: " + lines;

  document.getElementById("charcount").textContent =
    "Chars: " + chars;
}

function setModified(){
  modified = true;
  updateModified();
}

async function loadFile(){
  try{
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt", ".mml", ".html"] }
      }]
    });

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

function processText(text) {

  // ① 改行コード統一（CRLF → LF）
  text = text.replace(/\r\n/g, '\n');

  // ② 行頭の// → 半角スペース2つ
  text = text.replace(/^\/\/\s?/gm, '  ');

  // ③ タブ → 半角スペース2つ
  text = text.replace(/\t/g, '  ');

  // ④ 全角スペース → 半角
  text = text.replace(/ /g, ' ');

  return text;
}

async function editFile() {
  let text = document.getElementById("text").value;

  text = processText(text);

  document.getElementById("text").value = text;
}

async function saveFile(){
  try{
    const text = document.getElementById("text").value;

    const handle = await window.showSaveFilePicker({
      suggestedName: currentFileName,
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt", ".mml", ".html"] }
      }]
    });

    currentFileName = handle.name;
    updateFileName();

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();

    modified = false;
    updateModified();
    updateStatus();

  }catch(e){
    console.log(e);
  }
}

document.getElementById("text").addEventListener("input", function(){
  setModified();
  updateStatus();
});

const textarea = document.getElementById("text");

// ドロップ許可
textarea.addEventListener("dragover", function(e){
  e.preventDefault();
});

// ドロップ処理
textarea.addEventListener("drop", async function(e){
  e.preventDefault();

  const files = e.dataTransfer.files;
  if (files.length === 0) return;

  const file = files[0];

  // テキストファイルのみ処理
  if (!file.type.startsWith("text") && !file.name.match(/\.(txt|mml|html)$/)) {
    alert("テキストファイルのみ対応しています");
    return;
  }

  currentFileName = file.name;
  updateFileName();

  const text = await file.text();

  document.getElementById("text").value = text;

  modified = false;
  updateModified();
  updateStatus();
});
