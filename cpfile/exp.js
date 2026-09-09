<script>
const exp = document.getElementById('exp');
if (exp) { exp.textContent = exp.textContent.replace(/^\n/, ''); }
expNone();

function expNone() {
  if (exp) {
    if (exp.style.display === "none") {
      exp.style.display = "block";
    } else {
      exp.style.display = "none";
    }
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { expNone(); } // ← `expNome` を `expNone` に修正
});
</script>