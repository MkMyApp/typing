'use strict'

const iframeElement = document.getElementById('frm_type');
const reloadBtn = document.getElementById('reload');

// 直前のインデックスを保持する変数
let lastIndex = -1;

// ランダムにページを読み込む関数
function loadRandomPage() {
    // リストが1つしかない場合は無限ループになるため、チェックを入れると安全です
    if (menuList.length <= 1) {
        iframeElement.src = menuList[0];
        return;
    }

    let newIndex;
    
    // 直前と同じ index が選ばれている間、ランダム抽選を繰り返す
    do {
        newIndex = Math.floor(Math.random() * menuList.length);
    } while (newIndex === lastIndex);

    // 今回の index を保存
    lastIndex = newIndex;
    iframeElement.src = menuList[newIndex];
}

// リロードボタンをクリックした時の動作
reloadBtn.addEventListener('click', () => {
    loadRandomPage();
});

// 初回読み込み
loadRandomPage();