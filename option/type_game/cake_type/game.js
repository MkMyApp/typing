let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア保持用変数
let totalScore = 0;

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================
const ENEMY_IMAGES = [
  'cake (24).png', 'cake (23).png', 'cake (14).png', 'cake (17).png',
  'cake (13).png', 'cake (18).png', 'cake (19).png', 'cake (21).png',
  'cake (16).png', 'cake (20).png', 'cake (26).png', 'cake (29).png',
  'cake (30).png', 'cake (31).png', 'cake (32).png', 'cake (34).png',
  'cake (12).png', 'cake (15).png', 'cake (7).png',  'cake (35).png',
  'cake (36).png', 'cake (25).png', 'cake (1).png',  'cake (27).png',
  'cake (28).png', 'cake (22).png', 'cake (6).png',  'cake (33).png',
  'cake (3).png',  'cake (2).png',  'cake (4).png',  'cake (11).png'
];

const ENEMY_HEIGHT = 280; // 表示する高さ(px)
const ENEMY_SPEED = 3;    // 1フレームあたりの移動速度(px)

let activeEnemies = [];

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
//  Canvas 描画・アニメーションエンジン (1024x434)
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
  canvas.width = 1024;
  canvas.height = 434;
}

function spawnEnemy() {
  if (ENEMY_IMAGES.length === 0) return;

  const randomSrc = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
  const img = new Image();

  const enemy = {
    img: img,
    x: canvas ? canvas.width : 1024,
    y: 117,
    width: 200,
    height: ENEMY_HEIGHT,
    loaded: false
  };

  img.onload = () => {
    if (img.naturalHeight > 0) {
      const aspect = img.naturalWidth / img.naturalHeight;
      enemy.width = ENEMY_HEIGHT * aspect;
    }
    enemy.y = 120;
    enemy.loaded = true;
  };

  img.src = randomSrc;
  activeEnemies.push(enemy);
}

function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = activeEnemies.length - 1; i >= 0; i--) {
      const enemy = activeEnemies[i];
      enemy.x -= ENEMY_SPEED;

      if (enemy.loaded) {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
      }

      if (enemy.x + enemy.width < 0) {
        activeEnemies.splice(i, 1);
      }
    }
  }
  requestAnimationFrame(updateAndDraw);
}

requestAnimationFrame(updateAndDraw);

// ==================================================
//  ランク設定
// ==================================================
function getRank(cpm, accuracy) {
  if (accuracy < 50) return "F"; 
  if (cpm >= 500 && accuracy >= 100) return "肥満神";
  if (cpm >= 360 && accuracy >= 99) return "超重量";
  if (cpm >= 280 && accuracy >= 98) return "甘味王";
  if (cpm >= 200 && accuracy >= 95) return "ぽっちゃり";
  if (cpm >= 160 && accuracy >= 90) return "S";
  if (cpm >= 120 && accuracy >= 85) return "A";
  if (cpm >= 80 && accuracy >= 80)  return "B";
  if (cpm >= 60 && accuracy >= 70)  return "C";
  if (cpm >= 40 && accuracy >= 60)  return "D";
  if (cpm >= 20 && accuracy >= 50)  return "E";
  return "F";
}

// ==================================================
//  各種イベントフック関数
// ==================================================

/**
 * 1. 1打鍵・入力ごとのイベントハンドラ
 */
function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  strOutput(``);
  strOutput(`[キー入力]`);
  strOutput(`キー : '${key}'`);
  strOutput(`コード: ${code}`);
  strOutput(`間 隔: ${pressSec.toFixed(3)}s`);
  strOutput(`文字数: ${charCount}ch`);
  strOutput(`速 度: ${instantCpm}cpm`);
}

/**
 * 2. 1行完了時のイベントハンドラ（スコア計算・加算）
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  
  // 1行のスコア計算（速度 × 正解率）
  const lineScore = Math.round(cpm * (accuracy / 100));
  
　// ★ ケーキ（画像）が画面上に表示されている（残っている）場合のみスコアを加算
  if (activeEnemies.length > 0) {
    totalScore += lineScore;
  }

  const rank = getRank(cpm, accuracy);

  strOutput(``);
  strOutput(`[1行入力完了]`);
  strOutput(`単 語: ${targetWord}`);
  strOutput(`文字数: ${lineChars}ch`);
  strOutput(`時 間: ${lineSec.toFixed(2)}sec`);
  strOutput(`速 度: ${cpm}cpm`);
  strOutput(`正解率: ${accuracy}%`);
  strOutput(`加算pt: ${lineScore}pt`);
  strOutput(`現在計: ${totalScore}pt`);
  strOutput(`ランク: ${rank}`);
  strOutput(``);

  // 1行完了時に画面上の画像を消去
  activeEnemies = [];
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[タイピング開始]');
  activeEnemies = [];
  
  // 開始時にスコアを0にリセット
  totalScore = 0;

  // 開始時に <div id="score"></div> の表示を消去
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '';
  }

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

  spawnEnemy();
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

  const rank = getRank(totalCpm, totalAccuracy);

  strOutput(``);
  strOutput(`========================`);
  strOutput(`[全問完了 リザルト]`);
  strOutput(`総文字数: ${tChars}ch`);
  strOutput(`総 時間: ${tSec.toFixed(2)}sec`);
  strOutput(`平均速度: ${totalCpm}cpm`);
  strOutput(`平均精度: ${totalAccuracy}%`);
  strOutput(`獲得スコア: ${totalScore}pt`);
  strOutput(`総合ランク: ${rank}`);
  strOutput(`========================`);

  // <div id="score"></div> にランクとスコアを代入
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `${rank} : ${totalScore * 10}kcal`;
  }
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

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    if (typeof finished !== 'undefined' && finished) {
      if (typeof restartGame === 'function') restartGame();
    }
  }

  if (e.key === 'Escape') {
    if (typeof typeStarted !== 'undefined' && typeStarted) {
      if (typeof stopGame === 'function') stopGame();
    }
  }
}

window.addEventListener('keydown', handleKeyDown, true);

// ==================================================
//  タイピング状態監視 (タイマー処理)
// ==================================================
const checkInterval = setInterval(() => {
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = qIndex;
    onGameStart();
    onNextQuestion(qIndex);
  }

  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    onNextQuestion(qIndex);
  }

  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    const finalSec = (endTime - startTime) / 1000;
    const finalCpm = finalSec > 0 ? Math.round((totalChars / finalSec) * 60) : 0;
    const finalAcc = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    onGameComplete(finalCpm, finalAcc);
  }

  if (typeof typeStarted !== 'undefined' && !typeStarted && isTracking) {
    isTracking = false;
    strOutput('[タイピング中断]');
  }
}, 100);
