function joinQuery() {
	const queryInput = document.getElementById('query');
	const groups = document.querySelectorAll('.form-group');
	let baseUrl = '';
	const params = [];

	groups.forEach(group => {
		const btn = group.querySelector('.custom-btn');
		const input = group.querySelector('.custom-input, .custom-textarea');
		if (!btn || !input) return;

		const key = btn.textContent.trim();
		let val = input.value;

		if (key === 'query') return;

		if (key === 'URL') {
			if (val.trim() !== '') {
				baseUrl = val.trim();
			}
		} else {
			if (val !== '') {
				// 改行コードのみを %0A に置換（日本語などはそのまま保持）
				const formattedVal = val.replace(/\r?\n/g, '%0A');
				params.push(key + '=' + formattedVal);
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

// クエリ文字列をクリア
function clearQuery() {
	const queryInput = document.getElementById('query');
	if (queryInput) {
			queryInput.value = "";
	}
}

// 安全にデコードを行う補助関数
function safeDecode(str) {
	try {
		return decodeURIComponent(str);
	} catch (e) {
		try {
			return decodeURI(str);
		} catch (err) {
			// 例外時は unescape でデコード（非常用）
			return unescape(str);
		}
	}
}

// queryに入力されているエンコード済み文字列をデコードして、queryに書き戻す関数
function decodeQuery() {
	const queryInput = document.getElementById('query');
	if (!queryInput || !queryInput.value.trim()) return;

	let queryString = queryInput.value.trim();

	// '?' が含まれている場合、'?' より前のドメインやパスを削除する
	const questionMarkIndex = queryString.indexOf('?');
	if (questionMarkIndex !== -1) {
		queryString = queryString.substring(questionMarkIndex);
	}

	// '&' で各パラメータに分割
	const parts = queryString.split('&');

	const decodedParts = parts.map(part => {
		const equalIndex = part.indexOf('=');
		if (equalIndex === -1) {
			// '=' が含まれない部分（例: 先頭の '?t' など）
			return safeDecode(part);
		}

		const key = part.substring(0, equalIndex);
		const val = part.substring(equalIndex + 1);

		// 値（val）部分のみを安全にデコードして結合
		return key + '=' + safeDecode(val);
	});

	// デコード済みの文字列を結合して query に書き戻す
	queryInput.value = decodedParts.join('&');
}

// クエリ文字列を解析して各入力項目に再設定する関数
function parseQuery() {
	const queryInput = document.getElementById('query');
	if (!queryInput || !queryInput.value.trim()) return;

	let queryString = queryInput.value.trim();

	if (queryString.startsWith('?') || queryString.startsWith('&')) {
		queryString = queryString.substring(1);
	}

	const paramPairs = queryString.split('&');
	const queryMap = {};

	paramPairs.forEach(pair => {
		if (!pair) return;
		const equalIndex = pair.indexOf('=');
		if (equalIndex !== -1) {
			const key = pair.substring(0, equalIndex);
			const val = pair.substring(equalIndex + 1);
			
			// %0A（および %0a）を改行コード \n に置換して保持
			queryMap[key] = val.replace(/%0a/gi, '\n');
		} else {
			queryMap[pair] = '';
		}
	});

	const groups = document.querySelectorAll('.form-group');
	groups.forEach(group => {
		const btn = group.querySelector('.custom-btn');
		const input = group.querySelector('.custom-input, .custom-textarea');
		if (!btn || !input) return;

		const key = btn.textContent.trim();

		if (key === 'query') return;

		if (Object.prototype.hasOwnProperty.call(queryMap, key)) {
			input.value = queryMap[key];
		}
	});
}

// query の内容を ファイル選択ダイアログを表示して保存する関数
async function saveQuery() {
	const queryInput = document.getElementById('query');
	if (!queryInput) return;

	// id="title" から値を取得（空の場合は 'query' をデフォルトにする）
	const titleInput = document.getElementById('title');
	let defaultName = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'query';

	// 末尾に .txt が付いていなければ追加
	if (!defaultName.endsWith('.txt')) {
		defaultName += '.txt';
	}

	const content = queryInput.value;

	// FileSystem Access API (showSaveFilePicker) が使える場合
	if ('showSaveFilePicker' in window) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: defaultName,
				types: [{
					description: 'Text Files',
					accept: {
						'text/plain': ['.txt'],
					},
				}],
			});
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.error('保存処理中にエラーが発生しました:', err);
			}
		}
	} else {
		// 未対応環境用のフォールバック（プロンプト表示）
		let fileName = prompt('保存するファイル名を入力してください:', defaultName);
		if (fileName === null) return;

		fileName = fileName.trim() || 'query';
		if (!fileName.endsWith('.txt')) {
			fileName += '.txt';
		}

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
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
