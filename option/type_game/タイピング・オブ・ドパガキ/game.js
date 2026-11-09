// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// CSSの変数を取得してJavaScript側の基準サイズにする
const computedStyle = getComputedStyle(document.documentElement);
const GAME_WIDTH = parseInt(computedStyle.getPropertyValue('--game-width')) || 1024;
const GAME_HEIGHT = parseInt(computedStyle.getPropertyValue('--game-height')) || 434;

// キャンバス自体の内部解像度（描画サイズ）適用
if (canvas) {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}

// アニメーション関連変数
let effects = []; // 演出用配列
let animationFrameId = null;

let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// 累積スコア・直前獲得スコア保持用変数
let totalScore = 0;
let lastEarnedScore = 0;

// 1行ポップアップ用変数
let scoreX = 0;
let scoreY = 0;
let scoreTimer = 0;

// スクリーンシェイク用変数（衝撃波の揺れ）
let shakeTimer = 0;
let shakeIntensity = 0;

// 終了時結果用変数
let showFinalResultFlag = false;
let finalRank = "";

// サイケデリックカラーパレット
const PSYCHEDELIC_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff0055', '#00ff33', '#ff6600', '#9900ff', '#ffffff'];

// ==================================================
//  演出描画関数
// ==================================================

// 1行クリア時のスコアポップアップ表示関数
function drawScore() {
  if (!ctx || !canvas) return;
  if (scoreTimer <= 0) return;

  ctx.save();
  // 拡大縮小アニメーション付きのド派手なポップアップ
  const scale = 1.0 + Math.sin((scoreTimer / 30) * Math.PI) * 0.4;
  ctx.translate(scoreX, scoreY);
  ctx.scale(scale, scale);

  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = `${lastEarnedScore} pt`; 
  
  const rectW = 180;
  const rectH = 55;

  // サイケデリックな虹色のアウトライン
  ctx.fillStyle = PSYCHEDELIC_COLORS[Math.floor(Date.now() / 50) % PSYCHEDELIC_COLORS.length];
  ctx.fillRect(-rectW/2 - 6, -rectH/2 - 6, rectW + 12, rectH + 12);

  // 黒背景ボックス描画（文字を目立たせるため）
  ctx.fillStyle = '#000000';
  ctx.fillRect(-rectW / 2, -rectH / 2, rectW, rectH);

  // ２重のふちどり
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeText(text, 0, 0);

  // テキスト描画
  ctx.fillStyle = '#ff00ff'; // ネオンピンク
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // 毎フレームタイマーをカウントダウン
  scoreTimer--;
}

