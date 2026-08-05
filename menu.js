// ページ内のすべての iframe に対して高さを自動調整する処理を適用
document.querySelectorAll('iframe').forEach(iframeElement => {
    iframeElement.addEventListener('load', function() {
        try {
            // iframe内部のコンテンツの高さを取得して適用
            const contentHeight = iframeElement.contentWindow.document.documentElement.scrollHeight;
            iframeElement.style.height = contentHeight + 'px';
        } catch (e) {
            // ドメインが異なる場合（クロスドメイン制限）の安全対策
            console.warn('iframeの高さを取得できませんでした:', e);
        }
    });
});

// ランダムでsrcを設定する処理
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
];

const frmType = document.getElementById('frm_type');
if (frmType) {
    let newIndex = Math.floor(Math.random() * menuList.length);
    frmType.src = "mondai/" + menuList[newIndex];
}
