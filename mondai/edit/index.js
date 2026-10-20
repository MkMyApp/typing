function mkURL() {
	const groups = document.querySelectorAll('.form-group');
	let baseUrl = 'mkrand.html';
	const params = [];

	groups.forEach(group => {
		const btn = group.querySelector('.custom-btn');
		// input または textarea を取得
		const input = group.querySelector('.custom-input, .custom-textarea');
		if (!btn || !input) return;

		const key = btn.textContent.trim();
		const val = input.value.trim();

		if (key === 'URL') {
			if (val !== '') {
				baseUrl = val;
			}
		} else {
			if (val !== '') {
				params.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
			}
		}
	});

	let finalUrl = baseUrl;
	if (params.length > 0) {
		finalUrl += '?' + params.join('&');
	}

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
