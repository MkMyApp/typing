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
  return chars[0] || ""; // 該当位置に文字がない場合は先頭をフォールバック
}

// 指先の色・文字判定
function getTipColorAndText(finger) {
  if (finger.type === "thumb") {
    return { bg: THUMB_BG_COLOR, fg: "#FFFFFF", text: "" };
  }

  let bg = DEFAULT_TIP_BG;
  let fg = "#000000"; // デフォルトで黒文字
  
  // ラジオボタンの選択に従い、labelから該当する1文字を取得
  const displayChar = getCharByMode(finger.label);

  // 色ルールの適用判定（finger.labelに含まれる文字、または抽出文字と照合）
  for (const rule of colorRules) {
    const rawChars = Array.from(finger.label);
    if (rawChars.some(c => rule.CHARS.includes(c)) || rule.CHARS.includes(displayChar)) {
      bg = rule.BackColor;
      fg = rule.ForColor; // 色指定がある場合は白文字 (#FFFFFF)
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

  // 3. テキスト描画（必ず描画）
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
  const ctx = canvas.getContext("2d");

  const scale = typeof sVal !== 'undefined' ? sVal : 1;
  const fingerWidth = 36;
  const unitHeight = 24;
  const gap = 2;
  const handGap = 30; // 左右の手の間隔
  const padding = 16;

  const maxFingerH = Math.max(...handData.map(f => f.h));
  const canvasWidth = (fingerWidth * 10) + (gap * 8) + handGap + (padding * 2);
  const canvasHeight = (maxFingerH * unitHeight) + (padding * 2);

  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  canvas.style.width = `${canvasWidth * scale}px`;
  canvas.style.height = `${canvasHeight * scale}px`;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentX = padding;
  const bottomY = canvasHeight - padding;

  handData.forEach((finger, index) => {
    drawFinger(ctx, currentX, bottomY, fingerWidth, unitHeight, finger, scale);
    currentX += fingerWidth + gap;
    if (index === 4) { // 左手と右手の間隔
      currentX += handGap - gap;
    }
  });
}

// 画像保存関数
async function downloadHandImage() {
  const canvas = document.getElementById("handCanvas");
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

// TXT/CFG 保存
async function saveTextConfig() {
  const inputs = document.querySelectorAll('.btn-container-left input.str');
  const lines = Array.from(inputs).map(input => input.value);
  const textData = lines.join('\n') + '\n';

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'hand_config.cfg',
        types: [{ description: 'Configuration File', accept: { 'text/plain': ['.cfg', '.txt'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(textData);
      await writable.close();
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  } else {
    const blob = new Blob([textData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hand_config.cfg';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

// TXT/CFG 読み込み
function loadTextConfig(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split(/\r?\n/);
    const inputs = document.querySelectorAll('.btn-container-left input.str');
    inputs.forEach((input, index) => {
      input.value = index < lines.length ? lines[index] : '';
    });
    event.target.value = '';
    updateRulesFromUI();
  };
  reader.readAsText(file);
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

  // ラジオボタンから選択中モードを取得 (0:大文字, 1:小文字, 2:かな)
  const selectedRadio = document.querySelector('input[name="charMode"]:checked');
  charMode = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;

  renderHandCanvas();
}

// イベントリスナー設定
document.querySelectorAll('.control-panel input').forEach(input => {
  input.addEventListener('input', updateRulesFromUI);
  input.addEventListener('change', updateRulesFromUI);
});

// 初期描画
updateRulesFromUI();