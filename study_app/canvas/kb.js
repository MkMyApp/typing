// 色の判定ロジック
function getKeyColors(key) {
  let bg = "#f0f0f0"; // 背景色初期値（指定なし）
  let fg = null;      // 文字色判定用

  // 1. 機能キー（ID付き）の処理（「文字色」チェックの影響を受けない）
  if (key.id) {
    // 機能キーチェックOFF ➔ 透過（非表示）
    // 機能キーチェックON  ➔ 黒（#000000）に固定表示
    fg = transparentIdKeys ? "transparent" : "#000000";
    return { bg, fg };
  }

  // 2. 一般キーの背景色判定（入力ルールとの照合）
  const charsInBtn = key.c.trim().split('');
  for (const rule of colorRules) {
    if (charsInBtn.some(char => rule.CHARS.includes(char))) {
      bg = rule.BackColor;
      fg = rule.ForColor; // 背景色指定あり ➔ 文字色は「白 (#FFFFFF)」に固定
      break;
    }
  }

  // 3. 背景色指定がない一般キーの文字色切り替え処理
  if (!fg) {
    // 「文字色」チェックON ➔ 黒 ("#000000"), OFF ➔ 透過 ("transparent")
    fg = showTextColor ? "#000000" : "transparent";
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

// 画像保存関数（保存場所を選択できるAPIに対応）
async function downloadKeyboardImage() {
  const canvas = document.getElementById("keyboardCanvas");

  // File System Access API が使えるブラウザ（Chrome / Edge 等）の場合
  if ('showSaveFilePicker' in window) {
    try {
      // 1. ファイル保存ダイアログを開く
      const handle = await window.showSaveFilePicker({
        suggestedName: 'keyboard.png',
        types: [{
          description: 'PNG Image',
          accept: { 'image/png': ['.png'] },
        }],
      });

      // 2. CanvasのデータをBlobに変換して書き込む
      canvas.toBlob(async (blob) => {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      }, 'image/png');

    } catch (err) {
      // ユーザーが保存ダイアログをキャンセルした場合などはここに入る
      if (err.name !== 'AbortError') {
        console.error('保存処理でエラーが発生しました:', err);
      }
    }
  } else {
    // API非対応ブラウザ用の従来処理（ダウンロードフォルダへ）
    const link = document.createElement("a");
    link.download = "keyboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// --- TXT / CFG 保存処理 ---
async function saveTextConfig() {
  const inputs = document.querySelectorAll('.btn-container-left input.str');
  const lines = Array.from(inputs).map(input => input.value);
	const textData = lines.join('\n') + '\n';

  // File System Access API に対応している場合（Chrome / Edge 等）
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'keyboard_config.cfg',
        types: [{
          description: 'Configuration / Text File',
          accept: { 
            'text/plain': ['.cfg', '.txt'] 
          },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(textData);
      await writable.close();
    } catch (err) {
      if (err.name !== 'AbortError') console.error('保存エラー:', err);
    }
  } else {
    // 従来型のフォールバック保存（ダウンロードフォルダへ）
    const blob = new Blob([textData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'keyboard_config.cfg';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

// --- TXT / CFG 読み込み処理 ---
function loadTextConfig(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    // 改行コード（CRLF / LF）で分割
    const lines = content.split(/\r?\n/);
    const inputs = document.querySelectorAll('.btn-container-left input.str');

    // 最大5要素分ループ処理（余剰は切り捨て、不足は空文字）
    inputs.forEach((input, index) => {
      if (index < lines.length) {
        input.value = lines[index];
      } else {
        input.value = '';
      }
    });

    // 入力ファイル値をリセット
    event.target.value = '';

    // ルール更新と再描画を実行
    updateRulesFromUI();
  };

  reader.readAsText(file);
}

// --- フォーム読み取り＆更新関数 ---
function updateRulesFromUI() {
  colorRules = [];
  
  const hexInputs = document.querySelectorAll('.btn-container-left .hex');
  hexInputs.forEach(hex => {
    const str = hex.nextElementSibling;
    if (str && str.classList.contains('str') && str.value.length > 0) {
      colorRules.push({ CHARS: str.value, BackColor: hex.value, ForColor: "#FFFFFF" });
    }
  });

  const chkFunc = document.getElementById('chkFunc');
  const chkTextColor = document.getElementById('chkTextColor');

  transparentIdKeys = chkFunc ? !chkFunc.checked : true;
  showTextColor = chkTextColor ? chkTextColor.checked : false;

  renderKeyboardCanvas();
}

// --- イベントリスナー登録（関数の定義より後に記述） ---
document.querySelectorAll('.control-panel input').forEach(input => {
  input.addEventListener('input', updateRulesFromUI);
  input.addEventListener('change', updateRulesFromUI);
});

// 初期実行
updateRulesFromUI();
