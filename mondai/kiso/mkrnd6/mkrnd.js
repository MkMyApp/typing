function generateText() {

  const txtData = document.getElementById('txtdata');

  const chars = txtData.value.replace(/[\n\r\s]/g, "");
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

// ドキュメント全体のイベントリスナー
document.addEventListener('keydown', function(event) {
　//Escape Fn
  if (event.key === 'F2') {
    event.preventDefault();
    const textarea = document.getElementById('txtdata');
    if (!textarea) return;

    //問題生成　txtData.valueは書き換わる
    generateText();

    // 現在の表示状態を反転させて引数に渡す
    const isHidden = (textarea.style.display === 'none');
    setTextarea(isHidden);
  }
});

document.addEventListener('DOMContentLoaded', () => {
	generateText();
	init();
});
