  let TITLE_MSG
  let START_MSG
  let INPUT_MSG
  let RANDOM
  let WIDTH
  
  function showSettings() {
  document.getElementById("custom").style.display = "block";
  document.getElementById("type").style.display = "none";

  }

  function updateSettings() {
	  document.title = document.getElementById("TITLE_MSG").value;
	  START_MSG = document.getElementById("START_MSG").value;
	  INPUT_MSG = document.getElementById("INPUT_MSG").value;
	  RANDOM    = Number(document.getElementById("RANDOM").value);
	  WIDTH     = document.getElementById("WIDTH").value;

	  init();
    
    document.getElementById("txtComp").style.display = "none";
	  document.getElementById("custom").style.display = "none";
	  document.getElementById("type").style.display = "block";
	  document.getElementById("editor").focus();
  }

// 行数をカウントして問題数(input)に設定する関数
function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  
  // 改行で分割して配列にする
  const lines = txtdata.split('\n');
  
  // 空白を除いた純粋な問題行だけを数える場合（おすすめ）
  const validLines = lines.filter(line => line.trim() !== "");
  
  // もし空行も含めて完全に改行の数で数えたい場合は、下の1行のコメントアウトを解除
  // const validLines = lines;

  // 問題数のinputに件数を反映
  document.getElementById("RANDOM").value = validLines.length;
}

// 画面が読み込まれたら「行数」ボタンにイベントリスナーを登録
document.addEventListener("DOMContentLoaded", () => {
  const maxLineButton = document.getElementById("MAXLINE");
  if (maxLineButton) {
    maxLineButton.addEventListener("click", countLines);
  }
});

// 文字列の半角換算での長さを返す関数（全角=2, 半角=1）
function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    // シフトJIS換算などで全角になる文字コードの判定（簡易版）
    if (str.charCodeAt(i) >= 0x0020 && str.charCodeAt(i) <= 0x007e) {
      length += 1; // 半角
    } else {
      length += 2; // 全角
    }
  }
  return length;
}

// 最長行の文字数を判定して、(最長値 + 5) + "ch" をinputに代入する関数
function setMaxLength() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  
  let maxLen = 0;
  
  // 各行の長さを半角換算で比較し、最大のものを探す
  lines.forEach(line => {
    const currentLen = getByteLength(line);
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  });

  // 数値 + 5 に "ch" をつける
  const resultWidth = (maxLen + 5) + "ch";

  // 文字幅のinputに代入
  document.getElementById("WIDTH").value = resultWidth;
}

// 画面読み込み時に「最長」ボタンのイベントリスナーを登録
document.addEventListener("DOMContentLoaded", () => {
  const maxLenButton = document.getElementById("MAXLEN");
  if (maxLenButton) {
    maxLenButton.addEventListener("click", setMaxLength);
  }
});

function composeText() {

// 1. 各項目の値を取得
const titleMsg = document.getElementById('TITLE_MSG').value;
const startMsg = document.getElementById('START_MSG').value;
const inputMsg = document.getElementById('INPUT_MSG').value;
const randomVal = document.getElementById('RANDOM').value;
const widthVal = document.getElementById('WIDTH').value;

// 2. テキストエリアの要素を取得
const textArea = document.getElementById('txtdata');
const textComp = document.getElementById('txtComp');

// 3. 追加したい「const部分」を組み立てる
const configText = `<script>
const TITLE_MSG = "${titleMsg}";
const START_MSG = "${startMsg}";
const INPUT_MSG = "${inputMsg}";
const RANDOM = "${randomVal}";
const WIDTH = "${widthVal}";
<\/script>\n`;

const scaleText = `<!-------10--------20--------30--------40--------->\n`
const headText = `<textarea id="txtdata" hidden>\n`;

const footText = `</textarea>\n`;

const textVal = textArea.value;

// テキストエリアに合成結果を出力
textComp.value = configText + scaleText + headText + textVal + footText + scaleText;
textComp.style.display = "block";
}

function repText() {
const textArea = document.getElementById('txtdata');
  const text = textArea.value;

  const replacedText = text.replace(/ ' '/g, '\n');

  textArea.value = replacedText;
};

function catText() {
const textArea = document.getElementById('txtdata');
  const text = textArea.value;

  const replacedText = text.replace(/\n+/g, ' ');

  textArea.value = replacedText;
};

function toUpperText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toUpperCase();
}

function toLowerText() {
  const textArea = document.getElementById('txtdata');
  textArea.value = textArea.value.toLowerCase();
}
