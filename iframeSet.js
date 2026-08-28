// ページ内のすべての iframe の高さを調整
document.querySelectorAll('iframe').forEach(iframeElement => {
    iframeElement.addEventListener('load', function() {
        try {
            const doc = iframeElement.contentWindow.document;
            iframeElement.style.height = '0px';
            // 高さを設定する関数
						const adjustHeight = () => {
						    // scrollHeight と offsetHeight のうち、より大きい方を取得
						    const bodyHeight = Math.max(doc.body.scrollHeight, doc.body.offsetHeight);
						    const htmlHeight = Math.max(doc.documentElement.scrollHeight, doc.documentElement.offsetHeight);
						    const contentHeight = Math.max(bodyHeight, htmlHeight);

						    if (contentHeight > 0) {
						        // 余白のズレを吸収するため +10px ほどの余裕を持たせる
						        iframeElement.style.height = (contentHeight + 10) + 'px';
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