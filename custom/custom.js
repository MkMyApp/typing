'use strict';

/* ==========================================================================
   custom.js - エディタ・教材作成・テキスト加工用スクリプト
   ※ タイピング実行コアは typing.js 側に依存
   ========================================================================== */

// --- 外部ファイル読み込み (File System Access API) ---
async function loadText() {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt"] }
      }]
    });

    const file = await handle.getFile();
    const text = await file.text();

    document.getElementById("txtdata").value = text;
  } catch (e) {
    console.log("ファイル読み込みがキャンセルされました", e);
  }
}

// --- 単体テキスト保存 ---
async function saveText() {
  let currentFileName = "temp.txt";
  const text = document.getElementById("txtdata").value;

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: currentFileName,
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt"] }
      }]
    });

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  } catch (e) {
    console.log("保存がキャンセルされました", e);
  }
}

// --- テキスト置換・変換ツール群 ---
function replaceText() {
  const fromStr = document.getElementById('fromChars').value;
  const toStr = document.getElementById('toChars').value;
  const textArea = document.getElementById('txtdata');

  if (fromStr === '') return;
  textArea.value = textArea.value.replaceAll(fromStr, toStr);
}

function convert() {
  const fromStr = document.getElementById('fromChars').value;
  const toStr = document.getElementById('toChars').value;

  if (fromStr.length !== toStr.length) return;

  const map = {};
  for (let i = 0; i < fromStr.length; i++) {
    map[fromStr[i]] = toStr[i];
  }

  const input = document.getElementById('txtdata').value;
  const output = input.split('').map(char => map[char] || char).join('');
  document.getElementById('txtdata').value = output;
}

function getSelectedSeparator() {
  const selectedRadio = document.querySelector('input[name="sepchr"]:checked');
  if (!selectedRadio) return " ";

  let val = selectedRadio.value;
  if (val === '\\t' || val === '\t') {
    return '\t';
  }
  return val;
}

function repText() {
  const textArea = document.getElementById('txtdata');
  const text = textArea.value;
  if (!text) return;

  const separator = getSelectedSeparator();
  const escapedSep = separator.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const regex = new RegExp(escapedSep, 'g');

  const replacedText = text
    .replace(regex, '\n')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  textArea.value = replacedText;
}

function catText() {
  const textArea = document.getElementById('txtdata');
  const text = textArea.value;
  if (!text) return;

  const separator = getSelectedSeparator();
  const lines = text.split(/\r?\n/);
  const replacedText = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(separator);

  textArea.value = replacedText;
}

function toUpperText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toUpperCase();
}

function toLowerText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toLowerCase();
}

function zenSpc() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;
  textArea.value = textArea.value.replace(/\x20/g, '\u3000');
}

function hanSpc() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;
  textArea.value = textArea.value.replace(/\u3000/g, ' ');
}

function zenkaku() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;

  textArea.value = textArea.value.replace(/[^\r\n]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0x30a0 && code <= 0x30ff) return char;
    if (code >= 0x0020 && code <= 0x007e) {
      if (code === 0x0020) return '\u3000';
      return String.fromCharCode(code + 0xfee0);
    }
    return char;
  });
}

function hankaku() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;

  textArea.value = textArea.value.replace(/[^\r\n]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code === 0x3000) return ' ';
    if (code >= 0x30a0 && code <= 0x30ff) return char;
    if (code >= 0xff01 && code <= 0xff5e) {
      return String.fromCharCode(code - 0xfee0);
    }
    return char;
  });
}

function dedupeLines() {
  const textarea = document.getElementById("txtdata");
  const lines = textarea.value.replace(/\r\n/g, '\n').split('\n');
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    if (line.trim() === '' || !seen.has(line)) {
      result.push(line);
      seen.add(line);
    }
  }
  textarea.value = result.join('\n');
}

function sortByLength() {
  const el = document.getElementById('txtdata');
  const lines = el.value.split('\n').filter(line => line.trim() !== '');
  lines.sort((a, b) => a.length - b.length);
  el.value = lines.join('\n');
}

function formatText() {
  const el = document.getElementById('txtdata');
  let text = el.value;
  text = text.replace(/^[ \t\u3000]+/gm, "");
  text = text.replace(/[ \t\u3000]+$/gm, "");
  el.value = text.trim();
}

function setFont() {
  const dataEl = document.getElementById("txtdata");
  const widthEl = document.getElementById("WIDTH");
  if (dataEl.style.fontSize === 'var(--line-font-size)') {
    dataEl.style.fontSize = '20px';
    dataEl.style.width = '52ch';
  } else {
    dataEl.style.fontSize = 'var(--line-font-size)';
    dataEl.style.width = widthEl.value;
  }
}

function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  const validLines = lines.filter(line => line.trim() !== "");
  document.getElementById("RANDOM").value = validLines.length;
}

function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) >= 0x0020 && str.charCodeAt(i) <= 0x007e) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return length;
}

function setMaxLength() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  let maxLen = 0;

  lines.forEach(line => {
    const currentLen = getByteLength(line);
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  });

  const resultWidth = (maxLen + 5) + "ch";
  document.getElementById("WIDTH").value = resultWidth;
}

