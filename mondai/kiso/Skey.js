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
		transform: scale(${typeof sVal !== 'undefined' ? sVal : 1});
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
<button>1</button>
<button>2</button>
<button>3</button>
<button>4</button>
<button>5</button>
<button>6</button>
<button>7</button>
<button>8</button>
<button>9</button>
<button>0</button>
<button>-</button>
<button>^</button>
<button>\\</button>
<button id="BS">BS</button>
<br>
<button id="Tab">Tab</button>
<button>q</button>
<button>w</button>
<button>e</button>
<button>r</button>
<button>t</button>
<button>y</button>
<button>u</button>
<button>i</button>
<button>o</button>
<button>p</button>
<button>@</button>
<button>[</button>
<button id="Enter">Enter</button>
<br>
<button id="Caps">CapsLock</button>
<button>a</button>
<button>s</button>
<button>d</button>
<button>f</button>
<button>g</button>
<button>h</button>
<button>j</button>
<button>k</button>
<button>l</button>
<button>;</button>
<button>:</button>
<button>]</button>
<button id="Ent">⏎</button>
<br>
<button id="LShift">Shift</button>
<button>z</button>
<button>x</button>
<button>c</button>
<button>v</button>
<button>b</button>
<button>n</button>
<button>m</button>
<button>,</button>
<button>.</button>
<button>／</button>
<button>＼</button>
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
