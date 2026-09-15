// ★ CSSの変数を取得してJavaScript側の基準サイズにする
const computedStyle = getComputedStyle(document.documentElement);
const GAME_WIDTH = parseInt(computedStyle.getPropertyValue('--game-width')) || 1024;
const GAME_HEIGHT = parseInt(computedStyle.getPropertyValue('--game-height')) || 576;

const BGIMG ="bg.png";//背景画像

const FALLBACK = "どんぶり.png";//画像の代替

const IMAGE_EXTENSION = '.png';
const ENEMY_HEIGHT = 250; // 画像描画時の標準縦幅

// ★ 初期表示位置の設定（ここで位置を指定します）
const ENEMY_INITIAL_X = GAME_WIDTH / 2 - 120;
const ENEMY_INITIAL_Y = GAME_HEIGHT - 300;

// スコア表示に関する固定の位置・サイズ（順番を修正）
const SCORE_FONT = 'bold 24px sans-serif';
const SCORE_MARGIN_TOP = 50;
const SCORE_MARGIN_RIGHT = 80;
const SCORE_TEXTMARGIN_RIGHT = 90;
const SCORE_RECT_WIDTH = 100; 
const SCORE_RECT_HEIGHT = 35;
const SCORE_RECT_X = GAME_WIDTH - SCORE_RECT_WIDTH - SCORE_MARGIN_RIGHT; 
const SCORE_RECT_Y = SCORE_MARGIN_TOP - 5;
const SCORE_TEXT_X = GAME_WIDTH - SCORE_TEXTMARGIN_RIGHT;
const SCORE_TEXT_Y = SCORE_MARGIN_TOP;

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

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 演出用配列
let animationFrameId = null;

// 敵オブジェクトを1個生成する関数（指定位置に固定表示）
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
	const imageSrc = targetWord ? `${targetWord}${IMAGE_EXTENSION}` : ENEMY_IMAGES[0];
  const img = new Image();
  const enemy = {
    img: img,
    x: ENEMY_INITIAL_X, 
    y: ENEMY_INITIAL_Y,
    width: 180,
    height: ENEMY_HEIGHT,
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

// 称号計算関数（ラーメン屋風）
function getRankTitle(cpm, acc) {
  if (acc < 70) return "フードコートの新人";
  if (cpm >= 250 && acc >= 98) return "麺の神";
  if (cpm >= 190 && acc >= 95) return "超絶怒濤の麺さばき";
  if (cpm >= 140 && acc >= 90) return "行列のできる店主";
  if (cpm >= 100 && acc >= 85) return "一人前の見習い";
  if (cpm >= 70) return "湯切り職人";
  if (cpm >= 50) return "出前持ち";
  return "ラーメン好きの一般客";
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

  // 2. 敵の描画（移動処理を廃止し、その場で描画）
  activeEnemies.forEach(enemy => {
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
