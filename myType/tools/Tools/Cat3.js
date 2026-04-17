// テキストエリア
const texts = [
  document.getElementById("text0"),
  document.getElementById("text1"),
  document.getElementById("text2")
];

// Saveボタン
const saveButtons = [
  document.getElementById("save0"),
  document.getElementById("save1"),
  document.getElementById("save2")
];

// ステータス表示
const fileNameLabels = [
  document.getElementById("filename(0)"),
  document.getElementById("filename(1)"),
  document.getElementById("filename(2)")
];

const modifiedLabels = [
  document.getElementById("modified(0)"),
  document.getElementById("modified(1)"),
  document.getElementById("modified(2)")
];

const lineCountLabels = [
  document.getElementById("linecount(0)"),
  document.getElementById("linecount(1)"),
  document.getElementById("linecount(2)")
];

const charCountLabels = [
  document.getElementById("charcount(0)"),
  document.getElementById("charcount(1)"),
  document.getElementById("charcount(2)")
];

// ファイル名
const fileNames = ["(none)", "(none)", "(none)"];

// ファイルハンドル
const fileHandles = [null, null, null];

// 変更フラグ
const modifiedFlags = [false, false, false];

// 保存用キー
const DB_NAME = "mergeEditorDB";
const STORE_NAME = "handles";
const DIR_KEY = "lastDirectoryHandle";

// ステータス更新
function updateStatus(index) {
  const text = texts[index].value;
  const lines = text.length === 0 ? 1 : text.split("\n").length;
  const chars = text.length;

  if (fileNameLabels[index]) {
    fileNameLabels[index].textContent = "File: " + fileNames[index];
  }

  if (modifiedLabels[index]) {
    modifiedLabels[index].textContent = modifiedFlags[index] ? " *" : "";
  }

  if (lineCountLabels[index]) {
    lineCountLabels[index].textContent = "Line: " + lines;
  }

  if (charCountLabels[index]) {
    charCountLabels[index].textContent = "Chars: " + chars;
  }
}

// 全部更新
function updateAllStatus() {
  updateStatus(0);
  updateStatus(1);
  updateStatus(2);
}

// 変更状態設定
function setModified(index, modified) {
  modifiedFlags[index] = modified;
  updateStatus(index);
}

// API対応チェック
function checkFSAPI() {
  if (!window.showOpenFilePicker || !window.showSaveFilePicker || !window.showDirectoryPicker) {
    alert("このブラウザは File System Access API に十分対応していません（Chrome系を使用してください）");
    return false;
  }
  return true;
}

// IndexedDBを開く
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function () {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

// handle保存
async function saveHandle(key, handle) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(handle, key);

    tx.oncomplete = function () {
      db.close();
      resolve();
    };

    tx.onerror = function () {
      db.close();
      reject(tx.error);
    };
  });
}

// handle読込
async function loadHandle(key) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = function () {
      db.close();
      resolve(request.result || null);
    };

    request.onerror = function () {
      db.close();
      reject(request.error);
    };
  });
}

// 保存済みフォルダハンドルを取得
async function getLastDirectoryHandle() {
  try {
    const dirHandle = await loadHandle(DIR_KEY);
    return dirHandle || null;
  } catch (err) {
    console.error("フォルダハンドル読込失敗", err);
    return null;
  }
}

// 保存済みフォルダハンドルを書き込み可能か確認
async function verifyDirectoryHandle(dirHandle) {
  if (!dirHandle) return null;

  try {
    let permission = await dirHandle.queryPermission({ mode: "readwrite" });
    if (permission === "granted") {
      return dirHandle;
    }

    if (permission === "prompt") {
      permission = await dirHandle.requestPermission({ mode: "readwrite" });
      if (permission === "granted") {
        return dirHandle;
      }
    }
  } catch (err) {
    console.error("フォルダハンドル権限確認失敗", err);
  }

  return null;
}

// フォルダを選択して保存
async function selectDirectory() {
  if (!checkFSAPI()) return null;

  try {
    const dirHandle = await window.showDirectoryPicker();
    await saveHandle(DIR_KEY, dirHandle);
    return dirHandle;
  } catch (err) {
    if (err.name === "AbortError") return null;
    console.error(err);
    alert("フォルダ選択失敗");
    return null;
  }
}

// 開くときの startIn を決める
async function getStartInOption() {
  let dirHandle = await getLastDirectoryHandle();
  dirHandle = await verifyDirectoryHandle(dirHandle);

  if (!dirHandle) {
    dirHandle = await selectDirectory();
  }

  return dirHandle || "downloads";
}

// テキストエリアをクリア
async function clearFile(index) {
  texts[index].value = "";
  fileNames[index] = "(none)";
  fileHandles[index] = null;
  modifiedFlags[index] = false;
  updateStatus(index);
}

// ファイルを開く（txt / html 対応）
async function loadFile(index) {
  if (!checkFSAPI()) return;

  try {
    const startInValue = await getStartInOption();

    const [handle] = await window.showOpenFilePicker({
      startIn: startInValue,
      multiple: false,
      types: [
        {
          description: "Text / HTML",
          accept: {
            "text/plain": [".txt"],
            "text/html": [".html", ".htm"]
          }
        }
      ],
      excludeAcceptAllOption: false
    });

    const file = await handle.getFile();
    const content = await file.text();
    const normalized = content.replace(/\t/g, "  ");

    fileHandles[index] = handle;
    fileNames[index] = file.name;
    texts[index].value = normalized;

    setModified(index, false);
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    alert("ファイルを開けませんでした");
  }
}

