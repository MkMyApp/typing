function speak(text, lang, rate) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
}

// テキストを受け取り、言語を判定して読み上げる関数
function speakText(text) {
    // 空や全角スペースではない場合
    if (text !== '' && text !== ' ') {
        // ひらがな、カタカナ、漢字、全角記号などの全角文字が含まれているか判定
        if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text)) {
            speak(text, 'ja-JP', 0.5);
        } else {
            speak(text, 'en-US', 1);
        }
    }
}

// ボタンクリック時の処理
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    const editInput = document.getElementById('edit'); //
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let text;

            if (button.id === 'speak') {
                text = editInput.value.trim();
            
            } else if (button.id === 'BS') {
                editInput.value = editInput.value.slice(0, -1);

            } else if (button.id === 'Spc') {
                editInput.value = editInput.value + " ";

            } else if (button.id === 'Zen') {
                editInput.value = editInput.value + "　";

            }else {
                text = button.textContent.trim();
                editInput.value = editInput.value + text;
            }
            
            speakText(text);
        });
    });
});