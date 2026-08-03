// ボタンを押したときに実行する関数
function updateStrData() {
  // .hidden クラスが付いていなければ「表示中」とみなす
  if (!setBoxEl.classList.contains("hidden")) {
    if (dataEl.value.trim() === "") {
      dataEl.placeholder = "問題文を入力してください";
      return;
    }
    
    // （既存のプレイ中終了処理はそのまま）
    if (typeof typeStarted !== 'undefined' && typeStarted) {
      typeStarted = false;
      finished = true;
      endTime = performance.now();
      showFinalResult();
    }

		applySettings();
    setBoxHide();
  } else {
    setBoxShow();
    dataEl.focus();
  }
}

// テキストを消去する
function clrText(){
	document.getElementById("txtdata").value = "";
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

// ファイルを開く
async function loadFile(){
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
async function saveFile() {
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

function setBoxShow(){
  setBoxEl.classList.remove("hidden");
}

function setBoxHide(){
  setBoxEl.classList.add("hidden");
}

const dataEl = document.getElementById("txtdata");
const setBoxEl = document.getElementById("setBox");

if (dataEl.value.trim() !== "") {
  setBoxHide();
}

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

function applySettings() {
    TITLE_MSG = document.getElementById("TITLE_MSG").value;
    START_MSG = document.getElementById("START_MSG").value;
    INPUT_MSG = document.getElementById("INPUT_MSG").value;
    RANDOM    = Number(document.getElementById("RANDOM").value);
    WIDTH     = document.getElementById("WIDTH").value;
    IME       = document.getElementById("IME").value;
    init(); // typing.js の関数を呼ぶ
}

function setFont() {
  if (dataEl.style.fontSize === 'var(--line-font-size)') {
    dataEl.style.fontSize = '18px';
  } else {
    dataEl.style.fontSize = 'var(--line-font-size)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
		applySettings();
		const titleEl = document.getElementById('title');
		if (titleEl) {
		    titleEl.addEventListener('click', setBoxShow);
		} else {
		    console.error("id='title' の要素が見つかりませんでした");
		}
});

