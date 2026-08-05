// ランダムでsrcを設定
const menuList = [
'kanji/部活動.html',
'kanji/星座名.html',
'kanji/ローマ神話.html',
'kanji/ギリシア神話.html',
'kanji/日本神話の神々.html',
'kanji/ケーキ98種.html',
'kanji/焼肉.html',
'kanji/学校にあるもの.html',
'kanji/地質年代.html',
'kanji/中1社会地理「世界の姿」.html',
'kanji/中２理科「呼吸と循環」.html',
'kanji/中２理科「消化と吸収」.html',
'kanji/進撃の巨人.html',
'kanji/名探偵コナン映画タイトル.html',
'kanji/警察マスコット.html',
'english/ABC大文字.html',
'hiragana/あいう.html',
'hiragana/いろは.html',
'hiragana/ひらがな.html',
'english/初級英単語60.html',
]
const iframeElement = document.getElementById('frm_type');
let newIndex = Math.floor(Math.random() * menuList.length);
iframeElement.src = "mondai/" + menuList[newIndex];
