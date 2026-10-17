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
TITLE_MSG = getParam('t', TITLE_MSG); // タイトル
START_MSG = getParam('s', START_MSG); // スタートメッセージ
INPUT_MSG = getParam('m', INPUT_MSG); // 確認メッセージ
IME = getParam('ime', IME);           // Enter Shift+Enter
RANDOM = getParam('rnd', RANDOM);     // 出題数
WIDTH = getParam('w', WIDTH);         // 問題表示幅
F2flag = getParam('F2', F2flag);      // F2編集 on/off
imgSrc = getParam('img', imgSrc);     // 画像ソースを設定

// 画面表示制御
function showEditor(elem) {
  if (!elem) return;
  elem.style.display = "block";
  elem.style.width   = "640px";
  elem.style.height  = "120px";
  elem.style.fontSize= "20px";
  elem.focus();
}

// F1キーによる画像の表示非表示切り替え
function imgNone() {
  const img = document.getElementById('img');
  if (img) {
    if (img.style.display === "none") {
      img.style.display = "inline-block";
    } else {
      img.style.display = "none";
    }
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'F1') { 
    event.preventDefault();
    imgNone();
  } 
});

// 呼び出し元のHTMLファイル名に応じた localStorage のキー名を動的生成する
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  const baseName = filename.replace(/\.[^/.]+$/, "") || "default";
  return `CustomData_${baseName}`;
}

// F2キーによる表示・非表示および保存処理の切り替え
function setupF2KeyListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      const txtDataElem = document.getElementById('txtdata');
      if (txtDataElem) {
        if (txtDataElem.style.display === "none" || txtDataElem.style.display === "") {
          // 保存データがあれば表示前に設定
          const savedData = localStorage.getItem(getStorageKey());
          if (savedData !== null) {
            txtDataElem.value = savedData;
          }
          showEditor(txtDataElem);
        } else {
          // localStorage に保存して非表示にし、初期化を実行
          localStorage.setItem(getStorageKey(), txtDataElem.value);
          txtDataElem.style.display = "none";
          if (typeof init === 'function') { init(); }
        }
      }
    }
  });
}

// DOMが完全に読み込まれてから各種要素や初期化を処理する
window.addEventListener('DOMContentLoaded', () => {

  const imgElem = document.getElementById('img');
  if (imgElem) {
    // エラーが発生したときは要素自体を削除
    imgElem.onerror = function() {
      imgElem.remove();
    };

    // 画像の読み込み設定
    if (imgSrc && imgSrc !== "") {
      imgElem.src = imgSrc;
    } else {
      // imgSrcが空の場合も要素自体を削除
      imgElem.remove();
    }
  }

  const txtDataElem = document.getElementById('txtdata');

  // localStorage に保存データがあればテキストエリアの内容を復元
  if (txtDataElem) {
    const savedData = localStorage.getItem(getStorageKey());
    if (savedData !== null && savedData !== "") {
      txtDataElem.value = savedData;
    }
  }

  // 初回生成と初期化
  if (typeof init === 'function') {
    init();
  }
  
  const isEmptyData = txtDataElem && txtDataElem.value.trim() === "";

  if (F2flag === 'on' || isEmptyData) {
    setupF2KeyListener();
    if (isEmptyData && txtDataElem) {
      showEditor(txtDataElem);
    }
  }
});