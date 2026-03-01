import './style.css'
import { z } from 'zod'

// ── Types ────────────────────────────────────────────────────────────────────

interface Round {
  small: number
  big: number
  duration: number  // total seconds
}

interface SoundSettings {
  speakStart:     boolean   // announce blinds at start of game/round
  playWarnRiff:   boolean   // play riff.mp3 at 1-minute warning
  warnSpeak:      boolean   // speak 1-minute warning
  playSiren:      boolean   // play siren.mp3 when blinds go up
  speakIncrease:  boolean   // speak when blinds go up
  countdownBlip:  boolean   // blip each second in the last 10 seconds
}

type Status = 'idle' | 'running' | 'paused'

// ── Default config ───────────────────────────────────────────────────────────

const DEFAULT_ROUNDS: Round[] = [
  { small:   50, big:   100, duration:  7 * 60 },
  { small:  100, big:   200, duration:  7 * 60 },
  { small:  200, big:   400, duration:  7 * 60 },
  { small:  400, big:   800, duration:  7 * 60 },
  { small:  800, big:  1600, duration: 15 * 60 },
  { small: 1600, big:  3200, duration: 15 * 60 },
]

// ── State ────────────────────────────────────────────────────────────────────

let rounds: Round[]           = DEFAULT_ROUNDS.map(r => ({ ...r }))
let roundIndex: number        = 0
let timeLeft: number          = rounds[0].duration
let status: Status            = 'idle'
let gameNumber: number        = 1
let warningFired: boolean     = false
let intervalId: number | null = null
let pendingBlindAnnouncement: boolean = true

// Game settings
let endlessLastRound = true

// Sound settings
let soundSettings: SoundSettings = {
  speakStart:    true,
  playWarnRiff:  true,
  warnSpeak:     true,
  playSiren:     true,
  speakIncrease: true,
  countdownBlip: true,
}

// Edit-mode working copy
let editRounds: Round[] = []

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

const elEditTbody       = document.getElementById('edit-tbody')!
const elSettingsOverlay = document.getElementById('settings-overlay')!
const elVoiceSelect     = document.getElementById('voice-select') as HTMLSelectElement

const btnStartPause   = document.getElementById('btn-start-pause')   as HTMLButtonElement
const btnPrev         = document.getElementById('btn-prev')           as HTMLButtonElement
const btnReset        = document.getElementById('btn-reset')          as HTMLButtonElement
const btnNext         = document.getElementById('btn-next')           as HTMLButtonElement
const btnEditConfig   = document.getElementById('btn-edit-config')    as HTMLButtonElement
const btnSaveConfig   = document.getElementById('btn-save-config')    as HTMLButtonElement
const btnCancelConfig   = document.getElementById('btn-cancel-config')    as HTMLButtonElement
const btnResetConfig    = document.getElementById('btn-reset-config')     as HTMLButtonElement
const btnAddLevel       = document.getElementById('btn-add-level')        as HTMLButtonElement
const btnVoicePreview   = document.getElementById('btn-voice-preview')    as HTMLButtonElement

const chkEndlessLast = document.getElementById('chk-endless-last') as HTMLInputElement

const chkSpeakStart    = document.getElementById('chk-speak-start')    as HTMLInputElement
const chkWarnRiff      = document.getElementById('chk-warn-riff')      as HTMLInputElement
const chkWarnSpeak     = document.getElementById('chk-warn-speak')     as HTMLInputElement
const chkUpSiren       = document.getElementById('chk-up-siren')       as HTMLInputElement
const chkUpSpeak       = document.getElementById('chk-up-speak')       as HTMLInputElement
const chkCountdownBlip = document.getElementById('chk-countdown-blip') as HTMLInputElement

// ── Audio ────────────────────────────────────────────────────────────────────

const audioRiff  = new Audio('/riff.mp3')
const audioSiren = new Audio('/siren.mp3')

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

function playBlip() {
  playTone(880, 0.08, 0.2)                      // A5, short
}

