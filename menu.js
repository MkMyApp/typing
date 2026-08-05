// ページ内のすべての iframe の高さを調整
document.querySelectorAll('iframe').forEach(iframeElement => {
    iframeElement.addEventListener('load', function() {
        try {
            const doc = iframeElement.contentWindow.document;
            
            // 高さを設定する関数
            const adjustHeight = () => {
                const contentHeight = doc.documentElement.scrollHeight || doc.body.scrollHeight;
                if (contentHeight > 0) {
                    iframeElement.style.height = contentHeight + 'px';
                }
            };

            // 初回調整
            adjustHeight();

            // 内部コンテンツのサイズ変化を継続的に監視する設定
            if (window.ResizeObserver && doc.body) {
                const observer = new ResizeObserver(() => adjustHeight());
                observer.observe(doc.body);
            }
        } catch (e) {
            console.warn('iframeの高さを取得できませんでした:', e);
        }
    });
});