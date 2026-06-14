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
	margin-bottom:8px;
	margin-right:2px;
}

#edit {
	width:181px;
	height:24px;
	font-size:18px;
	margin-right:3px;

}

#BS {
	width:32px;
	font-size:12px;
}

#speak {
	width:32px;
	font-size:12px;
}

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