// ── Speech ───────────────────────────────────────────────────────────────────

let selectedVoice: SpeechSynthesisVoice | null = null
let availableVoices: SpeechSynthesisVoice[]    = []
let savedVoiceName: string | null              = null

function speak(text: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.95
  if (selectedVoice) utt.voice = selectedVoice
  window.speechSynthesis.speak(utt)
}

function populateVoices() {
  availableVoices = window.speechSynthesis.getVoices()
    .filter(v => v.lang === 'en-GB' || v.lang === 'en-US')

  // Try to restore a saved voice
  if (savedVoiceName && !selectedVoice) {
    selectedVoice = availableVoices.find(v => v.name === savedVoiceName) ?? null
    if (selectedVoice) savedVoiceName = null
  }

  // Strip any "English (Locale)+" or bare "English (Locale)" prefix
  const friendlyName = (v: SpeechSynthesisVoice) => {
    const stripped = v.name.replace(/^English \([^)]+\)\+?/i, '').trim()
    return stripped || '(Default)'
  }

  elVoiceSelect.innerHTML = ''
  const def = document.createElement('option')
  def.value = ''
  def.textContent = '(Browser default)'
  elVoiceSelect.appendChild(def)

  const groups: Record<string, HTMLOptGroupElement> = {
    'en-US': Object.assign(document.createElement('optgroup'), { label: 'American' }),
    'en-GB': Object.assign(document.createElement('optgroup'), { label: 'British'  }),
  }

  // Sort alphabetically within each group; push nameless "(Default)" entries to the bottom
  const entries = availableVoices
    .map((v, i) => ({ v, i, label: friendlyName(v) }))
    .sort((a, b) => {
      const aDefault = a.label === '(Default)'
      const bDefault = b.label === '(Default)'
      if (aDefault !== bDefault) return aDefault ? 1 : -1
      return a.label.localeCompare(b.label)
    })

  entries.forEach(({ v, i, label }) => {
    const opt = document.createElement('option')
    opt.value = String(i)
    opt.textContent = label
    if (v.name === selectedVoice?.name) opt.selected = true
    groups[v.lang]?.appendChild(opt)
  })
  for (const grp of Object.values(groups)) {
    if (grp.children.length > 0) elVoiceSelect.appendChild(grp)
  }
}

const PREVIEW_TEXT = 'Blinds are 50 and 100.'

function updatePreviewBtn() {
  const playing = window.speechSynthesis.speaking && !window.speechSynthesis.paused
  btnVoicePreview.textContent = playing ? '⏹' : '▶'
  btnVoicePreview.classList.toggle('playing', playing)
}

function speakPreview() {
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(PREVIEW_TEXT)
  utt.rate = 0.95
  if (selectedVoice) utt.voice = selectedVoice
  utt.addEventListener('start', updatePreviewBtn)
  utt.addEventListener('end',   updatePreviewBtn)
  utt.addEventListener('error', updatePreviewBtn)
  window.speechSynthesis.speak(utt)
  updatePreviewBtn()
}

function announceCurrentBlinds() {
  if (!soundSettings.speakStart) return
  const cur = rounds[roundIndex]
  speak(`Blinds are ${cur.small} and ${cur.big}.`)
}

function announceWarning() {
  const next = rounds[roundIndex + 1]
  if (!next) return
  const doSpeak = () => {
    if (soundSettings.warnSpeak) {
      // Read timeLeft at speech time — accurate even after the riff has played
      const t = timeLeft
      const timePhrase = t >= 60 ? 'one minute' : `${t} seconds`
      speak(`Attention. Blinds are going up to ${next.small} and ${next.big} in ${timePhrase}.`)
    }
  }
  if (soundSettings.playWarnRiff) {
    audioRiff.currentTime = 0
    audioRiff.play().catch(() => {})
    audioRiff.addEventListener('ended', doSpeak, { once: true })
  } else {
    doSpeak()
  }
}

