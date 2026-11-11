// ★ CSSの変数を取得してJavaScript側の基準サイズにする
const computedStyle = getComputedStyle(document.documentElement);
const GAME_WIDTH = parseInt(computedStyle.getPropertyValue('--game-width')) || 1024;
const GAME_HEIGHT = parseInt(computedStyle.getPropertyValue('--game-height')) || 576;

const BGIMG ="bg.png";//背景画像

const FALLBACK = "img.png";//画像の代替

const IMAGE_EXTENSION = '.png';
const ENEMY_HEIGHT = 400; // 画像描画時の標準縦幅

// ★ 初期表示位置の設定（ここで位置を指定します）
const ENEMY_INITIAL_X = GAME_WIDTH / 2 - 250;
const ENEMY_INITIAL_Y = GAME_HEIGHT - 400;

let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア・直前獲得スコア保持用変数
let totalScore = 0;
let lastEarnedScore = 0;

// 1行ポップアップ用変数
let scoreX = 0;
let scoreY = 0;
let scoreTimer = 0;

// 終了時結果用変数
let showFinalResultFlag = false;
let finalRank = "";

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

// スコア表示関数（シンプルな中央ポップアップ）
function drawScore() {
  if (!ctx || !canvas) return;
  if (scoreTimer <= 0) return;

  ctx.save();
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = `${lastEarnedScore} pt`; 
  
  const rectW = 180;
  const rectH = 55;

  // 背景ボックス描画（半透明黒）
  ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
  ctx.fillRect(scoreX - rectW / 2, scoreY - rectH / 2, rectW, rectH);

  // 枠線
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 2;
  ctx.strokeRect(scoreX - rectW / 2, scoreY - rectH / 2, rectW, rectH);

  // テキスト描画
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, scoreX, scoreY);
  
  ctx.restore();

  // 毎フレームタイマーをカウントダウン
  scoreTimer--;
}

// ゲーム終了時の結果表示関数（シンプルな装飾なしのボックス）
function drawFinalResult() {
  if (!ctx || !canvas) return;
  if (!showFinalResultFlag) return;

  ctx.save();

  // Canvas中央
  const rectW = 420;
  const rectH = 180;
  const rectX = (GAME_WIDTH - rectW) / 2;
  const rectY = (GAME_HEIGHT - rectH) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const line1 = `獲得スコア: ${totalScore} pt`;
  const line2 = `称号: 【${finalRank}】`;

  // 背景枠
  ctx.fillStyle = 'rgba(200, 200, 200, 0.75)';
  ctx.fillRect(rectX, rectY, rectW, rectH);

  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  // 1. 獲得スコア
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(line1, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 25);
  
  // 2. 称号
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(line2, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25);

  ctx.restore();
}

// 称号計算関数
function getRankTitle(cpm, acc) {
  const rank = Math.round(cpm * Math.pow(acc / 100, 3));

  if (rank >= 150) return "伝説の恐竜ハンター"; // 寿司打で無双するレベル（KPM 200〜300以上）
  if (rank >= 80)  return "百戦錬磨のハンター"; // 中2目標を大きく超える、クラスの英雄レベル
  if (rank >= 55)  return "ベテランハンター";   // ★中2目標（60文字）達成レベル！
  if (rank >= 35)  return "熟練トラッカー";    // ★小5目標（40文字）達成レベル！
  if (rank >= 20)  return "若手ハンター";      // 中学生の平均レベル
  if (rank >= 12)  return "見習いハンター";    // 小学生の平均レベル
  if (rank >= 6)   return "足跡を追う者";      // キーボードを触り始めた子
  return "化石発掘隊"; 
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

  // 4. スコア表示（1行クリア時ポップアップ）
  drawScore();

  // 5. 最終結果表示（終了時Canvas中央）
  drawFinalResult();

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
  scoreTimer = 0;
  showFinalResultFlag = false;
  finalRank = "";
  effects = [];
  activeEnemies = [];
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
  
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '';
  }
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

  // ポップアップ位置をCanvas中央に設定
  scoreX = GAME_WIDTH / 2;
  scoreY = GAME_HEIGHT / 2;
  scoreTimer = 35; // 約0.6秒間表示

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
    showFinalResultFlag = false;
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

    finalRank = getRankTitle(finalCpm, finalAcc);
    showFinalResultFlag = true;

    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = '';
    }
  }
}, 100);