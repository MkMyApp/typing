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

// 直前に読み上げたテキストを記録する変数
let lastSpokenText = '';

const targetNode = document.getElementById('target');

const observer = new MutationObserver(() => {
  // プレイ中かつ終了していない場合のみ処理
  if (typeof typeStarted !== 'undefined' && typeStarted && !finished) {
    const textToSpeak = targetNode.textContent.trim();
    
    // 1. 空文字、スタート文字、結果の％表示は除外
    // 2. 直前に読み上げた単語と同じ場合はスキップ（正誤判定時の再描画対策）
    if (
      textToSpeak && 
      textToSpeak !== START_MSG && 
      !textToSpeak.includes('%') && 
      textToSpeak !== lastSpokenText
    ) {
      // 読み上げを実行し、履歴を更新
      speak_en(textToSpeak);
      lastSpokenText = textToSpeak;
    }
  } else {
    // ゲームが終了、またはスタート前に戻ったら履歴をクリア
    lastSpokenText = '';
  }
});

// 監視の開始
observer.observe(targetNode, { childList: true, characterData: true, subtree: true });
