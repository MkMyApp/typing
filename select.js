'use strict'

const iframeElement = document.getElementById('type');

// 各カテゴリーのリスト
const englishFiles = [
'God Save the King.html',
'The Star-Spangled Banner.html',
'形容詞.html',
'人名.html',
'聖者の行進.html',
'代名詞.html',
'動詞.html',
'Michael, Row the Boat Ashore.html',
'Ten Little Indians Boys.html',
'Twinkle, Twinkle, Little Star.html',
].map(file => 'english/' + file);

const kanjiFiles = [
'多くの狼.html',
'君が代.html',
'いかのおすし.html',
'仏教の五戒.html',
'ハムレット.html',
'茶摘み.html',
'さくらさくら.html',
'教育略語.html',
'会津十の掟.html',
'奥の細道.html',
'モーセの十戒.html',
'敦盛（幸若舞より）.html',
'東海道線.html',
'徒然草.html',
'枕草子_夏.html',
'枕草子_秋.html',
'枕草子_春.html',
'枕草子_冬.html',
'我が輩は猫である.html',
].map(file => 'kanji/' + file);

const hiraganaFiles = [
'おおくのおおかみ.html',
'きみがよ.html',
'はるがきた.html',
'たきび.html',
'かたつむり.html',
'こぎつね.html',
'あめふり.html',
'たなばたさま.html',
].map(file => 'hiragana/' + file);

const kisoFiles = [
'kana14.html',
'kana12.html',
'kana13.html',
'フェーズ７.html',
'フェーズ６.html',
].map(file => 'kiso/' + file);

const phraseFiles = [
'ひらけゴマ.html',
'アブラカダブラ.html',
].map(file => 'phrase/' + file);

// 5つの配列をすべて結合
const menuList = englishFiles.concat(kanjiFiles, hiraganaFiles, kisoFiles,phraseFiles);

// 2. 配列の長さに合わせてインデックスを取得
    const index = Math.floor(Math.random() * menuList.length);
//  const index = new Date().getDate() % menuList.length;
//  const index = new Date().getDate() % menuList.length;
//  const index = new Date().getHours() % menuList.length;
//  const index = new Date().getMinutes() % menuList.length;
//  const index = new Date().getSeconds() % menuList.length;

// 3. 配列からファイル名を取り出して src に代入
iframeElement.src = menuList[index];
