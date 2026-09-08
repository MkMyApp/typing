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

document.addEventListener('DOMContentLoaded', () => {
	generateText();
	init();
});
