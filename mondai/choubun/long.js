'use strict'

const txtdataEl = document.getElementById('txtdata')
const targetEl  = document.getElementById('target')
const editorEl  = document.getElementById('editor')
const resultEl  = document.getElementById('result')

let targetText = ''
let startTime = 0
let isStarted = false
let isFinished = false

function applyBoxConfig() {
  const rootStyle = document.documentElement.style

  // 言語モード（lang）による折り返しスタイルの切り替え
  const boxes = [txtdataEl, targetEl, editorEl]
  const isEnglish = (typeof lang !== 'undefined' && lang === 'e')

  boxes.forEach(box => {
    if (box) {
      box.style.wordBreak = isEnglish ? 'normal' : 'break-all'
      box.style.overflowWrap = isEnglish ? 'break-word' : 'normal'
    }
  })

  // フォントサイズの設定（未設定時はデフォルト20px）
  const fontSizePx = (typeof font !== 'undefined') ? parseFloat(font) : 20
  rootStyle.setProperty('--box-font-size', (typeof font !== 'undefined') ? font : '20px')

  // 1ch（半角1文字の目安幅 ≒ fontSize * 0.6）と 1lh（行高 ≒ fontSize * 1.5）から幅・高さをピクセル計算
  if (typeof box_x !== 'undefined') {
    const chWidth = fontSizePx * 0.6
    const calculatedWidth = Math.round(box_x * chWidth + 30) // パディング左右15px * 2
    rootStyle.setProperty('--box-width', `${calculatedWidth}px`)
  }

  if (typeof box_y !== 'undefined') {
    const lineHeight = fontSizePx * 1.5
    const calculatedHeight = Math.round(box_y * lineHeight + 30) // パディング上下15px * 2
    rootStyle.setProperty('--box-height', `${calculatedHeight}px`)
  }

  // mode による配置と非表示の切り替え
  if (typeof mode !== 'undefined') {
    let container = document.getElementById('box-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'box-container'
      targetEl.parentNode.insertBefore(container, targetEl)
      container.appendChild(targetEl)
      container.appendChild(editorEl)
    }

    container.style.display = 'flex'
    container.style.justifyContent = 'center'
    container.style.alignItems = 'center'

    if (mode === 'h') {
      container.style.flexDirection = 'row'
      container.style.gap = '20px'
    } else {
      container.style.flexDirection = 'column'
      container.style.gap = '10px'
    }

    if (mode === 't') {
			txtdataEl.style.display = 'block'
			targetEl.style.display = 'none'
			editorEl.style.display = 'none'
    } else {
			txtdataEl.style.display = 'none'
			targetEl.style.display = 'block'
			editorEl.style.display = 'block'
    }
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function colorize() {
  const answer = [...targetText]
  const user = [...editorEl.value]
  let html = ''

  for (let i = 0; i < answer.length; i++) {
    const ca = answer[i]
    const cu = user[i]
    let cls = 'char-default'

    if (cu !== undefined) {
      cls = (cu === ca) ? 'char-correct' : 'char-wrong'
    }
    html += `<span class="${cls}">${esc(ca)}</span>`
  }
  targetEl.innerHTML = html
}

function resetToStart() {
  isStarted = false
  isFinished = false
  editorEl.disabled = false
  
  targetText = txtdataEl.value.trim()
  resultEl.textContent = `${targetText.length}ch`
  editorEl.value = ''
  editorEl.placeholder = 'キーを押すとスタート\nShift+Enterで完了'

  colorize()
  editorEl.focus()
}

function startTyping() {
  isStarted = true
  isFinished = false
  editorEl.placeholder = '測定中 ESCキーでリセット'
  startTime = performance.now()
}

function finish() {
  isStarted = false
  isFinished = true
  const endTime = performance.now()
  const sec = (endTime - startTime) / 1000
  const userText = editorEl.value
  
  let correctChars = 0
  const minLen = Math.min(targetText.length, userText.length)
  for (let i = 0; i < minLen; i++) {
    if (targetText[i] === userText[i]) correctChars++
  }

  const accuracy = targetText.length > 0 
    ? Math.round((correctChars / targetText.length) * 100) 
    : 0
  const cpm = sec > 0 ? Math.round((userText.length / sec) * 60) : 0

  resultEl.textContent = `${userText.length}ch ${sec.toFixed(1)}sec  ${accuracy}% ${cpm}cpm`
  editorEl.focus()
}

txtdataEl.addEventListener('input', () => {
  targetText = txtdataEl.value.trim()
  colorize()
})

editorEl.addEventListener('input', () => {
  // 文字入力があった瞬間に未スタートなら自動で計測開始
  if (!isStarted && !isFinished) {
    startTyping()
  }

  if (isStarted) {
    colorize()
  }
})

editorEl.addEventListener('keydown', e => {
  if (e.isComposing || e.keyCode === 229) return

  // 2. Esc キーでリスタート
  if (e.key === 'Escape') {
    e.preventDefault()
    resetToStart()
  }

  // 1. タイピング中：Shift+Enter で判定終了
  if (isStarted) {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      finish()
      return
    }
  }
})

function init() {
  applyBoxConfig()
  resetToStart()
}

// #txtdata のリサイズを監視して box_x / box_y 換算で表示
const resizeObserver = new ResizeObserver(() => {
  // フォントサイズと行高を取得
  const computed = window.getComputedStyle(txtdataEl)
  const fontSize = parseFloat(computed.fontSize) || 20
  const lineHeight = parseFloat(computed.lineHeight) || (fontSize * 1.5)

  // パディング（上下左右各15px）を引いた実質コンテンツ幅・高さを取得
  const contentWidth = txtdataEl.clientWidth - 30
  const contentHeight = txtdataEl.clientHeight - 30

  // 1ch (半角1文字幅 ≒ fontSize * 0.6) と 1lh (1行高) で割り算
  const chWidth = fontSize * 0.6
  const boxX = Math.round(contentWidth / chWidth)
  const boxY = Math.round(contentHeight / lineHeight)

  resultEl.textContent = `box_x = ${boxX}; box_y = ${boxY};`
})

if (mode === 't') {resizeObserver.observe(txtdataEl)}
init()

