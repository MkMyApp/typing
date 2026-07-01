function generateText() {

  const txtData = document.getElementById('txtdata');

  const chars = strdata.replace(/[\n\r\s]/g, "");
  let result = "";
  for (let i = 0; i < lines; i++) {
    let line = "";
    for (let j = 0; j < length; j++) {
      line += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += line + (i < lines - 1 ? "\n" : "");
  }
  txtData.value = result;
}

// ボタンを押したときに実行する関数
function updateStrData() {
  const inputElement = document.getElementById("setData");
  const editorEl = document.getElementById("editor");
  const inputValue = inputElement.value.trim();
  
  if (inputValue === "") {
    editorEl.value = "対象を入力";
    return;
  }
  
  //現在プレイ中（練習中）強制終了
  if (typeStarted) {
    typeStarted = false;
    finished = true;
    endTime = performance.now();
    showFinalResult(); // 終了画面（正解率などの結果）を表示
  }
  
  strdata = inputValue;
  generateText();
  init();
  editorEl.value = inputValue; 

}
