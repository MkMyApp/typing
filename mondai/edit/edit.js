// 1. HTMLファイルのURL（ブラウザのアドレスバー）からパラメータを取得
const htmlParams = new URLSearchParams(window.location.search);

// 2. 読み込まれているスクリプトのタグからパラメータを取得
const currentScript = document.currentScript || (function() {
  const scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

// スクリプトのsrc属性から「?」以降を取得
let jsParams = new URLSearchParams();
if (currentScript && currentScript.src && currentScript.src.includes('?')) {
  const queryString = currentScript.src.split('?')[1];
  jsParams = new URLSearchParams(queryString);
}

// 優先順位：HTMLパラメータ > スクリプトタグパラメータ > null
function getParam(key) {
  let val = null;
  if (htmlParams.has(key)) val = htmlParams.get(key);
  else if (jsParams.has(key)) val = jsParams.get(key);

  if (val !== null) {
    try {
      // URLエンコードされている値（%E5%95%8F...など）をデコード
      return decodeURIComponent(val);
    } catch (e) {
      return val;
    }
  }
  return null;
}

// localStorage のキー生成関数
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  const baseName = filename.replace(/\.[^/.]+$/, "") || "default";
  return `CustomConfig_${baseName}`;
}

// --------------------------------------------------
// パラメータ・ストレージの読み込みと保存
// --------------------------------------------------
const storageKey = getStorageKey();
let savedConfig = {};

// 保存済みデータの取得
try {
  const savedStr = localStorage.getItem(storageKey);
  if (savedStr) {
    savedConfig = JSON.parse(savedStr);
  }
} catch (e) {
  console.error("設定データの読み込みに失敗しました", e);
}

// --------------------------------------------------
// 各設定値の取得
// --------------------------------------------------
TITLE_MSG = getParam('t')   ?? savedConfig.TITLE_MSG   ?? TITLE_MSG;
START_MSG = getParam('s')   ?? savedConfig.START_MSG   ?? START_MSG;
INPUT_MSG = getParam('m')   ?? savedConfig.INPUT_MSG   ?? INPUT_MSG;
IME       = getParam('ime') ?? savedConfig.IME         ?? IME;
RANDOM    = getParam('rnd') ?? savedConfig.RANDOM      ?? RANDOM;
WIDTH     = getParam('w')   ?? savedConfig.WIDTH       ?? WIDTH;
imgSrc    = getParam('img') ?? savedConfig.imgSrc      ?? imgSrc;

// TXTDATAの取得（%250A や %0A を含めて改行コード \n に復元）
let rawTxt = getParam('txt') ?? savedConfig.TXTDATA ?? TXTDATA;
if (rawTxt && typeof rawTxt === 'string') {
  try {
    let decoded = decodeURIComponent(rawTxt);
    if (decoded.includes('%0A') || decoded.includes('%0a')) {
      decoded = decoded.replace(/%0a/gi, '\n');
    }
    TXTDATA = decoded;
  } catch (e) {
    TXTDATA = rawTxt.replace(/%250A/gi, '\n').replace(/%0A/gi, '\n');
  }
} else {
  TXTDATA = rawTxt;
}

// 【重要】typing.js が即時参照できるよう DOM (#txtdata) に値を書き戻す
const txtDataElem = document.getElementById('txtdata');
if (txtDataElem && TXTDATA !== undefined) {
  txtDataElem.value = TXTDATA;
}

// 最新の設定状態を localStorage に自動保存
const configToSave = {
  TITLE_MSG,
  START_MSG,
  INPUT_MSG,
  IME,
  RANDOM,
  WIDTH,
  imgSrc,
  TXTDATA
};
localStorage.setItem(storageKey, JSON.stringify(configToSave));

// F1キーによる画像の表示非表示切り替え
function imgNone() {
  const img = document.getElementById('img');
  if (img) {
    img.style.display = (img.style.display === "none") ? "inline-block" : "none";
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'F1') { 
    event.preventDefault();
    imgNone();
  } 
});

// DOM読み込み完了後の各種UI制御
window.addEventListener('DOMContentLoaded', () => {
  // 画像要素のセットアップ
  const imgElem = document.getElementById('img');
  if (imgElem) {
    imgElem.onerror = () => imgElem.remove();
    if (imgSrc && imgSrc !== "") {
      imgElem.src = imgSrc;
    } else {
      imgElem.remove();
    }
  }
});