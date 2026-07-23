// ==========================================
// 1. Web Audio API による MP3 音声の事前ロード
// ==========================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundBuffer = null;

function loadSound(url) {
  // ブラウザの自動再生規制を考慮し、ユーザー操作前でもContext生成を試みる
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      soundBuffer = audioBuffer;
    })
    .catch(err => console.error('音源ファイルの読み込みに失敗しました:', err));
}

// 拡張子（.mp3 や .wav）を明示してください
loadSound('sound.mp3');

// ==========================================
// 2. 超低遅延再生関数
// ==========================================
function playLoadedSound() {
  if (!audioCtx || !soundBuffer) return;

  // Suspended（一時停止）状態の場合は解除
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // 軽量ノードを生成して再生（高速打鍵の重なりにも完全対応）
  const source = audioCtx.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// ==========================================
// keydown イベントリスナー（単に音を鳴らすだけ）
// ==========================================
editorEl.addEventListener('keydown', e => {
  // 長押し（e.repeat）を除外して、キー入力のたびに発音
  if (!e.repeat) {
    playLoadedSound();
  }
});