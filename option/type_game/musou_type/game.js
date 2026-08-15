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
// フォールバック用のランダム画像配列（対応表にない単語が出た場合に使用）
const ENEMY_IMAGES = [
  'megahorn_x.jpg',
];

// ★ 出題文字列（漢字＋全角スペース＋よみ）と画像ファイル名の対応表
const MUSHI_MAP = {
'侍': '01-samurai-attack.png',
'忍者': '02-ninja-attack.png',
'武僧': '03-busou-attack.png',
'山伏': '04-yamabushi-attack.png',
'巫女': '05-miko-attack.png',
'陰陽師': '06-onmyoji-attack.png',
'鬼': '07-oni-attack.png',
'天狗': '08-tengu-attack.png',
'雷神': '09-raijin-attack.png',
'風神': '10-fujin-attack.png',
'将軍': '11-shogun-attack.png',
'九尾': '12-kyuubi-attack.png',
};

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const bgImg = new Image();
bgImg.src = 'bg.jpg';

// ★ プレイヤー画像の読み込みを追加
const myImg = new Image();
myImg.src = 'my.png';

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 「流れる」「打鍵成功」などの演出用配列
let animationFrameId = null;
const ENEMY_HEIGHT = 256; // 画像描画時の標準縦幅
const BASE_SPEED = 2;   // 左へ進む速度

// ==================================================
//  単語リストの自動流し込み & タイピング初期化
// ==================================================
const txtdataEl = document.getElementById('txtdata');
if (txtdataEl && typeof MUSHI_MAP !== 'undefined') {
  txtdataEl.value = Object.keys(MUSHI_MAP).join('\n');
  if (typeof init === 'function') {
    init();
  }
}

// 敵オブジェクトを1個生成する関数
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // 問題文に対応する画像を取得（なければフォールバック画像）
  let imageSrc = MUSHI_MAP[targetWord];

  if (!imageSrc && ENEMY_IMAGES.length > 0) {
    imageSrc = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
  }

  const img = new Image();

  // ★ 右端からのずらし量（固定値）
  const OFFSET_LEFT = 400; 

  const enemy = {
    img: img,
    // ★ 画面右端から少し左にずらした位置を初期値に設定
    x: (canvas ? canvas.width : 1024) - OFFSET_LEFT,
    y: ((canvas ? canvas.height - ENEMY_HEIGHT : 434 - ENEMY_HEIGHT) / 2) + 50,
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

  // ★ 画像が存在しない・読み込めない場合のフォールバック処理
  img.onerror = () => {
    const fallbackSrc = ENEMY_IMAGES[0] || 'megahorn_x.jpg';
    
    if (img.src.includes(fallbackSrc)) {
      return;
    }

    img.src = fallbackSrc;
  };

  img.src = imageSrc;
  activeEnemies = [enemy];
}

// スコア表示関数（右上に直前単語の獲得ポイントを表示）
function drawScore() {
  if (!ctx || !canvas) return;

  ctx.save();
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  const text = `${lastEarnedScore} pt`; 
  
  // 文字の背景にうっすら白座布団を敷いて見やすくする
  const margin = 15;
  const rectX = canvas.width - 200;
  const rectY = margin - 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(rectX, rectY, 185, 35);

  ctx.fillStyle = '#d32f2f'; // 鮮やかな赤系文字
  ctx.fillText(text, canvas.width - margin, margin);
  ctx.restore();
}

// 称号（ランク）計算関数
function getRankTitle(cpm, acc) {
  if (acc < 70) return "手習い中の門下生";
  if (cpm >= 350 && acc >= 98) return "神速無双・剣聖";
  if (cpm >= 300 && acc >= 95) return "天下無双の大将軍";
  if (cpm >= 250 && acc >= 90) return "免許皆伝の師範代";
  if (cpm >= 200 && acc >= 85) return "凄腕の侍";
  if (cpm >= 150) return "一人前の剣士";
  if (cpm >= 100) return "新進気鋭の武士";
  return "見習い足軽";
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

  // ★ 1.5 プレイヤー（my.png）の描画（画面左側）
  if (myImg.complete && myImg.naturalWidth !== 0) {
    const playerHeight = ENEMY_HEIGHT; // 敵と同じ縦幅（256px）に合わせる場合
    const aspect = myImg.naturalWidth / myImg.naturalHeight;
    const playerWidth = playerHeight * aspect;
    
    const playerX = -50; // 画面左端からの距離（px）
    const playerY = ((canvas.height - playerHeight) / 2) + 50; // 敵と同じY座標高さに調整

    ctx.drawImage(myImg, playerX, playerY, playerWidth, playerHeight);
  }

  // 2. 敵（カード）の移動と描画
  activeEnemies.forEach(enemy => {
    enemy.x -= enemy.speed;

    if (enemy.loaded) {
      ctx.save();
      // ★ 左右反転処理
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(enemy.img, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
      ctx.restore();
    }
  });

  // 3. エフェクト（敵の上に重ねて描画）
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

  // 画面外の敵と透明になったエフェクトのクリア
  activeEnemies = activeEnemies.filter(enemy => enemy.x + enemy.width > 0);
  effects = effects.filter(fx => fx.alpha > 0);

  // 4. 右上のスコア表示
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
  // ★ 正解率（accuracy %）を掛け合わせたスコア計算
  const lineScore = Math.round(cpm * (accuracy / 100));
  
  lastEarnedScore = lineScore; // 今回獲得したスコア
  totalScore += lineScore;     // 累計スコアに加算

  // 1. まず先にエフェクト（消失演出）を発生させる
  if (activeEnemies.length > 0) {
    const enemy = activeEnemies[0];

    const enemyWidth = (enemy.img && enemy.img.naturalHeight > 0) 
      ? ENEMY_HEIGHT * (enemy.img.naturalWidth / enemy.img.naturalHeight) 
      : enemy.width;
    const enemyHeight = enemy.height;

    const centerX = enemy.x + enemyWidth / 2;
    const centerY = enemy.y + enemyHeight / 2;

    // パーティクルエフェクト生成
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

  // 2. エフェクトが発生した「後」に敵カードを消去する
  activeEnemies = [];
}

// typing.js の判定処理（judgeCurrentWord）をフックしてスコア計算や敵消去を行う
if (typeof judgeCurrentWord === 'function') {
  const originalJudgeCurrentWord = judgeCurrentWord;
  judgeCurrentWord = function() {
    const now = performance.now();
    const timeSec = (now - lineStartTime) / 1000;
    const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
    const userTyped = typeof typed === 'function' ? typed() : '';

    const len = userTyped.length;
    const cpm = timeSec > 0 ? Math.round((len / timeSec) * 60) : 0;

    // ★ 正解率（accuracy）の計算処理
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
      // accuracy（正解率）を渡して実行
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
  // ★ スタート待機中（まだ開始していない／スタート画面に戻った）場合、称号を消去
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

    // 称号判定とスコア結果のUI書き換え
    const rankTitle = getRankTitle(finalCpm, finalAcc);
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = `獲得スコア: <strong>${totalScore} pt</strong><br>称号: <strong>【${rankTitle}】</strong>`;
    }
  }
}, 100);