//const subject = window
const subject = document.getElementById('editor');

subject.addEventListener('keydown', (event) => {
    // Shift + Enter が押されたか判定
    if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        //speak_en(subject.value);
        speak_jp(subject.value);
        return;
    }
    //半角文字の発音
    const key = event.key;
    if (/^[ -~]$/.test(key)) {
        speak_en(key);
    }
});

function speak(text, lang, rate) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
}

function speak_jp(text) {
    speak(text, 'ja-JP', 1);
}

function speak_en(text) {
    speak(text, 'en-US', 1);
}
