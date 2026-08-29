// 1. CSSを動的に作成して <head> に追加
const style = document.createElement('style');
style.textContent = `
  .contena {
    display: block;
    margin: 20px auto;
    border: solid 1px #ddd;
    padding: 10px;
    width: fit-content;
    transform-origin: top center;
    transform: scale(2.5);
  }

  .KB {
    padding: 10px;
    border: none;
    display: inline-block;
    transform-origin: top left;
    transform: scale(1);
  }

  button {
    font-family: monospace;
    text-align: center;
    padding: 0;
    width: 32px;
    height: 32px;
    font-size: 20px;
    margin: 0 2px 8px 0;
  }

  #BS { width: 32px; font-size: 12px; }
  #speak { width: 32px; font-size: 12px; }
  #EntBtn { width: 64px; font-size: 12px; margin-left:16px; }

  .hidden-style {
      color: transparent !important;
			cursor: default;
			pointer-events: none;
    }
`;
document.head.appendChild(style);

// 2. キーボードのHTML構造を定義
const keyboardHtml = `
<div class="contena">
<button id="BS">⌫</button>
<button id="speak">🔊</button>
<button id="EntBtn">Enter⏎</button>
<br>
<div class="KB">
<button>A</button>
<button>B</button>
<button>C</button>
<button>D</button>
<button>E</button>
<button>F</button>
<button>G</button>
<br>
<button>H</button>
<button>I</button>
<button>J</button>
<button>K</button>
<button>L</button>
<button>M</button>
<button>N</button>
<br>
<button>O</button>
<button>P</button>
<button>Q</button>
<button>R</button>
<button>S</button>
<button>T</button>
<button>U</button>
<br>
<button>V</button>
<button>W</button>
<button>X</button>
<button>Y</button>
<button>Z</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
</div>
</div>
`;

// 3. ページの body の最後にHTMLを追加
document.body.insertAdjacentHTML('beforeend', keyboardHtml);

// 4. CHARS に基づいてスタイルを適用
window.addEventListener('DOMContentLoaded', () => {
    const targetChars = typeof CHARS !== 'undefined' ? CHARS : "";
    
    // CHARS が定義されている場合のみ処理を実行
    if (typeof CHARS !== 'undefined') {
        const buttons = document.querySelectorAll('.KB button');
        buttons.forEach(btn => {
            const char = btn.textContent.trim();
            // 空白文字や空のボタンは対象外とする
            if (char !== "" && !targetChars.includes(char)) {
                btn.classList.add('hidden-style');
            }
        });
    }
});
