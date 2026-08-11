let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0;  // 1行ごとの開始時間を保持
let lastTypeTime = 0;   // 直前の打鍵時間を保持

// ★ 累積スコア・直前獲得スコア保持用変数
let totalScore = 0;
let lastEarnedScore = 0;

// ==================================================
//  演出・画像オブジェクト設定
// ==================================================
// フォールバック用のランダム画像配列（対応表にない単語が出た場合に使用）
const ENEMY_IMAGES = [
  'mushikago.png',
];

// ★ 出題文字列（ひらがな・漢字）と画像ファイル名の対応表
const MUSHI_MAP = {
  'キリギリス': 'mushi_kirigirisu.png',
  'クマゼミ': 'mushi_kumazemi.png',
  'ミンミンゼミ': 'mushi_minminzemi.png',
  'アゲハチョウ': 'mushi_agehachou.png',
  'ギンヤンマ': 'mushi_ginyanma.png',
  'イトトンボ': 'mushi_itotonbo.png',
  'アブラゼミ': 'mushi_aburazemi.png',
  'ミジンコ': 'mushi_mijinko.png',
  'ダニ': 'mushi_dani.png',
  'ノミ': 'mushi_nomi.png',
  'クマムシ': 'kumamushi.png',
  'ハエ': 'bug_hae.png',
  'ゴキブリ': 'bug_gokiburi.png',
  'ムカデ': 'bug_mukade.png',
  'スズメバチ': 'bug_suzumebachi.png',
  'イナゴ': 'bug_inago.png',
  'ショウリョウバッタ': 'bug_syouryou_batta.png',
  'トノサマバッタ': 'bug_tonosama_batta.png',
  'サソリ': 'bug_sasori.png',
  'カイコ成虫': 'kaiko_seichu.png',
  'ヒトスジシマカ': 'bug_hitosujishima_ka.png',
  'ヨナグニサン': 'atlasmoth_yonagunisan.png',
  'ハナカマキリ': 'bug_hanakamakiri.png',
  'ジンメンカメムシ': 'bug_jinmenkamemushi.png',
  'コノハムシ': 'bug_konohamushi.png',
  'トコジラミ': 'bug_tokojirami_shirami.png',
  'オオゾウムシ': 'bug_zoumushi_oozoumushi.png',
  'ニセハナマオウカマキリ': 'bug_nisehanamaou_kamakiri.png',
  'アオスジアゲハ': 'bug_aosujiageha.png',
  'グンタイアリ': 'bug_guntai_ari.png',
  'オオムラサキ': 'bug_oomurasaki.png',
  'コーカサスオオカブト': 'bug_kabutomushi_caucasus_ookabuto.png',
  'ヨツコブツノゼミ': 'bug_yotsukobu_tsunozemi.png',
  'プラナリア': 'animal_planaria.png',
  'カナブン': 'bug_kanabun.png',
  'コガネムシ': 'bug_koganemushi.png',
  'オケラ': 'bug_okeara.png',
  'カタツムリ': 'bug_katatsumuri.png',
  'ナメクジ': 'bug_namekuji.png',
  'コスズメ': 'bug_suzumega_kosuzume.png',
  'アカイエカ': 'bug_akaieka.png',
  'コウガイビル': 'animal_hiru_kougaibiru.png',
  'ゴホンヅノカブト': 'bug_gohonduno_kabuto.png',
  'アリジゴク': 'bug_arijigoku.png',
  'アブ': 'bug_abu.png',
  'コメツキムシ': 'bug_kometsukimushi.png',
  'ロクロクビオトシブミ': 'bug_rokurokubi_otoshibumi.png',
  'ニジイロクワガタ': 'bug_nijiiro_kuwagata.png',
  'シロヘリミドリツノカナブン': 'bug_shiroheri_midoritsuno_kanabun.png',
  'アカバナビワハゴロモ': 'bug_akabana_biwahagoromo.png',
  'ピーコックスパイダー': 'bug_peacock_spider.png',
  'カタゾウムシ': 'bug_katazoumushi.png',
  'マルクワガタ': 'bug_primosi_maru_kuwagata.png',
  'ミツツボアリ': 'bug_mitsutsubo_ari.png',
  'ゲンゴロウ': 'bug_gengorou.png',
  'クマバチ': 'bug_kumabachi.png',
  'ヨコエビ': 'fish_yokoebi.png',
  'ヒアリ': 'bug_ari_hiari.png',
  'セアカゴケグモ': 'bug_seakagokegumo.png',
  'タランチュラ': 'bug_kumo_tarantula.png',
  'カギムシ': 'bug_kagimushi.png',
  'クビアカツヤカミキリ': 'bug_kubiaka_tsuya_kamikiri.png',
  'ゴライアスオオツノハナムグリ': 'bug_goliathus_ootsuno_hanamuguri.png',
  'アレクサンドラトリバネアゲハ': 'bug_alexandra_toribane_ageha.png',
  'ミツバチ': 'bug_mitsubachi.png',
  'カマキリ': 'bug_kamakiri.png',
  'シロアリ女王': 'bug_shiroari_queen.png',
  'ユムシ': 'tsuri_bug_yumushi.png',
  'ハネアリ': 'bug_ari_haneari.png',
  'ブヨ': 'bug_buyo.png',
  'ジョロウグモ': 'bug_kumo_jorougumo.png',
  'ワラジムシ': 'bug_warajimushi.png',
  'ゴカイ': 'bug_character_gokai.png',
  'ミミズ': 'bug_character_mimizu.png',
  'ヒル': 'bug_character_hiru_gyaku.png',
  'マダニ': 'bug_dani_madani_set.png',
  'マルバネルリマダラ': 'bug_chou_marubane_rurimadara.png',
  'ゾウリムシ': 'bug_zourimushi.png',
  'オウゴンオニクワガタ': 'bug_ougon_oni_kuwagata.png',
  'ツマベニチョウ': 'bug_tsumabeni_chouu.png',
  'ボウフラ': 'bug_ka2_boufura.png',
  '蚊': 'bug_ka4_seichu.png',
  'ナミアゲハ': 'bug_namiageha_agehachouu.png',
  'オオスカシバ': 'bug_oosukashiba.png',
  'ヤスデ': 'bug_yasude.png',
  'オナガアゲハ': 'bug_onagaageha.png',
  'ヤンバルテナガコガネ': 'bug_yanbaru_tenaga_kogane.png',
  'チョウバエ': 'bug_choubae.png',
  'オニヤンマ': 'bug_tonbo_oniyanma.png',
  'カイガラムシメス': 'bug_konakaigaramushi_mesu.png',
  'カイガラムシオス': 'bug_konakaigaramushi_osu.png',
  'アゲハチョウ幼虫': 'bug_agehachou_youchu_syuukaku.png',
  'ロージーメイプルモス': 'bug_rosy_maple_moth.png',
  'ユキムシ': 'bug_yukimushi.png',
  'モンシロチョウ': 'mushi_monshirochou.png',
  'モルフォチョウ': 'bug_morpho_chou.png',
  'カカトアルキ': 'bug_kakatoaruki.png',
  'バイオリンムシ': 'bug_violin_mushi.png',
  'フンコロガシ': 'bug_funkorogashi_sukarabe.png',
  'タガメ': 'bug_tagame.png',
  'ハンミョウ': 'bug_hanmyou.png',
  'マイマイカブリ': 'bug_maimaikaburi.png',
  'シラミ': 'bug_shirami.png',
  'ナナフシ': 'bug_nanafushi.png',
  'ミズカマキリ': 'bug_mizu_kamakiri.png',
  'オオゴマダラ': 'bug_oogomadara_chou.png',
  'スズムシ': 'suzumushi.png',
  'アカヘルエンマグミムシ': 'bug_akaherienmagomimushi.png',
  'アオバアリガタハネカクシ': 'bug_aoba_arigata_hanekakushi.png',
  'クモ': 'mushi_kumo.png',
  'アカトンボ': 'mushi_akatonbo.png',
  'カブトムシ': 'mushi_kabutomushi.png',
  'クワガタ': 'mushi_kuwagata.png',
  'シロアリ': 'bug_shiroari.png',
  'タマムシ': 'mushi_tamamushi.png',
  'ダンゴムシ': 'bug_dangomushi.png',
  'カミキリムシ': 'bug_kamikirimushi.png',
  'カメムシ': 'mushi_kamemushi.png',
  'イソメ': 'tsuri_bug_isome_gokai.png',
  'サナダムシ': 'body_kiseichu_sanadamushi.png',
  'ホタル': 'mushi_hotaru.png',
  'ウジ虫': 'bug_uji.png',
  'コクゾウムシ': 'bug_kokuzoumushi_kome.png',
  'シミ': 'bug_shimi.png',
  'サシガメ': 'bug_sashigane.png',
  'ナミテントウ': 'tentoumushi_namitentou.png',
  'ランブル鞭毛虫': 'virus_lambl_benmouchu.png',
  'テントウムシ': 'mushi_tentoumushi.png',
  '線虫': 'animal_senchu.png',
};

