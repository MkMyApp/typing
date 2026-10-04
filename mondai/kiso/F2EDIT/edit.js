// 1. HTMLファイルのURL（ブラウザのアドレスバー）からパラメータを取得
const htmlParams = new URLSearchParams(window.location.search);

// 2. 読み込まれているスクリプトのタグからパラメータを取得
const currentScript = document.currentScript || (function() {
  const scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

// スクリプトのsrc属性から「?」以降を安全に取得する処理
let jsParams = new URLSearchParams();
if (currentScript && currentScript.src && currentScript.src.includes('?')) {
  const queryString = currentScript.src.split('?')[1];
  jsParams = new URLSearchParams(queryString);
}

// 優先順位：HTMLパラメータ（使用者） > スクリプトタグパラメータ（製作者） > デフォルト値
function getParam(key, defaultValue) {
  if (htmlParams.has(key)) return htmlParams.get(key);
  if (jsParams.has(key)) return jsParams.get(key);
  return defaultValue;
}

// 3. パラメータから値を取得
const F2flag = getParam('F2', 'off'); // F2編集 on/off
const paramStr = getParam('str', ''); // 対象文字を設定
const imgSrc = getParam('img', ''); // 画像ソースを設定

// 画面表示制御
// 編集画面（テキストエリア）を表示状態にし、スタイルを適用してフォーカスする共通関数
function showEditor(elem) {
  if (!elem) return;
  elem.style.display = "block"; // 表示に切り替え
  elem.style.width = "640px";
  elem.style.height = "120px";
  elem.style.fontSize = "20px";
  elem.focus();
}

// 呼び出し元のHTMLファイル名に応じた localStorage のキー名を動的生成する
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  const baseName = filename.replace(/\.[^/.]+$/, "") || "default";
  return `CustomData_${baseName}`;
}

// F2キーによる表示・非表示の切り替え（編集画面のトグル）を設定する関数
function setupF2KeyListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault(); // ブラウザ標準のF2動作を抑制

      const txtDataElem = document.getElementById('txtdata');

      if (txtDataElem) {
        if (txtDataElem.style.display === "none" || txtDataElem.hidden) {
          // 編集画面を開くとき
          showEditor(txtDataElem);
        } else {
// 編集画面を閉じてゲーム画面に戻る時
const storageKey = getStorageKey(); // ← キーを取得
localStorage.setItem(storageKey, txtDataElem.value); // ← 動的なキーで保存
txtDataElem.style.display = "none";

if (typeof init === 'function') {
  init();
          }
        }
      }
    }
  });
}

// DOMが完全に読み込まれてから各種要素や初期化を処理する
window.addEventListener('DOMContentLoaded', () => {
  const imgElem = document.getElementById('img');
  if (imgElem && (imgSrc !== "")) {
    imgElem.src = imgSrc;
  }

  const txtDataElem = document.getElementById('txtdata');

  if (txtDataElem) {
    // 優先順位に従って txtdata.value を決定する
    if (paramStr !== '') {
      // 1. 【最優先】URLパラメータ ( ?str=... ) で指定されている場合
      txtDataElem.value = paramStr;
    } else if (txtDataElem.value.trim() !== '') {
      // 2. 【第2優先】HTMLの #txtdata に文字列が設定されている場合
      // (そのまま維持)
    } else {
      // 3. 【第3優先】localStorage から保存データを読み込む
      const savedData = localStorage.getItem('CustomData');
      if (savedData !== null && savedData !== "") {
        txtDataElem.value = savedData;
      }
    }
  }

  if (typeof init === 'function') {
    init();
  }
  
  // データが空かどうかを判定する変数
  const isEmptyData = txtDataElem && txtDataElem.value.trim() === "";

  if (F2flag === 'on' || isEmptyData) {
    setupF2KeyListener();
    if (isEmptyData) {
      showEditor(txtDataElem);
    }
  }
});