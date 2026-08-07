let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1問ごとの開始時間を保持

// ==================================================
//  ポップコーン Canvas 描画エンジン (800x600 固定)
// ==================================================
const canvas = document.getElementById('popcornCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let popcorns = [];

// 画面中央下部（Canvas内座標）から発生させる基準位置
const START_X = 400; // 横幅800pxの中央
const START_Y = 300; // 高さ600pxの下部付近

/**
 * 1問完了時・クリア時のポップコーン発生関数
 * @param {number} cpm - スピード (CPM)
 * @param {number} accuracy - 正解率 (%)
 * @param {number} scale - 発生量の倍率 (デフォルト: 1)
 */
function spawnPopcorn(cpm, accuracy, scale = 1) {
  if (!canvas) return;

  const baseCount = Math.max(5, Math.min(40, Math.round(cpm / 5)));
  const count = Math.round(baseCount * scale);
  const powerBase = (accuracy / 100) * 12 + 6;

  for (let i = 0; i < count; i++) {
    popcorns.push({
      x: START_X + (Math.random() - 0.5) * 80,
      y: START_Y,
      vx: (Math.random() - 0.5) * (powerBase * 1.2),
      vy: -(Math.random() * powerBase + 5),
      size: Math.random() * 12 + 10,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      gravity: 0.45,
      // 正解率100%: 金色 / 80%以上: 通常（白） / 80%未満: 焦げ色
      color: accuracy === 100 ? '#FFD700' : (accuracy >= 80 ? '#FFF8DC' : '#DAA520')
    });
  }
}

/**
 * 1打鍵・入力ごとのプチポップコーン発生関数（IME対応）
 */
function spawnKeyPopcorn() {
  if (!canvas) return;

  // 1〜2個だけポコッと弾けさせる
  const count = Math.floor(Math.random() * 2) + 1;

  for (let i = 0; i < count; i++) {
    popcorns.push({
      x: START_X + (Math.random() - 0.5) * 120,
      y: START_Y,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 6 + 6), // 軽く跳ね上がる
      size: Math.random() * 8 + 8,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.3,
      gravity: 0.4,
      color: '#FFF8DC'
    });
  }
}

// 毎フレーム描画ループ
function updateAndDrawPopcorn() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = popcorns.length - 1; i >= 0; i--) {
      const p = popcorns[i];

      // 物理演算（移動・重力・回転）
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      // モコモコしたポップコーンを描画
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
      ctx.arc(-p.size * 0.3, -p.size * 0.2, p.size * 0.4, 0, Math.PI * 2);
      ctx.arc(p.size * 0.3, -p.size * 0.2, p.size * 0.4, 0, Math.PI * 2);
      ctx.arc(0, -p.size * 0.4, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // 中央のコーン種（核）
      ctx.fillStyle = '#CD853F';
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Canvasの底（600px）をはみ出したら削除
      if (p.y > canvas.height + 30) {
        popcorns.splice(i, 1);
      }
    }
  }
  requestAnimationFrame(updateAndDrawPopcorn);
}

// アニメーションループ起動
requestAnimationFrame(updateAndDrawPopcorn);


// ==================================================
//  イベント監視 (input & keydown)
// ==================================================

// 1. IME入力（日本語入力）対応：文字が入力されるたびに弾けさせる
const editorElForPop = document.getElementById('editor');
if (editorElForPop) {
  editorElForPop.addEventListener('input', () => {
    if (!isTracking) return;
    
    // 入力エリアに変化があるたび（かな打ち・ローマ字変換含む）ポップコーンを弾けさせる
    spawnKeyPopcorn();
  });
}

// 2. 1問完了判定（Enterキー押下時）
function handleKeyDown(e) {
  if (!isTracking) return;

  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    // IME OFFの時: Enter単体 / IME ONの時: Shift+Enter
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = currentWord;

      // その1行にかかった時間（秒）
      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      // その1行の CPM 計算
      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

      // その1行の正解率計算
      let lineCorrectChars = 0;
      const u = [...userTyped];
      const a = [...targetWord];
      for (let i = 0; i < u.length; i++) {
        if (u[i] === a[i]) lineCorrectChars++;
      }
      const lineTargetLen = Math.max(u.length, a.length);

      let lineAccuracy = 0;
      if (lineTargetLen > 0) {
        lineAccuracy = Math.round((lineCorrectChars / lineTargetLen) * 100);
      }

      // 1問完了時の大きなポップコーン噴射！
      spawnPopcorn(lineCpm, lineAccuracy);
    }
  }
}

window.addEventListener('keydown', handleKeyDown, true);


// ==================================================
//  タイピング状態監視 (タイマー処理)
// ==================================================
const checkInterval = setInterval(() => {
  // ■ タイピング開始時
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = 0;
    popcorns = []; // 画面上の残粒子をクリア
    
    // スタート合図の軽量ポップコーン
    spawnPopcorn(150, 100, 0.5);
  }

  // ■ 次の問題出題時
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now(); // 出題時のタイムスタンプを記録
  }

  // ■ 全問終了時
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    
    const sec = (endTime - startTime) / 1000;
    let cpm = sec > 0 ? Math.round((totalChars / sec) * 60) : 0;
    let accuracy = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    // 通算成績に応じた3連続の大噴火演出！
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        spawnPopcorn(cpm, accuracy, 2.0);
      }, i * 250);
    }
  }
}, 100);