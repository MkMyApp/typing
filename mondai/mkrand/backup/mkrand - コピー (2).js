// 1. HTMLファイルのURL（ブラウザのアドレスバー）からパラメータを取得
const htmlParams = new URLSearchParams(window.location.search);

// 2. 読み込まれているスクリプトのタグからパラメータを取得
const currentScript = document.currentScript || (function() {
  const scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();
const jsParams = new URLSearchParams(currentScript.src.split('?')[1]);

// 両方をチェックし、HTML側を優先、なければJS側、どちらもなければデフォルト値を使う関数
function getParam(key) {
  if (htmlParams.has(key)) return htmlParams.get(key);
  if (jsParams.has(key)) return jsParams.get(key);
  return null;
}

// 3. パラメータから値を取得（デフォルト値の設定）
const length = getParam('len') ? parseInt(getParam('len'), 10) : 6; // 問題文の長さ
const lines = getParam('lines') ? parseInt(getParam('lines'), 10) : 100; // 生成問題数
const F2flag = getParam('F2') ? getParam('F2') : (getParam('F2') ? getParam('F2') : 'off'); // F2編集 on/off
const paramStr = getParam('str') ? getParam('str') : ''; // 対象文字を設定
const imgSrc = getParam('img') ? getParam('img') : ''; // 画像ソースを設定

// 問題文字列生成
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
// 編集画面（テキストエリア）を表示状態にし、スタイルを適用してフォーカスする共通関数
function showEditor(elem) {
  if (!elem) return;
  elem.removeAttribute('hidden');
  elem.style.width = "640px";
  elem.style.height = "120px";
  elem.style.fontSize = "20px";
  elem.focus();
}

// F2キーによる表示・非表示の切り替え（編集画面のトグル）を設定する関数
function setupF2KeyListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault(); // ブラウザ標準のF2動作を抑制

      const strDataElem = document.getElementById('strdata');

      if (strDataElem) {
        if (strDataElem.hasAttribute('hidden')) {
          // 編集画面を開くとき（共通関数を使用）
          showEditor(strDataElem);
        } else {
          // 編集画面を閉じてゲーム画面に戻る時

          localStorage.setItem('mkrandCustomData', strDataElem.value);

          strDataElem.setAttribute('hidden', true);
          generateText(); // 再生成・反映
          
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

	const strDataElem = document.getElementById('strdata');
  const txtDataElem = document.getElementById('txtdata');

  let isLoadedFromStorage = false; // localStorageから読み込んだかどうかのフラグ

  if (strDataElem) {
    // 優先順位に従って strdata.value を決定する
    if (paramStr !== '') {
      // 1. 【最優先】URLパラメータ ( ?str=... ) で指定されている場合
      strDataElem.value = paramStr;
    } else if (strDataElem.value.trim() !== '') {
      // 2. 【第2優先】HTMLの #strdata に文字列が設定されている場合
      // (そのまま維持)
    } else if (txtDataElem && txtDataElem.value.trim() !== '') {
      // 3. 【第3優先】HTMLの #txtdata に文字列が設定されている場合
      strDataElem.value = txtDataElem.value;
    } else {
      // 4. 【第4優先】localStorage から保存データを読み込む
      const savedData = localStorage.getItem('mkrandCustomData');
      if (savedData !== null && savedData !== "") {
        strDataElem.value = savedData;
        isLoadedFromStorage = true; // 読み込み成功フラグを立てる
      }
    }
  }

  // 初回生成と初期化
  generateText();
  if (typeof init === 'function') {
    init();
  }
  
  // データが空かどうかを判定する変数
  const isEmptyData = strDataElem && strDataElem.value.trim() === "";
	// ★ F2キーのリスナー設定（F2flagが 'on'、localStorageから読み込み、またはデータが空の場合）
  if (F2flag === 'on' || isLoadedFromStorage || isEmptyData) {
    setupF2KeyListener();
    if (isEmptyData) {
			showEditor(strDataElem);
  　}
  }

});
