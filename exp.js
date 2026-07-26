//const expEl = document.getElementById('exp');
if (window.self !== window.top) {
  if (expEl) expEl.hidden = true;
}

if (expEl) {
  expEl.addEventListener('click', function() {
    this.hidden = true;
    editorEl.focus();
  });
}
