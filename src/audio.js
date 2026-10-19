let ctx = null
let masterGain = null
let deityGain = null
let omNodes = []
let currentNodes = []
let currentDeity = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.15
    masterGain.connect(ctx.destination)

    deityGain = ctx.createGain()
    deityGain.gain.value = 0.6
    deityGain.connect(masterGain)
  }
  return ctx
}

function stopDeityNodes() {
  currentNodes.forEach(n => {
    try {
      if (n.stop) n.stop()
      if (n.disconnect) n.disconnect()
    } catch {}
  })
  currentNodes = []
}

function createNoise(ac) {
  const size = ac.sampleRate * 4
  const buf = ac.createBuffer(1, size, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  src.loop = true
  return src
}

function buildOmBackground(ac) {
  // Soft continuous OM drone — shared across all deities
  // 136.1 Hz = cosmic Om frequency (year tone)
  const nodes = []
  const omGain = ac.createGain()
  omGain.gain.value = 0.35
  omGain.connect(masterGain)

  // Fundamental
  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 136.1
  const g1 = ac.createGain()
  g1.gain.value = 0.3
  osc1.connect(g1)
  g1.connect(omGain)
  osc1.start()
  nodes.push(osc1, g1)

  // Slight detuned chorus for warmth
  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 136.3
  const g2 = ac.createGain()
  g2.gain.value = 0.12
  osc2.connect(g2)
  g2.connect(omGain)
  osc2.start()
  nodes.push(osc2, g2)

  // Soft octave
  const osc3 = ac.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = 68.05
  const g3 = ac.createGain()
  g3.gain.value = 0.15
  osc3.connect(g3)
  g3.connect(omGain)
  osc3.start()
  nodes.push(osc3, g3)

  // Very slow breath-like LFO on volume
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.08
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 0.08
  lfo.connect(lfoGain)
  lfoGain.connect(omGain.gain)
  lfo.start()
  nodes.push(lfo, lfoGain, omGain)

  return nodes
}

function buildBrahma(ac) {
  // Black hole: very deep sub-bass drone + slow pulsing + dark rumble
  const nodes = []

  // Sub-bass at 28Hz — felt more than heard
  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 28
  const g1 = ac.createGain()
  g1.gain.value = 0.25
  osc1.connect(g1)
  g1.connect(deityGain)
  osc1.start()
  nodes.push(osc1, g1)

  // Second tone at 56Hz
  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 56
  const g2 = ac.createGain()
  g2.gain.value = 0.08
  osc2.connect(g2)
  g2.connect(deityGain)
  osc2.start()
  nodes.push(osc2, g2)

  // Very slow LFO — gravitational pulse
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.03
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 5
  lfo.connect(lfoGain)
  lfoGain.connect(osc1.frequency)
  lfo.start()
  nodes.push(lfo, lfoGain)

  // Dark filtered rumble — very quiet
  const noise = createNoise(ac)
  const lpf = ac.createBiquadFilter()
  lpf.type = 'lowpass'
  lpf.frequency.value = 60
  lpf.Q.value = 3
  const ng = ac.createGain()
  ng.gain.value = 0.06
  noise.connect(lpf)
  lpf.connect(ng)
  ng.connect(deityGain)
  noise.start()
  nodes.push(noise, lpf, ng)

  return nodes
}

function buildVishnu(ac) {
  // Universe: gentle layered harmonics + cosmic shimmer + space ambience
  const nodes = []

  // Warm harmonic layers
  const freqs = [136.1, 272.2]
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const g = ac.createGain()
    g.gain.value = i === 0 ? 0.12 : 0.04
    osc.connect(g)
    g.connect(deityGain)
    osc.start()
    nodes.push(osc, g)
  })

  // Gentle space shimmer — very soft high noise
  const noise = createNoise(ac)
  const bpf = ac.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 2500
  bpf.Q.value = 1.5
  const ng = ac.createGain()
  ng.gain.value = 0.012
  noise.connect(bpf)
  bpf.connect(ng)
  ng.connect(deityGain)
  noise.start()
  nodes.push(noise, bpf, ng)

  // Slow cosmic sweep
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.04
  const lfoG = ac.createGain()
  lfoG.gain.value = 500
  lfo.connect(lfoG)
  lfoG.connect(bpf.frequency)
  lfo.start()
  nodes.push(lfo, lfoG)

  return nodes
}

