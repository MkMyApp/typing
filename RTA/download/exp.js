const expEl = document.getElementById('exp');
if (expEl) {
  expEl.addEventListener('click', function() {
    this.hidden = true;
    editorEl.focus();
  });
}
