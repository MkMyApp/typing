let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア保持用変数
let totalScore = 0;

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================
// 画像が見つからない場合のフォールバック用
const ENEMY_IMAGES = [
  'sushi_syari.png',
];

const ENEMY_HEIGHT = 180; // 表示する高さ(px)
const BASE_SPEED = 1.5;   // 基準の移動速度(px)

let activeEnemies = [];

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
//  Canvas 描画・アニメーションエンジン (1024x434)
// ==================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
  canvas.width = 1024;
  canvas.height = 434;
}

/**
 * 寿司画像を1個生成する関数（出題時にのみ呼ばれます）
 */
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  
  // 出題文字列をそのまま「寿司名.png」形式に変換する
  let imageSrc = targetWord ? `${targetWord}.png` : '';

  // 万が一文字が空の場合などのフォールバック
  if (!imageSrc && ENEMY_IMAGES.length > 0) {
    imageSrc = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
  }

  if (!imageSrc) return;

  const img = new Image();

  const enemy = {
    img: img,
    x: canvas ? canvas.width : 1024,
    y: (canvas ? canvas.height - ENEMY_HEIGHT : 434 - ENEMY_HEIGHT) / 2, // レーンの中央に綺麗に配置
    width: 180,
    height: ENEMY_HEIGHT,
    speed: BASE_SPEED,
    loaded: false
  };

  img.onload = () => {
    if (img.naturalHeight > 0) {
      const aspect = img.naturalWidth / img.naturalHeight;
      enemy.width = ENEMY_HEIGHT * aspect;
    }
    enemy.loaded = true;
  };

  img.src = imageSrc;

  // ★ 画面上の配列をクリアして、新しい問題の寿司1個だけをセット
  activeEnemies = [enemy];
}

/**
 * 毎フレームの描画＆更新処理（自動生成ロジックは削除）
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画面上の寿司の移動と描画
    for (let i = activeEnemies.length - 1; i >= 0; i--) {
      const enemy = activeEnemies[i];
      enemy.x -= enemy.speed;

      if (enemy.loaded) {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
      }

      // 画面左端から完全に消えたら配列から削除
      if (enemy.x + enemy.width < 0) {
        activeEnemies.splice(i, 1);
      }
    }
  }
  requestAnimationFrame(updateAndDraw);
}

requestAnimationFrame(updateAndDraw);

// ==================================================
//  ランク設定
// ==================================================
function getRankTitle(cpm, acc) {
  if (acc < 70) return "虫見習い";
  if (cpm >= 70 && acc >= 98) return "伝説の虫博士";
  if (cpm >= 60 && acc >= 95) return "昆虫マスター";
  if (cpm >= 50 && acc >= 90) return "一人前の昆虫ハンター";
  if (cpm >= 40 && acc >= 85) return "熟練の虫捕り名人";
  if (cpm >= 30) return "駆け出し虫捕り";
  if (cpm >= 20) return "虫観察員";
  return "虫好きのひよこ";
}

// ==================================================
//  各種イベントフック関数
// ==================================================

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
 * 2. 1行完了時のイベントハンドラ
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  
  const lineScore = Math.round(cpm * (accuracy / 100));
  
  if (activeEnemies.length > 0) {
    totalScore += lineScore;
  }

  const rank = getRank(cpm, accuracy);

  strOutput(``);
  strOutput(`[1行入力完了]`);
  strOutput(`単 語: ${targetWord}`);
  strOutput(`文字数: ${lineChars}ch`);
  strOutput(`速 度: ${cpm}cpm`);
  strOutput(`正解率: ${accuracy}%`);
  strOutput(`加算pt: ${activeEnemies.length > 0 ? lineScore : 0}pt`);
  strOutput(`現在計: ${totalScore}pt`);
  strOutput(`ランク: ${rank}`);
  strOutput(``);

  // 1行入力完了したら画面の寿司を消去（食べた表現）
  activeEnemies = [];
}

/**
 * 3. ゲーム開始時のイベントハンドラ
 */
function onGameStart() {
  strOutput('[タイピング開始]');
  activeEnemies = [];
  totalScore = 0;

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '';
  }

  lineStartTime = performance.now();
  lastTypeTime = performance.now();

  // ★ ゲーム開始時（第1問）の寿司を1個生成
  spawnEnemy();
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 */
function onNextQuestion(questionIndex) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  lineStartTime = performance.now();
  strOutput(`[問題出題] 第${questionIndex}問: ${targetWord}`);
  
  // ★ 新しい問題が出題されたタイミングでのみ寿司を1個生成
  spawnEnemy();
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
  strOutput(`獲得スコア: ${totalScore * 10}pt`);
  strOutput(`総合称号: ${rank}`);
  strOutput(`========================`);

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `${rank} / スコア: ${totalScore * 10}pt`;
  }
}

// ==================================================
//  イベントフック登録 (typing.js への割り込み)
// ==================================================

const editorElement = document.getElementById('editor');

if (editorElement) {
  editorElement.addEventListener('input', (e) => {
    if (!isTracking || (typeof typeStarted !== 'undefined' && !typeStarted)) return;

    const now = performance.now();
    const pressSec = lastTypeTime > 0 ? (now - lastTypeTime) / 1000 : 0;
    lastTypeTime = now;

    const instantCpm = pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0;
    const currentTyped = editorElement.value.replace(/\n/g, '');

    onKeyPress({
      key: e.data || '',
      code: 'Input',
      pressSec: pressSec,
      charCount: currentTyped.length,
      instantCpm: instantCpm
    });
  });
}

if (typeof judgeCurrentWord === 'function') {
  const originalJudgeCurrentWord = judgeCurrentWord;
  judgeCurrentWord = function() {
    if (isTracking) {
      try {
        const userTyped = typeof typed === 'function' ? typed() : (editorElement ? editorElement.value : '');
        const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

        const lineEndTime = performance.now();
        const lineSec = (lineEndTime - lineStartTime) / 1000;
        const lineChars = userTyped.length;
        const lineCpm = lineSec > 0 ? Math.round((lineChars / lineSec) * 60) : 0;

        let lineCorrectChars = 0;
        const u = [...userTyped];
        const a = [...targetWord];
        for (let i = 0; i < Math.min(u.length, a.length); i++) {
          if (u[i] === a[i]) lineCorrectChars++;
        }
        const lineTargetLen = Math.max(u.length, a.length);
        const lineAccuracy = lineTargetLen > 0 ? Math.round((lineCorrectChars / lineTargetLen) * 100) : 0;

        onLineComplete({
          cpm: lineCpm,
          accuracy: lineAccuracy,
          lineSec: lineSec,
          lineChars: lineChars
        });
      } catch (err) {
        console.error("onLineComplete Error:", err);
      }
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

    onGameComplete(finalCpm, finalAcc);
  }

  if (typeof typeStarted !== 'undefined' && !typeStarted && isTracking) {
    isTracking = false;
    strOutput('[タイピング中断]');
  }
}, 100);