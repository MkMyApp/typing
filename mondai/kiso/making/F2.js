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
