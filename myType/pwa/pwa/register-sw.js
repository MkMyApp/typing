if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('Service Worker 登録成功:', reg.scope);
      })
      .catch((err) => {
        console.log('Service Worker 登録失敗:', err);
      });
  });
}