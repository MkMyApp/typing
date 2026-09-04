

// 色管理変数
let colorRules = [];
let transparentIdKeys = false;

// フォームからルールを読み取って更新する関数
function updateRulesFromUI() {
  colorRules = [];
  
  // すべての .hex（色）を直接読み込んで、隣の .str（テキスト）とペアにする
  const hexInputs = document.querySelectorAll('.btn-container-left .hex');
  hexInputs.forEach(hex => {
    const str = hex.nextElementSibling;
    if (str && str.classList.contains('str') && str.value.length > 0) {
      colorRules.push({ CHARS: str.value, BackColor: hex.value, ForColor: "#FFF" });
    }
  });

  // 機能キー透過チェックボックスの状態を取得
  const check = document.querySelector('.btn-container-left input.check');
  transparentIdKeys = check ? !check.checked : true;

  // 再描画を実行
  renderKeyboardCanvas();
}

// 色の判定ロジック
function getKeyColors(key) {
  let bg = "#f0f0f0";
  let fg = "#000000";

  // ID付きキーの透過フラグ処理
  if (key.id && transparentIdKeys) {
    fg = "transparent";
  }

  // IDのないキーの色付けルール判定
  if (!key.id) {
    const charsInBtn = key.c.trim().split('');
    for (const rule of colorRules) {
      if (charsInBtn.some(char => rule.CHARS.includes(char))) {
        bg = rule.BackColor;
        fg = rule.ForColor;
        break;
      }
    }
  }

  return { bg, fg };
}

// 単一ボタン描画関数
function drawButton(ctx, x, y, width, height, key, scale) {
  const { bg, fg } = getKeyColors(key);

  // 1. ボタン背景描画
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, width, height);

  // 2. ボタン枠線描画
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, y, width, height);

  // 3. テキスト描画
  if (fg !== "transparent") {
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = key.c.trim();

    // 2段表示判定（IDがなく文字数が2文字以上）
    if (!key.id && text.length >= 2) {
      ctx.font = `${12 * scale}px monospace`;
      ctx.fillText(text[0], x + width / 2, y + height * 0.32);
      ctx.fillText(text[1], x + width / 2, y + height * 0.68);
    } else if (text) {
      let fontSize;

      if (key.id) {
        fontSize = 10 * scale;
        ctx.font = `${fontSize}px monospace`;

        const maxTextWidth = width - (4 * scale);

        while (ctx.measureText(text).width > maxTextWidth && fontSize > 4 * scale) {
          fontSize -= 0.5 * scale;
          ctx.font = `${fontSize}px monospace`;
        }
      } else {
        fontSize = 18 * scale;
        ctx.font = `${fontSize}px monospace`;
      }

      ctx.fillText(text, x + width / 2, y + height / 2);
    }
  }
}

// 全体描画・メイン処理
function renderKeyboardCanvas() {
  const canvas = document.getElementById("keyboardCanvas");
  const ctx = canvas.getContext("2d");

  // スタイル定数
  const padding = 10;
  const btnHeight = 32;
  const btnWidth = 32;
  const marginX = 6;
  const marginY = 8;
  const scale = typeof sVal !== 'undefined' ? sVal : 1;

  // 全体幅・高さを正確に計算
  const rowWidths = keyboardData.map(row => {
    return row.reduce((sum, k) => sum + (k.w || btnWidth) + marginX, 0) - marginX;
  });
  const maxContentWidth = Math.max(...rowWidths);

  const baseWidth = maxContentWidth + padding * 2;
  const baseHeight = (btnHeight * 5) + (marginY * 4) + padding * 2;

  // Canvas要素の解像度サイズ設定
  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  // CSS上の見た目サイズも一致させる
  canvas.style.width = `${baseWidth * scale}px`;
  canvas.style.height = `${baseHeight * scale}px`;

  // --- 描画処理 ---
  // 全体背景
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 外枠線
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // 各ボタンのループ描画
  let currentY = padding;

  keyboardData.forEach(row => {
    let currentX = padding;

    row.forEach(key => {
      const w = key.w || btnWidth;
      const h = btnHeight;

      const drawX = currentX * scale;
      const drawY = currentY * scale;
      const drawW = w * scale;
      const drawH = h * scale;

      drawButton(ctx, drawX, drawY, drawW, drawH, key, scale);

      currentX += w + marginX;
    });

    currentY += btnHeight + marginY;
  });
}

// 画像保存関数
function downloadKeyboardImage() {
  const canvas = document.getElementById("keyboardCanvas");
  const link = document.createElement("a");
  link.download = "keyboard.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// --- イベントリスナーの登録（リアルタイム反映） ---
// input要素全体に対して直接イベントリスナーを登録する
document.querySelectorAll('.control-panel input').forEach(input => {
  input.addEventListener('input', updateRulesFromUI);
  input.addEventListener('change', updateRulesFromUI);
});

// 初期表示
updateRulesFromUI();
