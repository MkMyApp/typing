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
  'sweets_crape.png',
  'sweets_haluhalo_haroharo.png',
  'sweets_maccha_pafe_parfait.png',
  'sweets_pafe_parfait_ichigo.png',
  'sweets_purin_goma.png',
  'sweets_annindoufu.png',
  'pudding_a_la_mode.png',
  'sweets_yaki_purin_pudding.png',
  'sweets_purin.png',
  'sweets_purin_mango.png',
  'sweets_purin_normal.png',
  'sweets_rakugan.png',
  'sweets_imokenpi.png',
  'sweets_gosyokumame.png',
  'sweets_tuncaron.png',
  'nut_giant_corn.png',
  'sweets_gyuuhi.png',
  'sweets_palmier.png',
  'sweets_ichigoame5.png',
  'potatochips.png',
  'food_daigakuimo.png',
  'sweets_chocolate_bacon.png',
  'sweets_geppei.png',
  'sweets_smore.png',
  'nut_kokutou_kurumi.png',
  'sweets_florentins.png',
  'sweets_cannolo.png',
  'sweets_cronut_kuronattsu.png',
  'sweets_press_senbei.png',
  'sweets_chocolate_pafe_parfait.png',
  'sweets_cheeseball.png',
  'sweets_churosu_churros.png',
  'hinamatsuri_arare2.png',
  'sweets_pongashi.png',
  'honey_toast.png',
  'sweets_tamago_bouro_bolo.png',
  'sweets_maritozzo.png',
  'chocolate_ichigo_white.png',
  'chocolate_ichigo_brown.png',
  'sweets_kurobou.png',
  'sweets_kakipi.png',
  'nut_hazelnut.png',
  'sweets_malasada.png',
  'sweets_fugashi.png',
  'sweets_cracker.png',
  'sweets_gulab_jam.png',
  'sweets_rasgulla.png',
  'food_hottoku.png',
  'sweets_chocolate_mousse.png',
  'sweets_fondant_au_chocolat.png',
  'sweets_chiboust.png',
  'sweets_tiramisu.png',
  'sweets_busse.png',
  'sweets_mille_crepe.png',
  'sweets_cake_far_breton.png',
  'sweets_cake_pavlova.png',
  'sweets_pinapple_cake.png',
  'sweets_shortcake.png',
  'christmas_stollen.png',
  'sweets_montblanc.png',
  'sweets_cake_chocomint.png',
  'wedding_anniversary_cake.png',
  'sweets_cupcake.png',
  'christmas_bush_de_noel.png',
  'sweets_omlet_cake_ichigo.png',
  'sweets_chocolate_cake_sachertorte.png',
  'sweets_pound_cake_fruit.png',
  'sweets_funnelcake.png',
  'sweets_omlet_cake_banana.png',
  'food_cakewich_sandwich.png',
  'sweets_cheesecake.png',
  'sweets_pound_cake.png',
  'pound_cake.png',
  'roll_cake.png',
  'sweets_chiffoncake.png',
  'sweets_cake_pop.png',
  'sweets_dutch_baby_pancake.png',
  'sweets_nama_donuts.png',
  'sweets_nama_donuts_cherry.png',
  'food_fruit_sandwich_ichigo.png',
  'pan_india_dosa.png',
  'pan_india_wada.png',
  'pan_india_idli.png',
  'sweets_hotcake.png',
  'sweets_cupcake_red_velvet_cake.png',
  'christmas_cake.png',
  'sweets_puchi_pancake.png',
  'sweets_pancake.png',
  'sweets_colorful_cupcake_yellow.png',
  'sweets_colorful_cupcake_pink.png',
  'sweets_colorful_cupcake_brown.png',
  'sweets_colorful_cupcake_blue.png',
  'sweets_chiffoncake_cut4_syrup.png',
  'sweets_chiffoncake_cut3_green.png',
  'sweets_chiffoncake_cut2_chocolate.png',
  'sweets_chiffoncake_cut1_plain.png',
  'sweets_chiffoncake4_syrup.png',
  'sweets_chiffoncake3_green.png',
  'sweets_chiffoncake2_chocolate.png',
  'sweets_chiffoncake1_plain.png'
];

