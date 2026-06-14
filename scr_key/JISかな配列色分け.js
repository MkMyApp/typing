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

.A {color:#f00;}
.K {color:#00f;}
.S {color:#f90;}
.T {color:#0a0;}
.N {color:#a0a;}
.H {color:#d44;}
.M {color:#f0f;}
.Y {color:#8a0;}
.R {color:#08f;}
.W {color:#888;}

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
#Zen {width: 128px;}
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
<button>　</button>
<button class="N">ぬ</button>
<button class="H">ふ</button>
<button class="A">あ</button>
<button class="A">う</button>
<button class="A">え</button>
<button class="A">お</button>
<button class="Y">や</button>
<button class="Y">ゆ</button>
<button class="Y">よ</button>
<button class="W">わ</button>
<button class="H">ほ</button>
<button class="H">へ</button>
<button>　</button>
<button>　</button>
<br>
<button id="Tab">　</button>
<button class="T">た</button>
<button class="T">て</button>
<button class="A">い</button>
<button class="S">す</button>
<button class="K">か</button>
<button class="W">ん</button>
<button class="N">な</button>
<button class="N">に</button>
<button class="R">ら</button>
<button class="S">せ</button>
<button>　</button>
<button>　</button>
<button id="Enter">　</button>
<br>
<button id="Caps">　</button>
<button class="T">ち</button>
<button class="T">と</button>
<button class="S">し</button>
<button class="H">は</button>
<button class="K">き</button>
<button class="K">く</button>
<button class="M">ま</button>
<button class="N">の</button>
<button class="R">り</button>
<button class="R">れ</button>
<button class="K">け</button>
<button class="M">む</button>
<button id="Ent">　</button>
<br>
<button id="LShift">　</button>
<button class="T">つ</button>
<button class="S">さ</button>
<button class="S">そ</button>
<button class="H">ひ</button>
<button class="K">こ</button>
<button class="M">み</button>
<button class="M">も</button>
<button class="N">ね</button>
<button class="R">る</button>
<button class="M">め</button>
<button class="R">ろ</button>
<button id="RShift">　</button>
<br>
<button id="LCtrl">　</button>
<button id="Win">　</button>
<button id="LAlt">　</button>
<button>　</button>
<button id="Zen">　</button>
<button>　</button>
<button>　</button>
<button id="RAlt">　</button>
<button>　</button>
<button>　</button>
<button id="RCtrl">　</button>
</div>
</div>
`;

// 3. ページの body の最後にHTMLを追加
document.body.insertAdjacentHTML('beforeend', keyboardHtml);
