// --- テーマごとの設定パラメータ定義 ---
const themeConfigs = {
  none: {
    bgname: "",
    keyScale: 1.0,
    offsetX: 0,
    offsetY: 0
  },
  western: {
    bgname: "洋巻物.png",
    keyScale: 0.75,
    offsetX: 90,
    offsetY: 35
  },
  japanese: {
    bgname: "和巻物.png",
    keyScale: 0.7,
    offsetX: 120,
    offsetY: 50
  }
};

// 現在適用中のテーマパラメータ
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
    // 背景なしの場合は即座に再描画
    updateRulesFromUI();
  }
}

// 起動時の初期化
window.addEventListener('DOMContentLoaded', () => {
  const bgThemeSelect = document.getElementById('bg-theme');
  const initialTheme = bgThemeSelect ? bgThemeSelect.value : 'none';
  applyTheme(initialTheme);
  initEventListeners();
});

// 現在選択されている文字種別を取得する関数
function getCurrentMojiType() {
  const select = document.getElementById('char-mode');
  return select ? select.value : "大文字";
}

// 色の判定ロジック
function getKeyColors(key) {
  let bg = "#f0f0f0";
  let fg = null;

  if (key.id) {
    fg = transparentIdKeys ? "transparent" : "#000000";
    return { bg, fg };
  }

  let text = key.c.trim();
  const moji = getCurrentMojiType();
  
  if (moji === "小文字") {
    text = toLowerCaseStr(text);
  } else if (moji === "かな") {
    text = qwertyToJisKana(text);
  } else if (moji === "シフト") {
    text = shift2str(text);
  }

  const charsInBtn = text.split('');
  for (const rule of colorRules) {
    if (charsInBtn.some(char => rule.CHARS.includes(char))) {
      bg = rule.BackColor;
      fg = rule.ForColor;
      break;
    }
  }

  if (!fg) {
    fg = showTextColor ? "#000000" : "transparent";
  }

  return { bg, fg };
}

// 単一ボタン描画関数
function drawButton(ctx, x, y, width, height, key, scale) {
  const { bg, fg } = getKeyColors(key);

  ctx.fillStyle = bg;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, y, width, height);

  if (fg !== "transparent") {
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

		let text = key.c.trim();
    const moji = getCurrentMojiType();
    
    if (!key.id) {
      if (moji === "小文字") {
        text = toLowerCaseStr(text);
      } else if (moji === "かな") {
        text = qwertyToJisKana(text);
      } else if (moji === "シフト") { // ← この分岐を追加
        text = shift2str(text);
      }
    }

    const fontName = "monospace, 'Hiragino Kaku Gothic ProN', Meiryo";

    if (!key.id && text.length >= 2) {
      ctx.font = `${12 * scale}px ${fontName}`;
      ctx.fillText(text[0], x + width / 2, y + height * 0.32);
      ctx.fillText(text[1], x + width / 2, y + height * 0.68);
    } else if (text) {
      let fontSize;

      if (key.id) {
        fontSize = 10 * scale;
        ctx.font = `${fontSize}px ${fontName}`;
        const maxTextWidth = width - (4 * scale);

        while (ctx.measureText(text).width > maxTextWidth && fontSize > 4 * scale) {
          fontSize -= 0.5 * scale;
          ctx.font = `${fontSize}px ${fontName}`;
        }
      } else {
        fontSize = 18 * scale;
        ctx.font = `${fontSize}px ${fontName}`;
      }

      ctx.fillText(text, x + width / 2, y + height / 2);
    }
  }
}

