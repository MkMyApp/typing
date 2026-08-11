let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア保持用変数
let totalScore = 0;

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================
// フォールバック用のランダム画像配列（対応表にない単語が出た場合に使用）
const ENEMY_IMAGES = [
  'sushi_syari.png',
];

// ★ 出題文字列（ひらがな・漢字）と画像ファイル名の対応表
const SUSHI_MAP = {
  // 握り・赤身・白身
  'まぐろ': 'sushi_akami.png',
  '赤身': 'sushi_akami.png',
  '中とろ': 'sushi_chutoro.png',
  '大とろ': 'sushi_ootoro.png',
  '炙りとろ': 'sushi_aburi_toro.png',
  'たい': 'sushi_tai.png',
  '真鯛': 'sushi_tai.png',
  'はまち': 'sushi_hamachi.png',
  'ぶり': 'sushi_buri.png',
  '寒ぶり': 'sushi_buri.png',
  'かつお': 'sushi_katsuo.png',
  '金目鯛': 'sushi_kinmedai.png',
  'のどぐろ': 'sushi_nodoguro.png',
  'こはだ': 'sushi_kohada.png',
  'いわし': 'sushi_iwashi.png',

  // サーモン・えび・貝・他
  '炙りサーモン': 'sushi_aburi_salmon.png',
  '焼きはらす': 'sushi_harasu.png',
  'えび': 'sushi_ebi.png',
  '甘えび': 'sushi_amaebi.png',
  'いか': 'sushi_ika.png',
  'たこ': 'sushi_tako.png',
  'ほたて': 'sushi_hotate.png',
  '炙りほたて': 'sushi_aburi_hotate.png',
  '赤貝': 'sushi_akagai.png',
  'ホッキ貝': 'sushi_kai_hokkigai.png',
  'えんがわ': 'sushi_engawa.png',
  '炙りえんがわ': 'sushi_aburi_engawa.png',
  'シャコ': 'sushi_syako.png',
  'かずのこ': 'sushi_kazunoko.png',

  // 卵・穴子・うなぎ・肉・変わり種
  'たまご': 'sushi_tamago.png',
  '穴子': 'sushi_anago.png',
  '煮あなご': 'sushi_anago.png',
  'うなぎ': 'sushi_unagi.png',
  'いなり': 'inarizushi.png',
  'いなり寿司': 'inarizushi.png',
  'ハンバーグ': 'sushi_hamburg.png',
  '肉寿司': 'food_nikuzushi1.png',
  '芽ねぎ': 'sushi_menegi.png',
  'バッテラ': 'sushi_battera.png',

  // 軍艦・巻き物・その他
  'いくら': 'food_sushi_kobore_ikura_gunkan.png',
  'うに': 'sushi_uni2.png',
  'しらす': 'sushi_shirasu.png',
  '白子': 'sushi_shirako.png',
  'ツナマヨ': 'sushi_tsuna.png',
  'とろたく巻': 'sushi_makimono_torotaku.png',
  'たくあん巻': 'makimono_takuwan.png',
  '納豆巻': 'sushi_makimono_nattou.png',
  'ガリ': 'gari.png',
  'シャリ': 'sushi_syari.png'
};

const ENEMY_HEIGHT = 180; // 表示する高さ(px)
const BASE_SPEED = 3;     // 基準の移動速度(px)

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
  
  // 1. 問題文（単語）に対応する画像があれば優先使用
  let imageSrc = SUSHI_MAP[targetWord];

  // 2. 対応する画像がない場合は ENEMY_IMAGES からランダム選択
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
function getRank(cpm, accuracy) {
  if (accuracy < 50) return "F"; 
  if (cpm >= 500 && accuracy >= 100) return "横綱";
  if (cpm >= 360 && accuracy >= 99) return "大関";
  if (cpm >= 280 && accuracy >= 98) return "関脇";
  if (cpm >= 200 && accuracy >= 95) return "S+";
  if (cpm >= 160 && accuracy >= 90) return "S";
  if (cpm >= 120 && accuracy >= 85) return "A";
  if (cpm >= 80 && accuracy >= 80)  return "B";
  if (cpm >= 60 && accuracy >= 70)  return "C";
  if (cpm >= 40 && accuracy >= 60)  return "D";
  if (cpm >= 20 && accuracy >= 50)  return "E";
  return "F";
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