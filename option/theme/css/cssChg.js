document.addEventListener('DOMContentLoaded', () => {
  // 1. スタイルの動的生成と注入
  const style = document.createElement('style');
  style.textContent = `
    #container {
      margin-top: 32px;
      font-size: 32px;
    }
  `;
  document.head.appendChild(style);

  // 2. HTML構造の動的生成
  const container = document.createElement('div');
  container.id = 'container';

  const label = document.createElement('label');
  label.htmlFor = 'theme-select';
  label.textContent = 'テーマ: ';

  const select = document.createElement('select');
  select.id = 'theme-select';
  select.size = 5;
  select.style.fontSize = '32px';
  select.style.width = '200px';
  select.style.verticalAlign = 'top';

  container.appendChild(label);
  container.appendChild(select);
  document.body.appendChild(container);

  // 3. CSSファイルのリスト
  const cssList = [
    'type.css',
    'light.css',
    'dark.css',
    'mint.css',
    'ファンシー.css',
    'blueSea.css',
    't_type.css',
    'd_type.css',
    'p_type.css',
    'ハロウィン.css',
    '黒板.css',
    'ハッカー.css',
    'サイバーウォー.css',
    'サイバー.css',
    '電脳空間.css',
    'デジタル.css',
    '侍.css',
    '道場.css',
  ];

  // 4. <option> タグの動的生成
  cssList.forEach(cssFile => {
    const option = document.createElement('option');
    option.value = cssFile;
    option.textContent = cssFile.replace('.css', '');
    select.appendChild(option);
  });

  // 5. 【初期設定】読み込み時に確実に1番目（type.css）を選択＆反映する
  select.selectedIndex = 0;
  const themeStyle = document.getElementById('theme-style');
  if (themeStyle) {
    themeStyle.href = select.value;
  }

  // 6. ユーザーがセレクトボックスを変更した時の処理
  select.addEventListener('change', (event) => {
    if (themeStyle) {
      themeStyle.href = event.target.value;
    }
  });
});