// テキストエリアの高さを内容に合わせて自動調整する関数
function adjustHeight(el) {
  el.style.height = 'auto'; // 一度リセットして高さを再計算可能にする
  el.style.height = el.scrollHeight + 'px'; // 内容（スクロール領域）の高さに合わせる
}

async function buildHtmlListFromDirectoryHandle(dirHandle) {
  const files = [];
  const isLinkMode = document.getElementById("Link").checked;
  // 並び替え設定の取得
  const sortMode = document.querySelector('input[name="sort"]:checked').value;

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file") {
      if (name.toLowerCase().endsWith(".html") && name.toLowerCase() !== "index.html") {
        const file = await handle.getFile();
        files.push({
          name: name,
          modified: file.lastModified
        });
      }
    }
  }

  // --- 並び替えの判定処理 ---
  if (sortMode === "name") {
    // ファイル名順（昇順 A→Z）
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
  } else {
    // タイムスタンプ順（新しい順）
    files.sort((a, b) => b.modified - a.modified);
  }
  // -------------------------

  let result = "";
  for (const file of files) {
    if (isLinkMode) {
      const title = file.name.replace(/\.html$/i, "");
      result += `<p><a href="${file.name}">${title}</a></p>\n`;
    } else {
      result += `'${file.name}',\n`;
    }
  }

  return { files, result };
}

async function listHtmlFiles() {
  const textarea = document.getElementById("output");
  textarea.value = "";

  try {
    const dirHandle = await window.showDirectoryPicker();
    const { files, result } = await buildHtmlListFromDirectoryHandle(dirHandle);

    textarea.value = result;
    adjustHeight(textarea); // 出力後に高さを調整
    alert("完了：" + files.length + "件");
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      alert("エラーが発生したか、対応していないブラウザです。");
    }
  }
}

document.getElementById("btnLoad").addEventListener("click", listHtmlFiles);

const output = document.getElementById("output");

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

      const { files, result } = await buildHtmlListFromDirectoryHandle(handle);
      output.value = result;
      adjustHeight(output); // ドロップでの出力後も高さを調整
      alert("完了：" + files.length + "件");
      return;
    }

    alert("このブラウザではフォルダのドロップに対応していない可能性があります。");
  } catch (err) {
    console.error(err);
    alert("フォルダの読み取りに失敗しました。");
  }
});
// テキストエリアを直接編集した際にも高さを自動調整する
output.addEventListener("input", () => {
  adjustHeight(output);
});
