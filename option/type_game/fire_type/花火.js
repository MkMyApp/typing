let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1問ごとの開始時間を保持

// 花火パーティクル配列
let fireworks = [];

// ==================================================
//  Canvas 描画・アニメーションエンジン (800x600 固定)
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * 花火（同心円エフェクト）の生成
 * @param {number} x - 中心X座標
 * @param {number} y - 中心Y座標
 * @param {number} maxRadius - 最大半径
 * @param {number} circleCount - 同心円の重なり数
 */
function createFirework(x, y, maxRadius, circleCount) {
  const colors = ['#ff4d4d', '#4da6ff', '#5cdb5c', '#ffff4d', '#b366ff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  fireworks.push({
    x: x,
    y: y,
    currentRadius: 0,
    maxRadius: maxRadius,
    circleCount: circleCount,
    color: color,
    alpha: 1.0,
    speed: 2 + Math.random() * 2
  });
}

/**
 * 成績（CPM・正解率）から花火のY座標（高さ）を計算する
 * 速度と正確性が高いほど画面上部（Yが小さい位置）に打ち上がる
 */
function calculateYFromPerformance(cpm, accuracy) {
  // CPMの上限目安を400、正解率を100%としてスコア化(0.0〜1.0)
  let cpmScore = cpm / 400;
  if (cpmScore > 1) {
    cpmScore = 1;
  }
  
  let accScore = accuracy / 100;
  if (accScore > 1) {
    accScore = 1;
  }

  // スコアの平均値を算出
  let totalScore = (cpmScore + accScore) / 2;

  // Y座標の範囲: 画面上部(100px) 〜 画面下部(500px)
  let minY = 100;
  let maxY = 500;
  
  // スコアが高いほどY座標は小さくなる（上に行く）
  let targetY = maxY - (totalScore * (maxY - minY));
  return targetY;
}

/**
 * 毎フレームの描画ループ
 */
function updateAndDraw() {
  if (ctx && canvas) {
    // 1. 暗い青色の背景を描画
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 花火（同心円）の更新と描画
    for (let i = fireworks.length - 1; i >= 0; i--) {
      let fw = fireworks[i];

      // 半径を広げる
      fw.currentRadius += fw.speed;
      // 徐々に透明にする
      fw.alpha -= 0.015;

      // 透明度が残っている間だけ描画
      if (fw.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = fw.alpha;
        ctx.strokeStyle = fw.color;
        ctx.lineWidth = 2;

        // 指定数の同心円を描画
        for (let j = 0; j < fw.circleCount; j++) {
          let r = fw.currentRadius * ((j + 1) / fw.circleCount);
          if (r > 0) {
            ctx.beginPath();
            ctx.arc(fw.x, fw.y, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.restore();
      } else {
        // 消滅した花火を配列から除去
        fireworks.splice(i, 1);
      }
    }
  }
  requestAnimationFrame(updateAndDraw);
}

// アニメーションループ起動
requestAnimationFrame(updateAndDraw);


// ==================================================
//  各種イベントフック
// ==================================================

/**
 * 1. 1打鍵・入力ごとのイベントハンドラ
 * 小さめの花火（画面下半分、横位置は乱数）
 */
function onKeyPress() {
  if (!isTracking) return;

  let x = Math.random() * canvas.width;
  // 画面下半分（300px 〜 550px）
  let y = 300 + Math.random() * 250;
  let maxRadius = 15 + Math.random() * 15;
  let circleCount = 2;

  createFirework(x, y, maxRadius, circleCount);
}

/**
 * 2. 1問（1行）完了時のイベントハンドラ
 * 位置は全域、大きさと数は成績による
 */
function onLineComplete(cpm, accuracy) {
  // 成績に応じた花火の数
  let count = Math.floor((accuracy / 100) * 10) + 5;
  
  // 成績に応じた最大半径
  let baseRadius = 40 + (cpm / 10);

  for (let i = 0; i < count; i++) {
    let x = 100 + Math.random() * (canvas.width - 200);
    let calculatedY = calculateYFromPerformance(cpm, accuracy);
    // 少し高さをバラつかせる
    let y = calculatedY - (Math.random() * 240 + 120);
    
    createFirework(x, y, baseRadius, 4);
  }
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  // 画面上に残っているエフェクトをクリア
  fireworks = [];

  // 開始の合図として中央下に控えめな花火を1発
  createFirework(canvas.width / 2, 450, 40, 3);
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 */
function onNextQuestion(questionIndex) {
  // 次の題目へ移る際のアクションが必要な場合はここに記述
}

/**
 * 5. 全問クリア（リザルト表示）時のイベントハンドラ
 * 通算成績に合わせて大きさと数を決定
 */
function onGameComplete(totalCpm, totalAccuracy) {
  // 通算成績に応じて多数打ち上げ
  let totalCount = Math.floor(5 + (totalAccuracy / 100) * 7);
  
  for (let i = 0; i < totalCount; i++) {
    // 打ち上げタイミングを少しずらすために時間差で生成
    setTimeout(() => {
      let x = 80 + Math.random() * (canvas.width - 160);
      
      // 成績に基づく基準の高さ
      let baseY = calculateYFromPerformance(totalCpm, totalAccuracy);
      
      // 上下に±150pxの大きなばらつきを持たせる
      let yOffset = (Math.random() - 0.5) * 300; 
      let y = baseY + yOffset;

      // 画面外にはみ出さないよう上下枠内に収める（80px〜520px）
      if (y < 80) {
        y = 80;
      }
      if (y > 520) {
        y = 520;
      }

      let radius = 60 + (totalCpm / 5);

      createFirework(x, y, radius, 5);
    }, i * 150);
  }
}


// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

// 1. テキスト入力の監視
const editorElForGame = document.getElementById('editor');
if (editorElForGame) {
  editorElForGame.addEventListener('input', () => {
    onKeyPress();
  });
}

// 2. 判定・問題判定用キーダウンの監視
function handleKeyDown(e) {
  if (!isTracking) return;

  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    // IME OFFの時: Enter単体 / IME ONの時: Shift+Enter
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

      // その1行にかかった時間（秒）
      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      // 1行あたりの CPM 計算
      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

      // 1行あたりの 正解率計算
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

      // 1問完了イベントの発火
      onLineComplete(lineCpm, lineAccuracy);
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
    
    onGameStart();
  }

  // ■ 次の問題が出題された時
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now(); // 出題時のタイムスタンプを記録
    
    onNextQuestion(qIndex);
  }

  // ■ 全問終了時（クリア時）
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    
    const sec = (endTime - startTime) / 1000;
    let cpm = sec > 0 ? Math.round((totalChars / sec) * 60) : 0;
    let accuracy = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    onGameComplete(cpm, accuracy);
  }
}, 100);