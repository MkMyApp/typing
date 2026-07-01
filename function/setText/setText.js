// ボタンを押したときに実行する関数
function updateStrData() {
  const dataEl = document.getElementById("txtdata");
  const inputVal = dataEl.value.trim();
  
  // 【ポイント】textarea の現在の表示状態をチェック
  if (dataEl.style.display !== "none") {
    
    // 1. textarea が表示されている場合：入力内容を確定して隠す
    if (inputVal === "") {
      dataEl.placeholder = "問題文を入力してください";
      return;
    }
    
    // 現在プレイ中（練習中）強制終了
    if (typeStarted) {
      typeStarted = false;
      finished = true;
      endTime = performance.now();
      showFinalResult(); // 終了画面（正解率などの結果）を表示
    }

    init();
    
    // textarea のみを隠す（ボタンは残る）
    dataEl.style.display = "none";
    
  } else {
    // 2. textarea が隠れている場合：再設定のために再表示する
    dataEl.style.display = "inline-block"; // または "block"
    dataEl.focus(); // すぐに入力できるようフォーカスを合わせる
  }
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
    document.getElementById("txtdata").style.display = "inline-block"; // または "block"

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

const dataEl = document.getElementById("txtdata");
if (dataEl.value.trim() !== "") {
  dataEl.style.display = "none";
}
