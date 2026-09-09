const exp = document.getElementById('exp');
if (exp) { exp.textContent = exp.textContent.replace(/^\n/, ''); }

window.addEventListener('keydown', (event) => {
  if (exp && event.key === 'Escape') {
    if (exp.style.display === "none") {
      exp.style.display = "block";
    } else {
      exp.style.display = "none";
    }
  }
});
