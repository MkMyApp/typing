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

function addText() {
  const input = document.getElementById("inpStr");
  const textarea = document.getElementById("txtdata");
  const inputValue = input.value.trim();
  
  if (inputValue !== "") {
    const lines = textarea.value.replace(/\r\n/g, '\n').split('\n');
    const isDuplicate = lines.some(line => line.trim() === inputValue);
    
    if (!isDuplicate) {
      textarea.value = inputValue + "\n" + textarea.value;
      // 追加成功時のメッセージを表示
      input.placeholder = "文字列を追加しました";
    } else {
      // 重複時のメッセージを表示
      input.placeholder = "同じ文字列がありました。";
    }
    
    input.value = ""; // 入力欄をクリア
  }
  // 重複行削除
  dedupeLines()
}

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
