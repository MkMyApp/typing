// 循環させる色のリスト（初期色 -> 赤 -> 青 -> 緑 -> オレンジ -> ピンク -> 透過）
const COLOR_PALETTE = [
    { bg: "#f0f0f0",    fg: "#000000" }, // 0: 初期状態
    { bg: "#F00",       fg: "#FFFFFF" }, // 1: 赤
    { bg: "#00F",       fg: "#FFFFFF" }, // 2: 青
    { bg: "#3A5",       fg: "#FFFFFF" }, // 3: 緑
    { bg: "#F60",       fg: "#FFFFFF" }, // 4: オレンジ
    { bg: "#F29",       fg: "#FFFFFF" }, // 5: ピンク
    { bg: "#f0f0f0", fg: "transparent" }, // 6: 透過
];

// RGB値 / 16進数を判定用カラーコードに変換する関数
function rgbToHex(colorStr) {
    if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") return "TRANSPARENT";
    if (colorStr.startsWith("#")) {
        let hex = colorStr.toUpperCase();
        if (hex.length === 4) {
            hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex;
    }
    const matches = colorStr.match(/\d+/g);
    if (!matches || matches.length < 3) return colorStr.toUpperCase();
    const r = parseInt(matches[0]).toString(16).padStart(2, '0').toUpperCase();
    const g = parseInt(matches[1]).toString(16).padStart(2, '0').toUpperCase();
    const b = parseInt(matches[2]).toString(16).padStart(2, '0').toUpperCase();
    return `#${r}${g}${b}`;
}

// クリックイベントのリスナーを設定する関数
window.enableKeyClickToggle = function() {
    const buttons = document.querySelectorAll('.KB button:not([id])');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentBgHex = rgbToHex(btn.style.backgroundColor || "#F0F0F0");
            
            // 現在の文字色を取得（指定がない場合は初期値の黒）
            const rawFg = btn.style.color || "#000000";
            const currentFgIsTransparent = (rawFg === "transparent" || rawFg === "rgba(0, 0, 0, 0)");

            // 背景色と文字色の両方を正確に判定する
            let currentIndex = COLOR_PALETTE.findIndex(p => {
                const bgMatch = rgbToHex(p.bg) === currentBgHex;
                
                // パレット側が transparent の場合は、要素も transparent か判定
                // パレット側が 通常色の場合は、要素が transparent でないか判定
                const fgMatch = (p.fg === "transparent") 
                    ? currentFgIsTransparent 
                    : !currentFgIsTransparent;

                return bgMatch && fgMatch;
            });

            if (currentIndex === -1) {
                currentIndex = 0;
            }

            const nextIndex = (currentIndex + 1) % COLOR_PALETTE.length;
            const nextColor = COLOR_PALETTE[nextIndex];

            btn.style.backgroundColor = nextColor.bg;
            btn.style.color = nextColor.fg;
        });
    });
};