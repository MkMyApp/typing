'use strict'

const titleEl  = document.getElementById('title')
const targetEl = document.getElementById('target')
const editorEl = document.getElementById('editor')
const resultEl = document.getElementById('result')

let words = []
let schedule = []
let qIndex = 0

let currentWord = ''
let correct = 0
let correctChars = 0
let targetLengthTotal = 0
let total = 0
let limit = 0

let startTime = 0
let endTime = 0
let totalChars = 0

let typeStarted = false
let composing = false
let finished = false

function esc(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function typed(){
  return editorEl.value.replace(/\n/g, '')
}

function updateScore(color = ''){
  resultEl.textContent = `${correct} / ${qIndex} / ${limit}`
  resultEl.style.color = color
}

function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function colorize(answer, user){
  const a = [...answer]
  const u = [...user]

  let html = ''

  for(let i = 0; i < a.length; i++){
    const ca = a[i]
    const cu = u[i]

    let color = 'black'
    if(cu !== undefined){
      color = (cu === ca) ? 'blue' : 'red'
    }

    html += `<span style="color:${color}">${esc(ca)}</span>`
  }

  targetEl.innerHTML = html
}

function showStart(){
  targetEl.textContent = START_MSG
  targetEl.style.textAlign = 'center'

  editorEl.value = ''
  editorEl.placeholder = INPUT_MSG
  editorEl.style.textAlign = 'center'
  
  correct = 0
  total = 0
  qIndex = 0
  updateScore()

  editorEl.focus()
}
function buildSchedule(){
  const list = words.map((_, i) => i)

  if(RANDOM > 0){
    shuffle(list)
    return list.slice(0, Math.min(RANDOM, words.length))
  }

  return list
}

function showFinalResult(){
  const sec = (endTime - startTime) / 1000
  const cpm = sec > 0 ? Math.round(totalChars / sec * 60) : 0

  resultEl.textContent = `${totalChars}ch  ${Math.round(sec)}sec  ${cpm}cpm`
  resultEl.style.color = ''

  targetEl.style.textAlign = 'center'
  
  const accuracy = targetLengthTotal > 0 
    ? Math.round(correctChars / targetLengthTotal * 100) : 0
  targetEl.textContent = `${accuracy}%`

  editorEl.style.textAlign = 'center'
  editorEl.value = START_MSG
}

function nextWord(){
  if(qIndex >= schedule.length){
    typeStarted = false
    finished = true
    endTime = performance.now()

    showFinalResult()

    editorEl.placeholder = ''
    editorEl.style.textAlign = 'center'
    editorEl.focus()
    return
  }

  currentWord = words[schedule[qIndex]]
  qIndex++

  editorEl.value = ''
  colorize(currentWord, '')

  targetEl.style.textAlign = 'left'
  editorEl.style.textAlign = 'left'
  editorEl.focus()
}

function startType(){
  finished = false
  editorEl.placeholder = ''
  schedule = buildSchedule()
  limit = schedule.length
  qIndex = 0
  correct = 0
  correctChars = 0
  targetLengthTotal = 0
  total = 0
  totalChars = 0
  startTime = performance.now()

  updateScore()

  typeStarted = true
  nextWord()
}

function judgeCurrentWord(){
  const userTyped = typed()
  const targetWord = currentWord
  const u = [...userTyped]
  const a = [...targetWord]

  let currentCorrectChars = 0

  for(let i = 0; i < u.length; i++){
    if(u[i] === a[i]){
      currentCorrectChars++
    }
  }

  total++
  totalChars += u.length
  
  targetLengthTotal += Math.max(u.length, a.length)
  correctChars += currentCorrectChars

  if(userTyped === targetWord){
    correct++
    updateScore('#8080f0')
  }else{
    updateScore('#f08080')
  }

  nextWord()
}

function loadWords(text){
  words = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

function init(){
  let TITLE = document.title
  titleEl.textContent = TITLE
  document.documentElement.style.setProperty('--line-width', WIDTH)

  loadWords(document.getElementById('txtdata').value)

  if(RANDOM > 0){
    limit = Math.min(RANDOM, words.length)
  }else{
    limit = words.length
  }

  showStart()

  setTimeout(() => editorEl.focus(), 0)
}

editorEl.addEventListener('compositionstart', () => {
  composing = true
})

editorEl.addEventListener('compositionend', () => {
  composing = false
  if(typeStarted){
    colorize(currentWord, typed())
  }
})

editorEl.addEventListener('input', () => {
  if(!typeStarted || composing) return
  colorize(currentWord, typed())
})

editorEl.addEventListener('keydown', e => {
  if(e.key !== 'Enter' || e.isComposing) return

  e.preventDefault()

  if(finished){
    finished = false
    showStart()
    return
  }

  if(!typeStarted){
    startType()
    editorEl.value = ''
    return
  }

  judgeCurrentWord()
})

init()