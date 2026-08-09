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
//  ランク設定
// ==================================================

function getRank(cpm, accuracy) {
　//正解率 50%以下
　if (accuracy < 50) return "F"; 
  // 1分間に約500文字以上＋高精度
  if (cpm >= 500 && accuracy >= 100) return "からあげクン";
  // 1分間に約360文字以上＋高精度
  if (cpm >= 360 && accuracy >= 99) return "パートさん";
  // 1分間に約280文字以上＋高精度
  if (cpm >= 280 && accuracy >= 98) return "バイトくん";
  // 1分間に約200文字以上＋高精度
  if (cpm >= 200 && accuracy >= 95) return "研修中";
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

  // 各種計算結果を出力
  strOutput(``);
  strOutput(`[キー入力]`);
  strOutput(`キー　: '${key}'`);
  strOutput(`コード: ${code}`);
  strOutput(`間　隔: ${pressSec.toFixed(3)}s`);
  strOutput(`文字数: ${charCount}ch`);
  strOutput(`速　度: ${instantCpm}cpm`);
}

/**
 * 1. 1打鍵・入力ごとのイベントハンドラ
 */
function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  strOutput(``);
  strOutput(`[キー入力]`);
  strOutput(`キー : '${key}'`);
  strOutput(`コード: ${code}`);
  strOutput(`間 隔: ${pressSec.toFixed(3)}s`);
  strOutput(`文字数: ${charCount}ch`);
  strOutput(`速 度: ${instantCpm}cpm`);
}

/**
 * 2. 1行完了時のイベントハンドラ（スコア計算・加算）
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  
  // 1行のスコア計算（速度 × 正解率）
  const lineScore = Math.round(cpm * (accuracy / 100));
  
  totalScore += lineScore;

  const rank = getRank(cpm, accuracy);

  strOutput(``);
  strOutput(`[1行入力完了]`);
  strOutput(`単 語: ${targetWord}`);
  strOutput(`文字数: ${lineChars}ch`);
  strOutput(`時 間: ${lineSec.toFixed(2)}sec`);
  strOutput(`速 度: ${cpm}cpm`);
  strOutput(`正解率: ${accuracy}%`);
  strOutput(`加算pt: ${lineScore}pt`);
  strOutput(`現在計: ${totalScore}pt`);
  strOutput(`ランク: ${rank}`);
  strOutput(``);
  
    const scoreEl = document.getElementById('score');
	  if (scoreEl) {
	    scoreEl.innerHTML = `時給 ${lineScore *10}円`;
	  }


}
/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[タイピング開始]');
  activeEnemies = [];
  
  // 開始時にスコアを0にリセット
  totalScore = 0;

  // 開始時に <div id="score"></div> の表示を消去
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '';
  }

  lineStartTime = performance.now();
  lastTypeTime = performance.now();
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
 * 5. 全問完了（リザルト表示）時のイベントハンドラ
 */
function onGameComplete(totalCpm, totalAccuracy) {
  const tChars = typeof totalChars !== 'undefined' ? totalChars : 0;
  let tSec = 0;
  try {
    if (typeof startTime !== 'undefined' && typeof endTime !== 'undefined') {
      tSec = (endTime - startTime) / 1000;
    }
  } catch (e) {}

  const rank = getRank(totalCpm, totalAccuracy);

  strOutput(``);
  strOutput(`========================`);
  strOutput(`[全問完了 リザルト]`);
  strOutput(`総文字数: ${tChars}ch`);
  strOutput(`総 時間: ${tSec.toFixed(2)}sec`);
  strOutput(`平均速度: ${totalCpm}cpm`);
  strOutput(`平均精度: ${totalAccuracy}%`);
  strOutput(`獲得スコア: ${totalScore}pt`);
  strOutput(`総合ランク: ${rank}`);
  strOutput(`========================`);

  // <div id="score"></div> にランクとスコアを代入
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `Rank : ${rank} 総額 ${totalScore * 10}円`;
  }
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

// キー打鍵間隔の計算用タイムスタンプ
let lastKeyPressTime = 0;
// ★ 追加: 直近で押された物理キーのコードを保持する変数
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
      key: e.data || e.inputType, // 入力文字
      code: lastKeyCode || 'Input', // ★ 修正: 保存しておいた lastKeyCode を渡す
      pressSec: pressSec,
      charCount: charCount,
      instantCpm: instantCpm
    });
  });
}

// 2. 判定・問題判定用キーダウンの監視
function handleKeyDown(e) {
  if (!isTracking) return;

  // ★ 追加: 押されたキーの code (KeyA や Enter など) を保存
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
