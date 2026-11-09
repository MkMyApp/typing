const BGIMG ="bg.jpg";
const YOU_IMG= 'you.png';
const YOU_HEIGHT = 300;
const YOU_LEFT = 30; //左からのオフセット
const YOU_TOP = 50; //中央からのオフセット

const FALLBACK = "fallback.png";
const IMAGE_EXTENSION = '.png';

const ENEMY_HEIGHT = 300; // 画像描画時の標準縦幅
const OFFSET_LEFT = 300; //出現位置右端からのオフセット
const OFFSET_TOP = 50; //出現位置中央からのオフセット

const BASE_SPEED = 1;      // 左へ進む速度

// ★ タイピング完了時に中央に表示する画像のサイズ設定（高さを基準に縦横比を維持）
const CENTER_IMAGE_HEIGHT = 500;  // 中央表示する画像の縦幅基準 (px)

let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア・直前獲得スコア保持用変数
let totalScore = 0;
let lastEarnedScore = 0;

// ★ 1行ポップアップ用変数
let scoreX = 0;
let scoreY = 0;
let scoreTimer = 0;

// ★ 終了時結果用変数（新規追加）
let showFinalResultFlag = false;
let finalRank = "";

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================

// ★ フォールバック用の画像配列（画像が存在しない場合に使用）
const ENEMY_IMAGES = [FALLBACK,];

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// ★ CSSの変数を取得してJavaScript側の基準サイズにする
const computedStyle = getComputedStyle(document.documentElement);
const GAME_WIDTH = parseInt(computedStyle.getPropertyValue('--game-width')) || 1024;
const GAME_HEIGHT = parseInt(computedStyle.getPropertyValue('--game-height')) || 434;

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

// 1行クリア時のスコアポップアップ表示関数
function drawScore() {
  if (!ctx || !canvas) return;
  if (scoreTimer <= 0) return;

  ctx.save();
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = `${lastEarnedScore} pt`; 
  
  const rectW = 140;
  const rectH = 40;
  const rectX = scoreX - rectW / 2;
  const rectY = scoreY - rectH / 2;

  // 背景ボックス描画（エフェクト中心位置）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(rectX, rectY, rectW, rectH);

  // テキスト描画（エフェクト中心位置）
  ctx.fillStyle = '#d32f2f';
  ctx.fillText(text, scoreX, scoreY);
  ctx.restore();

  // 毎フレームタイマーをカウントダウン
  scoreTimer--;
}

// ★ ゲーム終了時の結果表示関数
function drawFinalResult() {
  if (!ctx || !canvas) return;
  if (!showFinalResultFlag) return;

  ctx.save();

	// Canvas中央
  const rectW = 380;
  const rectH = 150;
  const rectX = (GAME_WIDTH - rectW) / 2;
  const rectY = (GAME_HEIGHT - rectH) / 2;

  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const line1 = `獲得スコア: ${totalScore} pt`;
  const line2 = `称号: 【${finalRank}】`;

  // 背景枠の描画（中央）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(rectX, rectY, rectW, rectH);

  // 枠線の描画
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  // テキスト描画
  ctx.fillStyle = '#404040';
  ctx.fillText(line1, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
  ctx.fillText(line2, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

  ctx.restore();
}

// 称号計算関数
function getRank(cpm, acc) {
	//文字数/分　×　正確率の３乗
	const rank = Math.round(cpm * Math.pow(acc / 100, 3));
  if (rank >= 1000) return "SSS";
  if (rank >= 500) return "SS";
  if (rank >= 300) return "S";
  if (rank >= 200) return "A";
  if (rank >= 150) return "B";
  if (rank >= 100) return "C";
  if (rank >= 60) return "D";
  if (rank >= 30) return "E";
  return "F";
}

*/
一般の部
素人 　30文字未満
　手元を確認しながらゆっくり1文字ずつ打つ段階
見習い　 30文字以上
　キー配置を覚え始め、実用的な入力に向かい始める段階
一人前 　60文字以上
　脱初心者。手元を見ずに日常の文書作成ができる標準レベル
達人 　100文字以上
　実務で十分速いレベル。思考を邪魔せずスムーズに入力可能
名人 　150文字以上
　頭に浮かんだ文章がそのまま指から出力される上級レベル
鉄人 　200文字以上
　タイピングソフトの上位常連・超上級者クラス
伝説 　300文字以上
　大会・競技タイピングの領域
覇王 　500文字以上
　人類の限界を突破した領域
超人 　1000文字以上
　神の領域

小学生の部
たまご　 10文字未満
　キーの場所を探しながらゆっくり1キーずつ押す段階
ひよこ　 10文字以上
　キーの場所を覚えて、自分のペースで打てる段階
見習い　 20文字以上
　小学校の授業やタイピング練習で平均的なスピード
一人前　 30文字以上
　クラブ活動や家での練習でスムーズに打てるレベル（学年トップ級）
達人　 50文字以上
　手元を見ずに画面だけを見てサクサク打てる上級レベル
名人　 80文字以上
　高学年〜中学生顔負けの全国レベルのスピード
伝説　 120文字以上
　小学生タイピング大会の上位入賞クラス
天才キッズ　200文字以上
　一般の部で戦える
*/

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

  // ★ 4. 流れてくる敵の移動と描画
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

  // 6. スコア表示（1行ヒット時ポップアップ）
  drawScore();

  // 7. 最終結果表示（終了時Canvas中央）
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
  showFinalResultFlag = false; // 結果フラグリセット
  finalRank = "";
  effects = [];
  activeEnemies = [];
  centerDisplayImage = null;
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

    centerDisplayImage = enemy.img;
    centerImageLoaded = enemy.loaded;

    const enemyWidth = (enemy.img && enemy.img.naturalHeight > 0) 
      ? ENEMY_HEIGHT * (enemy.img.naturalWidth / enemy.img.naturalHeight) 
      : enemy.width;
    const enemyHeight = enemy.height;

    const centerX = enemy.x + enemyWidth / 2;
    const centerY = enemy.y + enemyHeight / 2;

    // ★ 1行クリア時のポップアップ設定
    scoreX = centerX;
    scoreY = centerY;
    scoreTimer = 25; // 約0.4秒間表示

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

  // ★ 終了時の処理（結果フラグをONにして称号を設定）
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    activeEnemies = [];

    const finalSec = (endTime - startTime) / 1000;
    const finalCpm = finalSec > 0 ? Math.round((totalChars / finalSec) * 60) : 0;
    const finalAcc = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    finalRank = getRank(finalCpm, finalAcc);
    showFinalResultFlag = true; // Canvas中央表示フラグをON
  }
}, 100);