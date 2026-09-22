// 1. フォントリストの抽出とGoogle Fontsの動的読み込み
const txtdataEl = document.getElementById('txtdata');
if (txtdataEl) {
  const rawFonts = txtdataEl.value
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);

  const loadedFonts = new Set();
  rawFonts.forEach(fontName => {
    if (!loadedFonts.has(fontName)) {
      loadedFonts.add(fontName);
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(fontLink);
    }
  });
}

// 2. 動的CSSの生成
const mystyleEl = document.createElement('style');
mystyleEl.textContent = `
  #target.dynamic-font, 
  #target.dynamic-font span,
  textarea#editor.dynamic-font {
    font-family: var(--active-font), sans-serif, monospace !important;
  }
`;
document.head.appendChild(mystyleEl);

// 3. フォント切り替え関数
function applyFontToTarget() {
  const targetEl = document.getElementById('target');
  const editorEl = document.getElementById('editor');
  if (!targetEl) return;

  const text = targetEl.textContent.trim();

  if (text && text !== START_MSG && !text.includes('%') && !text.includes('/')) {
    const fontVal = `"${text}", sans-serif, monospace`;
    document.documentElement.style.setProperty('--active-font', fontVal);
    targetEl.classList.add('dynamic-font');
    if (editorEl) {
      editorEl.classList.add('dynamic-font');
    }

    // ▼ フォント名の文字数 + 5 に width を設定する処理
    const charCount = text.length;
    targetEl.style.width = `${charCount + 5}ch`;
    if (editorEl) {
      editorEl.style.width = `${charCount + 5}ch`;
    }

  } else {
    document.documentElement.style.removeProperty('--active-font');
    targetEl.classList.remove('dynamic-font');
    if (editorEl) {
      editorEl.classList.remove('dynamic-font');
    }

    // ▼ リセット時の処理
    targetEl.style.width = '';
    if (editorEl) {
      editorEl.style.width = '';
    }
  }
}

// 4. DOM読み込み完了後にタイピング監視を開始
window.addEventListener('DOMContentLoaded', () => {
  const targetEl = document.getElementById('target');
  if (targetEl) {
    const observer = new MutationObserver(() => {
      applyFontToTarget();
    });
    observer.observe(targetEl, { childList: true, subtree: true, characterData: true });
    applyFontToTarget();
  }
});
