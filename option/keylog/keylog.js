let isTracking = false;
let lastQIndex = -1;    // 前回検知したqIndexを保持 (-1スタート)
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ==================================================
//  テキストエリア状態モニタ
// ==================================================
function strOutput(str) {
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.value += str + '\n';
    logEl.scrollTop = logEl.scrollHeight;
  }
}

// ==================================================
//  各種イベントフック関数
// ==================================================

function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  strOutput(``);
  strOutput(`[キー入力]`);
  strOutput(`キー : '${key}'`);
  strOutput(`コード: ${code}`);   strOutput(`間 隔: ${pressSec.toFixed(3)}s`);
  strOutput(`文字数: ${charCount}ch`);   strOutput(`速 度: ${instantCpm}cpm`);
}

/**
 * 2. 1行完了時のイベントハンドラ
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  strOutput(``);
  strOutput(`[1行入力完了]`);
  strOutput(`単 語: ${targetWord}`);   strOutput(`文字数: ${lineChars}ch`);
  strOutput(`速 度: ${cpm}cpm`);   strOutput(`正解率: ${accuracy}%`);
  strOutput(``);
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[タイピング開始]');
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 */
function onNextQuestion(questionIndex) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  lineStartTime = performance.now();
  strOutput(`[問題出題] 第${questionIndex}問: ${targetWord}`);
}

/**
 * 5. 全問完了（リザルト表示）時のイベントハンドラ
 */
function onGameComplete(totalCpm, totalAccuracy) {
  const tChars = typeof totalChars !== 'undefined' ? totalChars : 0;
  let tSec = 0;
  try {
    if (typeof startTime !== 'undefined' && typeof endTime !== 'undefined') {
      tSec = (endTime - startTime) / 1000;
    }
  } catch (e) {}

  strOutput(``);
  strOutput(`========================`);
  strOutput(`[全問完了 リザルト]`);
  strOutput(`総文字数: ${tChars}ch`);
  strOutput(`総 時間: ${tSec.toFixed(2)}sec`);
  strOutput(`平均速度: ${totalCpm}cpm`);
  strOutput(`平均精度: ${totalAccuracy}%`);
  strOutput(`========================`);
}

// ==================================================
//  イベントフック登録 (typing.js への割り込み)
// ==================================================

const editorElement = document.getElementById('editor');

if (editorElement) {
  editorElement.addEventListener('input', (e) => {
    if (!isTracking || (typeof typeStarted !== 'undefined' && !typeStarted)) return;

    const now = performance.now();
    const pressSec = lastTypeTime > 0 ? (now - lastTypeTime) / 1000 : 0;
    lastTypeTime = now;

    const instantCpm = pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0;
    const currentTyped = editorElement.value.replace(/\n/g, '');

    onKeyPress({
      key: e.data || '',
      code: 'Input',
      pressSec: pressSec,
      charCount: currentTyped.length,
      instantCpm: instantCpm
    });
  });
}

// judgeCurrentWord のフック（typing.js の関数をラップ）
if (typeof judgeCurrentWord === 'function') {
  const originalJudgeCurrentWord = judgeCurrentWord;
  judgeCurrentWord = function() {
    if (isTracking) {
      try {
        const userTyped = typeof typed === 'function' ? typed() : (editorElement ? editorElement.value : '');
        const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

        const lineEndTime = performance.now();
        const lineSec = (lineEndTime - lineStartTime) / 1000;
        const lineChars = userTyped.length;
        const lineCpm = lineSec > 0 ? Math.round((lineChars / lineSec) * 60) : 0;

        let lineCorrectChars = 0;
        const u = [...userTyped];
        const a = [...targetWord];
        for (let i = 0; i < Math.min(u.length, a.length); i++) {
          if (u[i] === a[i]) lineCorrectChars++;
        }
        const lineTargetLen = Math.max(u.length, a.length);
        const lineAccuracy = lineTargetLen > 0 ? Math.round((lineCorrectChars / lineTargetLen) * 100) : 0;

        onLineComplete({
          cpm: lineCpm,
          accuracy: lineAccuracy,
          lineSec: lineSec,
          lineChars: lineChars
        });
      } catch (err) {
        console.error("onLineComplete Error:", err);
      }
    }

    originalJudgeCurrentWord();
  };
}

// ==================================================
//  タイピング状態監視 (タイマー処理)
// ==================================================
const checkInterval = setInterval(() => {
  // ゲーム開始の検知
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = -1; // リセット
    onGameStart();
  }

  // 問題が進んだことの検知（typing.js の qIndex 変更を監視）
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    onNextQuestion(qIndex);
  }

  // ゲーム終了の検知
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    const finalSec = (typeof endTime !== 'undefined' && typeof startTime !== 'undefined') ? (endTime - startTime) / 1000 : 0;
    const finalCpm = finalSec > 0 ? Math.round((totalChars / finalSec) * 60) : 0;
    const finalAcc = (typeof targetLengthTotal !== 'undefined' && targetLengthTotal > 0) 
      ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    onGameComplete(finalCpm, finalAcc);
  }

  // タイピング中断の検知
  if (typeof typeStarted !== 'undefined' && !typeStarted && isTracking) {
    isTracking = false;
    strOutput('[タイピング中断]');
  }
}, 100);
