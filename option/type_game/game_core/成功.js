/**
 * 1行完成時の視覚エフェクトを実行する関数
 * @param {HTMLElement|string} targetElement - 光らせる対象のUI要素（#target や .game-container）
 */
function triggerLineCompleteEffect(targetElement) {
  const el = typeof targetElement === 'string' 
    ? document.getElementById(targetElement) 
    : targetElement;

  if (el) {
    // クラスのリセットと再適用（連続完成時のアニメーション再再生用）
    el.classList.remove('flash-correct');
    void el.offsetWidth; // リフロー発生
    el.classList.add('flash-correct');

    // 250ms後に光りを消す
    setTimeout(() => {
      el.classList.remove('flash-correct');
    }, 250);
  }

  // Canvas上の中心付近にパッと弾けるパーティクル（紙吹雪/光の粒子）を追加生成
  createBurstParticles();
}

// 1行完成時にCanvas上で弾ける粒子の生成（オプション）
const completeParticles = [];

function createBurstParticles() {
  if (!canvas) return;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 15〜20個の粒子を放射状に散らす
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    completeParticles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 4 + 2,
      alpha: 1.0,
      color: 'hsl(' + Math.floor(Math.random() * 360) + ', 80%, 60%)' // カラフルな色
    });
  }
}

/**
 * 毎フレームの描画ループ（updateAndDrawなど）内で呼び出す更新・描画処理
 */
function drawCompleteParticles(ctx) {
  for (let i = completeParticles.length - 1; i >= 0; i--) {
    const p = completeParticles[i];
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 移動と減衰
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;

    if (p.alpha <= 0) {
      completeParticles.splice(i, 1);
    }
  }
}