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

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    const editInput = document.getElementById('editor');
    
    // --- ボタン処理 ---
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let text;

            if (button.id === 'speak') {
                text = editInput.value.trim();
            } else if (button.id === 'CLR') {
                editInput.value = "";
            } else if (button.id === 'BS') {
                editInput.value = editInput.value.slice(0, -1);
            } else if (button.id === 'EntBtn') {
                if (!typeStarted){
                    startType();
                    editorEl.value = '';
                } else {
                    judgeCurrentWord();
                }
                return;
            } else if (button.id === 'Spc') {
                editInput.value = editInput.value + " ";
            } else if (button.id === 'Zen') {
                editInput.value = editInput.value + " ";
            } else {
                text = button.value || button.textContent.trim();
								editInput.value = editInput.value + text;
            }
            speakText(text);
        });
    });

    //Enterキーでの読み上げ処理 ---
    editInput.addEventListener('keydown', (e) => {
        // Enterキーであり、かつIME変換中でない場合のみ実行
        if (e.key === 'Enter' && !e.isComposing) {
            const text = editInput.value.trim();
            speakText(text);
        }
    });
});

// --- ボタンの色設定に関する処理 ---

// id属性を持たない「文字キー」のみを対象として抽出
const targetButtons = Array.from(document.querySelectorAll('button')).filter(btn => !btn.id);

function updateButtonColors(str) {
  targetButtons.forEach(btn => {
    // value属性が存在するかどうかをチェック
    const hasValue = btn.hasAttribute('value');
    const char = btn.value;

    // 1. value属性がないボタンは常に表示
    // 2. URLパラメータ(str)がない場合も表示
    if (!hasValue || str === null) {
      btn.style.color = "#000";
      btn.style.pointerEvents = "auto";
    } 
    // 3. value属性があり、かつパラメータに含まれている文字のみ表示
    else if (char !== '' && str.includes(char)) {
      btn.style.color = "#000";
      btn.style.pointerEvents = "auto";
    } 
    // 4. それ以外のvalue属性を持つボタンは透明にする
    else {
      btn.style.color = "transparent";
      btn.style.pointerEvents = "auto";
    }
  });
}
// URLパラメータ（?ch=...）を取得して処理を実行
const urlParams = new URLSearchParams(window.location.search);
const paramValue = urlParams.get('ch');

updateButtonColors(paramValue);
