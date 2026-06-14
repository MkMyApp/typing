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
  padding:10px;
  border:none;
  display: inline-block;
	transform-origin: top left;
  transform: scale(1);
}

button {
	width:32px;
	height:32px;
	font-size:20px;
	margin-bottom:4px;
	margin-right:2px;
}

#edit {
	width:262px;
	height:24px;
	font-size:18px;
	margin-right:2px;

}

#BS {
	width:48px;
	font-size:12px;
}

#speak {
	width:48px;
	font-size:12px;
}

#Tab {width:48px;}
#LCtrl {width:48px;}
#Caps {width:64px;}
#Enter {width:56px;}
#Ent {width:40px;}
#LShift {width:80px;}
#RShift {width:64px;}
#Han {width: 128px;}
#Win {width: 42px;}
#LAlt {width: 42px;}
#RAlt {width: 42px;}
#RCtrl {width: 48px;}

#EntBtn {
  width: 64px;
  font-size: 12px;
  margin-left:16px;
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
<div id="KB">
<button>&nbsp;</button>
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
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<br>
<button id="Tab">&nbsp;</button>
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
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="Enter">&nbsp;</button>
<br>
<button id="Caps">&nbsp;</button>
<button>a</button>
<button>s</button>
<button>d</button>
<button>f</button>
<button>g</button>
<button>h</button>
<button>j</button>
<button>k</button>
<button>l</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="Ent">&nbsp;</button>
<br>
<button id="LShift">&nbsp;</button>
<button>z</button>
<button>x</button>
<button>c</button>
<button>v</button>
<button>b</button>
<button>n</button>
<button>m</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="RShift">&nbsp;</button>
<br>
<button id="LCtrl">&nbsp;</button>
<button id="Win">&nbsp;</button>
<button id="LAlt">&nbsp;</button>
<button>&nbsp;</button>
<button id="Han">&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="RAlt">&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="RCtrl">&nbsp;</button>
</div>
</div>
`;

// 3. ページの body の最後にHTMLを追加
document.body.insertAdjacentHTML('beforeend', keyboardHtml);
