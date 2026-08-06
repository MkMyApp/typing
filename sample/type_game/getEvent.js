let isTracking = false;
let lastQIndex = 0; // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1問ごとの開始時間を保持（パターンB用）

function strOutput(str) {
  //console.log(str);
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.value += str + '\n';
    // 常に最下部へスクロール
    logEl.scrollTop = logEl.scrollHeight;
  }
}

// 1. キー入力時に呼び出す関数（イベントハンドラー）
function handleKeyDown(e) {
  if (!isTracking) return;

  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  // --------------------------------------------------
  //  入力完了時の処理（Enter判定）
  // --------------------------------------------------
  if (e.key === 'Enter') {
    // IME OFF の時：Enter単体で完了
    // IME ON の時 ：Shift + Enter で完了
    if (isImeOff || e.shiftKey) {
      
      // --- パターンB: 1問単体の計算 ---
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = currentWord;

      // その1行にかかった時間（秒）
      const lineSec = (performance.now() - lineStartTime) / 1000;
      
      // その1行の入力文字数
      const lineChars = userTyped.length;

      // その1行の CPM
      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

      // その1行の正解数判定
      let lineCorrectChars = 0;
      const u = [...userTyped];
      const a = [...targetWord];
      for (let i = 0; i < u.length; i++) {
        if (u[i] === a[i]) lineCorrectChars++;
      }
      const lineTargetLen = Math.max(u.length, a.length);

      // その1行の正解率
      let lineAccuracy = 0;
      if (lineTargetLen > 0) {
        lineAccuracy = Math.round((lineCorrectChars / lineTargetLen) * 100);
      }

      // ▼ 1問ごとの結果をログ出力
      strOutput(`[入力完了] 解答単語: ${currentWord} -> ${lineChars}ch ${lineSec.toFixed(2)}sec ${lineCpm}cpm (正解率: ${lineAccuracy}%)`);
      
    }
  } else {
    // keydownの判定
    strOutput(`Key: ${e.key}, Code: ${e.code}`);
  }
}

// 2. イベントリスナーの登録
window.addEventListener('keydown', handleKeyDown, true);


// 3. 状態監視（タイマー処理）
const checkInterval = setInterval(() => {
  // ■ 開始判定
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = 0; // 開始時に初期化
    // ▼ ここに開始時の処理
    strOutput('[タイピング開始]');
  }

  // ■ 問題出題時の判定
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now(); // 出題時のタイムスタンプを取得（パターンB用）

    // ▼ ここに出題時の処理
    strOutput(`[問題出題] 第${qIndex}問: ${currentWord}`);
  }

  // ■ 終了判定
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    
    // 全体の集計（typing.js のグローバル変数から計算）
    const sec = (endTime - startTime) / 1000;
    let cpm = 0;
    if (sec > 0) {
      cpm = Math.round((totalChars / sec) * 60);
    }

    let accuracy = 0;
    if (targetLengthTotal > 0) {
      accuracy = Math.round((correctChars / targetLengthTotal) * 100);
    }

    // ログに出力（全問終了時の通算成績）
    strOutput(`[タイピング終了] ${totalChars}ch ${sec.toFixed(2)}sec ${cpm}cpm (正解率: ${accuracy}%)`);
  }
}, 100);