// ★ 出題文字列（ひらがな・カタカナ・漢字）とお菓子画像ファイル名の対応表
const SWEETS_MAP = {
  'クレープ': 'sweets_crape.png',
  'ハロハロ': 'sweets_haluhalo_haroharo.png',
  '抹茶パフェ': 'sweets_maccha_pafe_parfait.png',
  'いちごパフェ': 'sweets_pafe_parfait_ichigo.png',
  'いちごのパフェ': 'sweets_pafe_parfait_ichigo.png',
  'ごまプリン': 'sweets_purin_goma.png',
  '杏仁豆腐': 'sweets_annindoufu.png',
  'あんにんどうふ': 'sweets_annindoufu.png',
  'プリンアラモード': 'pudding_a_la_mode.png',
  '焼きプリン': 'sweets_yaki_purin_pudding.png',
  'プリン': 'sweets_purin.png',
  'マンゴープリン': 'sweets_purin_mango.png',
  '落雁': 'sweets_rakugan.png',
  'らくがん': 'sweets_rakugan.png',
  '芋けんぴ': 'sweets_imokenpi.png',
  'いもけんぴ': 'sweets_imokenpi.png',
  '五色豆': 'sweets_gosyokumame.png',
  'ごしょくまめ': 'sweets_gosyokumame.png',
  'トゥンカロン': 'sweets_tuncaron.png',
  'ジャイアントコーン': 'nut_giant_corn.png',
  '求肥': 'sweets_gyuuhi.png',
  'ぎゅうひ': 'sweets_gyuuhi.png',
  'パルミエ': 'sweets_palmier.png',
  'いちごあめ': 'sweets_ichigoame5.png',
  'いちご飴': 'sweets_ichigoame5.png',
  '苺飴': 'sweets_ichigoame5.png',
  'ポテトチップス': 'potatochips.png',
  'ポテチ': 'potatochips.png',
  '大学芋': 'food_daigakuimo.png',
  'だいがくいも': 'food_daigakuimo.png',
  'チョコレートべーコン': 'sweets_chocolate_bacon.png',
  'チョコベコン': 'sweets_chocolate_bacon.png',
  '月餅': 'sweets_geppei.png',
  'スモア': 'sweets_smore.png',
  '黒糖くるみ': 'nut_kokutou_kurumi.png',
  'こくとうくるみ': 'nut_kokutou_kurumi.png',
  'フロランタン': 'sweets_florentins.png',
  'カンノーロ': 'sweets_cannolo.png',
  'クロナッツ': 'sweets_cronut_kuronattsu.png',
  'プレスせんべい': 'sweets_press_senbei.png',
  '煎餅': 'sweets_press_senbei.png',
  'せんべい': 'sweets_press_senbei.png',
  'チョコパフェ': 'sweets_chocolate_pafe_parfait.png',
  'チョコレートパフェ': 'sweets_chocolate_pafe_parfait.png',
  'チーズボール': 'sweets_cheeseball.png',
  'チュロス': 'sweets_churosu_churros.png',
  'ひなあられ': 'hinamatsuri_arare2.png',
  '雛あられ': 'hinamatsuri_arare2.png',
  'ポン菓子': 'sweets_pongashi.png',
  'ぽんがし': 'sweets_pongashi.png',
  'ハニートースト': 'honey_toast.png',
  'たまごボーロ': 'sweets_tamago_bouro_bolo.png',
  'タマゴボーロ': 'sweets_tamago_bouro_bolo.png',
  'マリトッツォ': 'sweets_maritozzo.png',
  'ホワイトチョコいちご': 'chocolate_ichigo_white.png',
  'チョコいちご': 'chocolate_ichigo_brown.png',
  '黒棒': 'sweets_kurobou.png',
  'くろぼう': 'sweets_kurobou.png',
  '柿の種': 'sweets_kakipi.png',
  'かきのたね': 'sweets_kakipi.png',
  '柿ピー': 'sweets_kakipi.png',
  'ヘーゼルナッツ': 'nut_hazelnut.png',
  'マラサダ': 'sweets_malasada.png',
  '麩菓子': 'sweets_fugashi.png',
  'ふがし': 'sweets_fugashi.png',
  'クラッカー': 'sweets_cracker.png',
  'グラブジャムン': 'sweets_gulab_jam.png',
  'ラスグラ': 'sweets_rasgulla.png',
  'ホットク': 'food_hottoku.png',
  'チョコムース': 'sweets_chocolate_mousse.png',
  'チョコレートムース': 'sweets_chocolate_mousse.png',
  'フォンダンショコラ': 'sweets_fondant_au_chocolat.png',
  'シブースト': 'sweets_chiboust.png',
  'ティラミス': 'sweets_tiramisu.png',
  'ブッセ': 'sweets_busse.png',
  'ミルレープ': 'sweets_mille_crepe.png',
  'ファーブルトン': 'sweets_cake_far_breton.png',
  'パブロバ': 'sweets_cake_pavlova.png',
  'パブロヴァ': 'sweets_cake_pavlova.png',
  'パイナップルケーキ': 'sweets_pinapple_cake.png',
  'ショートケーキ': 'sweets_shortcake.png',
  'シュトーレン': 'christmas_stollen.png',
  'モンブラン': 'sweets_montblanc.png',
  'チョコミントケーキ': 'sweets_cake_chocomint.png',
  'アニバーサリーケーキ': 'wedding_anniversary_cake.png',
  'カップケーキ': 'sweets_cupcake.png',
  'ブッシュドノエル': 'christmas_bush_de_noel.png',
  'いちごオムレット': 'sweets_omlet_cake_ichigo.png',
  'ザッハトルテ': 'sweets_chocolate_cake_sachertorte.png',
  'フルーツパウンドケーキ': 'sweets_pound_cake_fruit.png',
  'ファンネルケーキ': 'sweets_funnelcake.png',
  'バナナオムレット': 'sweets_omlet_cake_banana.png',
  'ケーキサンド': 'food_cakewich_sandwich.png',
  'チーズケーキ': 'sweets_cheesecake.png',
  'パウンドケーキ': 'sweets_pound_cake.png',
  'ロールケーキ': 'roll_cake.png',
  'シフォンケーキ': 'sweets_chiffoncake.png',
  'ケーキポップ': 'sweets_cake_pop.png',
  'ダッチベビー': 'sweets_dutch_baby_pancake.png',
  '生ドーナツ': 'sweets_nama_donuts.png',
  'なまどーなつ': 'sweets_nama_donuts.png',
  'チェリー生ドーナツ': 'sweets_nama_donuts_cherry.png',
  'フルーツサンド': 'food_fruit_sandwich_ichigo.png',
  'ドーサ': 'pan_india_dosa.png',
  'ワダ': 'pan_india_wada.png',
  'イドゥリ': 'pan_india_idli.png',
  'パンケーキ': 'sweets_pancake.png',
  'ホットケーキ': 'sweets_hotcake.png',
  'レッドベルベットケーキ': 'sweets_cupcake_red_velvet_cake.png',
  'クリスマスケーキ': 'christmas_cake.png',
  'プチパンケーキ': 'sweets_puchi_pancake.png'
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
 * お菓子画像を1個生成する関数（出題時にのみ呼ばれます）
 */
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  
  // 1. 問題文（単語）に対応する画像があれば優先使用
  let imageSrc = SWEETS_MAP[targetWord];

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

  // ★ 画面上の配列をクリアして、新しい問題のお菓子1個だけをセット
  activeEnemies = [enemy];
}

/**
 * 毎フレームの描画＆更新処理（自動生成ロジックは削除）
 */
function updateAndDraw() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画面上のお菓子の移動と描画
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
  if (cpm >= 500 && accuracy >= 100) return "ひまん王";
  if (cpm >= 360 && accuracy >= 99) return "ふっくら";
  if (cpm >= 280 && accuracy >= 98) return "ぽっちゃり";
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

  // 1行入力完了したら画面のお菓子を消去（食べた表現）
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

  // ★ ゲーム開始時（第1問）のお菓子を1個生成
  spawnEnemy();
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
 */
function onNextQuestion(questionIndex) {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  lineStartTime = performance.now();
  strOutput(`[問題出題] 第${questionIndex}問: ${targetWord}`);
  
  // ★ 新しい問題が出題されたタイミングでのみお菓子を1個生成
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
    scoreEl.innerHTML = `${rank} / スコア: ${totalScore * 10}kcal`;
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