// ボタンを押したときに実行する関数
function updateStrData() {
  // 現在表示中（dataEl.style.display が "none" ではない）なら、確定して隠す
  if (dataEl.style.display !== "none") {
    if (dataEl.value.trim() === "") {
      dataEl.placeholder = "問題文を入力してください";
      return;
    }
    
    // プレイ中の強制終了処理
    if (typeof typeStarted !== 'undefined' && typeStarted) {
      typeStarted = false;
      finished = true;
      endTime = performance.now();
      showFinalResult();
    }

    init();
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
	dataEl.style.display = "inline-block";
  setBoxEl.style.display = "inline";

}

function setBoxHide(){
  dataEl.style.display = "none";
	setBoxEl.style.display = "none";

}

const dataEl = document.getElementById("txtdata");
const setBoxEl = document.getElementById("setBox");

if (dataEl.value.trim() !== "") {
  setBoxHide();
}

document.addEventListener('DOMContentLoaded', () => {
    const titleEl = document.getElementById('title');
    if (titleEl) {
        titleEl.addEventListener('click', setBoxShow);
    } else {
        console.error("id='title' の要素が見つかりませんでした");
    }
});

