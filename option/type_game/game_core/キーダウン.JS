function addTypeEffect(x, y, color) {
  typeEffect.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 40,
    alpha: 1.0,
    color: color || 'rgba(255, 255, 255, '
  });
}

function drawTypeEffect(ctx) {
  for (let i = typeEffect.length - 1; i >= 0; i--) {
    const effect = typeEffect[i];
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.strokeStyle = effect.color + effect.alpha + ')';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // アニメーション更新
    effect.radius += 2;      // 半径を拡大
    effect.alpha -= 0.05;    // 透明度を減少

    // 透明になったら配列から削除
    if (effect.alpha <= 0) {
      typeEffect.splice(i, 1);
    }
  }
}

// キーボード入力時のイベントリスナー
window.addEventListener('keydown', (e) => {
  // 例: 押されたキーに対応するCanvas上の座標(x, y)を取得
  const keyPosition = getKeyPosition(e.key); 

  if (keyPosition) {
    // 1. 波紋オブジェクトを生成して配列に追加する
    addTypeEffect(keyPosition.x, keyPosition.y, 'rgba(255, 255, 255, ');
  }
});

// メインの描画・アニメーションループ
function gameLoop() {
  // Canvas画面を一度クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // （他の背景やキーボードUIなどの描画処理）

  // 2. 配列に蓄積された波紋を更新＆描画する
  drawTypeEffect(ctx);

  // 次のフレームを要求（ループ処理）
  requestAnimationFrame(gameLoop);
}

// アニメーションループを開始
requestAnimationFrame(gameLoop);

