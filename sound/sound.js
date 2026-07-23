const audio = new Audio(sound_src);

function playSound() {
  audio.currentTime = 0;
  audio.play().catch(err => console.error(err));
}

document.addEventListener('keydown', (e) => {
  // 長押しリピート時は鳴らさない
  if (e.repeat) return;

  // 無視したい装飾キーや特殊キーの e.code / e.key
  const ignoreCodes = [
    'ShiftLeft', 'ShiftRight',
    'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight',
    'CapsLock', 'Tab', 'Escape'
  ];

  // 無視リストに含まれるキーなら処理を中断
  if (ignoreCodes.includes(e.code) || ignoreCodes.includes(e.key)) {
    return;
  }

  // 条件を通過した物理キー（文字キー、数字キー、Enter、Backspaceなど）で発音
  playSound();
});