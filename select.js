'use strict'

  const MENU_COUNT = 4;
	const iframeElement = document.getElementById('type');
  	const index = Math.floor(Math.random() * MENU_COUNT);
//  const index = new Date().getDate() % MENU_COUNT;
//  const index = new Date().getDate() % MENU_COUNT;
//  const index = new Date().getHours() % MENU_COUNT;
//  const index = new Date().getMinutes() % MENU_COUNT;
//  const index = new Date().getSeconds() % MENU_COUNT;

switch (index) {
    case 0:
        iframeElement.src = 'english/ABC大文字.html';
        break;
    case 1:
        iframeElement.src = 'kiso/フェーズ１.html';
        break;
    case 2:
        iframeElement.src = 'kiso/kana01.html';
        break;
    case 3:
        iframeElement.src = 'hiragana/いろはうた.html';
        break;
	}
