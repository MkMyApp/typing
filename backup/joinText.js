// テキストを消去する
function clrText(){
	document.getElementById("txtdata").value = "";
}

// フォルダを選択し、中のtxtファイルを結合する
async function loadFile(){
  try {
    // フォルダ選択ダイアログを開く
    const dirHandle = await window.showDirectoryPicker();
    const textarea = document.getElementById("txtdata");
    let combinedText = textarea.value;

    // フォルダ内の各エントリーを走査
    for await (const entry of dirHandle.values()) {
      // ファイルかつ拡張子が .txt のものだけ対象にする
      if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
        const file = await entry.getFile();
        const text = await file.text();
        
        // 既存テキストの末尾に追記（改行で区切る）
        if (combinedText !== "" && !combinedText.endsWith('\n')) {
            combinedText += '\n';
        }
        combinedText += text + '\n';
      }
    }

    // 結合した内容をテキストエリアにセット
    textarea.value = combinedText;

    // 重複行削除を実行
    dedupeLines();

  } catch(e) {
    console.log("フォルダの読み込みがキャンセルされたか、エラーが発生しました", e);
  }
}

// ダイアログを開いて保存する
async function saveFile() {
  const text = document.getElementById("txtdata").value;
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "combined.txt",
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

function dedupeLines() {
  const textarea = document.getElementById("txtdata");
  
  // 改行コードの統一と行分割
  const lines = textarea.value.replace(/\r\n/g, '\n').split('\n');
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 空行でなく、かつ未登録のものだけを追加
    if (trimmedLine !== '' && !seen.has(trimmedLine)) {
      result.push(trimmedLine);
      seen.add(trimmedLine);
    }
  }

  textarea.value = result.join('\n');
}