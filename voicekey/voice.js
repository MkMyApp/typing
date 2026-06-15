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
    const editInput = document.getElementById('editor'); //
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let text;

            if (button.id === 'speak') {
                text = editInput.value.trim();
            
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
                editInput.value = editInput.value + "　";

            }else {
                text = button.textContent.trim();
                editInput.value = editInput.value + text;
            }
            speakText(text);
        });
    });
});
// --- ボタンの色設定に関する処理 ---

const targetButtons = Array.from(document.querySelectorAll('button')).filter(btn => !btn.id);

function updateButtonColors(str) {
  targetButtons.forEach(btn => {
    const char = btn.textContent.trim();
    // 文字列が含まれるか、strがnull/undefined（全文字対象）なら黒
    if (str === null || str === undefined || str.includes(char)) {
      btn.style.color = "black";
    } else {
      btn.style.color = "transparent";
    }
  });
}

// URLパラメータを取得（優先）
const urlParams = new URLSearchParams(window.location.search);
const paramValue = urlParams.get('chars');

if (paramValue !== null) {
  // URLパラメータがある場合はそれを適用
  updateButtonColors(paramValue);
} else {
  // URLパラメータがない場合、str.js を動的に読み込む
  const script = document.createElement('script');
  script.src = 'str.js';
  script.onload = () => {
    // 読み込み成功時、str.jsで定義された strBlack を使用
    // ※ typeof で存在確認を行い、なければ null を渡す
    updateButtonColors(typeof strBlack !== 'undefined' ? strBlack : null);
  };
  script.onerror = () => {
    // str.js が見つからない場合は全ボタンを黒にする
    updateButtonColors(null);
  };
  document.head.appendChild(script);
}
