let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア・直前獲得スコア保持用変数
let totalScore = 0;
let lastEarnedScore = 0;

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================
// ★ フォールバック用の画像配列（画像が存在しない場合に使用）
const ENEMY_IMAGES = [
  '足軽.png',
];

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const bgImg = new Image();
bgImg.src = 'bg.jpg';

// プレイヤー画像
const myImg = new Image();
myImg.src = 'you.png';

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 演出用配列
let animationFrameId = null;
const ENEMY_HEIGHT = 320; // 画像描画時の標準縦幅
const BASE_SPEED = 1;      // 左へ進む速度

// 敵オブジェクトを1個生成する関数
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // ★ 画像ファイル名は「問題文.png」で確定
  const imageSrc = targetWord ? `${targetWord}.png` : ENEMY_IMAGES[0];

  const img = new Image();
  const OFFSET_LEFT = 200; 

  const enemy = {
    img: img,
    x: (canvas ? canvas.width : 1024) - OFFSET_LEFT,
		y: (((canvas ? canvas.height : 434) - ENEMY_HEIGHT) / 2) + 50,
    width: 180,
    height: ENEMY_HEIGHT,
    speed: BASE_SPEED,
    loaded: false
  };

  // 画像の読み込み成功時
  img.onload = () => {
    if (img.naturalHeight > 0) {
      const aspect = img.naturalWidth / img.naturalHeight;
      enemy.width = ENEMY_HEIGHT * aspect;
    }
    enemy.loaded = true;
  };

  // ★ 画像が存在しない・読み込めない場合は「足軽.png」を表示
  img.onerror = () => {
    const fallbackSrc = ENEMY_IMAGES[0] || '足軽.png';
    if (img.src.includes(fallbackSrc)) return;
    img.src = fallbackSrc;
  };

  img.src = imageSrc;
  activeEnemies = [enemy];
}

// スコア表示関数
function drawScore() {
  if (!ctx || !canvas) return;

  ctx.save();
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  const text = `${lastEarnedScore} pt`; 
  
  const margin = 15;
  const rectX = canvas.width - 200;
  const rectY = margin - 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(rectX, rectY, 185, 35);

  ctx.fillStyle = '#d32f2f';
  ctx.fillText(text, canvas.width - margin, margin);
  ctx.restore();
}

// 称号計算関数
function getRankTitle(cpm, acc) {
  if (acc < 70) return "百姓";
  if (cpm >= 350 && acc >= 98) return "天下一統";
  if (cpm >= 300 && acc >= 95) return "天下布武";
  if (cpm >= 250 && acc >= 90) return "海道一の弓取り";
  if (cpm >= 200 && acc >= 85) return "侍大将";
  if (cpm >= 150) return "足軽大将";
  if (cpm >= 100) return "足軽";
  return "草履取り";
}

// アニメーションメインループ
function update() {
  if (!ctx || !canvas) return;

  // 1. 背景の描画
  if (bgImg.complete && bgImg.naturalWidth !== 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 1.5 プレイヤー描画
  if (myImg.complete && myImg.naturalWidth !== 0) {
    const playerHeight = ENEMY_HEIGHT;
    const aspect = myImg.naturalWidth / myImg.naturalHeight;
    const playerWidth = playerHeight * aspect;
    
    const playerX = 0;
    const playerY = ((canvas.height - playerHeight) / 2) + 50;

    ctx.drawImage(myImg, playerX, playerY, playerWidth, playerHeight);
  }

  // 2. 敵の移動と描画
  activeEnemies.forEach(enemy => {
    enemy.x -= enemy.speed;

    if (enemy.loaded) {
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // 3. エフェクト描画
  effects.forEach(fx => {
    fx.x += fx.vx;
    fx.y += fx.vy;
    fx.alpha -= fx.decay;

    if (fx.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = fx.alpha;
      ctx.fillStyle = fx.color || '#ff0000';
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.size || 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  activeEnemies = activeEnemies.filter(enemy => enemy.x + enemy.width > 0);
  effects = effects.filter(fx => fx.alpha > 0);

  // 4. スコア表示
  drawScore();

  animationFrameId = requestAnimationFrame(update);
}

// 描画ループ開始
if (canvas) {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(update);
}

// ==================================================
//  タイピングイベントフック
// ==================================================
function onGameStart() {
  totalScore = 0;
  lastEarnedScore = 0;
  effects = [];
  activeEnemies = [];
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

function onNextQuestion(qIndex) {
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
  spawnEnemy();
}

function onLineComplete(timeSec, cpm, accuracy, isMissless) {
  const lineScore = Math.round(cpm * (accuracy / 100));
  
  lastEarnedScore = lineScore;
  totalScore += lineScore;

  if (activeEnemies.length > 0) {
    const enemy = activeEnemies[0];

    const enemyWidth = (enemy.img && enemy.img.naturalHeight > 0) 
      ? ENEMY_HEIGHT * (enemy.img.naturalWidth / enemy.img.naturalHeight) 
      : enemy.width;
    const enemyHeight = enemy.height;

    const centerX = enemy.x + enemyWidth / 2;
    const centerY = enemy.y + enemyHeight / 2;

    for (let i = 0; i < 20; i++) {
      effects.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 6 + 3,
        alpha: 1.0,
        decay: 0.04,
        color: isMissless ? '#ffea00' : '#ff9800'
      });
    }
  }

  activeEnemies = [];
}

// judgeCurrentWord のフック
if (typeof judgeCurrentWord === 'function') {
  const originalJudgeCurrentWord = judgeCurrentWord;
  judgeCurrentWord = function() {
    const now = performance.now();
    const timeSec = (now - lineStartTime) / 1000;
    const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
    const userTyped = typeof typed === 'function' ? typed() : '';

    const len = userTyped.length;
    const cpm = timeSec > 0 ? Math.round((len / timeSec) * 60) : 0;

    let correctCharsCount = 0;
    const u = [...userTyped];
    const a = [...targetWord];
    for (let i = 0; i < Math.min(u.length, a.length); i++) {
      if (u[i] === a[i]) correctCharsCount++;
    }
    const maxLen = Math.max(u.length, a.length);
    const accuracy = maxLen > 0 ? Math.round((correctCharsCount / maxLen) * 100) : 0;
    const isMissless = (userTyped === targetWord);

    try {
      onLineComplete(timeSec, cpm, accuracy, isMissless);
    } catch (err) {
      console.error("onLineComplete Error:", err);
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
  if (typeof typeStarted !== 'undefined' && !typeStarted && !finished) {
    const scoreEl = document.getElementById('score');
    if (scoreEl && scoreEl.innerHTML !== '') {
      scoreEl.innerHTML = '';
    }
  }

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

    const rankTitle = getRankTitle(finalCpm, finalAcc);
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = `獲得スコア: <strong>${totalScore} pt</strong><br>称号: <strong>【${rankTitle}】</strong>`;
    }
  }
}, 100);