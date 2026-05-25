// テキストエリアの高さを内容に合わせて自動調整する関数[cite: 3]
function adjustHeight(el) {
  el.style.height = 'auto'; // 一度リセットして高さを再計算可能にする[cite: 3]
  el.style.height = el.scrollHeight + 'px'; // 内容（スクロール領域）の高さに合わせる[cite: 3]
}

async function buildFolderListFromDirectoryHandle(dirHandle) {
  const folders = [];
  const isLinkMode = document.getElementById("Link").checked; //[cite: 3]
  // 並び替え設定の取得
  const sortMode = document.querySelector('input[name="sort"]:checked').value; //[cite: 3]

  for await (const [name, handle] of dirHandle.entries()) {
    // フォルダ（directory）のみを抽出対象とする
    if (handle.kind === "directory") {
      let timestamp = 0;
      
      try {
        // 各フォルダの中にある "index.html" を探す
        const indexHandle = await handle.getFileHandle("index.html");
        const file = await indexHandle.getFile();
        // index.html の更新日時を取得
        timestamp = file.lastModified;
      } catch (e) {
        // index.html が見つからない場合は、古いものとして timestamp = 0 のままにする
        timestamp = 0;
      }

      folders.push({
        name: name,
        modified: timestamp
      });
    }
  }

  // --- 並び替えの判定処理 ---[cite: 3]
  if (sortMode === "name") {
    // フォルダ名順（昇順 A→Z）[cite: 3]
    folders.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
  } else {
    // index.html のタイムスタンプ順（新しい順）[cite: 3]
    folders.sort((a, b) => b.modified - a.modified);
  }
  // -------------------------

  let result = "";
  for (const folder of folders) {
    if (isLinkMode) {
      // リンク形式：フォルダへの相対リンクとして末尾に / を付与
      result += `<p><a href="${folder.name}/">${folder.name}</a></p>\n`;
    } else {
      // 配列・リスト形式
      result += `'${folder.name}',\n`;
    }
  }

  return { folders, result };
}

async function listFolders() {
  const textarea = document.getElementById("output");
  textarea.value = "";

  try {
    // フォルダ選択ダイアログを表示[cite: 3]
    const dirHandle = await window.showDirectoryPicker();
    const { folders, result } = await buildFolderListFromDirectoryHandle(dirHandle);

    textarea.value = result;
    adjustHeight(textarea); // 出力後に高さを調整[cite: 3]
    alert("完了：フォルダ " + folders.length + "件");
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      alert("エラーが発生したか、対応していないブラウザです。");
    }
  }
}

// ボタンクリックイベントの登録[cite: 3]
document.getElementById("btnLoad").addEventListener("click", listFolders);

const output = document.getElementById("output");

// ドラッグ＆ドロップ関連のイベント[cite: 3]
output.addEventListener("dragover", (e) => {
  e.preventDefault();
  output.classList.add("drop-hover");
});

output.addEventListener("dragleave", () => {
  output.classList.remove("drop-hover");
});

output.addEventListener("drop", async (e) => {
  e.preventDefault();
  output.classList.remove("drop-hover");
  output.value = "";

  try {
    const item = e.dataTransfer.items[0];
    if (!item) {
      alert("何もドロップされていません。");
      return;
    }

    if (item.getAsFileSystemHandle) {
      const handle = await item.getAsFileSystemHandle();

      if (!handle || handle.kind !== "directory") {
        alert("フォルダをドロップしてください。");
        return;
      }

      const { folders, result } = await buildFolderListFromDirectoryHandle(handle);
      output.value = result;
      adjustHeight(output); // ドロップでの出力後も高さを調整[cite: 3]
      alert("完了：フォルダ " + folders.length + "件");
      return;
    }

    alert("このブラウザではフォルダのドロップに対応していない可能性があります。");
  } catch (err) {
    console.error(err);
    alert("フォルダの読み取りに失敗しました。");
  }
});

// テキストエリアを直接編集した際にも高さを自動調整する[cite: 3]
output.addEventListener("input", () => {
  adjustHeight(output);
});