// --- 設定反映 & typing.js 側へのリセット指示 ---
function updateSettings() {
  window.TITLE_MSG = document.getElementById("TITLE_MSG").value;
  window.START_MSG = document.getElementById("START_MSG").value;
  window.INPUT_MSG = document.getElementById("INPUT_MSG").value;
  window.RANDOM    = Number(document.getElementById("RANDOM").value);
  window.WIDTH     = document.getElementById("WIDTH").value;
  window.IME       = document.getElementById("IME").value;

  // typing.js の init() を実行して再読み込み
  if (typeof init === 'function') {
    init();
  }
  if (typeof typeStarted !== 'undefined') {
    typeStarted = false;
  }
  document.getElementById("editor").focus();
}

function customDivDisplay(mode) {
  const customDiv = document.getElementById("custom");
  if (customDiv) {
    customDiv.style.display = mode;
  }
}

function testPlay() {
  updateSettings();
  customDivDisplay("none");
}

function toggleTextareaHeight(id) {
  const textarea = document.getElementById(id);
  if (!textarea) return;

  const computedStyle = window.getComputedStyle(textarea);
  const currentHeight = Math.round(parseFloat(computedStyle.height));
  const minHeight = Math.round(parseFloat(computedStyle.minHeight));

  if (Math.abs(currentHeight - minHeight) <= 5) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 20) + 'px';
  } else {
    textarea.style.height = computedStyle.minHeight;
  }
}

function clrText(id) {
  const textArea = document.getElementById(id);
  textArea.value = "";
  if (typeof adjustTextareaHeight === 'function') {
    adjustTextareaHeight(id);
  }
}

// --- スタンドアロン HTML 出力合成機能 ---
function composeText() {
  const titleMsg = document.getElementById('TITLE_MSG').value;
  const startMsg = document.getElementById('START_MSG').value;
  const inputMsg = document.getElementById('INPUT_MSG').value;
  const randomVal = document.getElementById('RANDOM').value;
  const widthVal = document.getElementById('WIDTH').value;
  const imeVal = document.getElementById('IME').value;

  const textArea = document.getElementById('txtdata');
  const textComp = document.getElementById('txtComp');

  const header = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="style.css">
<title>${titleMsg}</title>
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
const IME = "${imeVal}";
const RANDOM = "${randomVal}";
const WIDTH = "${widthVal}";
<\/script>
`;

  const scaleText = `<!-------10--------20--------30--------40-->\n`;
  const headText = `<textarea id="txtdata" hidden>\n`;
  let textVal = textArea.value;
  if (textVal.length > 0 && !textVal.endsWith('\n')) { textVal += '\n'; }
  const footText = `</textarea>\n`;

  const footer = `<script src="typing.js"><\/script>\n</body>\n</html>\n`;

  textComp.value = header + configText + scaleText + headText + textVal + footText + scaleText + footer;

  if (typeof adjustTextareaHeight === 'function') {
    adjustTextareaHeight('txtComp');
  }
}

async function saveFile() {
  const text = document.getElementById("txtComp").value;

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "type.html",
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".html"] }
      }]
    });

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  } catch (e) {
    console.log("保存がキャンセルされました", e);
  }
}

// --- ショートカットキー（F2）設定 ---
function setupF2KeyListener() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      e.stopPropagation();

      const customElem = document.getElementById('custom');
      if (customElem) {
        const isHidden = window.getComputedStyle(customElem).display === 'none';
        customDivDisplay(isHidden ? 'block' : 'none');
      }
    }
  }, true);
}

// --- 初期化イベント登録 ---
window.addEventListener('DOMContentLoaded', () => {
  // F2キーのショートカットキーを登録
  setupF2KeyListener();

  // HTML上の要素に設定初期値を反映
  if (typeof TITLE_MSG !== 'undefined') document.getElementById("TITLE_MSG").value = TITLE_MSG;
  if (typeof START_MSG !== 'undefined') document.getElementById("START_MSG").value = START_MSG;
  if (typeof INPUT_MSG !== 'undefined') document.getElementById("INPUT_MSG").value = INPUT_MSG;
  if (typeof IME       !== 'undefined') document.getElementById("IME").value = IME;
  if (typeof RANDOM    !== 'undefined') document.getElementById("RANDOM").value = Number(RANDOM);
  if (typeof WIDTH     !== 'undefined') document.getElementById("WIDTH").value = WIDTH;

  // typing.js で hide/none にされた txtdata を再表示
  const txtdataArea = document.getElementById("txtdata");
  if (txtdataArea) {
    txtdataArea.style.display = "block";
  }

  // 空白等の整形
  formatText();

  // 初期化と表示切替
  if (txtdataArea && txtdataArea.value.trim() !== "") {
    updateSettings();
    customDivDisplay("none");
  } else {
    updateSettings();
  }

  // ドラッグ＆ドロップによるファイル読み込み
  if (txtdataArea) {
    txtdataArea.addEventListener("dragover", (e) => e.preventDefault());
    txtdataArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length === 0) return;
      const file = files[0];

      if (!file.type.startsWith("text/") && !file.name.match(/\.(txt|html)$/)) {
        alert("テキストファイル（.txt / .html）のみ対応しています");
        return;
      }

      const text = await file.text();
      txtdataArea.value = text;
    });
  }
});
