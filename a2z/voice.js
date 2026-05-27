const subject = document.getElementById('editor');
const voiceCheckbox = document.getElementById('check');

subject.addEventListener('keydown', (event) => {
    if (voiceCheckbox && voiceCheckbox.checked) {
        const key = event.key;
        if (/^[ -~]$/.test(key)) {
            speak(key);
        }
    }
});

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}
