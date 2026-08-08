let isTracking = false;
let lastQIndex = 0;     // 前回出題された問題のインデックスを保持
let lineStartTime = 0; // 1行ごとの開始時間を保持

// ==================================================
//  ★ 画像サイズ指定・ゲーム設定
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
// 4. 敵（ゴースト）の難易度・パラメータ設定
// ==================================================
// かんたん（初心者向け）： 125 cpm 基準
// （目安: 100〜150 CPM / 手元を見ながらでも確実に打てれば倒せるレベル）

// ふつう （標準向け）  ： 200 cpm 基準
// （目安: 150〜250 CPM / ブラインドタッチがスムーズにできるレベル）

// むずかしい（上級者向け）： 300 cpm 基準
// （目安: 250〜350 CPM / ミスなくかなり速く打ち続ける必要があるレベル）

const TARGET_CPM_PER_QUESTION = 200; // 1問あたりの目標攻撃力（ふつう設定）
let GHOST_MAX_HP = 2000;             // 初期最大体力（onGameStartで自動計算）
let ghostHp = GHOST_MAX_HP;          // 現在の体力
let pendingDamage = 0;               // ファイアボール着弾時に与える保留中のダメージ

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
let showGoImage = false;     // 表示フラグ
let ghostHitTimer = 0;       // ダメージ受けた時の点滅用タイマー
let isGhostDefeated = false; // 撃退完了フラグ（消滅フラグ）

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
 * @param {number} damage - この攻撃で与えるダメージ（スコア）
 */
