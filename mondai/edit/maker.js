// ファイルを開く（テキストファイル読込）
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

// ダイアログを開いてテキスト保存する
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

// 置換処理
function replaceText() {
  const fromStr = document.getElementById('fromChars').value;
  const toStr = document.getElementById('toChars').value;
  const textArea = document.getElementById('txtdata');

  if (fromStr === '') { return; }
  textArea.value = textArea.value.replaceAll(fromStr, toStr);
}

// 1対1文字変換処理
function convert() {
  const fromStr = document.getElementById('fromChars').value;
  const toStr = document.getElementById('toChars').value;

  if (fromStr.length !== toStr.length) { return; }

  const map = {};
  for (let i = 0; i < fromStr.length; i++) {
    map[fromStr[i]] = toStr[i];
  }

  const input = document.getElementById('txtdata').value;
  const output = input.split('').map(char => map[char] || char).join('');
  document.getElementById('txtdata').value = output;
}

// 選択中の区切り文字を取得
function getSelectedSeparator() {
  const selectedRadio = document.querySelector('input[name="sepchr"]:checked');
  if (!selectedRadio) return " ";

  let val = selectedRadio.value;
  if (val === '\\t' || val === '\t') {
    return '\t';
  }
  return val;
}

// 区切り文字で改行分割
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

// 改行を区切り文字で結合
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

// 大文字化
function toUpperText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toUpperCase();
}

// 小文字化
function toLowerText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toLowerCase();
}

// 全角スペース置換（半角スペース -> 全角スペース）
function zenSpc() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;
  // \x20 : 半角スペース / \u3000 : 全角スペース
  textArea.value = textArea.value.replace(/\x20/g, '\u3000');
}

// 半角スペース置換（全角スペース -> 半角スペース）
function hanSpc() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;
  // \u3000 : 全角スペース / \x20 : 半角スペース
  textArea.value = textArea.value.replace(/\u3000/g, ' ');
}

// カタカナを除外して半角文字を全角文字に置換
function zenkaku() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;

  textArea.value = textArea.value.replace(/[^\r\n]/g, (char) => {
    // 全角カタカナ ( Unicode: U+30A0 〜 U+30FF ) はそのまま返す
    const code = char.charCodeAt(0);
    if (code >= 0x30a0 && code <= 0x30ff) {
      return char;
    }

    // ASCIIの表示可能文字 ( 0x20 Space 〜 0x7E ~ ) を全角に変換
    if (code >= 0x0020 && code <= 0x007e) {
      if (code === 0x0020) return '\u3000'; // ← 半角スペースを全角スペースに変換
      return String.fromCharCode(code + 0xfee0);
    }

    return char;
  });
}

// カタカナを除外して全角文字を半角文字に置換
function hankaku() {
  const textArea = document.getElementById('txtdata');
  if (!textArea) return;

  textArea.value = textArea.value.replace(/[^\r\n]/g, (char) => {
    const code = char.charCodeAt(0);

    // 1. 全角スペース ( U+3000 ) を優先して半角スペースに変換
    if (code === 0x3000) {
      return ' ';
    }

    // 2. 全角カタカナ ( Unicode: U+30A0 〜 U+30FF ) はそのまま返す
    if (code >= 0x30a0 && code <= 0x30ff) {
      return char;
    }

    // 3. 全角英数・記号 ( U+FF01 〜 U+FF5E ) を半角に変換
    if (code >= 0xff01 && code <= 0xff5e) {
      return String.fromCharCode(code - 0xfee0);
    }

    return char;
  });
}

// 重複行の削除
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

// 文字列長順ソート
function sortByLength() {
  const el = document.getElementById('txtdata');
  const lines = el.value.split('\n').filter(line => line.trim() !== '');
  lines.sort((a, b) => a.length - b.length);
  el.value = lines.join('\n');
}

// テキスト整形（前後の空白除去）
function formatText() {
  const el = document.getElementById('txtdata');
  if (!el) return;
  let text = el.value;
  text = text.replace(/^[ \t\u3000]+/gm, "");
  text = text.replace(/[ \t\u3000]+$/gm, "");
  el.value = text.trim();
}

// フォントサイズ・幅切替
function setFont() {
  const dataEl = document.getElementById("txtdata");
  const widthEl = document.getElementById("WIDTH");
  if (!dataEl || !widthEl) return;
  if (dataEl.style.fontSize === 'var(--line-font-size)') {
    dataEl.style.fontSize = '20px';
    dataEl.style.width = '52ch';
  } else {
    dataEl.style.fontSize = 'var(--line-font-size)';
    dataEl.style.width = widthEl.value;
  }
}

// 問題行数カウント
function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  const validLines = lines.filter(line => line.trim() !== "");
  document.getElementById("LINES").value = validLines.length;
}

// バイト数/全半角考慮の長さ判定
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

// 最長行長＋5を設定
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

// テキストエリア高さ自動調整
function adjustTextareaHeight(id) {
  const textarea = document.getElementById(id);
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

// テキストエリア高さ最小調整
function minTextareaHeight(id) {
  const textarea = document.getElementById(id);
	if (textarea) {
	    const computedMinHeight = window.getComputedStyle(textarea).minHeight;
	    textarea.style.height = computedMinHeight;
  }
}

// ドラッグ＆ドロップおよび初期化処理
window.addEventListener('DOMContentLoaded', () => {
  const txtdataArea = document.getElementById("txtdata");

  if (txtdataArea) {
    txtdataArea.addEventListener("dragover", function(e) {
      e.preventDefault();
    });

    txtdataArea.addEventListener("drop", async function(e) {
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

  formatText();
});

  async function copyText() {
    const textarea = document.getElementById('txtdata');
    
    try {
      await navigator.clipboard.writeText(textarea.value);
      //alert('copy');
    } catch (err) {
      alert('コピーに失敗しました');
    }
  }
