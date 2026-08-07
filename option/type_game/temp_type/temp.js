let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1行ごとの開始時間を保持

// ==================================================
//  テキストエリア状態モニタ
// ==================================================
function strOutput(str) {
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.value += str + '\n';
    // 常に最下部へスクロール
    logEl.scrollTop = logEl.scrollHeight;
  }
}

// ==================================================
//  Canvas 描画・アニメーションエンジン (800x600 固定)
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * 毎フレームの描画ループ
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 【演出実装箇所】
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
 * @param {Object} keyData - 1打鍵ごとの詳細データ
 * @param {string} keyData.key - 入力されたキー ('a', 'Enter' など)
 * @param {string} keyData.code - キーコード ('KeyA', 'Enter' など)
 * @param {number} keyData.pressSec - 前の打鍵からの経過時間 (秒)
 * @param {number} keyData.charCount - 現時点での入力文字数
 * @param {number} keyData.instantCpm - その打鍵時点での速度 (CPM)
 */
function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  // 各種計算結果を出力
  strOutput(
    `[キー入力] Key: '${key}' (Code: ${code}) | 間隔: ${pressSec.toFixed(3)}s | 文字数: ${charCount}ch | 速度: ${instantCpm}cpm`
  );
}

/**
 * 2. 1問（1行）完了時のイベントハンドラ
 * 必要な計算結果をすべて引数（オブジェクト）で受け取る
 * * @param {Object} stats - 計算データ
 * @param {number} stats.cpm - CPM
 * @param {number} stats.accuracy - 正解率 (%)
 * @param {number} stats.lineSec - かかった時間 (秒)
 * @param {number} stats.lineChars - 文字数
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // 渡された引数をそのまま出力に使用
  strOutput(`[入力完了] 解答単語: ${targetWord} -> ${lineChars}ch ${lineSec.toFixed(2)}sec ${cpm}cpm (正解率: ${accuracy}%)`);
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[タイピング開始]');
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 * @param {number} questionIndex - 現在の出題インデックス
 */
function onNextQuestion(questionIndex) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  strOutput(`[問題出題] 第${questionIndex}問: ${targetWord}`);
}

/**
 * 5. 全問クリア（リザルト表示）時のイベントハンドラ
 */
function onGameComplete(totalCpm, totalAccuracy) {
  const tChars = typeof totalChars !== 'undefined' ? totalChars : 0;
  const tSec = (typeof endTime !== 'undefined' && typeof startTime !== 'undefined') ? (endTime - startTime) / 1000 : 0;
  strOutput(`[タイピング終了] ${tChars}ch ${tSec.toFixed(2)}sec ${totalCpm}cpm (正解率: ${totalAccuracy}%)`);
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

// キー打鍵間隔の計算用タイムスタンプ
let lastKeyPressTime = 0;

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
      key: e.data || e.inputType, // 入力文字
      code: e.code || 'Input',
      pressSec: pressSec,
      charCount: charCount,
      instantCpm: instantCpm
    });
  });
}

// 2. 判定・問題判定用キーダウンの監視
function handleKeyDown(e) {
  if (!isTracking) return;

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
