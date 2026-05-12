const logo = document.getElementById('main-logo');
logo.onclick = function() {
    // iframe内のshowSettings関数を実行する
    if (iframe.contentWindow && typeof iframe.contentWindow.showSettings === 'function') {
        iframe.contentWindow.showSettings();
    }
};

const iframe = document.getElementById('frm_typing');
/**
 * 指定したIDの要素に値を代入する関数
 * @param {string} id - 要素のID
 * @param {string} value - 代入したい文字列
 */

function updateIframeElement(id, value) {
    const target = iframe.contentWindow.document.getElementById(id);
    if (target) {
        target.value = value;
    } else {
        console.warn(`ID: ${id} が見つかりませんでした。`);
    }
}

iframe.onload = function() {
//---5----10---15---20---25---30---35---40
const newText = `
新しい問題文
`;
//---5----10---15---20---25---30---35---40
updateIframeElement('txtdata', newText);
updateIframeElement('TITLET_MSG', 'テスト');
updateIframeElement('START_MSG', 'Enter⏎');
updateIframeElement('INPUT_MSG', 'かな 確認');
updateIframeElement('RANDOM', '0');
updateIframeElement('WIDTH', '25ch');
iframe.contentWindow.updateSettings();
};
