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

function applySettings() {
    TITLE_MSG = document.getElementById("TITLE_MSG").value;
    START_MSG = document.getElementById("START_MSG").value;
    INPUT_MSG = document.getElementById("INPUT_MSG").value;
    RANDOM    = Number(document.getElementById("RANDOM").value);
    WIDTH     = document.getElementById("WIDTH").value;
    IME       = document.getElementById("IME").value;
    init(); // typing.js の関数を呼ぶ
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

