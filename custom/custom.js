  let START_MSG = "Enter⏎でスタート"
  let INPUT_MSG = "英数 かな"
  let RANDOM = 10
  let WIDTH = "25ch"
  
  function showSettings() {
  const customDiv = document.getElementById("custom");
  customDiv.style.display = "";
  const typeDiv = document.getElementById("type");
  typeDiv.style.display = "none";

  }

  function updateSettings() {
	  document.title = document.getElementById("TITLET_MSG").value;
	  START_MSG = document.getElementById("START_MSG").value;
	  INPUT_MSG = document.getElementById("INPUT_MSG").value;
	  RANDOM    = Number(document.getElementById("RANDOM").value);
	  WIDTH     = document.getElementById("WIDTH").value;

	  init();
	  
	  const customDiv = document.getElementById("custom");
	  customDiv.style.display = "none";
	  const typeDiv = document.getElementById("type");
	  typeDiv.style.display = "";

	  const editor = document.getElementById("editor");
	  editor.focus();
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

