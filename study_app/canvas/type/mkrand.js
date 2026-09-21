// 1. 読み込まれているスクリプトのURLからクエリパラメータ（引数）を取得する
const currentScript = document.currentScript || (function() {
  const scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

const urlParams = new URLSearchParams(currentScript.src.split('?')[1]);

// 2. パラメータから値を取得（指定がない場合はデフォルト値として 6 や 100 を設定）
const length = urlParams.has('len') ? parseInt(urlParams.get('len'), 10) : 6; // 問題文の長さ
const lines = urlParams.has('lines') ? parseInt(urlParams.get('lines'), 10) : 100; // 生成問題数

function generateText() {
  let sourceText = "";
  const txtDataElem = document.getElementById('txtdata');
  const strDataElem = document.getElementById('strdata');

  // strdataが存在し、かつ値が入っていればそちらを優先、なければtxtdataを使う
  if (strDataElem && strDataElem.value.trim() !== "") {
    sourceText = strDataElem.value;
  } else if (txtDataElem) {
    sourceText = txtDataElem.value;
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
  
  if (txtDataElem) {
    txtDataElem.value = result;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const txtDataElem = document.getElementById('txtdata');

  // JavaScriptで <textarea id="strdata" hidden> を動的に生成して追加する
  const strDataElem = document.createElement('textarea');
  strDataElem.id = 'strdata';
  strDataElem.hidden = true; // 最初は非表示
  if (txtDataElem) {
    strDataElem.value = txtDataElem.value; // txtdataの内容を初期セット
  }
  document.body.appendChild(strDataElem);

  // 初回生成と初期化
  generateText();
  init();

  // F2キーで表示・非表示を切り替える
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault(); // ブラウザ標準のF2動作を抑制
      if (strDataElem) {
        if (strDataElem.hasAttribute('hidden')) {
          // 非表示から表示にする時：もしstrdataが空ならtxtdataからコピーする
          if (strDataElem.value.trim() === "" && txtDataElem) {
            strDataElem.value = txtDataElem.value;
          }
          strDataElem.removeAttribute('hidden');
          strDataElem.focus(); // 表示されたらフォーカスを当てる
        } else {
          // 表示から非表示にする時
          strDataElem.setAttribute('hidden', true);
          generateText();
          if (typeof init === 'function') {
            init();
          }
        }
      }
    }
  });
});