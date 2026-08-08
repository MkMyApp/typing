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

      const x = canvas.width - displayWidth - 50;
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
//  ランク設定
// ==================================================
function getRank(cpm, accuracy) {
  // 正解率 50%以下
  if (accuracy < 50) return "F"; 
  // 1分間に約500文字以上＋高精度
  if (cpm >= 500 && accuracy >= 100) return "神";
  // 1分間に約360文字以上＋高精度
  if (cpm >= 360 && accuracy >= 99) return "超人";
  // 1分間に約280文字以上＋高精度
  if (cpm >= 280 && accuracy >= 98) return "名人";
  // 1分間に約200文字以上＋高精度
  if (cpm >= 200 && accuracy >= 95) return "S+";
  // 1分間に約160文字以上
  if (cpm >= 160 && accuracy >= 90) return "S";
  // 1分間に約120文字以上
  if (cpm >= 120 && accuracy >= 85) return "A";
  // 1分間に約80文字以上
  if (cpm >= 80 && accuracy >= 80)  return "B";
  // 1分間に約60文字以下
  if (cpm >= 60 && accuracy >= 70)  return "C";
  // 1分間に約40文字以下
  if (cpm >= 40 && accuracy >= 60)  return "D";
  // 1分間に約20文字以下
  if (cpm >= 20 && accuracy >= 50)  return "E";
  return "F";
}

// ==================================================
//  各種イベントフック
// ==================================================

/**
 * 1. 1打鍵・入力ごとのイベントハンドラ
 * @param {Object} keyData - 1打鍵ごとの詳細データ
 * @param {string} keyData.key - 入力されたキー ('a', 'Enter' など)
 * @param {string} keyData.code - キーコード ('KeyA', 'Enter' など)
 * @param {number} keyData.pressSec - 前の打鍵からの経過時間 (秒)
 * @param {number} keyData.charCount - 現時点での入力文字数
 * @param {number} keyData.instantCpm - その打鍵時点での速度 (CPM)
 */
function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  // キャラクターアクション切り替え
  switchToM02();

  // 各種計算結果を出力
  strOutput(``);
  strOutput(`[キー入力]`);
  strOutput(`キー : '${key}'`);
  strOutput(`コード: ${code}`);
  strOutput(`間 隔: ${pressSec.toFixed(3)}s`);
  strOutput(`文字数: ${charCount}ch`);
  strOutput(`速 度: ${instantCpm}cpm`);
}

/**
 * 2. 1問（1行）完了時のイベントハンドラ
 * @param {Object} stats - 計算データ
 * @param {number} stats.cpm - CPM
 * @param {number} stats.accuracy - 正解率 (%)
 * @param {number} stats.lineSec - かかった時間 (秒)
 * @param {number} stats.lineChars - 文字数
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  // 詠唱完了 -> 立ち姿に戻し、魔法弾を発射！
  currentCharacterImage = m01Image;
  triggerFireball();

  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  const lineScore = Math.round(cpm * (accuracy / 100));
  const rank = getRank(cpm, accuracy);

  strOutput(``);
  strOutput(`[入力完了]`);
  strOutput(`単 語: ${targetWord}`);
  strOutput(`文字数: ${lineChars}ch`);
  strOutput(`時 間: ${lineSec.toFixed(2)}sec`);
  strOutput(`速 度: ${cpm}cpm`);
  strOutput(`正解率: ${accuracy}%`);
  strOutput(`スコア: ${lineScore}pt`);
  strOutput(`ランク: ${rank}`);
  strOutput(``);
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[ゴースト撃退戦 開始]');
  currentCharacterImage = m01Image;
  showGoImage = true;
  isGhostDefeated = false;
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 * @param {number} questionIndex - 現在の出題インデックス
 */
function onNextQuestion(questionIndex) {
  currentCharacterImage = m01Image;
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  strOutput(`[問題出題] 第${questionIndex}問: ${targetWord}`);
}

/**
 * 5. 全問クリア（リザルト表示）時のイベントハンドラ
 */
function onGameComplete(totalCpm, totalAccuracy) {
  currentCharacterImage = m01Image;

  const tChars = typeof totalChars !== 'undefined' ? totalChars : 0;
  const tSec = (typeof endTime !== 'undefined' && typeof startTime !== 'undefined') ? (endTime - startTime) / 1000 : 0;

  // --- 最終スコアとランクの計算 ---
  const finalScore = Math.round(totalCpm * Math.pow(totalAccuracy / 100, 2));
  const rank = getRank(totalCpm, totalAccuracy);

  strOutput(``);
  strOutput(`[ゴースト撃退完了！] 浄化成功`);
  strOutput(`文字数: ${tChars}ch`);
  strOutput(`時 間: ${tSec.toFixed(2)}sec`);
  strOutput(`速 度: ${totalCpm}cpm`);
  strOutput(`正解率: ${totalAccuracy}%`);
  strOutput(`スコア: ${finalScore}pt`);
  strOutput(`ランク: ${rank}`);
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

// キー打鍵間隔の計算用タイムスタンプ
let lastKeyPressTime = 0;
// 直近で押された物理キーのコードを保持する変数
let lastKeyCode = '';

// テキスト入力の監視
const editorElForGame = document.getElementById('editor');
if (editorElForGame) {
  editorElForGame.addEventListener('input', (e) => {
    if (!isTracking) return;

    const now = performance.now();

    // 最初の打鍵の時は行の開始時間（lineStartTime）からの経過時間にする
    const baseTime = lastKeyPressTime > 0 ? lastKeyPressTime : lineStartTime;
    const pressSec = baseTime > 0 ? (now - baseTime) / 1000 : 0;
    
    // 次回の打鍵間隔計算用に時間を保存
    lastKeyPressTime = now;

    // 現在のテキストエリアの入力文字数
    const charCount = editorElForGame.value.replace(/\n/g, '').length;

    // その打鍵単体のスピード（打鍵間隔から換算したCPM）
    const instantCpm = pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0;

    // オブジェクトとしてまとめて渡す
    onKeyPress({
      key: e.data || e.inputType,
      code: lastKeyCode || 'Input',
      pressSec: pressSec,
      charCount: charCount,
      instantCpm: instantCpm
    });
  });
}

// 判定・問題判定用キーダウンの監視
function handleKeyDown(e) {
  if (!isTracking) return;

  // 押されたキーの code を保存
  lastKeyCode = e.code;

  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

      // 1. 時間と文字数の算出
      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      // 2. CPM 計算
      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

      // 3. 正解率計算
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

      // 4. 計算した値をすべてオブジェクトにまとめて引数として引き渡す
      onLineComplete({
        cpm: lineCpm,
        accuracy: lineAccuracy,
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
  // ■ タイピング開始時
  if (typeof typeStarted !== 'undefined' && typeStarted && !isTracking) {
    isTracking = true;
    lastQIndex = 0;
    onGameStart();
  }

  // ■ 次の問題が出題された時
  if (isTracking && typeof qIndex !== 'undefined' && qIndex !== lastQIndex) {
    lastQIndex = qIndex;
    lineStartTime = performance.now();
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