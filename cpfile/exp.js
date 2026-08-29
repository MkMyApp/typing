window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (document.getElementById('exp').style.display === "none") {
      document.getElementById('exp').style.display = "block";
    } else {
      document.getElementById('exp').style.display = "none";
    }
  }
});
