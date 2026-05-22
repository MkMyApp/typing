const subject = document.getElementById('editor');
//const subject = window

subject.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[a-zA-Z]$/.test(key)) {
        speak(key);
    }
});

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}