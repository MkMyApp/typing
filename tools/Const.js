function composeText() {
  // 1. 各項目の値を取得
  const titleMsg = document.getElementById('TITLE_INPUT').value;
  const startMsg = document.getElementById('START_INPUT').value;
  const inputMsg = document.getElementById('INPUT_INPUT').value;
  const randomVal = document.getElementById('RANDOM_INPUT').value;
  const widthVal = document.getElementById('WIDTH_INPUT').value;

  // 2. テキストエリアの要素を取得 (HTMLに合わせて txtdata に変更)
  const textArea = document.getElementById('txtdata');

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
  textArea.value = configText + scaleText + headText + textVal + footText + scaleText;
}

// 行数をカウントして問題数(input)に設定する関数
function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  
  // 改行で分割して配列にする
  const lines = txtdata.split('\n');
  
  // 空白を除いた純粋な問題行だけを数える（末尾の空改行などをノーカウントにするため）
  const validLines = lines.filter(line => line.trim() !== "");

  // 問題数のinput（RANDOM_INPUT）に件数を反映
  document.getElementById("RANDOM_INPUT").value = validLines.length;
}

// 文字列の半角換算での長さを返す関数（全角=2, 半角=1）
function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
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
  
  lines.forEach(line => {
    const currentLen = getByteLength(line);
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  });

  const resultWidth = (maxLen + 5) + "ch";
  document.getElementById("WIDTH_INPUT").value = resultWidth;
}

// 画面が読み込まれたら各ボタンにイベントリスナーを登録
document.addEventListener("DOMContentLoaded", () => {
  const maxLineButton = document.getElementById("MAXLINE");
  if (maxLineButton) {
    maxLineButton.addEventListener("click", countLines);
  }

  const maxLenButton = document.getElementById("MAXLEN");
  if (maxLenButton) {
    maxLenButton.addEventListener("click", setMaxLength);
  }
});