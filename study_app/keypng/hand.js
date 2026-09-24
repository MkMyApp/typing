// --- テーマごとの設定パラメータ定義（サイズ・位置の調整はこちらで行えます） ---
const themeConfigs = {
  none: {
    bgname: "",
    handScale: 1.0,  // 手のイラストの全体倍率
    offsetX: 0,      // 横方向の位置オフセット
    offsetY: 0       // 縦方向の位置オフセット
  },
  western: {
    bgname: "洋巻物.png",
    handScale: 0.8,  // 洋風背景での手の倍率
    offsetX: 50,      // 横方向の位置調整
    offsetY: 20       // 縦方向の位置調整
  },
  japanese: {
    bgname: "和巻物.png",
    handScale: 0.8,  // 和風背景での手の倍率
    offsetX: 50,      // 横方向の位置調整
    offsetY: 20       // 縦方向の位置調整
  }
};

let currentThemeConfig = themeConfigs.none;
const bgImage = new Image();

// 選択された背景テーマに基づいて設定を更新し画像を読み込む
function applyTheme(themeKey) {
  currentThemeConfig = themeConfigs[themeKey] || themeConfigs.none;

  if (currentThemeConfig.bgname) {
    bgImage.src = currentThemeConfig.bgname;
    bgImage.onload = function() {
      updateRulesFromUI();
    };
    bgImage.onerror = function() {
      console.warn("背景画像の読み込みに失敗しました。デフォルト背景で描画します。");
      updateRulesFromUI();
    };
  } else {
    updateRulesFromUI();
  }
}

// 固定色定義
const FINGER_BG_COLOR = "#FFF8DC"; // 指本体（クリーム色）
const THUMB_BG_COLOR = "#FFF8F0";  // 親指（クリーム色）
const DEFAULT_TIP_BG = "#FFF8F0";  // ルール未マッチ時の指先背景

let colorRules = [];
let charMode = 0; // 0:大文字, 1:小文字, 2:かな

// label文字列から選択中モードの1文字を取得する
function getCharByMode(labelStr) {
  if (!labelStr) return "";
  const chars = Array.from(labelStr);
  if (chars.length > charMode) {
    return chars[charMode];
  }
  return chars[0] || "";
}

// 指先の色・文字判定
function getTipColorAndText(finger) {
  if (finger.type === "thumb") {
    return { bg: THUMB_BG_COLOR, fg: "#FFFFFF", text: "" };
  }

  let bg = DEFAULT_TIP_BG;
  let fg = "#000000";
  
  const displayChar = getCharByMode(finger.label);

  for (const rule of colorRules) {
    const rawChars = Array.from(finger.label);
    if (rawChars.some(c => rule.CHARS.includes(c)) || rule.CHARS.includes(displayChar)) {
      bg = rule.BackColor;
      fg = rule.ForColor;
      break;
    }
  }

  return { bg, fg, text: displayChar };
}

// 単一の指を描画する関数
function drawFinger(ctx, startX, bottomY, fingerWidth, unitHeight, finger, scale) {
  const totalHeight = finger.h * unitHeight;
  const tipHeight = finger.tipH * unitHeight;
  const bodyHeight = totalHeight - tipHeight;

  const x = startX * scale;
  const w = fingerWidth * scale;
  const yTop = (bottomY - totalHeight) * scale;
  const yTipBottom = (bottomY - bodyHeight) * scale;

  // 1. 指本体（下部長方形）
  ctx.fillStyle = FINGER_BG_COLOR;
  ctx.fillRect(x, yTipBottom, w, bodyHeight * scale);
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, yTipBottom, w, bodyHeight * scale);

  // 2. 指先（上部長方形）
  const { bg, fg, text } = getTipColorAndText(finger);

  ctx.fillStyle = bg;
  ctx.fillRect(x, yTop, w, tipHeight * scale);
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, yTop, w, tipHeight * scale);

  // 3. テキスト描画
  if (text) {
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${18 * scale}px sans-serif`;
    ctx.fillText(text, x + w / 2, yTop + (tipHeight * scale) / 2);
  }
}

// 全体描画メイン処理
function renderHandCanvas() {
  const canvas = document.getElementById("handCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const baseScale = typeof sVal !== 'undefined' ? sVal : 1;
  const handScale = currentThemeConfig.handScale;
  const scale = baseScale * handScale;

  const fingerWidth = 36;
  const unitHeight = 24;
  const gap = 2;
  const handGap = 30;
  const padding = 16;

  const maxFingerH = Math.max(...handData.map(f => f.h));
  const canvasWidth = (fingerWidth * 10) + (gap * 8) + handGap + (padding * 2);
  const canvasHeight = (maxFingerH * unitHeight) + (padding * 2);

  canvas.width = canvasWidth * baseScale;
  canvas.height = canvasHeight * baseScale;
  canvas.style.width = `${canvasWidth * baseScale}px`;
  canvas.style.height = `${canvasHeight * baseScale}px`;

  // 背景画像の描画（設定されている場合）
  if (currentThemeConfig.bgname && bgImage.complete && bgImage.naturalWidth !== 0) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1 * baseScale;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // オフセットとスケールを反映した描画位置の起点を計算
  const offsetX = currentThemeConfig.offsetX;
  const offsetY = currentThemeConfig.offsetY;

  let currentX = padding + offsetX;
  const bottomY = canvasHeight - padding + offsetY;

  handData.forEach((finger, index) => {
    drawFinger(ctx, currentX, bottomY, fingerWidth, unitHeight, finger, scale);
    currentX += fingerWidth + gap;
    if (index === 4) {
      currentX += handGap - gap;
    }
  });
}

// 画像保存関数
async function downloadHandImage() {
  const canvas = document.getElementById("handCanvas");
  renderHandCanvas();

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'hand_positions.png',
        types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
      });
      canvas.toBlob(async (blob) => {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      }, 'image/png');
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  } else {
    const link = document.createElement("a");
    link.download = "hand_positions.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// フォーム読み取り＆更新
function updateRulesFromUI() {
  colorRules = [];
  const hexInputs = document.querySelectorAll('.btn-container-left .hex');
  hexInputs.forEach(hex => {
    const str = hex.nextElementSibling;
    if (str && str.classList.contains('str') && str.value.length > 0) {
      colorRules.push({ CHARS: str.value, BackColor: hex.value, ForColor: "#FFFFFF" });
    }
  });

  const selectedRadio = document.querySelector('input[name="charMode"]:checked');
  charMode = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;

  renderHandCanvas();
}

// 起動時の初期化
window.addEventListener('DOMContentLoaded', () => {
  const bgThemeSelect = document.getElementById('bg-theme');
  const initialTheme = bgThemeSelect ? bgThemeSelect.value : 'none';
  applyTheme(initialTheme);

  document.querySelectorAll('.control-panel input').forEach(input => {
    input.addEventListener('input', updateRulesFromUI);
    input.addEventListener('change', updateRulesFromUI);
  });

  if (bgThemeSelect) {
    bgThemeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }
});