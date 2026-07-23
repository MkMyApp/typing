// オーディオオブジェクトの事前読み込み
const audioMap = {};
soundList.forEach(src => {
  audioMap[src] = new Audio(src);
});

// リストボックスの初期化処理
document.addEventListener('DOMContentLoaded', () => {
  const selectEl = document.getElementById('soundSelect');
  if (!selectEl) return;

  // 先頭に「ランダム」の選択肢を追加
  const randomOption = document.createElement('option');
  randomOption.value = 'all';
  randomOption.textContent = '★ランダム (全種類)';
  selectEl.appendChild(randomOption);

  // soundList の要素から option タグを動的生成
  soundList.forEach(src => {
    const option = document.createElement('option');
    option.value = src;
    option.textContent = src;
    selectEl.appendChild(option);
  });

  // リストボックス選択変更時に試しに1回鳴らす（不要なら削除可）
  selectEl.addEventListener('change', () => {
    playSound();
  });
});

// 音声再生関数
function playSound() {
  const selectEl = document.getElementById('soundSelect');
  const selected = selectEl ? selectEl.value : 'all';

  let targetAudio = null;

  if (selected === 'all') {
    // ランダム再生
    const randomIndex = Math.floor(Math.random() * soundList.length);
    const selectedSrc = soundList[randomIndex];
    targetAudio = audioMap[selectedSrc];
  } else if (audioMap[selected]) {
    // 選択されたファイル再生
    targetAudio = audioMap[selected];
  }

  if (targetAudio) {
    targetAudio.currentTime = 0;
    targetAudio.play().catch(err => console.error(err));
  }
}

// キー入力イベント
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  const ignoreCodes = [
    'ShiftLeft', 'ShiftRight',
    'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight',
    'CapsLock', 'Tab', 'Escape'
  ];

  if (ignoreCodes.includes(e.code) || ignoreCodes.includes(e.key)) {
    return;
  }

  playSound();
});