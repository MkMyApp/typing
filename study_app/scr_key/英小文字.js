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
<button>a</button>
<button>b</button>
<button>c</button>
<button>d</button>
<button>e</button>
<button>f</button>
<button>g</button>
<br>
<button>h</button>
<button>i</button>
<button>j</button>
<button>k</button>
<button>l</button>
<button>m</button>
<button>n</button>
<br>
<button>o</button>
<button>p</button>
<button>q</button>
<button>r</button>
<button>s</button>
<button>t</button>
<button>u</button>
<br>
<button>v</button>
<button>w</button>
<button>x</button>
<button>y</button>
<button>z</button>
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