function announceIncrease() {
  const doSpeak = () => {
    if (soundSettings.speakIncrease) {
      const cur = rounds[roundIndex]
      speak(`Blinds have increased to ${cur.small} and ${cur.big}.`)
    }
  }
  if (soundSettings.playSiren) {
    audioSiren.currentTime = 0
    audioSiren.play().catch(() => {})
    audioSiren.addEventListener('ended', doSpeak, { once: true })
  } else {
    doSpeak()
  }
}

// ── LocalStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'poker-timer-config'

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    rounds,
    voiceName: selectedVoice?.name ?? null,
    soundSettings,
    endlessLastRound,
  }))
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const cfg = JSON.parse(raw)
    if (Array.isArray(cfg.rounds) && cfg.rounds.length > 0) {
      rounds   = cfg.rounds.map((r: any) => ({
        small:    r.small,
        big:      r.big,
        duration: r.duration ?? Math.round((r.minutes ?? 7) * 60),
      }))
      timeLeft = rounds[0].duration
    }
    if (cfg.voiceName) savedVoiceName = cfg.voiceName
    if (cfg.soundSettings && typeof cfg.soundSettings === 'object') {
      Object.assign(soundSettings, cfg.soundSettings)
    }
    if (typeof cfg.endlessLastRound === 'boolean') endlessLastRound = cfg.endlessLastRound
  } catch {}
}

// ── Render ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format a duration (seconds) as M:SS for the edit input */
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Parse "M:SS" or "MM:SS" or plain "M" (treated as whole minutes) → seconds.
 *  Returns null if the string is not a recognisable, valid time. */
function parseDuration(str: string): number | null {
  const colonMatch = str.trim().match(/^(\d{1,3}):(\d{1,2})$/)
  if (colonMatch) {
    const m = parseInt(colonMatch[1], 10)
    const s = parseInt(colonMatch[2], 10)
    if (s > 59) return null
    const total = m * 60 + s
    return total > 0 ? total : null
  }
  const minOnly = str.trim().match(/^(\d{1,3})$/)
  if (minOnly) {
    const m = parseInt(minOnly[1], 10)
    return m > 0 ? m * 60 : null
  }
  return null
}


function renderUI() {
  const cur   = rounds[roundIndex]
  const next  = rounds[roundIndex + 1]
  const total = cur.duration

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
  const isRunning        = status === 'running'
  const lastRoundDone    = !endlessLastRound && roundIndex >= rounds.length - 1 && timeLeft === 0
  btnStartPause.disabled    = lastRoundDone
  btnStartPause.textContent = isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'
  btnStartPause.classList.toggle('running', isRunning)
  btnPrev.disabled       = isRunning || roundIndex === 0
  const nothingToReset   = status === 'idle' && roundIndex === 0 && timeLeft === rounds[0].duration
  btnReset.disabled      = isRunning || nothingToReset
  btnNext.disabled       = roundIndex >= rounds.length - 1
  btnEditConfig.disabled = isRunning
}

// ── Validation ───────────────────────────────────────────────────────────────

const blindSchema    = z.coerce.number().int().min(1)
const durationSchema = z.string().refine(val => parseDuration(val) !== null, { message: 'Use M:SS' })

function validateInput(inp: HTMLInputElement): boolean {
  const field = inp.dataset.field
  let valid = true
  if (field === 'small' || field === 'big') {
    valid = blindSchema.safeParse(inp.value).success
  } else if (field === 'duration') {
    valid = durationSchema.safeParse(inp.value).success
  }
  inp.classList.toggle('is-invalid', !valid)
  return valid
}

function validateAllEditInputs(): boolean {
  const inputs = Array.from(elEditTbody.querySelectorAll<HTMLInputElement>('input[data-field]'))
  return inputs.map(validateInput).every(Boolean)
}

function syncSaveBtn() {
  btnSaveConfig.disabled = elEditTbody.querySelector('input.is-invalid') !== null
}

// ── Edit mode ────────────────────────────────────────────────────────────────

