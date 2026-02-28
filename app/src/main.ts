import './style.css'

// ── Types ────────────────────────────────────────────────────────────────────

interface Round {
  small: number
  big: number
  minutes: number
}

type Status = 'idle' | 'running' | 'paused' | 'finished'

// ── Default config ───────────────────────────────────────────────────────────

const DEFAULT_ROUNDS: Round[] = [
  { small:   50, big:   100, minutes: 20 },
  { small:  100, big:   200, minutes: 20 },
  { small:  200, big:   400, minutes: 20 },
  { small:  400, big:   800, minutes: 20 },
  { small:  800, big:  1600, minutes: 20 },
  { small: 1600, big:  3200, minutes: 20 },
]

// ── State ────────────────────────────────────────────────────────────────────

let rounds: Round[]        = DEFAULT_ROUNDS.map(r => ({ ...r }))
let roundIndex: number     = 0
let timeLeft: number       = rounds[0].minutes * 60
let status: Status         = 'idle'
let gameNumber: number     = 1
let warningFired: boolean  = false
let intervalId: number | null = null

// Queued blind announcement: fires on next Start, not immediately.
// True on fresh game start (idle) and after Next Round is pressed.
let pendingBlindAnnouncement: boolean = true

// ── DOM refs ─────────────────────────────────────────────────────────────────

const elGameNumber    = document.getElementById('game-number')!
const elRoundNumber   = document.getElementById('round-number')!
const elTotalRounds   = document.getElementById('total-rounds')!
const elSmallBlind    = document.getElementById('small-blind')!
const elBigBlind      = document.getElementById('big-blind')!
const elNextBlinds    = document.getElementById('next-blinds')!
const elNextSmall     = document.getElementById('next-small')!
const elNextBig       = document.getElementById('next-big')!
const elCountdown     = document.getElementById('countdown')!
const elClockProgress = document.getElementById('clock-progress') as unknown as SVGCircleElement

const CIRCUMFERENCE = 2 * Math.PI * 85  // 534.07

const elTbody       = document.getElementById('rounds-tbody')!
const btnStartPause = document.getElementById('btn-start-pause') as HTMLButtonElement
const btnReset      = document.getElementById('btn-reset')       as HTMLButtonElement
const btnNext       = document.getElementById('btn-next')        as HTMLButtonElement

// ── Audio ────────────────────────────────────────────────────────────────────

const audioCtx = new AudioContext()

function playTone(frequency: number, duration: number, gain = 0.3) {
  const osc = audioCtx.createOscillator()
  const vol = audioCtx.createGain()
  osc.connect(vol)
  vol.connect(audioCtx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
  vol.gain.setValueAtTime(gain, audioCtx.currentTime)
  vol.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

function playStart() {
  playTone(523, 0.2)                            // C5
  setTimeout(() => playTone(659, 0.3), 180)     // E5
  setTimeout(() => playTone(784, 0.5), 360)     // G5
}

function playPause() {
  playTone(440, 0.4)                            // A4
}

// ── Speech ───────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.95
  window.speechSynthesis.speak(utt)
}

function announceCurrentBlinds() {
  const cur = rounds[roundIndex]
  speak(`Blinds are ${cur.small} and ${cur.big}.`)
}

function announceWarning() {
  const next = rounds[roundIndex + 1]
  if (!next) return
  speak(`Attention. Blinds are going up to ${next.small} and ${next.big} in one minute.`)
}

function announceIncrease() {
  const cur = rounds[roundIndex]
  speak(`Blinds have increased to ${cur.small} and ${cur.big}.`)
}

// ── Render ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function renderRoundsTable() {
  elTbody.innerHTML = ''
  rounds.forEach((r, i) => {
    const tr = document.createElement('tr')
    if (i === roundIndex) tr.classList.add('active')
    if (i < roundIndex)  tr.classList.add('done')
    tr.innerHTML = `<td>${i + 1}</td><td>${r.small}</td><td>${r.big}</td><td>${r.minutes}</td>`
    elTbody.appendChild(tr)
  })
}

function renderUI() {
  const cur   = rounds[roundIndex]
  const next  = rounds[roundIndex + 1]
  const total = cur.minutes * 60

  elGameNumber.textContent  = String(gameNumber)
  elRoundNumber.textContent = String(roundIndex + 1)
  elTotalRounds.textContent = String(rounds.length)
  elSmallBlind.textContent  = String(cur.small)
  elBigBlind.textContent    = String(cur.big)
  elCountdown.textContent   = formatTime(timeLeft)

  // Clock ring
  const pct = total > 0 ? (timeLeft / total) * 100 : 0
  elClockProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct / 100))
  elClockProgress.classList.toggle('warning', pct <= 25)
  elClockProgress.classList.toggle('paused', status === 'paused')

  // Next blinds
  if (next) {
    elNextBlinds.style.visibility = 'visible'
    elNextSmall.textContent = String(next.small)
    elNextBig.textContent   = String(next.big)
  } else {
    elNextBlinds.style.visibility = 'hidden'
  }

  // Buttons
  btnStartPause.disabled    = status === 'finished'
  btnStartPause.textContent = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'
  btnStartPause.classList.toggle('running', status === 'running')
  btnReset.disabled = status === 'running'
  btnNext.disabled  = status === 'finished'

  renderRoundsTable()
}

// ── Timer logic ───────────────────────────────────────────────────────────────

function tick() {
  if (timeLeft > 0) {
    timeLeft--

    // 1-minute warning
    if (timeLeft === 60 && !warningFired && roundIndex < rounds.length - 1) {
      warningFired = true
      announceWarning()
    }
  } else {
    advanceRound()
  }
  renderUI()
}

function advanceRound() {
  if (roundIndex < rounds.length - 1) {
    roundIndex++
    timeLeft     = rounds[roundIndex].minutes * 60
    warningFired = false
    announceIncrease()  // automatic advance always announces immediately
  } else {
    stopTimer()
    status = 'finished'
    speak('The game is over. Well played!')
  }
}

function startTimer() {
  if (intervalId !== null) return
  intervalId = window.setInterval(tick, 1000)
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// ── Button handlers ───────────────────────────────────────────────────────────

btnStartPause.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume()

  if (status === 'running') {
    status = 'paused'
    stopTimer()
    playPause()
  } else {
    status = 'running'
    startTimer()
    playStart()
    // Announce current blinds if this is a fresh start or after Next was pressed
    if (pendingBlindAnnouncement) {
      announceCurrentBlinds()
      pendingBlindAnnouncement = false
    }
  }
  renderUI()
})

btnReset.addEventListener('click', () => {
  stopTimer()
  rounds       = DEFAULT_ROUNDS.map(r => ({ ...r }))
  roundIndex   = 0
  timeLeft     = rounds[0].minutes * 60
  status       = 'idle'
  warningFired = false
  gameNumber++
  pendingBlindAnnouncement = true  // announce blinds on next Start, not now
  renderUI()
})

btnNext.addEventListener('click', () => {
  if (roundIndex < rounds.length - 1) {
    roundIndex++
    timeLeft     = rounds[roundIndex].minutes * 60
    warningFired = false
    pendingBlindAnnouncement = true  // announce on next Start, not immediately
    renderUI()
  }
})

// ── Init ──────────────────────────────────────────────────────────────────────

renderUI()
