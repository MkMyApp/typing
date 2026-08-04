//タイピング記録をtxtに保存
//<script src="record.js"></script>

let logRows = [];
let isTracking = false;
let sessionStartTime = 0;
let currentTargetWord = '';

// 1. keydown イベントの監視と記録
window.addEventListener('keydown', function(e) {
  if (!isTracking && typeof typeStarted !== 'undefined' && typeStarted) {
    isTracking = true;
    sessionStartTime = performance.now();
    logRows = [];
  }

  if (isTracking) {
    const now = performance.now();
    const sec = ((now - sessionStartTime) / 1000).toFixed(2);

    if (typeof currentWord !== 'undefined') {
      currentTargetWord = currentWord;
    }

    logRows.push([
      `"${currentTargetWord.replace(/"/g, '""')}"`,
      sec,
      e.code,
      `"${e.key.replace(/"/g, '""')}"`
    ].join(','));
  }
}, true);

// 2. 終了判定と「ダウンロードUI」の生成
const checkInterval = setInterval(() => {
  if (typeof finished !== 'undefined' && finished && isTracking) {
    isTracking = false;
    showDownloadButton();
  }
}, 200);

// ダウンロード用エリアを表示する処理
function showDownloadButton() {
  let dlEl = document.getElementById('dl');
  if (!dlEl) {
    dlEl = document.createElement('div');
    dlEl.id = 'dl';
    document.body.appendChild(dlEl);
  }

  dlEl.style.display = 'block';
  dlEl.innerHTML = `<strong>[ Click to Download data Log ]</strong><br>ここをクリックして結果を保存`;

  // クリック時に手動ダウンロード発動（ブラウザにブロックされません）
  dlEl.onclick = function() {
    const dataHeader = 'targetWord,timeSec,code,key\n';
    const dataContent = dataHeader + logRows.join('\n') + '\n';;
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, dataContent], { type: 'text/data;charset=utf-8;' });
    
    saveFile(blob, `typing_log_${Date.now()}.csv`);
  };
}

function saveFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