// 全体描画・メイン処理
function renderKeyboardCanvas() {
  const canvas = document.getElementById("keyboardCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const padding = 10;
  const btnHeight = 32;
  const btnWidth = 32;
  const marginX = 6;
  const marginY = 8;

  const scale = typeof sVal !== 'undefined' ? sVal : 1;
  // テーマごとの設定値を動的に反映
  const currentKeyScale = currentThemeConfig.keyScale;
  const currentOffsetX = currentThemeConfig.offsetX;
  const currentOffsetY = currentThemeConfig.offsetY;

  const rowWidths = keyboardData.map(row => {
    return row.reduce((sum, k) => sum + (k.w || btnWidth) + marginX, 0) - marginX;
  });
  const maxContentWidth = Math.max(...rowWidths);

  const baseWidth = maxContentWidth + padding * 2;
  const baseHeight = (btnHeight * 5) + (marginY * 4) + padding * 2;

  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;
  canvas.style.width = `${baseWidth * scale}px`;
  canvas.style.height = `${baseHeight * scale}px`;

  // 背景画像の描画（設定されている場合）
  if (currentThemeConfig.bgname && bgImage.complete && bgImage.naturalWidth !== 0) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  let currentY = padding;

  keyboardData.forEach(row => {
    let currentX = padding;

    row.forEach(key => {
      const w = key.w || btnWidth;
      const h = btnHeight;

      const drawX = (currentOffsetX + currentX) * scale * currentKeyScale;
      const drawY = (currentOffsetY + currentY) * scale * currentKeyScale;
      const drawW = w * scale * currentKeyScale;
      const drawH = h * scale * currentKeyScale;

      drawButton(ctx, drawX, drawY, drawW, drawH, key, scale * currentKeyScale);

      currentX += w + marginX;
    });

    currentY += btnHeight + marginY;
  });
}

// 画像保存関数
async function downloadKeyboardImage() {
  const canvas = document.getElementById("keyboardCanvas");
  renderKeyboardCanvas();

  if ('showSaveFilePicker' in window) {
    canvas.toBlob(async (blob) => {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'keyboard.png',
          types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        if (err.name !== 'AbortError') console.error('保存処理エラー:', err);
      }
    }, 'image/png');
  } else {
    const link = document.createElement("a");
    link.download = "keyboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// 変換ユーティリティ
function toLowerCaseStr(str) { return str.toLowerCase(); }
function toUpperCaseStr(str) { return str.toUpperCase(); }

function shift2str(str) {
  const shiftMap = {
    '1': '!1', '2': '"2', '3': '#3', '4': '$4', '5': '%5',
    '6': '&6', '7': '\'7', '8': '(8', '9': ')9', '0': ' 0',
    '-': '=-', '^': '~^', 
    '@': '`@', '[': '{[',
    ';': '+;',
    ':': '*:', ']': '}]',
    ',': '<,', '.': '>.', '/': '?/'
  };
  return str.split('').map(char => {
    const upper = char.toUpperCase();
    return shiftMap[upper] !== undefined ? shiftMap[upper] : char;
  }).join('');
}

function qwertyToJisKana(str) {
  const jisMap = {
    '1': 'ぬ', '2': 'ふ', '3': 'あ', '4': 'う', '5': 'え',
    '6': 'お', '7': 'や', '8': 'ゆ', '9': 'よ', '0': 'わ',
    '-': 'ほ', '^': 'へ', '|': 'む',
    'Q': 'た', 'W': 'て', 'E': 'い', 'R': 'す', 'T': 'か',
    'Y': 'ん', 'U': 'な', 'I': 'に', 'O': 'ら', 'P': 'せ',
    '@': '゛', '[': '゜',
    'A': 'ち', 'S': 'と', 'D': 'し', 'F': 'は', 'G': 'き',
    'H': 'く', 'J': 'ま', 'K': 'の', 'L': 'り', ';': 'れ',
    ':': 'け', ']': 'む',
    'Z': 'つ', 'X': 'さ', 'C': 'そ', 'V': 'ひ', 'B': 'こ',
    'N': 'み', 'M': 'も', ',': 'ね', '.': 'る', '/': 'め', '_': 'ろ'
  };
  return str.split('').map(char => {
    const upper = char.toUpperCase();
    return jisMap[upper] !== undefined ? jisMap[upper] : char;
  }).join('');
}

function jisKanaToQwerty(str) {
  const reverseJisMap = {
    'ぬ': '1', 'ふ': '2', 'あ': '3', 'う': '4', 'え': '5',
    'お': '6', 'や': '7', 'ゆ': '8', 'よ': '9', 'わ': '0',
    'ほ': '-', 'へ': '^', 'む': ']',
    'た': 'Q', 'て': 'W', 'い': 'E', 'す': 'R', 'か': 'T',
    'ん': 'Y', 'な': 'U', 'に': 'I', 'ら': 'O', 'せ': 'P',
    '゛': '@', '゜': '[',
    'ち': 'A', 'と': 'S', 'し': 'D', 'は': 'F', 'き': 'G',
    'く': 'H', 'ま': 'J', 'の': 'K', 'り': 'L', 'れ': ';',
    'け': ':',
    'つ': 'Z', 'さ': 'X', 'そ': 'C', 'ひ': 'V', 'こ': 'B',
    'み': 'N', 'も': 'M', 'ね': ',', 'る': '.', 'め': '/', 'ろ': '_'
  };
  return str.split('').map(char => reverseJisMap[char] !== undefined ? reverseJisMap[char] : char).join('');
}

// --- 保存・読み込み処理 ---
async function saveTextConfig() {
  const inputs = document.querySelectorAll('.btn-container-left input.str');
  const lines = Array.from(inputs).map(input => {
    let val = input.value;
    val = jisKanaToQwerty(val);
    return val.toUpperCase();
  });

  const textData = lines.join('\n') + '\n';

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'keyboard_config.txt',
        types: [{ description: 'Config File', accept: { 'text/plain': ['.txt'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(textData);
      await writable.close();
    } catch (err) {
      if (err.name !== 'AbortError') console.error('保存エラー:', err);
    }
  } else {
    const blob = new Blob([textData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'keyboard_config.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

function loadTextConfig(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const lines = content.split(/\r?\n/);
    const inputs = document.querySelectorAll('.btn-container-left input.str');
    const moji = getCurrentMojiType();

    inputs.forEach((input, index) => {
      if (index < lines.length) {
        let val = lines[index];
        if (moji === "小文字") {
          val = toLowerCaseStr(val);
        } else if (moji === "かな") {
          val = qwertyToJisKana(val);
        }
        input.value = val;
      } else {
        input.value = '';
      }
    });

    event.target.value = '';
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

// --- イベントリスナー登録 ---
function initEventListeners() {
  // 入力フォームの変更監視
  document.querySelectorAll('.control-panel input').forEach(input => {
    input.addEventListener('input', updateRulesFromUI);
    input.addEventListener('change', updateRulesFromUI);
  });

  // 文字種別のセレクトボックス変更時に即時再描画
  const charModeSelect = document.getElementById('char-mode');
  if (charModeSelect) {
    charModeSelect.addEventListener('change', () => {
      renderKeyboardCanvas();
    });
  }

  // 背景テーマのセレクトボックス変更時にパラメータを切り替えて再描画
  const bgThemeSelect = document.getElementById('bg-theme');
  if (bgThemeSelect) {
    bgThemeSelect.addEventListener('change', (e) => {
      const themeKey = e.target.value;
      applyTheme(themeKey);
    });
  }
}