function renderEditTable() {
  elEditTbody.innerHTML = ''
  editRounds.forEach((r, i) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><input type="number" min="1" value="${r.small}" data-field="small" data-idx="${i}"></td>
      <td><input type="number" min="1" value="${r.big}"   data-field="big"   data-idx="${i}"></td>
      <td><input type="text" class="duration-input" value="${formatDuration(r.duration)}" data-field="duration" data-idx="${i}" placeholder="M:SS"></td>
      <td class="row-actions">
        <button class="btn-row-action" data-action="up"     data-idx="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn-row-action" data-action="down"   data-idx="${i}" ${i === editRounds.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="btn-row-action btn-delete" data-action="delete" data-idx="${i}" ${editRounds.length === 1 ? 'disabled' : ''}>✕</button>
      </td>`
    elEditTbody.appendChild(tr)
  })
  syncSaveBtn()
}

function flushEditInputs() {
  elEditTbody.querySelectorAll<HTMLInputElement>('input[data-idx]').forEach(inp => {
    const idx   = Number(inp.dataset.idx)
    const field = inp.dataset.field
    if (field === 'small' || field === 'big') {
      editRounds[idx][field] = Math.max(1, Number(inp.value) || 1)
    } else if (field === 'duration') {
      const parsed = parseDuration(inp.value)
      if (parsed !== null) editRounds[idx].duration = parsed
      // if invalid, leave the existing value unchanged
    }
  })
}

function openEditMode() {
  editRounds = rounds.map(r => ({ ...r }))
  renderEditTable()
  chkEndlessLast.checked = endlessLastRound
  chkSpeakStart.checked    = soundSettings.speakStart
  chkWarnRiff.checked      = soundSettings.playWarnRiff
  chkWarnSpeak.checked     = soundSettings.warnSpeak
  chkUpSiren.checked       = soundSettings.playSiren
  chkUpSpeak.checked       = soundSettings.speakIncrease
  chkCountdownBlip.checked = soundSettings.countdownBlip
  elSettingsOverlay.hidden = false
}

function closeEditMode() {
  elSettingsOverlay.hidden = true
}

// ── Timer logic ───────────────────────────────────────────────────────────────

function tick() {
  if (timeLeft > 0) {
    timeLeft--
    if (timeLeft <= 60 && !warningFired && roundIndex < rounds.length - 1 && rounds[roundIndex].duration > 60) {
      warningFired = true
      announceWarning()
    }
    const isLastRound = roundIndex >= rounds.length - 1
    if (timeLeft >= 1 && timeLeft <= 10 && soundSettings.countdownBlip && !(isLastRound && endlessLastRound)) {
      playBlip()
    }
  } else if (roundIndex < rounds.length - 1) {
    advanceRound()
  } else if (!endlessLastRound) {
    // Final round has run out and endless mode is off — freeze at 0:00
    stopTimer()
    status = 'paused'
  }
  // else: endless last round — keep running at 0:00
  renderUI()
}

function advanceRound() {
  roundIndex++
  timeLeft     = rounds[roundIndex].duration
  warningFired = false
  announceIncrease()
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
    if (pendingBlindAnnouncement) {
      announceCurrentBlinds()
      pendingBlindAnnouncement = false
    }
  }
  renderUI()
})

btnPrev.addEventListener('click', () => {
  if (roundIndex > 0) {
    roundIndex--
    timeLeft     = rounds[roundIndex].duration
    warningFired = false
    pendingBlindAnnouncement = true
    renderUI()
  }
})

btnReset.addEventListener('click', () => {
  stopTimer()
  roundIndex   = 0
  timeLeft     = rounds[0].duration
  status       = 'idle'
  warningFired = false
  gameNumber++
  pendingBlindAnnouncement = true
  renderUI()
})

btnNext.addEventListener('click', () => {
  if (roundIndex < rounds.length - 1) {
    roundIndex++
    timeLeft     = rounds[roundIndex].duration
    warningFired = false
    pendingBlindAnnouncement = true
    renderUI()
  }
})

btnEditConfig.addEventListener('click', openEditMode)

btnCancelConfig.addEventListener('click', closeEditMode)

btnResetConfig.addEventListener('click', () => {
  editRounds = DEFAULT_ROUNDS.map(r => ({ ...r }))
  renderEditTable()
  endlessLastRound       = true
  chkEndlessLast.checked = endlessLastRound
  soundSettings = { speakStart: true, playWarnRiff: true, warnSpeak: true, playSiren: true, speakIncrease: true, countdownBlip: true }
  chkSpeakStart.checked    = soundSettings.speakStart
  chkWarnRiff.checked      = soundSettings.playWarnRiff
  chkWarnSpeak.checked     = soundSettings.warnSpeak
  chkUpSiren.checked       = soundSettings.playSiren
  chkUpSpeak.checked       = soundSettings.speakIncrease
  chkCountdownBlip.checked = soundSettings.countdownBlip
})

btnSaveConfig.addEventListener('click', () => {
  if (!validateAllEditInputs()) return
  flushEditInputs()
  rounds     = editRounds.map(r => ({ ...r }))
  roundIndex = 0
  timeLeft   = rounds[0].duration
  status     = 'idle'
  warningFired = false
  pendingBlindAnnouncement = true
  saveConfig()
  closeEditMode()
  renderUI()
})

btnAddLevel.addEventListener('click', () => {
  flushEditInputs()
  const last = editRounds[editRounds.length - 1]
  editRounds.push({ small: last.small * 2, big: last.big * 2, duration: last.duration })
  renderEditTable()
})

elEditTbody.addEventListener('input', e => {
  const inp = (e.target as Element).closest<HTMLInputElement>('input[data-field]')
  if (inp) { validateInput(inp); syncSaveBtn() }
})

elEditTbody.addEventListener('click', e => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-action]')
  if (!btn) return
  const idx    = Number(btn.dataset.idx)
  const action = btn.dataset.action
  flushEditInputs()
  if (action === 'up' && idx > 0) {
    ;[editRounds[idx - 1], editRounds[idx]] = [editRounds[idx], editRounds[idx - 1]]
  } else if (action === 'down' && idx < editRounds.length - 1) {
    ;[editRounds[idx], editRounds[idx + 1]] = [editRounds[idx + 1], editRounds[idx]]
  } else if (action === 'delete' && editRounds.length > 1) {
    editRounds.splice(idx, 1)
  }
  renderEditTable()
})

elVoiceSelect.addEventListener('change', () => {
  const idx = Number(elVoiceSelect.value)
  selectedVoice = elVoiceSelect.value === '' ? null : (availableVoices[idx] ?? null)
  saveConfig()
  speakPreview()
})

chkEndlessLast.addEventListener('change', () => { endlessLastRound = chkEndlessLast.checked; saveConfig() })

chkSpeakStart.addEventListener('change', () => { soundSettings.speakStart    = chkSpeakStart.checked; saveConfig() })
chkWarnRiff.addEventListener('change',   () => { soundSettings.playWarnRiff  = chkWarnRiff.checked;   saveConfig() })
chkWarnSpeak.addEventListener('change',  () => { soundSettings.warnSpeak     = chkWarnSpeak.checked;  saveConfig() })
chkUpSiren.addEventListener('change',    () => { soundSettings.playSiren     = chkUpSiren.checked;    saveConfig() })
chkUpSpeak.addEventListener('change',         () => { soundSettings.speakIncrease = chkUpSpeak.checked;         saveConfig() })
chkCountdownBlip.addEventListener('change',   () => { soundSettings.countdownBlip = chkCountdownBlip.checked;   saveConfig() })

btnVoicePreview.addEventListener('click', () => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
    updatePreviewBtn()
  } else {
    speakPreview()
  }
})

// ── Init ──────────────────────────────────────────────────────────────────────

loadConfig()

if (window.speechSynthesis) {
  populateVoices()
  window.speechSynthesis.addEventListener('voiceschanged', populateVoices)
}

renderUI()
