// 1. HTMLファイルのURL（ブラウザのアドレスバー）からパラメータを取得
const htmlParams = new URLSearchParams(window.location.search);

// 2. 読み込まれているスクリプトのタグからパラメータを取得
const currentScript = document.currentScript || (function() {
  const scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();
const jsParams = new URLSearchParams(currentScript.src.split('?')[1]);

// ★両方をチェックし、HTML側を優先、なければJS側、どちらもなければデフォルト値を使う関数
function getParam(key) {
  if (htmlParams.has(key)) return htmlParams.get(key);
  if (jsParams.has(key)) return jsParams.get(key);
  return null;
}

// 3. パラメータから値を取得（デフォルト値の設定）
const length = getParam('len') ? parseInt(getParam('len'), 10) : 6; // 問題文の長さ
const lines = getParam('lines') ? parseInt(getParam('lines'), 10) : 100; // 生成問題数
const F2flag = getParam('F2') ? getParam('F2') : 'off'; // F2編集 on/off
const paramStr = getParam('str') ? getParam('str') : ''; // 対象文字を設定
const imgSrc = getParam('img') ? getParam('img') : ''; // 対象文字を設定

// DOMが完全に読み込まれてから画像のsrcを変更する
window.addEventListener('DOMContentLoaded', () => {
  const imgElem = document.getElementById('img');
  if (imgElem && (imgSrc !== "")) {
    imgElem.src = imgSrc;
  }
});

if (paramStr !== '') {
  const strDataElem = document.getElementById('strdata');
  if (strDataElem) {
    strDataElem.value = paramStr;
  }
}

function generateText() {
  const txtDataElem = document.getElementById('txtdata');
  const strDataElem = document.getElementById('strdata');
  // strdataに値が入っていればそちらを優先、なければtxtdataを使う
  if (strDataElem.value.trim() === "") {
    strDataElem.value = txtDataElem.value;
  }

  let  sourceText = strDataElem.value.trim();
 
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
  
  if (txtDataElem) {
    txtDataElem.value = result;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 初回生成と初期化
  generateText();
  init();
  
  // F2キーのリスナー設定関数を呼び出す
  if (F2flag === 'on') {
  	setupF2KeyListener();
  }
});

/**
 * F2キーによる表示・非表示の切り替え（編集画面のトグル）を設定する関数
 */
function setupF2KeyListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault(); // ブラウザ標準のF2動作を抑制

      const txtDataElem = document.getElementById('txtdata');
      const strDataElem = document.getElementById('strdata');

      if (strDataElem) {
        if (strDataElem.hasAttribute('hidden')) {
          strDataElem.removeAttribute('hidden');
          strDataElem.style.width = "640px";
          strDataElem.style.height = "120px";
          strDataElem.style.fontSize = "20px";
          strDataElem.focus(); // 表示されたらフォーカスを当てる
        } else {
          // 表示から非表示にする時（編集画面を閉じてゲーム画面に戻る時）
          if (strDataElem.value.trim() === "" ) {
						alert("対象文字列が空です。")
          }
          strDataElem.setAttribute('hidden', true);
          generateText(); // 新しく編集された問題テキストを再生成・反映する
          
          // ▼ここでゲーム全体を綺麗に初期化・リセットする
          if (typeof init === 'function') {
            init();
          }
        }
      }
    }
  });
}
