let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1行ごとの開始時間を保持

// ==================================================
//  ★ 画像サイズ指定設定
// ==================================================
// 1. キャラクター画像 (m01 / m02) のサイズ指定
const CHARACTER_HEIGHT = 250; // 高さ (px)
const CHARACTER_WIDTH = null; // 横幅 (nullで縦横比維持)

// 2. ゴースト画像 (go.png) のサイズ指定
const GO_HEIGHT = 300; // 高さ (px)
const GO_WIDTH = null;

// 3. ファイアボール画像 (fb.png) のサイズ指定
const FB_HEIGHT = 100; // 高さ (px)
const FB_WIDTH = null;
const FB_SPEED = 30;   // 1フレームあたりの移動速度(px)

// ==================================================
//  テキストエリア状態モニタ
// ==================================================
function strOutput(str) {
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.value += str + '\n';
    logEl.scrollTop = logEl.scrollHeight;
  }
}

// ==================================================
//  Canvas 描画・アニメーションエンジン
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Canvasの内部解像度を設定 (1024x434)
if (canvas) {
  canvas.width = 1024;
  canvas.height = 434;
}

// 1. 背景画像の読み込み
const bgImage = new Image();
bgImage.src = 'bg.png';

// 2. キャラクター画像 (m01 / m02) の読み込み
const m01Image = new Image();
m01Image.src = 'm01.png';

const m02Image = new Image();
m02Image.src = 'm02.png';

let currentCharacterImage = m01Image;

// 3. ゴースト画像 (go.png) の読み込みと状態管理
const goImage = new Image();
goImage.src = 'go.png';
let showGoImage = false; // 表示フラグ
let ghostHitTimer = 0;   // ダメージ受けた時の点滅用タイマー
let isGhostDefeated = false; // 撃退完了フラグ

// 4. ファイアボール画像 (fb.png) の読み込みと状態管理
const fbImage = new Image();
fbImage.src = 'fb.png';
let isFbActive = false; // 発射中フラグ
let fbX = 0;            // X位置
let fbY = 0;            // Y位置

/**
 * m02画像（詠唱・打鍵時アクション）へ切り替える関数
 */
function switchToM02() {
  if (currentCharacterImage !== m02Image) {
    currentCharacterImage = m02Image;
  }
}

/**
 * ファイアボール（fb.png）を左から右へ飛ばす関数
 */
function triggerFireball() {
  isFbActive = true;
  const charDisplayWidth = CHARACTER_WIDTH 
    ? CHARACTER_WIDTH 
    : CHARACTER_HEIGHT * (currentCharacterImage.naturalWidth / (currentCharacterImage.naturalHeight || 1));
  
  fbX = charDisplayWidth * 0.7; 
  fbY = canvas.height - (CHARACTER_HEIGHT / 2) - (FB_HEIGHT / 2) - 50;
}

