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

  if (typeof box_x !== 'undefined') {
    rootStyle.setProperty('--box-chars', box_x)
  }
  if (typeof box_y !== 'undefined') {
    rootStyle.setProperty('--box-lines', box_y)
  }
  if (typeof font !== 'undefined') {
    rootStyle.setProperty('--box-font-size', font)
  }

  // mode による配置と非表示の切り替え
  if (typeof mode !== 'undefined') {
    // #target と #editor を包むコンテナ要素を取得または作成
    let container = document.getElementById('box-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'box-container'
      targetEl.parentNode.insertBefore(container, targetEl)
      container.appendChild(targetEl)
      container.appendChild(editorEl)
    }

    // Flexboxをベースにして切り替える
    container.style.display = 'flex'
    container.style.justifyContent = 'center'
    container.style.alignItems = 'center'

    if (mode === 'horizontal') {
      container.style.flexDirection = 'row' // 横並び
      container.style.gap = '20px'
    } else {
      container.style.flexDirection = 'column' // 縦並び
      container.style.gap = '10px'
    }

    // mode が 'test' でない場合は #txtdata を非表示にする[cite: 3]
    if (mode !== 'test') {
      txtdataEl.style.display = 'none'
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

init()