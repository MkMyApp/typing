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
// ★ タイピング完了時に中央に表示する画像のサイズ設定（高さを基準に縦横比を維持）
const CENTER_IMAGE_HEIGHT = 300;  // 中央表示する画像の縦幅基準 (px)

// ★ フォールバック用の画像配列（画像が存在しない場合に使用）
const ENEMY_IMAGES = [
  'ドラゴンエッグ.jfif',
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
const YOU_HEIGHT = 300;
const ENEMY_HEIGHT = 100; // 画像描画時の標準縦幅
const OFFSET_LEFT = 300; //出現位置右端からのオフセット
const BASE_SPEED = 1;      // 左へ進む速度

// ★ 中央に固定表示する画像専用の変数
let centerDisplayImage = null;
let centerImageLoaded = false;

// 敵オブジェクトを1個生成する関数（流れてくる敵）
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // ★ 画像ファイル名は「問題文.jfif」で確定
  const imageSrc = targetWord ? `${targetWord}.jfif` : ENEMY_IMAGES[0];

  const img = new Image();

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

  // ★ 画像が存在しない・読み込めない場合ドラゴンエッグ.jfif
  img.onerror = () => {
    const fallbackSrc = ENEMY_IMAGES[0] || 'ドラゴンエッグ.jfif';
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

// 称号計算関数（竜狩りテーマ）
function getRankTitle(cpm, acc) {
  if (acc < 70) return "訓練生";
  if (cpm >= 70 && acc >= 98) return "竜神殺し";
  if (cpm >= 60 && acc >= 95) return "伝説の竜騎士";
  if (cpm >= 50 && acc >= 90) return "竜牙士";
  if (cpm >= 40 && acc >= 85) return "竜狩り";
  if (cpm >= 30) return "討伐隊長";
  if (cpm >= 20) return "見習い猟兵";
  return "村の自警団";
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

  // 2. 中央に固定表示する画像の描画
  if (centerDisplayImage && centerImageLoaded) {
    const aspect = centerDisplayImage.naturalWidth / centerDisplayImage.naturalHeight;
    const centerDrawHeight = CENTER_IMAGE_HEIGHT;
    const centerDrawWidth = centerDrawHeight * aspect;

    const cx = (canvas.width - centerDrawWidth) / 2;
    const cy = (canvas.height - centerDrawHeight) / 2;

    ctx.save();
    ctx.drawImage(centerDisplayImage, cx, cy, centerDrawWidth, centerDrawHeight);
    ctx.restore();
  }

  // 3. プレイヤー画像 (you.png) の描画
  if (myImg.complete && myImg.naturalWidth !== 0) {
    const playerHeight = YOU_HEIGHT;
    const aspect = myImg.naturalWidth / myImg.naturalHeight;
    const playerWidth = playerHeight * aspect;
    
    const playerX = 0;
    const playerY = ((canvas.height - playerHeight) / 2) + 50;

    ctx.drawImage(myImg, playerX, playerY, playerWidth, playerHeight);
  }

  // ★ 4. 流れてくる敵の移動と描画（最後＝最前面に描画）
  activeEnemies.forEach(enemy => {
    enemy.x -= enemy.speed;

    if (enemy.loaded) {
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // 5. エフェクト描画
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

  // 6. スコア表示
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
  centerDisplayImage = null; // ゲーム開始時は中央画像をクリア
  centerImageLoaded = false;
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

    // ★ タイピング完了時に新しい中央表示用画像としてセット
    centerDisplayImage = enemy.img;
    centerImageLoaded = enemy.loaded;

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
    activeEnemies = [];
     // centerDisplayImage = null; // ゲーム終了時は中央の画像もクリア

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