// ドラッグ＆ドロップ読込
function setupDragAndDrop() {
  texts.forEach((textarea, index) => {
    textarea.addEventListener("dragover", (e) => {
      e.preventDefault();
      textarea.classList.add("dragover");
    });

    textarea.addEventListener("dragleave", () => {
      textarea.classList.remove("dragover");
    });

    textarea.addEventListener("drop", async (e) => {
      e.preventDefault();
      textarea.classList.remove("dragover");

      try {
        const file = e.dataTransfer.files[0];
        if (!file) return;

        const content = await file.text();
        const normalized = content.replace(/\t/g, "  ");

        texts[index].value = normalized;
        fileNames[index] = file.name;

        // ドラッグ読込では書き込みハンドルは取得できない
        fileHandles[index] = null;

        setModified(index, true);
      } catch (err) {
        console.error(err);
        alert("ドラッグ読込失敗: " + err.message);
      }
    });
  });
}

// 上書き保存（元ファイルへ）
async function saveToHandle(index) {
  const handle = fileHandles[index];
  if (!handle) {
    throw new Error("保存先ファイルが未選択です");
  }

  let permission = await handle.queryPermission({ mode: "readwrite" });
  if (permission !== "granted") {
    permission = await handle.requestPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      throw new Error("書き込み権限が拒否されました");
    }
  }

  const writable = await handle.createWritable();
  await writable.write(texts[index].value);
  await writable.close();
}

// 名前を付けて保存 (常に showSaveFilePicker を呼ぶ)
async function saveAs(index) {
  if (!checkFSAPI()) return;

  try {
    const suggestedName = fileNames[index] === "(none)" ? "untitled.txt" : fileNames[index];

    const handle = await window.showSaveFilePicker({
      suggestedName: suggestedName,
      startIn: await getStartInOption(),
      types: [
        {
          description: "Text / HTML",
          accept: {
            "text/plain": [".txt"],
            "text/html": [".html", ".htm"]
          }
        }
      ]
    });

    const writable = await handle.createWritable();
    await writable.write(texts[index].value);
    await writable.close();

    // 保存した新しいハンドルを保持する
    fileHandles[index] = handle;
    fileNames[index] = handle.name;

    setModified(index, false);
    alert("名前を付けて保存しました");
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    alert("保存失敗: " + err.message);
  }
}

// マージ → 中央に反映だけ
async function mergeFiles() {
  if (!checkFSAPI()) return;

  try {
    if (!fileHandles[1] && texts[1].value === "") {
      alert("中央のファイルを先に開いてください");
      return;
    }

    const left = texts[0].value;
    const center = texts[1].value;
    const right = texts[2].value;

    const merged = left + center + right;

    texts[1].value = merged;
    fileHandles[1] = null;
    fileNames[1] = "(none)";

    setModified(1, true);
    updateStatus(1);
  } catch (err) {
    console.error(err);
    alert("マージ失敗: " + err.message);
  }
}

// 保存
async function saveFile(index) {
  if (!checkFSAPI()) return;

  try {
    if (fileHandles[index]) {
      await saveToHandle(index);
      setModified(index, false);
      alert("保存しました");
      return;
    }

    // ドラッグ読込時など、ハンドルがない場合は名前付き保存
    const suggestedName = fileNames[index] === "(none)" ? "untitled.txt" : fileNames[index];

    const handle = await window.showSaveFilePicker({
      suggestedName: suggestedName,
      startIn: await getStartInOption(),
      types: [
        {
          description: "Text / HTML",
          accept: {
            "text/plain": [".txt"],
            "text/html": [".html", ".htm"]
          }
        }
      ]
    });

    const writable = await handle.createWritable();
    await writable.write(texts[index].value);
    await writable.close();

    fileHandles[index] = handle;
    fileNames[index] = handle.name;

    setModified(index, false);

    alert("保存しました");
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    alert("保存失敗: " + err.message);
  }
}

function processText(text) {
  // 改行コード統一（CRLF → LF）
  text = text.replace(/\r\n/g, "\n");

  //半角2つ → 全角スペース
  text = text.replace(/  /g, "　");

  // 行頭の全角スペース 削除
  text = text.replace(/^　+/gm, '');

  // タブ → 半角スペース2つ
  text = text.replace(/\t/g, "  ");

  //行末のスペース削除
  text = text.replace(/[ ]+$/gm, "");
  text = text.replace(/[　]+$/gm, "");

  return text;
}

async function cleanFile(index) {
  let text = texts[index].value;

  text = processText(text);

  texts[index].value = text;
  setModified(index, true);
}

// 初期化時の修正
window.addEventListener("load", () => {

  setupDragAndDrop();
  updateAllStatus();
});

// 入力時更新
texts.forEach((textarea, index) => {
  textarea.addEventListener("input", () => {
    setModified(index, true);
  });
});