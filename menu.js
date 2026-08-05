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
