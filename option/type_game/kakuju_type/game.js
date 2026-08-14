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

// ★ 出題文字列（漢字＋全角スペース＋よみ）と画像ファイル名の対応表（修正版）
const MUSHI_MAP = {
　　'炎角　エンカク': 'megahorn_omega_01.jpg',
　　'絶炎角　ゼツエンカク': 'megahorn_omega_02.jpg',
　　'剛角　ゴウカク': 'megahorn_s_01.jpg',
　　'斬角　ザンカク': 'megahorn_s_02.jpg',
　　'飛角　ヒカク': 'megahorn_s_03.jpg',
　　'砕角　サイカク': 'megahorn_s_04.jpg',
　　'壁角　ヘキカク': 'megahorn_s_05.jpg',
　　'絶剛角　ゼツゴウカク': 'megahorn_h_01.jpg',
　　'鎖角　サカク': 'megahorn_a_01.jpg',
　　'絶鎖角　ゼツサカク': 'megahorn_h_02.jpg',
　　'電角　デンカク': 'megahorn_a_02.jpg',
　　'毒角　ドクカク': 'megahorn_a_03.jpg',
　　'猛角　モウカク': 'megahorn_a_04.jpg',
　　'鎌角　レンカク': 'megahorn_a_05.jpg',
　　'重角　ジュウカク': 'megahorn_a_06.jpg',
　　'熱角　ネッカク': 'megahorn_a_07.jpg',
　　'氷角　ヒョウカク': 'megahorn_a_08.jpg',
　　'威角　イカク': 'megahorn_a_09.jpg',
　　'粉角　フンカク': 'megahorn_a_10.jpg',
　　'挟角　キョウカク': 'megahorn_a_11.jpg',
　　'溶角　ヨウカク': 'megahorn_a_12.jpg',
　　'縛角　バクカク': 'megahorn_a_13.jpg',
　　'弾角　ダンカク': 'megahorn_a_14.jpg',
　　'璃角　リカク': 'megahorn_a_15.jpg',
　　'波角　ハカク': 'megahorn_a_16.jpg',
　　'忍角　ニンカク': 'megahorn_a_17.jpg',
　　'籠角　ロウカク': 'megahorn_a_18.jpg',
　　'槍角　ソウカク': 'megahorn_a_19.jpg',
　　'絶槍角　ゼツソウカク': 'megahorn_h_03.jpg',
　　'臭角　シュウカク': 'megahorn_a_20.jpg',
　　'突角　トッカク': 'megahorn_a_21.jpg',
　　'潜角　センカク': 'megahorn_a_22.jpg',
　　'明角　メイカク': 'megahorn_a_23.jpg',
　　'盾角　ジュンカク': 'megahorn_a_24.jpg',
　　'転角　テンカク': 'megahorn_a_25.jpg',
　　'鎧角　ガイカク': 'megahorn_a_26.jpg',
　　'林角　リンカク': 'megahorn_a_27.jpg',
　　'呑角　ドンカク': 'megahorn_a_28.jpg',
　　'群角　グンカク': 'megahorn_a_29.jpg',
　　'闘角　トウカク': 'megahorn_a_30.jpg',
　　'邪角　ジャカク': 'megahorn_a_31.jpg',
　　'捕角　ホカク': 'megahorn_a_32.jpg',
　　'拭角　ショクカク': 'megahorn_a_33.jpg',
　　'美角　ビカク': 'megahorn_a_34.jpg',
　　'電角変異種　デンカクヘンイシュ': 'megahorn_h_04.jpg',
　　'毒角変異種　ドクカクヘンイシュ': 'megahorn_h_05.jpg',
　　'鎌角変異種　レンカクヘンイシュ': 'megahorn_h_11_2.jpg',
　　'氷角変異種　ヒョウカクヘンイシュ': 'megahorn_h_06.jpg',
　　'忍角変異種　ニンカクヘンイシュ': 'megahorn_h_07.jpg',
　　'突角変異種　トッカクヘンイシュ': 'megahorn_h_08.jpg',
　　'邪角変異種　ジャカクヘンイシュ': 'megahorn_h_09.jpg',
　　'捕角変異種　ホカクヘンイシュ': 'megahorn_h_10.jpg',
};

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const bgImg = new Image();
bgImg.src = 'bg.jpg';

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 「流れる」「打鍵成功」などの演出用配列
let animationFrameId = null;
const ENEMY_HEIGHT = 256; // 画像描画時の標準縦幅
const BASE_SPEED = 1;   // 左へ進む速度

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

// 敵カード（角獣）オブジェクトを1個生成する関数
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // 問題文に対応する画像を取得（なければフォールバック画像）
  let imageSrc = MUSHI_MAP[targetWord];

  if (!imageSrc && ENEMY_IMAGES.length > 0) {
    imageSrc = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
  }

  const img = new Image();

  const enemy = {
    img: img,
    x: canvas ? canvas.width - 64 : 1024,
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
    
    // 無限ループ防止（すでにフォールバック画像読み込みエラーの場合はスキップ）
    if (img.src.includes(fallbackSrc)) {
      return;
    }

    // 代替画像（megahorn_x.jpg）に差し替えて再読み込み
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
  if (acc < 70) return "見習い角獣ハンター";
  if (cpm >= 350 && acc >= 98) return "角醒の神討手・オメガホーン";
  if (cpm >= 300 && acc >= 95) return "極角の討伐帝";
  if (cpm >= 250 && acc >= 90) return "熟練のメガホーンハンター";
  if (cpm >= 200 && acc >= 85) return "一人前の角獣狩人";
  if (cpm >= 150) return "駆け出し角獣ハンター";
  if (cpm >= 100) return "角獣調査員";
  return "新米角獣トラッカー";
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

  // 2. 敵（カード）の移動と描画
  activeEnemies.forEach(enemy => {
    enemy.x -= enemy.speed;

    if (enemy.loaded) {
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
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

    // パティクルエフェクト生成
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
  // (少しだけ余韻を残したい場合は setTimeout を使うこともできます)
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

    // 称号判定とスコア結果のUI書き換え（★ここで totalScore を表示）
    const rankTitle = getRankTitle(finalCpm, finalAcc);
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = `獲得スコア: <strong>${totalScore} pt</strong><br>称号: <strong>【${rankTitle}】</strong>`;
    }
  }
}, 100);