function triggerFireball(damage) {
  isFbActive = true;
  pendingDamage = damage;
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

      // 残りHP割合に基づいて不透明度（アルファ値）を設定
      // HPが0になっても消滅するまでは最低0.15（うっすら表示）を保持
      const hpRatio = Math.max(0, ghostHp / GHOST_MAX_HP);
      let baseAlpha = 0.15 + (hpRatio * 0.85);

      // ダメージ（被弾）時は点滅演出
      if (ghostHitTimer > 0) {
        if (Math.floor(ghostHitTimer / 3) % 2 === 0) {
          baseAlpha *= 0.3;
        }
        ghostHitTimer--;
      }

      ctx.globalAlpha = baseAlpha;
      ctx.drawImage(goImage, x, y, displayWidth, displayHeight);
      ctx.restore();

      // HPゲージの描画（画面右上寄り）
      const barWidth = 200;
      const barHeight = 16;
      const barX = canvas.width - barWidth - 30;
      const barY = 30;

      ctx.save();
      // ゲージ背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // ゲージ本体
      ctx.fillStyle = ghostHp > 0 ? '#f38ba8' : '#888888';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      // 枠線
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // テキスト表示
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`HP: ${ghostHp} / ${GHOST_MAX_HP}`, barX + (barWidth / 2), barY + 12);
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

      // ゴーストへのヒット判定
      const ghostTargetX = canvas.width - (GO_WIDTH || (GO_HEIGHT * (goImage.naturalWidth / goImage.naturalHeight))) + 50;
      if (fbX + 300 >= ghostTargetX) {
        isFbActive = false;
        ghostHitTimer = 12; // 点滅アニメーション

        // ダメージ適用（HPは0未満にならない）
        ghostHp = Math.max(0, ghostHp - pendingDamage);
        strOutput(`[着弾] 敵に ${pendingDamage} ダメージ！ (残りHP: ${ghostHp})`);
        pendingDamage = 0;

        // 全行完了済み、かつ体力が0の場合は消滅
        if (typeof finished !== 'undefined' && finished && ghostHp <= 0) {
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
  if (accuracy < 50) return "F"; 
  if (cpm >= 500 && accuracy >= 100) return "神";
  if (cpm >= 360 && accuracy >= 99) return "超人";
  if (cpm >= 280 && accuracy >= 98) return "名人";
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
//  各種イベントフック
// ==================================================

/**
 * 1. 1打鍵・入力ごとのイベントハンドラ
 */
function onKeyPress({ key, code, pressSec, charCount, instantCpm }) {
  if (!isTracking) return;

  switchToM02();

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
 */
function onLineComplete({ cpm, accuracy, lineSec, lineChars }) {
  // スコア（攻撃力）＝ CPM × (正解率 / 100)
  const lineScore = Math.round(cpm * (accuracy / 100));

  currentCharacterImage = m01Image;
  triggerFireball(lineScore);

  const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
  const rank = getRank(cpm, accuracy);

  strOutput(``);
  strOutput(`[入力完了]`);
  strOutput(`単 語: ${targetWord}`);
  strOutput(`文字数: ${lineChars}ch`);
  strOutput(`時 間: ${lineSec.toFixed(2)}sec`);
  strOutput(`速 度: ${cpm}cpm`);
  strOutput(`正解率: ${accuracy}%`);
  strOutput(`攻撃力(スコア): ${lineScore}pt`);
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

  // RANDOM や txtdata の行数から決定された出題数 (limit) を取得
  const questionCount = (typeof limit !== 'undefined' && limit > 0) ? limit : 10;
  
  // 最大HP ＝ 出題数 × 目標CPM
  GHOST_MAX_HP = questionCount * TARGET_CPM_PER_QUESTION;
  ghostHp = GHOST_MAX_HP;

  strOutput(`敵HP設定: ${GHOST_MAX_HP} (出題数:${questionCount}問 × 基準:${TARGET_CPM_PER_QUESTION}pt)`);
}

/**
 * 4. 次の問題が出題された時のイベントハンドラ
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

  const finalScore = Math.round(totalCpm * Math.pow(totalAccuracy / 100, 2));
  const rank = getRank(totalCpm, totalAccuracy);

  // 最後の魔法弾が着弾した後にHPが0であれば完全に消滅させる
  if (ghostHp <= 0 && !isFbActive) {
    isGhostDefeated = true;
  }

  strOutput(``);
  strOutput(ghostHp <= 0 ? `[ゴースト撃退完了！] 浄化成功` : `[討伐失敗...] ゴーストが残っています`);
  strOutput(`文字数: ${totalChars}ch`);
  strOutput(`速 度: ${totalCpm}cpm`);
  strOutput(`正解率: ${totalAccuracy}%`);
  strOutput(`最終スコア: ${finalScore}pt`);
  strOutput(`ランク: ${rank}`);

  // ==================================================
  // ★ typing.js の setTimeout 処理が終わった後に上書きする
  // ==================================================
  setTimeout(() => {
    const targetEl = document.getElementById('target');
    if (targetEl) {
      targetEl.textContent = `称号: 【${rank}】`;
    }
  }, 10); // 10ミリ秒遅らせることでタイマーの順序を後にする
}

// ==================================================
//  DOM / キー入力 イベント監視
// ==================================================

let lastKeyPressTime = 0;
let lastKeyCode = '';

const editorElForGame = document.getElementById('editor');
if (editorElForGame) {
  editorElForGame.addEventListener('input', (e) => {
    if (!isTracking) return;

    const now = performance.now();
    const baseTime = lastKeyPressTime > 0 ? lastKeyPressTime : lineStartTime;
    const pressSec = baseTime > 0 ? (now - baseTime) / 1000 : 0;
    
    lastKeyPressTime = now;
    const charCount = editorElForGame.value.replace(/\n/g, '').length;
    const instantCpm = pressSec > 0 ? Math.round((1 / pressSec) * 60) : 0;

    onKeyPress({
      key: e.data || e.inputType,
      code: lastKeyCode || 'Input',
      pressSec: pressSec,
      charCount: charCount,
      instantCpm: instantCpm
    });
  });
}

function handleKeyDown(e) {
  if (!isTracking) return;

  lastKeyCode = e.code;
  const isImeOff = (typeof IME !== 'undefined' && IME === 'OFF');

  if (e.key === 'Enter') {
    if (isImeOff || e.shiftKey) {
      const editorEl = document.getElementById('editor');
      const userTyped = editorEl ? editorEl.value.replace(/\n/g, '') : '';
      const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';

      const lineSec = (performance.now() - lineStartTime) / 1000;
      const lineChars = userTyped.length;

      let lineCpm = 0;
      if (lineSec > 0) {
        lineCpm = Math.round((lineChars / lineSec) * 60);
      }

			let lineCorrectChars = 0;
			const u = [...userTyped];
			const a = [...targetWord];

			for (let i = 0; i < Math.min(u.length, a.length); i++) {
			  if (u[i] === a[i]) lineCorrectChars++;
			}

			const lineTargetLen = Math.max(u.length, a.length);

			let lineAccuracy = 0;
			if (lineTargetLen > 0) {
			  lineAccuracy = Math.round((lineCorrectChars / lineTargetLen) * 100);
			}

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