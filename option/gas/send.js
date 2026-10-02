// 任意の桁数のランダムなIDを生成
function generateUserId(rndLength = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < rndLength; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomStr;
}

// ユーザーIDを取得または新規生成する関数
function getUserId() {
    const key = 'mytypeID';
    let userId = localStorage.getItem(key);
    
    // 記憶されていなければ新規生成して保存
    if (!userId) {
        userId = generateUserId(8);
        localStorage.setItem(key, userId);
    }
    
    return userId;F
}

// データ送信
function handleSendClick() {
    // タイピング結果のデータを取得
    const currentFileName = window.location.pathname.split("/").pop() || "unknown";
    const sec = (endTime - startTime) / 1000;
    const cpm = sec > 0 ? Math.round(totalChars / sec * 60) : 0;
    const accuracy = targetLengthTotal > 0 ? Math.round(correctChars / targetLengthTotal * 100) : 0;
    const sendStr = `${getUserId()},${currentFileName},${totalChars},${sec.toFixed(2)},${cpm},${accuracy}`;

		//const deployId = "デプロイID";
		const deployId = window.prompt("コピーしたデプロイIDを貼り付けてください", "");
		const gasUrl = `https://script.google.com/macros/s/${deployId}/exec`;

// Fetch APIで文字列をそのまま送信
    fetch(gasUrl, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: sendStr
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.status === "success") {
            alert(`【送信成功！】\nスプレッドシートにデータが蓄積されました。\n送信内容: "${sendStr}"`);
        } else {
            alert(`【サーバーエラー】\nGAS側で失敗しました:\n${result.message}`);
        }
    })
    .catch(error => {
        alert(`【通信エラー】\n送信に失敗しました。\n原因: ${error.message}`);
    });

} //データ送信末端

// ==================================================
//  タイピング結果表示（終了時など）をフックする処理
// ==================================================
if (typeof showFinalResult === 'function') {
  const originalShowFinalResult = showFinalResult;
  showFinalResult = function() {
    originalShowFinalResult();
    handleSendClick();
  };
}