function buildShiva(ac) {
  // Storm + lightning + damaru: layered, controlled, not harsh
  const nodes = []

  // Deep thunder — filtered sawtooth, very low
  const osc1 = ac.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = 35
  const lpf1 = ac.createBiquadFilter()
  lpf1.type = 'lowpass'
  lpf1.frequency.value = 70
  lpf1.Q.value = 1
  const g1 = ac.createGain()
  g1.gain.value = 0.06
  osc1.connect(lpf1)
  lpf1.connect(g1)
  g1.connect(deityGain)
  osc1.start()
  nodes.push(osc1, lpf1, g1)

  // Wind — bandpass noise with slow modulation
  const wind = createNoise(ac)
  const bpf = ac.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 300
  bpf.Q.value = 0.3
  const wg = ac.createGain()
  wg.gain.value = 0.05
  wind.connect(bpf)
  bpf.connect(wg)
  wg.connect(deityGain)
  wind.start()
  nodes.push(wind, bpf, wg)

  // Wind howl modulation
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.1
  const lfoG = ac.createGain()
  lfoG.gain.value = 150
  lfo.connect(lfoG)
  lfoG.connect(bpf.frequency)
  lfo.start()
  nodes.push(lfo, lfoG)

  // Lightning — short crack with exponential decay + rumble tail
  const crackle = createNoise(ac)
  const hpf = ac.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 3000
  const crackGain = ac.createGain()
  crackGain.gain.value = 0
  crackle.connect(hpf)
  hpf.connect(crackGain)
  crackGain.connect(deityGain)
  crackle.start()
  nodes.push(crackle, hpf, crackGain)

  // Thunder rumble tail (low noise burst after lightning)
  const thunderNoise = createNoise(ac)
  const thunderLpf = ac.createBiquadFilter()
  thunderLpf.type = 'lowpass'
  thunderLpf.frequency.value = 120
  thunderLpf.Q.value = 1
  const thunderGain = ac.createGain()
  thunderGain.gain.value = 0
  thunderNoise.connect(thunderLpf)
  thunderLpf.connect(thunderGain)
  thunderGain.connect(deityGain)
  thunderNoise.start()
  nodes.push(thunderNoise, thunderLpf, thunderGain)

  // Lightning flash: sharp crack then rolling thunder
  function flash() {
    if (currentDeity !== 'shiva') return
    const now = ac.currentTime

    // Sharp crack
    crackGain.gain.setValueAtTime(0, now)
    crackGain.gain.linearRampToValueAtTime(0.15, now + 0.005)
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    // Rolling thunder follows 100ms later
    thunderGain.gain.setValueAtTime(0, now + 0.1)
    thunderGain.gain.linearRampToValueAtTime(0.1, now + 0.15)
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

    setTimeout(flash, 4000 + Math.random() * 8000)
  }
  setTimeout(flash, 2000)

  // Damaru pulse — tuned tap, not a sustained tone
  const damaru = ac.createOscillator()
  damaru.type = 'sine'
  damaru.frequency.value = 200
  const damaruGain = ac.createGain()
  damaruGain.gain.value = 0
  damaru.connect(damaruGain)
  damaruGain.connect(deityGain)
  damaru.start()
  nodes.push(damaru, damaruGain)

  function beat() {
    if (currentDeity !== 'shiva') return
    const now = ac.currentTime
    damaru.frequency.setValueAtTime(200, now)
    damaru.frequency.exponentialRampToValueAtTime(80, now + 0.15)
    damaruGain.gain.setValueAtTime(0.08, now)
    damaruGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    setTimeout(beat, 4000 + Math.random() * 3000)
  }
  setTimeout(beat, 3000)

  return nodes
}

export function switchSound(deity) {
  if (deity === currentDeity) return
  currentDeity = deity
  stopDeityNodes()

  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  // Start Om background if not already running
  if (omNodes.length === 0) {
    omNodes = buildOmBackground(ac)
  }

  switch (deity) {
    case 'brahma':
      currentNodes = buildBrahma(ac)
      break
    case 'vishnu':
      currentNodes = buildVishnu(ac)
      break
    case 'shiva':
      currentNodes = buildShiva(ac)
      break
  }
}

export function setVolume(val) {
  if (masterGain) masterGain.gain.value = val
}

export function getVolume() {
  return masterGain ? masterGain.gain.value : 0.15
}

export function initAudio() {
  getCtx()
}
