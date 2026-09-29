let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1行ごとの開始時間を保持

// ==================================================
//  Canvas 描画・アニメーションエンジン 
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// ページ読み込み時の初期背景（いかのおすし.png）
if (canvas) {
  canvas.style.backgroundImage = "url('いかのおすし.png')";
  canvas.style.backgroundSize = "cover";
  canvas.style.backgroundPosition = "center";
  canvas.style.backgroundRepeat = "no-repeat";
}

/**
 * 毎フレームの描画ループ
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 【演出実装箇所】
  }
  requestAnimationFrame(updateAndDraw);
}

// アニメーションループ起動
requestAnimationFrame(updateAndDraw);

// ==================================================
//  背景画像を切り替えるヘルパー関数（エラーフォールバック付き）
// ==================================================
function setCanvasBackground(imageName) {
  if (!canvas) return;

  const img = new Image();
  img.src = imageName;

  img.onload = () => {
    canvas.style.backgroundImage = `url('${imageName}')`;
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = "center";
    canvas.style.backgroundRepeat = "no-repeat";
  };

  img.onerror = () => {
    console.warn(`画像 "${imageName}" が見つからないため、「いかのおすし.png」を表示します。`);
    canvas.style.backgroundImage = "url('いかのおすし.png')";
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = "center";
    canvas.style.backgroundRepeat = "no-repeat";
  };
}

// ==================================================
//  ランク設定（防犯バージョン）
// ==================================================
function getRank(cpm, accuracy) {
  // 正解率 50%以下
  if (accuracy < 50) return "おちつけ"; 
  if (cpm >= 200 && accuracy >= 100) return "ぼうはんマスター";
  if (cpm >= 160 && accuracy >= 98) return "あんぜんはかせ";
  if (cpm >= 120 && accuracy >= 90) return "こどもけいさつ";
  if (cpm >= 100 && accuracy >= 80)  return "これであんしん";
  if (cpm >= 80 && accuracy >= 80)  return "よくできました";
  if (cpm >= 60 && accuracy >= 60)  return "できました";
  return "がんばろう";
}

// ==================================================
//  各種イベントフック
// ==================================================

function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;
}

function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  const lineScore = Math.round(cpm / 25 * ((accuracy / 100) ** 3));
  totalScore += lineScore;
  const rank = getRank(cpm, accuracy);
  
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `${lineScore * 10}点`;
  }
}

function onGameStart() {
  activeEnemies = [];
  totalScore = 0;

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '';
  }

  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

function onNextQuestion(questionIndex) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  if (targetWord) {
    setCanvasBackground(`${targetWord}.png`);
  } else {
    setCanvasBackground("いかのおすし.png");
  }
}

function onGameComplete(totalCpm, totalAccuracy) {
  const tChars = typeof totalChars !== 'undefined' ? totalChars : 0;
  let tSec = 0;
  try {
    if (typeof startTime !== 'undefined' && typeof endTime !== 'undefined') {
      tSec = (endTime - startTime) / 1000;
    }
  } catch (e) {}

  const rank = getRank(totalCpm, totalAccuracy);
  setCanvasBackground("いかのおすし.png");

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `${rank} / ${totalScore * 10}点`;
  }
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

let lastKeyPressTime = 0;
let lastKeyCode = '';

const editorElForGame = document.getElementById('editor');
if (editorElForGame) {
  editorElForGame.addEventListener('input', (e) => {
    if (!isTracking) return;

    const now = performance.now();
    const baseTime = lastKeyPressTime > 0 ? lastKeyPressTime : lineStartTime;
    const pressSec = baseTime > 0 ? (now - baseTime) / 1000 : 0;
    
    lastKeyPressTime = now;

    const charCount = editorElForGame.value.replace(/\n/g, '').length;
    const instantCpm = pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0;

    onKeyPress({
      key: e.data || e.inputType,
      code: lastKeyCode || 'Input',
      pressSec: pressSec,
      charCount: charCount,
      instantCpm: instantCpm
    });
  });
}

function handleKeyDown(e) {
  // ★ リザルト表示中（finished が true の状態）に Enter が押されたらスコアを消す
  if (e.key === 'Enter' && typeof finished !== 'undefined' && finished) {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = '';
    }
  }

  if (!isTracking) return;

  lastKeyCode = e.code;
  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

      let lineCorrectChars = 0;
      const u = [...userTyped];
      const a = [...targetWord];
      for (let i = 0; i < u.length; i++) {
        if (u[i] === a[i]) lineCorrectChars++;
      }
      const lineTargetLen = Math.max(u.length, a.length);

      let lineAccuracy = 0;
      if (lineTargetLen > 0) {
        lineAccuracy = Math.round((lineCorrectChars / lineTargetLen) * 100);
      }

      onLineComplete({
        cpm: lineCpm,
        accuracy: lineAccuracy,
        lineSec: lineSec,
        lineChars: lineChars
      });
    }
  }
}

window.addEventListener('keydown', handleKeyDown, true);

// ==================================================
//  タイピング状態監視 (タイマー処理)
// ==================================================
const checkInterval = setInterval(() => {
  // ■ タイピング開始時
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = 0;
    onGameStart();
  }

  // ■ 次の問題が出題された時
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now();
    onNextQuestion(qIndex);
  }

  // ■ 全問終了時（クリア時）
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    
    const sec = (endTime - startTime) / 1000;
    let cpm = sec > 0 ? Math.round((totalChars / sec) * 60) : 0;
    let accuracy = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    onGameComplete(cpm, accuracy);
  }
}, 100);