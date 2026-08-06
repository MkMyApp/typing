let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1問ごとの開始時間を保持

// ==================================================
//  Canvas 描画・アニメーションエンジン (800x600 固定)
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * 毎フレームの描画ループ
 * 独自のエフェクトやアニメーションを描画・更新する場合はここに記述します。
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 【演出実装箇所】
    // 独自のアニメーション粒子やグラフィックの更新・描画処理をここで行います。
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
 * テキストエリアへの入力（かな入力・入力中の文字列変化）があった際に呼び出されます。
 */
function onKeyPress() {
  if (!isTracking) return;

  // 【演出実装箇所】
  // 打鍵ごとのプチエフェクト（音の再生、小さなパーティクル発生など）を記述します。
}

/**
 * 2. 1問（1行）完了時のイベントハンドラ
 * @param {number} cpm - その1行の入力スピード (CPM)
 * @param {number} accuracy - その1行の正解率 (%)
 */
function onLineComplete(cpm, accuracy) {
  // 【演出実装箇所】
  // 1問クリアごとのエフェクトを記述します。
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  // 【演出実装箇所】
  // スタート時の画面クリア、カウントダウン演出、BGM再生などを記述します。
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 * @param {number} questionIndex - 現在の出題インデックス
 */
function onNextQuestion(questionIndex) {
  // 【演出実装箇所】
  // 問題切り替え時の演出（カットイン、お題のフェードインなど）を記述します。
}

/**
 * 5. 全問クリア（リザルト表示）時のイベントハンドラ
 * @param {number} totalCpm - 通算スピード (CPM)
 * @param {number} totalAccuracy - 通算正解率 (%)
 */
function onGameComplete(totalCpm, totalAccuracy) {
  // 【演出実装箇所】
  // 最終リザルト時の演出を記述します。
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
      const targetWord = currentWord;

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