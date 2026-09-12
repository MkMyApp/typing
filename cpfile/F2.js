// 表示・非表示を制御する関数（引数で指定）
function setTextarea(isVisible) {
  const textarea = document.getElementById('txtdata');
  if (!textarea) return;

  if (isVisible) {
    textarea.style.display = 'block';
    textarea.focus();
  } else {
    textarea.style.display = 'none';
    init();
  }
}

// ドキュメント全体のイベントリスナー
document.addEventListener('keydown', function(event) {
　//Escape Fn
  if (event.key === 'F2') {
    event.preventDefault();
    const textarea = document.getElementById('txtdata');
    if (!textarea) return;

    // 現在の表示状態を反転させて引数に渡す
    const isHidden = (textarea.style.display === 'none');
    setTextarea(isHidden);
  }
});
