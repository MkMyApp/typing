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
const length = parseInt(getParam('len', '6'), 10); // 問題文の長さ
const lines = parseInt(getParam('lines', '100'), 10); // 生成問題数
const F2flag = getParam('F2', 'off'); // F2編集 on/off
const paramStr = getParam('str', ''); // 対象文字を設定
const imgSrc = getParam('img', ''); // 画像ソースを設定
TITLE_MSG = getParam('t', TITLE_MSG);
START_MSG = getParam('s',START_MSG);
INPUT_MSG = getParam('m',INPUT_MSG);
IME = getParam('ime',IME);
RANDOM = getParam('rnd',RANDOM);
WIDTH = getParam('w',WIDTH);

// 問題文字列生成（乱数によるランダム生成）
function generateText() {
  const strDataElem = document.getElementById('strdata');
  const txtDataElem = document.getElementById('txtdata');
  if (!strDataElem || !txtDataElem) {
    return;
  }
  
  let sourceText = strDataElem.value.trim();
  if (sourceText === "") {
    return;
  }

  const chars = sourceText.replace(/[\n\r\s]/g, "");
  let result = "";
  
  if (chars.length > 0) {
    for (let i = 0; i < lines; i++) {
      let line = "";
      for (let j = 0; j < length; j++) {
        line += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      result += line + (i < lines - 1 ? "\n" : "");
    }
  }
  
  txtDataElem.value = result;
}

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

// F2キーによる表示・非表示の切り替え
function setupF2KeyListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      const strDataElem = document.getElementById('strdata');
      if (strDataElem) {
        if (strDataElem.style.display === "none" || strDataElem.style.display === "") {
          showEditor(strDataElem);
        } else {
          localStorage.setItem(getStorageKey(), strDataElem.value);
          strDataElem.style.display = "none";
          generateText(); // 再生成・反映
          if (typeof init === 'function') { init() }
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

  const strDataElem = document.getElementById('strdata');
  const txtDataElem = document.getElementById('txtdata');

  if (strDataElem) {
    if (paramStr !== '') {
      strDataElem.value = paramStr;
    } else if (strDataElem.value.trim() !== '') {
      // (そのまま維持)
    } else if (txtDataElem && txtDataElem.value.trim() !== '') {
      strDataElem.value = txtDataElem.value;
    } else {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData !== null && savedData !== "") {
        strDataElem.value = savedData;
      }
    }
  }

  // 初回生成と初期化
  generateText();
  if (typeof init === 'function') {
    init();
  }
  
  const isEmptyData = strDataElem && strDataElem.value.trim() === "";

  if (F2flag === 'on' || isEmptyData) {
    setupF2KeyListener();
    if (isEmptyData) {
      showEditor(strDataElem);
    }
  }
});