/**
 * 毎フレームの描画ループ
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. 背景画像
    if (bgImage.complete && bgImage.naturalWidth !== 0) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }
    
    // 2. キャラクター画像
    if (currentCharacterImage.complete && currentCharacterImage.naturalWidth !== 0) {
      const displayHeight = CHARACTER_HEIGHT;
      const displayWidth = CHARACTER_WIDTH 
        ? CHARACTER_WIDTH 
        : displayHeight * (currentCharacterImage.naturalWidth / currentCharacterImage.naturalHeight);
      
      ctx.drawImage(currentCharacterImage, 0, canvas.height - displayHeight, displayWidth, displayHeight);
    }

    // 3. ゴースト画像 (go.png) 描画
    if (showGoImage && !isGhostDefeated && goImage.complete && goImage.naturalWidth !== 0) {
      const displayHeight = GO_HEIGHT;
      const displayWidth = GO_WIDTH 
        ? GO_WIDTH 
        : displayHeight * (goImage.naturalWidth / goImage.naturalHeight);

      const x = canvas.width - displayWidth -50;
      const y = canvas.height - displayHeight;

      ctx.save();
      // ダメージ（被弾）時は点滅演出
      if (ghostHitTimer > 0) {
        ctx.globalAlpha = (Math.floor(ghostHitTimer / 3) % 2 === 0) ? 0.3 : 1.0;
        ghostHitTimer--;
      }
      ctx.drawImage(goImage, x, y, displayWidth, displayHeight);
      ctx.restore();
    }

    // 4. ファイアボール (fb.png) 描画・更新
    if (isFbActive && fbImage.complete && fbImage.naturalWidth !== 0) {
      const displayHeight = FB_HEIGHT;
      const displayWidth = FB_WIDTH 
        ? FB_WIDTH 
        : displayHeight * (fbImage.naturalWidth / fbImage.naturalHeight);

      fbX += FB_SPEED;
      ctx.drawImage(fbImage, fbX, fbY, displayWidth, displayHeight);

      // ゴーストへのヒット判定（ゴーストの位置に到達）
      const ghostTargetX = canvas.width - (GO_WIDTH || (GO_HEIGHT * (goImage.naturalWidth / goImage.naturalHeight))) + 50;
      if (fbX + 300 >= ghostTargetX) {
        isFbActive = false;
        ghostHitTimer = 12; // ヒット時の点滅アニメーション発動

        // 全行完了していたらゴースト撃退
        if (typeof finished !== 'undefined' && finished) {
          isGhostDefeated = true;
        }
      }
    }
  }
  requestAnimationFrame(updateAndDraw);
}

// アニメーションループ起動
requestAnimationFrame(updateAndDraw);

// ==================================================
//  イベントフック
// ==================================================

function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;
  switchToM02();
}

function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  // 詠唱完了 -> 立ち姿に戻し、魔法弾を発射！
  currentCharacterImage = m01Image;
  triggerFireball();
}

function onGameStart() {
  strOutput('[ゴースト撃退戦 開始]');
  currentCharacterImage = m01Image;
  showGoImage = true;
  isGhostDefeated = false;
}

function onNextQuestion(questionIndex) {
  currentCharacterImage = m01Image;
}

function onGameComplete(totalCpm, totalAccuracy) {
  strOutput(`[ゴースト撃退完了！] 浄化成功`);
  currentCharacterImage = m01Image;
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

const editorElForGame = document.getElementById('editor');
if (editorElForGame) {
  editorElForGame.addEventListener('keydown', (e) => {
    if (isTracking && e.key !== 'Enter') {
      switchToM02();
    }
  });

  editorElForGame.addEventListener('input', (e) => {
    if (!isTracking) return;
    const now = performance.now();
    const baseTime = lastKeyPressTime > 0 ? lastKeyPressTime : lineStartTime;
    const pressSec = baseTime > 0 ? (now - baseTime) / 1000 : 0;
    lastKeyPressTime = now;

    onKeyPress({
      key: e.data || e.inputType,
      code: e.code || 'Input',
      pressSec: pressSec,
      charCount: editorElForGame.value.length,
      instantCpm: pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0
    });
  });
}

let lastKeyPressTime = 0;

function handleKeyDown(e) {
  if (!isTracking) return;

  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      onLineComplete({
        cpm: lineSec > 0 ? Math.round((lineChars / lineSec) * 60) : 0,
        accuracy: 100,
        lineSec: lineSec,
        lineChars: lineChars
      });
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
    lastQIndex = 0;
    onGameStart();
  }

  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now();
    onNextQuestion(qIndex);
  }

  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    const sec = (endTime - startTime) / 1000;
    let cpm = sec > 0 ? Math.round((totalChars / sec) * 60) : 0;
    let accuracy = targetLengthTotal > 0 ? Math.round((correctChars / targetLengthTotal) * 100) : 0;

    onGameComplete(cpm, accuracy);
  }
}, 100);