// ゲーム終了時の結果表示関数
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

  // ボーダー描画
  const borderColor = PSYCHEDELIC_COLORS[Math.floor(Date.now() / 100) % PSYCHEDELIC_COLORS.length];
  ctx.fillStyle = borderColor;
  ctx.fillRect(rectX - 10, rectY - 10, rectW + 20, rectH + 20);

  // 背景枠
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(rectX, rectY, rectW, rectH);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  // 1. 獲得スコア
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#00ffff';
  ctx.fillText(line1, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
  
  // 2. 称号
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#ffeb3b';
  ctx.fillText(line2, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

  ctx.restore();
}

// 称号計算関数（タイピング・オブ・ドパガキ仕様）
function getRank(cpm, acc) {
  const rank = Math.round(cpm * Math.pow(acc / 100, 3));

  if (rank >= 1000) return "ゴッドドパガキ";
  if (rank >= 500)  return "脳汁大噴出ニキ";
  if (rank >= 300)  return "ドパミン中毒者";
  if (rank >= 200)  return "爆速レスバトル民";
  if (rank >= 150)  return "画面に張り付き勢";
  if (rank >= 100)  return "見習いキッズ";
  if (rank >= 60)   return "指もつれネチズン";
  if (rank >= 30)   return "ロム専ぬるま湯キッズ";
  return "回線切って出直して";
}

// アニメーションメインループ
function update() {
  if (!ctx || !canvas) return;

  // 1. Canvasのクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  
  // スクリーンシェイク（画面揺らし）の適用
  if (shakeTimer > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
    shakeTimer--;
  }

  // 2. 特殊エフェクトの更新と描画
  effects.forEach(fx => {
    if (fx.type === 'ring') {
      // 衝撃波リング
      fx.radius += fx.speed;
      fx.alpha -= fx.decay;
      if (fx.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = fx.alpha;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = fx.lineWidth;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (fx.type === 'spark') {
      // トゲトゲトゲのフラッシュ（爆発）
      fx.rotation += fx.vRotation;
      fx.size += fx.speed;
      fx.alpha -= fx.decay;
      if (fx.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = fx.alpha;
        ctx.fillStyle = fx.color;
        ctx.translate(fx.x, fx.y);
        ctx.rotate(fx.rotation);
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 / 10) * i;
          const r = i % 2 === 0 ? fx.size : fx.size * 0.4;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    } else if (fx.type === 'laser') {
      // 火花＆レーザー
      fx.x += fx.vx;
      fx.y += fx.vy;
      fx.alpha -= fx.decay;
      if (fx.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = fx.alpha;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = fx.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x - fx.vx * 2, fx.y - fx.vy * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (fx.type === 'scribble') {
      // 「あ！！」「ア！！」「脳内爆発」などのテキスト＆落書き文字の飛び散り
      fx.x += fx.vx;
      fx.y += fx.vy;
      fx.alpha -= fx.decay;
      fx.scale += 0.02;
      if (fx.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = fx.alpha;
        ctx.translate(fx.x, fx.y);
        ctx.scale(fx.scale, fx.scale);
        ctx.font = 'bold 32px Impact, sans-serif';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(fx.text, 0, 0);
        ctx.fillStyle = fx.color;
        ctx.fillText(fx.text, 0, 0);
        ctx.restore();
      }
    }
  });

  effects = effects.filter(fx => fx.alpha > 0);

  // 3. スコア表示（1行ヒット時ポップアップ）
  drawScore();

  ctx.restore(); // スクリーンシェイクの解除

  // 4. 最終結果表示（終了時Canvas中央）
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
  shakeTimer = 0;
  shakeIntensity = 0;
  showFinalResultFlag = false;
  finalRank = "";
  effects = [];
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

function onNextQuestion(qIndex) {
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

function onLineComplete(timeSec, cpm, accuracy, isMissless) {
  // 1行クリア時に hitSound を再生
  if (typeof playHitSound === 'function') {
    playHitSound();
  }

  const lineScore = Math.round(cpm * (accuracy / 100));
  
  lastEarnedScore = lineScore;
  totalScore += lineScore;

  // エフェクトおよびポップアップをCanvas中央に発生させる
  const centerX = GAME_WIDTH / 2;
  const centerY = GAME_HEIGHT / 2;

  scoreX = centerX;
  scoreY = centerY;
  scoreTimer = 35; // 約0.6秒間表示

  // ド迫力スクリーンシェイクを作動
  shakeTimer = 15;
  shakeIntensity = isMissless ? 18 : 10;

  // 1. 同心円状のサイケデリック衝撃波リング (複数)
  for (let r = 0; r < (isMissless ? 5 : 3); r++) {
    effects.push({
      type: 'ring',
      x: centerX,
      y: centerY,
      radius: 10 + r * 15,
      speed: 8 + r * 3,
      alpha: 1.0,
      decay: 0.025,
      lineWidth: 12 - r * 2,
      color: PSYCHEDELIC_COLORS[r % PSYCHEDELIC_COLORS.length]
    });
  }

  // 2. 回転する巨大なトゲトゲのスパーク
  for (let s = 0; s < (isMissless ? 4 : 2); s++) {
    effects.push({
      type: 'spark',
      x: centerX,
      y: centerY,
      size: 30,
      speed: 12 + s * 4,
      rotation: Math.random() * Math.PI,
      vRotation: (Math.random() - 0.5) * 0.3,
      alpha: 1.0,
      decay: 0.03,
      color: PSYCHEDELIC_COLORS[Math.floor(Math.random() * PSYCHEDELIC_COLORS.length)]
    });
  }

  // 3. 飛び散るサイケデリックレーザー＆光のシャワー
  const laserCount = isMissless ? 60 : 35;
  for (let i = 0; i < laserCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 15 + 8;
    effects.push({
      type: 'laser',
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: Math.random() * 6 + 2,
      alpha: 1.0,
      decay: Math.random() * 0.03 + 0.02,
      color: PSYCHEDELIC_COLORS[Math.floor(Math.random() * PSYCHEDELIC_COLORS.length)]
    });
  }

  // 4. 「あ！！！」「ア！！！」など脳内のカオスを叫ぶテキストの飛び散り
  const texts = ['あ！！', 'ア！！', 'キタ！！', '脳！！', 'ドパッ！', '！！！', 'バグ！', '脳汁！！'];
  const textCount = isMissless ? 6 : 3;
  for (let t = 0; t < textCount; t++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    effects.push({
      type: 'scribble',
      x: centerX + (Math.random() - 0.5) * 60,
      y: centerY + (Math.random() - 0.5) * 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      text: texts[Math.floor(Math.random() * texts.length)],
      scale: 0.8,
      alpha: 1.0,
      decay: 0.02,
      color: PSYCHEDELIC_COLORS[Math.floor(Math.random() * PSYCHEDELIC_COLORS.length)]
    });
  }
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

  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;

    const finalSec = (endTime - startTime) / 1000;
    const finalCpm = finalSec > 0 ? Math.round((totalChars / finalSec) * 60) : 0;
    const finalAcc = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    finalRank = getRank(finalCpm, finalAcc);
    showFinalResultFlag = true;
  }
}, 100);

// ==================================================
//  文字列バイト長計算 & UIサイズ動的変更
// ==================================================

// 文字列のバイト長を計算（半角: 1ch, 全角: 2ch）
function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) >= 0x0020 && str.charCodeAt(i) <= 0x007e) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return length;
}

// 次の問題が表示されるときに要素の幅（width）を動的変更
const originalOnNextQuestion = typeof onNextQuestion === 'function' ? onNextQuestion : null;
onNextQuestion = function(qIndex) {
  if (originalOnNextQuestion) {
    originalOnNextQuestion(qIndex);
  }

  const targetEl = document.getElementById('target');
  const editorEl = document.getElementById('editor');

  if (typeof currentWord !== 'undefined' && currentWord !== '') {
		const rawLength = getByteLength(currentWord) + 5;
    const widthLength = Math.max(20, rawLength); // 最小値を20に設定
    const widthStyle = `${widthLength}ch`;

    if (targetEl) targetEl.style.width = widthStyle;
    if (editorEl) editorEl.style.width = widthStyle;
  }
};

// 効果音のファイルリスト
const hitSound = [
'大砲1.mp3',
'レベルアップ.mp3',
'ラッパのファンファーレ.mp3',
'爆発1.mp3',
'ドンドンパフパフ.mp3',
'男衆「イエーイ！」.mp3',
'男衆「イヤッホー！」.mp3',
];

// タイピングキー押下時用サウンドリスト
const soundList = [
  'sound (1).mp3',
  'sound (2).mp3',
  'sound (3).mp3',
  'sound (4).mp3',
  'sound (5).mp3',
  'sound (6).mp3',
  'sound (7).mp3',
  'sound (8).mp3',
  'sound (9).mp3',
  'sound (10).mp3',
  'sound (11).mp3',
  'sound (12).mp3',
  'sound (13).mp3',
  'sound (14).mp3',
  'sound (15).mp3',
  'sound (16).mp3',
  'sound (17).mp3',
  'sound (18).mp3',
  'sound (19).mp3',
  'sound (20).mp3',
  'sound (21).mp3',
  'sound (22).mp3',
  'sound (23).mp3',
  'sound (24).mp3',
  'sound (25).mp3',
  'sound (26).mp3',
  'sound (27).mp3',
  'sound (28).mp3',
  'sound (29).mp3',
];

// オーディオオブジェクトの事前読み込み
const audioMap = {};
[...soundList, ...hitSound].forEach(src => {
  audioMap[src] = new Audio(src);
});

// キー入力用サウンド再生関数
function playSound() {
  if (soundList.length === 0) return;

  const randomIndex = Math.floor(Math.random() * soundList.length);
  const selectedSrc = soundList[randomIndex];
  const targetAudio = audioMap[selectedSrc];

  if (targetAudio) {
    targetAudio.currentTime = 0;
    targetAudio.play().catch(err => console.error(err));
  }
}

// 1行完成（確定）時にhitSoundからランダム再生する関数
function playHitSound() {
  if (hitSound.length === 0) return;

  const randomIndex = Math.floor(Math.random() * hitSound.length);
  const selectedSrc = hitSound[randomIndex];
  const targetAudio = audioMap[selectedSrc];

  if (targetAudio) {
    targetAudio.currentTime = 0;
    targetAudio.play().catch(err => console.error(err));
  }
}

// キー入力イベント
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  const ignoreCodes = [
    'ShiftLeft', 'ShiftRight',
    'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight',
    'CapsLock', 'Tab', 'Escape'
  ];

  if (ignoreCodes.includes(e.code) || ignoreCodes.includes(e.key)) {
    return;
  }

  playSound();
});
