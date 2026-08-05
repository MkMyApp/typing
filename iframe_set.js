const iframeElement = document.getElementById('frm_type');

iframeElement.addEventListener('load', function() {
//iframeの読み込み完了時に高さを合わせる処理
    // iframe内部のコンテンツの高さを取得して適用
    const contentHeight = iframeElement.contentWindow.document.documentElement.scrollHeight;
    iframeElement.style.height = contentHeight + 'px';
});
