// ★ CSSの変数を取得してJavaScript側の基準サイズにする
const computedStyle = getComputedStyle(document.documentElement);
const GAME_WIDTH = parseInt(computedStyle.getPropertyValue('--game-width')) || 1024;
const GAME_HEIGHT = parseInt(computedStyle.getPropertyValue('--game-height')) || 576;

const BGIMG ="bg.png";//背景画像

const YOU_IMG= 'you.png';//キャラクター画像
const YOU_HEIGHT = 300;
const YOU_LEFT = 30; //左からのオフセット
const YOU_TOP = 50; //中央からのオフセット

const FALLBACK = "img.png";//画像の代替

const IMAGE_EXTENSION = '.png';
const ENEMY_HEIGHT = 300; // 画像描画時の標準縦幅
const OFFSET_LEFT = 300; //出現位置右端からのオフセット
const OFFSET_TOP = 50; //出現位置中央からのオフセット
const BASE_SPEED = 1;      // 左へ進む速度

// ★ タイピング完了時に中央に表示する画像のサイズ設定（高さを基準に縦横比を維持）
const CENTER_IMAGE_HEIGHT = 500;  // 中央表示する画像の縦幅基準 (px)

// スコア表示に関する固定の位置・サイズ（順番を修正）
const SCORE_FONT = 'bold 24px sans-serif';
const SCORE_MARGIN = 15;
const SCORE_RECT_WIDTH = 100; 
const SCORE_RECT_HEIGHT = 35;
const SCORE_RECT_X = GAME_WIDTH - SCORE_RECT_WIDTH - SCORE_MARGIN; 
const SCORE_RECT_Y = SCORE_MARGIN - 5;
const SCORE_TEXT_X = GAME_WIDTH - SCORE_MARGIN;
const SCORE_TEXT_Y = SCORE_MARGIN;

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

// ★ フォールバック用の画像配列
const ENEMY_IMAGES = [FALLBACK,];

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// ★ キャンバス自体の内部解像度（描画サイズ）にもCSS変数の値を適用する
if (canvas) {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}

const bgImg = new Image();
bgImg.src = BGIMG;

// プレイヤー画像
const myImg = new Image();
myImg.src = YOU_IMG;

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 演出用配列
let animationFrameId = null;

// ★ 中央に固定表示する画像専用の変数
let centerDisplayImage = null;
let centerImageLoaded = false;

// 敵オブジェクトを1個生成する関数（流れてくる敵）
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
	const imageSrc = targetWord ? `${targetWord}${IMAGE_EXTENSION}` : ENEMY_IMAGES[0];
  const img = new Image();
  const enemy = {
    img: img,
    x: GAME_WIDTH - OFFSET_LEFT,
    y: ((GAME_HEIGHT - ENEMY_HEIGHT) / 2) + OFFSET_TOP,
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

  // ★ 画像が存在しない・読み込めない場合
  img.onerror = () => {
    const fallbackSrc = ENEMY_IMAGES[0] || FALLBACK;
    if (img.src.includes(fallbackSrc)) return;
    img.src = fallbackSrc;
  };

  img.src = imageSrc;
  activeEnemies = [enemy];
}

// スコア表示関数
function drawScore() {
  if (!ctx || !canvas) return;

  const text = `${lastEarnedScore} pt`; 

  ctx.save();
  // 描画ごとに必ずフォントや位置揃えを設定する
  ctx.font = SCORE_FONT;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  // 背景の白っぽいボックスを描画
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(SCORE_RECT_X, SCORE_RECT_Y, SCORE_RECT_WIDTH, SCORE_RECT_HEIGHT);

  // スコアのテキストを描画
  ctx.fillStyle = '#ff0000';
  ctx.fillText(text, SCORE_TEXT_X, SCORE_TEXT_Y);
  
  ctx.restore();
}

// 称号計算関数（ふつうのバトルゲーム版）
function getRankTitle(cpm, acc) {
  if (acc < 70) return "訓練生";
  if (cpm >= 250 && acc >= 98) return "伝説の英雄";
  if (cpm >= 190 && acc >= 95) return "剣聖";
  if (cpm >= 140 && acc >= 90) return "上級戦士";
  if (cpm >= 100 && acc >= 85) return "中級戦士";
  if (cpm >= 70) return "熟練冒険者";
  if (cpm >= 50) return "見習い冒険者";
  return "駆け出しの冒険者";
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
    
    const playerX = YOU_LEFT;
    const playerY = ((canvas.height - playerHeight) / 2) + YOU_TOP;

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