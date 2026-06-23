// 1. CSSを動的に作成して <head> に追加
const style = document.createElement('style');
style.textContent = `
  .KB {
    display: block;
    border: solid 1px #888;
 		background-color: #f8f8f8;
    margin: 20px auto;
    padding: 10px;
    width: fit-content;
    transform-origin: top center;
    transform: scale(1);
  }

  .KB button {
    font-family: monospace;
    text-align: center;
    padding: 0;
    width: 32px;
    height: 32px;
    font-size: 18px;
    margin: 0 2px 8px 0;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    vertical-align: top;
		background-color: #f0f0f0;
    color: #000;
    border: 1px solid #888;
    box-sizing: border-box;
  }

  #ESC { font-size: 8px;}
  #BS { font-size: 10px;}
	#Tab {
		font-size: 8px;
		width:48px;
	  justify-content: flex-start;
	  padding-left: 10px;
	}
	#LCtrl {
    font-size: 8px;
		width:48px;
	  justify-content: flex-start;
	  padding-left: 10px;
	}
	#RCtrl {
		font-size: 8px;
		width: 48px;
	  justify-content: flex-end;
	  padding-right: 10px;
	}
	#Caps {
		font-size: 8px;
		width:64px;
	  justify-content: flex-start;
	  padding-left: 10px;
	}
	#Enter {
		font-size: 8px;
		width: 56px;
	  justify-content: flex-end;
	  padding-right: 10px;
	}
	#Ent { font-size: 12px; width:40px;}
	#LShift { 
	    font-size: 8px; 
	    width: 80px; 
	    justify-content: flex-start;
	    padding-left: 10px;
	  }
	#RShift { 
    font-size: 8px; 
    width: 64px; 
    justify-content: flex-end;
    padding-right: 10px;
  }
	#Spc { font-size: 8px; width: 128px;}
  #ON { font-size: 8px;}
  #OFF { font-size: 6px;}
  #kana { font-size: 8px;}
	#LWin { font-size: 8px; width: 42px;}
	#RWin { font-size: 8px;}
	#LAlt { font-size: 8px; width: 42px;}
	#RAlt { font-size: 8px; width: 42px;}
	#Menu { font-size: 8px;}
`;
document.head.appendChild(style);

// 2. キーボードのHTML構造を定義
const keyboardHtml = `
<div class="KB">
<button id="ESC">ESC</button>
<button>ぬ</button>
<button>ふ</button>
<button>あ</button>
<button>う</button>
<button>え</button>
<button>お</button>
<button>や</button>
<button>ゆ</button>
<button>よ</button>
<button>わ</button>
<button>ほ</button>
<button>へ</button>
<button>ー</button>
<button id="BS">BS</button>
<br>
<button id="Tab">Tab</button>
<button>た</button>
<button>て</button>
<button>い</button>
<button>す</button>
<button>か</button>
<button>ん</button>
<button>な</button>
<button>に</button>
<button>ら</button>
<button>せ</button>
<button>゛</button>
<button>゜</button>
<button id="Enter">Enter</button>
<br>
<button id="Caps">CapsLock</button>
<button>ち</button>
<button>と</button>
<button>し</button>
<button>は</button>
<button>き</button>
<button>く</button>
<button>ま</button>
<button>の</button>
<button>り</button>
<button>れ</button>
<button>け</button>
<button>む</button>
<button id="Ent">⏎</button>
<br>
<button id="LShift">Shift</button>
<button>つ</button>
<button>さ</button>
<button>そ</button>
<button>ひ</button>
<button>こ</button>
<button>み</button>
<button>も</button>
<button>ね</button>
<button>る</button>
<button>め</button>
<button>ろ</button>
<button id="RShift">Shift</button>
<br>
<button id="LCtrl">Ctrl</button>
<button id="LWin">Win</button>
<button id="LAlt">Alt</button>
<button id="OFF">無変換</button>
<button id="Spc">&nbsp;</button>
<button id="ON">変換</button>
<button id="kana">かな</button>
<button id="RAlt">Alt</button>
<button id="RWin">Win</button>
<button id="Menu">Menu</button>
<button id="RCtrl">Ctrl</button>
</div>
`;

// 3. ページの body の最後にHTMLを追加
document.body.insertAdjacentHTML('beforeend', keyboardHtml);

// 4. CHARS に基づいて色を付ける関数
window.applyColor = function(CHARS, BackColor, ForColor) {
    const buttons = document.querySelectorAll('.KB button');
  	if (ForColor == "") { ForColor = BackColor; }

    buttons.forEach(btn => {
        const char = btn.textContent.trim();
        if (char !== "" && CHARS.includes(char)) {
            btn.style.backgroundColor = BackColor;
           	btn.style.color = ForColor;
            btn.style.border = "1px solid #888";
            btn.style.boxSizing = "border-box";
        }
    });
};

// idが定義されているボタンの文字色を透過にする関数
window.setTransparent = function() {
    const buttons = document.querySelectorAll('.KB button[id]');
    buttons.forEach(btn => {
        btn.style.color = "transparent";
    });
};

// ボタンの文字色を透過にする関数
window.applyTransparent = function() {
	const buttons = document.querySelectorAll('.KB button:not([id])');
  buttons.forEach(btn => {
      btn.style.color = "transparent";
  });
};
