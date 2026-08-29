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
    transform: scale(2);
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
<button>あ</button>
<button>い</button>
<button>う</button>
<button>え</button>
<button>お</button>
<br>
<button>か</button>
<button>き</button>
<button>く</button>
<button>け</button>
<button>こ</button>
<br>
<button>さ</button>
<button>し</button>
<button>す</button>
<button>せ</button>
<button>そ</button>
<br>
<button>た</button>
<button>ち</button>
<button>つ</button>
<button>て</button>
<button>と</button>
<br>
<button>な</button>
<button>に</button>
<button>ぬ</button>
<button>ね</button>
<button>の</button>
<br>
<button>　</button>
<button>　</button>
<button>っ</button>
<button>　</button>
<button>を</button>

</div>
<div class="KB">
<button>は</button>
<button>ひ</button>
<button>ふ</button>
<button>へ</button>
<button>ほ</button>
<br>
<button>ま</button>
<button>み</button>
<button>む</button>
<button>め</button>
<button>も</button>
<br>
<button>や</button>
<button>　</button>
<button>ゆ</button>
<button>　</button>
<button>よ</button>
<br>
<button>ら</button>
<button>り</button>
<button>る</button>
<button>れ</button>
<button>ろ</button>
<br>
<button>わ</button>
<button>゛</button>
<button>゜</button>
<button>　</button>
<button>ん</button>
<br>
<button>ゃ</button>
<button>　</button>
<button>ゅ</button>
<button>　</button>
<button>ょ</button>
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
