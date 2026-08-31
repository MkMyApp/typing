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
function updateButtonColors(str) {
  // id属性を持たない「文字キー」をその場で取得
  const targetBtns = Array.from(document.querySelectorAll('button')).filter(btn => !btn.id);

  targetBtns.forEach(btn => {
    // value属性があればそれを使い、無ければ表示文字(textContent)を取得
    const char = (btn.value || btn.textContent).trim();

    // 1. ?ch パラメータが存在しない(null)場合は、すべての文字を黒にする
    if (str === null) {
      btn.style.color = "#000";
      if (btn.classList.contains('Label')) {
	      btn.style.pointerEvents = "none";
			} else {
	      btn.style.pointerEvents = "auto";
	    }
    } 
    // 2. 空白（スペース）のボタンは常に黒表示
    else if (char === '' || char === ' ') {
      btn.style.color = "#000";
      btn.style.pointerEvents = "auto";
    }
    // 3. 常に黒表示したい「特別なクラス」がある場合のみ指定する
    else if (btn.classList.contains('Label')) {
      btn.style.color = "#000";
      btn.style.pointerEvents = "none";
    }
    // 4. ?ch に含まれている文字と一致したら 黒(#000) にする
    else if (str.includes(char)) {
      btn.style.color = "#000";
      btn.style.pointerEvents = "auto";
    } 
    // 4. それ以外（一致しない文字）は 透明(transparent) にする
    else {
      btn.style.color = "transparent";
      btn.style.pointerEvents = "none";
    }
  });
}

// URLパラメータ（?ch=...）を取得して処理を実行
const urlParams = new URLSearchParams(window.location.search);
const paramValue = urlParams.get('ch');

updateButtonColors(paramValue);
