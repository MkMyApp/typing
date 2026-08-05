// --------------------------------------------------
// すべての iframe の読み込みと高さ調整 + スクロール処理
// --------------------------------------------------
const iframes = document.querySelectorAll('iframe');
let loadedCount = 0;

iframes.forEach(iframeElement => {
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

            // 初回高さ調整
            adjustHeight();

            // 内部コンテンツのサイズ変化を継続的に監視
            if (window.ResizeObserver && doc.body) {
                const observer = new ResizeObserver(() => adjustHeight());
                observer.observe(doc.body);
            }
        } catch (e) {
            console.warn('iframeの高さを取得できませんでした:', e);
        }

        // 読み込み完了した iframe をカウント
        loadedCount++;

        // すべての iframe の読み込み（高さの確定）が終わったら一番上にスクロール
        if (loadedCount === iframes.length) {
            // レイアウトのガタつきを吸収するため少しだけ遅延を入れる
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth' // スムーススクロール（即時スクロールにしたい場合は 'auto'）
                });
            }, 50);
        }
    });
});