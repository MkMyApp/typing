/**
 * 画面シェイク＆赤フラッシュ演出を実行する関数
 * @param {HTMLElement|string} targetElement - 対象のDOM要素（またはID名）
 */
function triggerMissEffect(targetElement) {
  // ID名が渡された場合は要素を取得、要素直接ならそのまま利用
  const container = typeof targetElement === 'string' 
    ? document.getElementById(targetElement) 
    : targetElement;

  if (!container) return;

  // 既に演出実行中の場合はクラスを一度リセット（連続ミス対応）
  container.classList.remove('shake', 'flash-red');
  
  // リフロー（再描画）を発生させてCSSアニメーションを確実に最初から再再生させる
  void container.offsetWidth;

  // クラスを付与してアニメーション開始
  container.classList.add('shake', 'flash-red');

  // アニメーション終了時（約200ms〜300ms後）にクラスを取り除く
  setTimeout(() => {
    container.classList.remove('shake', 'flash-red');
  }, 200);
}