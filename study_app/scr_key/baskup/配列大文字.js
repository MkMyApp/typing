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
<button>Q</button>
<button>W</button>
<button>E</button>
<button>R</button>
<button>T</button>
<button>Y</button>
<button>U</button>
<button>I</button>
<button>O</button>
<button>P</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="Enter">&nbsp;</button>
<br>
<button id="Caps">&nbsp;</button>
<button>A</button>
<button>S</button>
<button>D</button>
<button>F</button>
<button>G</button>
<button>H</button>
<button>J</button>
<button>K</button>
<button>L</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button>&nbsp;</button>
<button id="Ent">&nbsp;</button>
<br>
<button id="LShift">&nbsp;</button>
<button>Z</button>
<button>X</button>
<button>C</button>
<button>V</button>
<button>B</button>
<button>N</button>
<button>M</button>
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
