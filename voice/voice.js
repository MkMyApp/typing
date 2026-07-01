const subject = document.getElementById('editor');

subject.addEventListener('keydown', (event) => {
	// 【読み上げ（Ctrl + Enter）】の判定
	if (event.key === 'Enter' && event.ctrlKey) {
	    event.preventDefault();
	    if (subject.value !== "") {
	        // 1. 読み上げ中はテキストエリアを無効化する
	        subject.disabled = true;

	        //日本語音声で読み上げる。
	        //speak_jp(subject.value, () => {
	        //英語音声で読み上げる。
	        speak_en(subject.value, () => {

          // 2. 読み上げ完了後にテキストを消去し、有効化する
          subject.value = "";
          subject.disabled = false;
          // 3. テキストエリアにフォーカス
          subject.focus();
	        });
	    }
	    return;
	}

  // 【打鍵確認】の判定
  const key = event.key;
  if (/^[ -~]$/.test(key)) {
    speak_en(key);
  }
  
});

function speak(text, lang, rate, onEndCallback) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    
    // 読み上げ終了時の処理を設定
    if (onEndCallback) {
        utterance.onend = onEndCallback;
    }
    
    window.speechSynthesis.speak(utterance);
}

function speak_jp(text, onEndCallback) {
    speak(text, 'ja-JP', 1, onEndCallback);
}

function speak_en(text, onEndCallback) {
    speak(text, 'en-US', 1, onEndCallback);
}
