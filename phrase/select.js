'use strict'

const iframeElement = document.getElementById('frm_type');
const reloadBtn = document.getElementById('reload');

// ランダムにページを読み込む関数
function loadRandomPage() {
    const index = Math.floor(Math.random() * menuList.length);
    iframeElement.src = menuList[index];
}

// リロードボタンをクリックした時の動作
reloadBtn.addEventListener('click', () => {
    loadRandomPage();
});

// 初回読み込み
loadRandomPage();
