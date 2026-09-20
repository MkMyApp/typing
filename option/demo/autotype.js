const isLandscape = window.innerWidth >= window.innerHeight;

// 判定に応じてパラメータを動的に切り替え 長尺:ショート
const TITLE_MARGIN_TOP = isLandscape ? "0px" : "400px"; // タイトルの上の余白
const AUTO_INPUT_MSG = "自動入力します"; 

const AUTO_START_DELAY = isLandscape ? 3000 : 3000;  // 手動スタート検知後のウェイト（ミリ秒）
const AUTO_NEXT_DELAY = isLandscape ? 1500 : 1500;   // 問題間の基本ウェイト（ミリ秒）
const AUTO_NEXT_JITTER = isLandscape ? 300 : 300;    // 問題間ウェイトのランダムな揺れ幅（±ミリ秒）
const AUTO_TYPING_SPEED = isLandscape ? 300 : 200; // 1文字あたりの基本入力間隔（ミリ秒）
const AUTO_TYPING_JITTER = isLandscape ? 100 : 50; // 入力間隔のランダムな揺れ幅（±ミリ秒）

const styleEl = document.createElement('style');

// .game-container が存在するかチェック
const hasGameContainer = document.querySelector('.game-container') !== null;

if (hasGameContainer) {
    // .game-container がある場合（ゲーム画面ごと下げる）
    styleEl.innerHTML = `
        .game-container {
            margin-top: ${TITLE_MARGIN_TOP};
        }
    `;
} else {
    // .game-container がない場合（従来通りタイトルのみ下げる）
    styleEl.innerHTML = `
        #title {
            margin-top: ${TITLE_MARGIN_TOP};
        }
    `;
}

document.head.appendChild(styleEl);

document.addEventListener("DOMContentLoaded", () => {
  if (typeof editorEl !== 'undefined') {
    editorEl.placeholder = AUTO_INPUT_MSG;

    const observer = new MutationObserver(() => {
      if (editorEl.placeholder && editorEl.placeholder !== AUTO_INPUT_MSG) {
        editorEl.placeholder = AUTO_INPUT_MSG;
      }
    });
    observer.observe(editorEl, { attributes: true, attributeFilter: ['placeholder'] });
  }
});

let isAutoPlaying = false;

const sound_src = "sound.mp3";
const audio = new Audio(sound_src);

function playSound() {
  audio.currentTime = 0;
  audio.play().catch(err => console.error(err));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 基準値に ±jitter の範囲でランダムな揺れを加える関数
function getRandomInterval(base, jitter) {
  const min = base - jitter;
  const max = base + jitter;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runAutoPlay() {
  if (isAutoPlaying) return;
  isAutoPlaying = true;
  
  console.log("=== AutoPlay Start ===");

  // ゲームが続いている間、問題を1つずつ自動クリアしていく
  while (typeof typeStarted !== 'undefined' && typeStarted && !finished) {
    const targetWord = typeof currentWord !== 'undefined' ? currentWord : '';
    
    if (targetWord) {
      editorEl.value = '';
      
			// 1文字ずつ流し込む
      for (let i = 0; i < targetWord.length; i++) {
        if (!typeStarted || finished) break;
        
        // 1文字目以外、または文字を打つ前にインターバルを挟む場合
        // （もしくは全文字共通で「ウェイト -> 入力」の順にする）
        const currentSpeed = getRandomInterval(AUTO_TYPING_SPEED, AUTO_TYPING_JITTER);
        await sleep(currentSpeed);

        if (!typeStarted || finished) break;
        
        editorEl.value += targetWord[i];
        editorEl.dispatchEvent(new Event('input', { bubbles: true }));
        
        // ★ここで打鍵音を鳴らす（関数が存在する場合のみ実行）
        if (typeof playSound === 'function') {
          playSound();
        }
      }
      
      await sleep(200);
      
      // 決定の Enter を送る
      if (typeStarted && !finished) {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          cancelable: true,
          shiftKey: (typeof IME !== 'undefined' && IME !== 'OFF')
        });
        editorEl.dispatchEvent(enterEvent);
        
        // ★Enter確定時にも音を鳴らす場合
        if (typeof playSound === 'function') {
          playSound();
        }
      }
    }
    
    // 問題間ウェイトにもランダムな揺れを適用
    const nextWait = getRandomInterval(AUTO_NEXT_DELAY, AUTO_NEXT_JITTER);
    await sleep(nextWait);
  }

  isAutoPlaying = false;
  console.log("=== AutoPlay Finished ===");
}

// 手動でスタート（Enter）された瞬間を監視して、自動タイピングを発火させる
editorEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    if (!typeStarted) {
      setTimeout(() => {
        if (!isAutoPlaying) {
          runAutoPlay();
        }
      }, AUTO_START_DELAY);
    }
  }
}, true);
