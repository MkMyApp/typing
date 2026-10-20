function joinQuery() {
	const queryInput = document.getElementById('query');
	if (queryInput) {
		if (queryInput.value !== "") {
			queryInput.value = "";
			return;
		}
	}

	const groups = document.querySelectorAll('.form-group');
	let baseUrl = '';
	const params = [];

	groups.forEach(group => {
		const btn = group.querySelector('.custom-btn');
		const input = group.querySelector('.custom-input, .custom-textarea');
		if (!btn || !input) return;

		const key = btn.textContent.trim();
		const val = input.value.trim();

		if (key === 'query') return;

		if (key === 'URL') {
			if (val !== '') {
				baseUrl = val;
			}
		} else {
			if (val !== '') {
				// encodeURIComponent を外し、そのまま結合する
				params.push(key + '=' + val);
			}
		}
	});

	let fullQuery = "";
	if (params.length > 0) {
		const connector = baseUrl.includes('?') ? '&' : '?';
		fullQuery += connector + params.join('&');
	}

	if (queryInput) {
		queryInput.value = fullQuery;
	}
}

// .txt ファイルを読み込んで query にセットする関数
function loadQuery() {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt';

	fileInput.onchange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const queryInput = document.getElementById('query');
			if (queryInput) {
				queryInput.value = event.target.result;
			}
		};
		reader.readAsText(file);
	};

	fileInput.click();
}

// query の内容を 指定したファイル名.txt として保存（ダウンロード）する関数
function saveQuery() {
	const queryInput = document.getElementById('query');
	if (!queryInput) return;

	// ファイル名の入力を求める（デフォルト値: query）
	let fileName = prompt('保存するファイル名を入力してください:', 'query');
	
	// キャンセルされた場合は処理を中断
	if (fileName === null) return;

	// 空文字の場合はデフォルト名を設定
	fileName = fileName.trim() || 'query';

	// .txt 拡張子が付いていない場合は補完する
	if (!fileName.endsWith('.txt')) {
		fileName += '.txt';
	}

	const content = queryInput.value;
	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = fileName; // 入力されたファイル名を設定
	document.body.appendChild(a);
	a.click();

	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function onlyURL(){
    const urlInput = document.getElementById('url');
    const finalUrl = urlInput.value;
    window.open(finalUrl, '_blank');
}

function openURL(){
    const urlInput = document.getElementById('url');
    const queryInput = document.getElementById('query');
    const encodedQuery = encodeURI(queryInput.value);
    const finalUrl = urlInput.value + encodedQuery;
    window.open(finalUrl, '_blank');
}

// 行数をカウントして問題数(input)に設定する関数
function countLines() {
  const txtdata = document.getElementById("txtdata").value;
  
  // 改行で分割して配列にする
  const lines = txtdata.split('\n');
  
  // 空白を除いた純粋な問題行だけを数える場合（おすすめ）
  const validLines = lines.filter(line => line.trim() !== "");
  
  // もし空行も含めて完全に改行の数で数えたい場合は、下の1行のコメントアウトを解除
  // const validLines = lines;

  // 問題数のinputに件数を反映
  document.getElementById("RANDOM").value = validLines.length;
}

// 文字列の半角換算での長さを返す関数（全角=2, 半角=1）
function getByteLength(str) {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    // シフトJIS換算などで全角になる文字コードの判定（簡易版）
    if (str.charCodeAt(i) >= 0x0020 && str.charCodeAt(i) <= 0x007e) {
      length += 1; // 半角
    } else {
      length += 2; // 全角
    }
  }
  return length;
}

// 最長行の文字数を判定して、(最長値 + 5) + "ch" をinputに代入する関数
function setMaxLength() {
  const txtdata = document.getElementById("txtdata").value;
  const lines = txtdata.split('\n');
  
  let maxLen = 0;
  
  // 各行の長さを半角換算で比較し、最大のものを探す
  lines.forEach(line => {
    const currentLen = getByteLength(line);
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  });

  // 数値 + 5 に "ch" をつける
  const resultWidth = (maxLen + 5) + "ch";
  // 文字幅のinputに代入
  document.getElementById("WIDTH").value = resultWidth;
}