// ★ お皿画像のロード
const dishImg = new Image();
dishImg.src = 'dish.png';

// 画面サイズ・背景設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const bgImg = new Image();
bgImg.src = 'bg.png';

// アニメーション関連変数
let activeEnemies = [];
let effects = []; // 「流れる」「打鍵成功」などの演出用配列
let animationFrameId = null;
const ENEMY_HEIGHT = 100; // 画像描画時の標準縦幅
const BASE_SPEED = 1;   // 左へ進む速度

// ==================================================
//  単語リストの自動流し込み & タイピング初期化
// ==================================================
const txtdataEl = document.getElementById('txtdata');
if (txtdataEl && typeof MUSHI_MAP !== 'undefined') {
  txtdataEl.value = Object.keys(MUSHI_MAP).join('\n');
  if (typeof init === 'function') {
    init();
  }
}

// 虫オブジェクトを1個生成する関数
function spawnEnemy() {
  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

  // 問題文（単語）に対応する画像を取得
  let imageSrc = MUSHI_MAP[targetWord];

  // 対応表にない場合はフォールバック画像を使用
  if (!imageSrc && ENEMY_IMAGES.length > 0) {
    imageSrc = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
  }

  const img = new Image();

  const enemy = {
    img: img,
    x: canvas ? canvas.width - 64 : 1024,
    y: (canvas ? canvas.height - ENEMY_HEIGHT : 434 - ENEMY_HEIGHT) / 2,
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
  activeEnemies = [enemy];
}

// スコア表示関数（右上に直前単語の獲得ポイントを表示）
function drawScore() {
  if (!ctx || !canvas) return;

  ctx.save();
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  const text = `${lastEarnedScore} pt`; 
  
  // 文字の背景にうっすら白座布団を敷いて見やすくする
  const margin = 15;
  const rectX = canvas.width - 200;
  const rectY = margin - 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(rectX, rectY, 185, 35);

  ctx.fillStyle = '#d32f2f'; // 鮮やかな赤系文字
  ctx.fillText(text, canvas.width - margin, margin);
  ctx.restore();
}

// 称号（ランク）計算関数
function getRankTitle(cpm, acc) {
  if (acc < 70) return "虫見習い";
  if (cpm >= 350 && acc >= 98) return "伝説の虫博士";
  if (cpm >= 300 && acc >= 95) return "昆虫マスター";
  if (cpm >= 250 && acc >= 90) return "一人前の昆虫ハンター";
  if (cpm >= 200 && acc >= 85) return "熟練の虫捕り名人";
  if (cpm >= 150) return "駆け出し虫捕り";
  if (cpm >= 100) return "虫観察員";
  return "虫好きのひよこ";
}

// アニメーションメインループ
function update() {
  if (!ctx || !canvas) return;

  // 1. 背景の描画
  if (bgImg.complete && bgImg.naturalWidth !== 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. 敵（お皿 ＋ 虫）の移動と描画
  activeEnemies.forEach(enemy => {
    enemy.x -= enemy.speed;

    // --- ① お皿（dish.png）を描画 ---
    const dishSize = 130; // お皿のサイズ
    const dishX = enemy.x + (enemy.width - dishSize) / 2; // 虫の中央に配置
    const dishY = enemy.y + (enemy.height - dishSize) / 2;

    if (dishImg.complete && dishImg.naturalWidth !== 0) {
      ctx.drawImage(dishImg, dishX, dishY, dishSize, dishSize);
    }

    // --- ② お皿の上に虫画像を描画 ---
    if (enemy.loaded) {
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // 画面外に出た敵のクリア
  activeEnemies = activeEnemies.filter(enemy => enemy.x + enemy.width > 0);

  // 3. エフェクト（パーティクル等）の更新と描画
  effects.forEach(fx => {
    fx.x += fx.vx;
    fx.y += fx.vy;
    fx.alpha -= fx.decay;

    if (fx.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = fx.alpha;
      ctx.fillStyle = fx.color || '#ff0000';
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.size || 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  effects = effects.filter(fx => fx.alpha > 0);

  // 4. 右上のスコア表示
  drawScore();

  // 次のフレーム要求
  animationFrameId = requestAnimationFrame(update);
}

// 描画ループ開始
if (canvas) {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(update);
}

// ==================================================
//  タイピングイベントフック
// ==================================================
function onGameStart() {
  totalScore = 0;
  lastEarnedScore = 0;
  effects = [];
  activeEnemies = [];
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
}

function onNextQuestion(qIndex) {
  lineStartTime = performance.now();
  lastTypeTime = performance.now();
  spawnEnemy();
}

function onLineComplete(timeSec, cpm, accuracy, isMissless) {
  // ★ 正解率（accuracy %）を掛け合わせたスコア計算
  const lineScore = Math.round(cpm * (accuracy / 100));
  
  lastEarnedScore = lineScore; // 今回獲得したスコア
  totalScore += lineScore;     // 累計スコアに加算

  // 倒した敵をクリア & 消失演出
  if (activeEnemies.length > 0) {
    const enemy = activeEnemies[0];
    for (let i = 0; i < 15; i++) {
      effects.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 5 + 2,
        alpha: 1.0,
        decay: 0.03,
        color: isMissless ? '#ffea00' : '#ff9800'
      });
    }
  }
  activeEnemies = [];
}

// typing.js の判定処理（judgeCurrentWord）をフックしてスコア計算や敵消去を行う
if (typeof judgeCurrentWord === 'function') {
  const originalJudgeCurrentWord = judgeCurrentWord;
  judgeCurrentWord = function() {
    const now = performance.now();
    const timeSec = (now - lineStartTime) / 1000;
    const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
    const userTyped = typeof typed === 'function' ? typed() : '';

    const len = userTyped.length;
    const cpm = timeSec > 0 ? Math.round((len / timeSec) * 60) : 0;

    // ★ 正解率（accuracy）の計算処理
    let correctCharsCount = 0;
    const u = [...userTyped];
    const a = [...targetWord];
    for (let i = 0; i < Math.min(u.length, a.length); i++) {
      if (u[i] === a[i]) correctCharsCount++;
    }
    const maxLen = Math.max(u.length, a.length);
    const accuracy = maxLen > 0 ? Math.round((correctCharsCount / maxLen) * 100) : 0;
    const isMissless = (userTyped === targetWord);

    try {
      // accuracy（正解率）を渡して実行
      onLineComplete(timeSec, cpm, accuracy, isMissless);
    } catch (err) {
      console.error("onLineComplete Error:", err);
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

    // 称号判定とスコア結果のUI書き換え（★ここで totalScore を表示）
    const rankTitle = getRankTitle(finalCpm, finalAcc);
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerHTML = `獲得スコア: <strong>${totalScore} pt</strong><br>称号: <strong>【${rankTitle}】</strong>`;
    }
  }
}, 100);