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
  // Persistent OM drone — always audible, shared across all deities
  // 136.1 Hz = cosmic Om frequency (Earth year tone)
  const nodes = []
  const omGain = ac.createGain()
  omGain.gain.value = 0.5
  omGain.connect(masterGain)

  // Fundamental — warm sine
  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 136.1
  const g1 = ac.createGain()
  g1.gain.value = 0.4
  osc1.connect(g1)
  g1.connect(omGain)
  osc1.start()
  nodes.push(osc1, g1)

  // Detuned chorus for richness
  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 136.3
  const g2 = ac.createGain()
  g2.gain.value = 0.2
  osc2.connect(g2)
  g2.connect(omGain)
  osc2.start()
  nodes.push(osc2, g2)

  // Second detuned voice
  const osc2b = ac.createOscillator()
  osc2b.type = 'sine'
  osc2b.frequency.value = 135.9
  const g2b = ac.createGain()
  g2b.gain.value = 0.15
  osc2b.connect(g2b)
  g2b.connect(omGain)
  osc2b.start()
  nodes.push(osc2b, g2b)

  // Sub-octave for body
  const osc3 = ac.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = 68.05
  const g3 = ac.createGain()
  g3.gain.value = 0.2
  osc3.connect(g3)
  g3.connect(omGain)
  osc3.start()
  nodes.push(osc3, g3)

  // Upper harmonic for presence
  const osc4 = ac.createOscillator()
  osc4.type = 'sine'
  osc4.frequency.value = 272.2
  const g4 = ac.createGain()
  g4.gain.value = 0.06
  osc4.connect(g4)
  g4.connect(omGain)
  osc4.start()
  nodes.push(osc4, g4)

  // Slow breath-like LFO on volume
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.06
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 0.12
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
  // Storm + realistic lightning + damaru
  const nodes = []

  // Deep thunder bed — filtered sawtooth, very low
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

  // Realistic lightning: noise source → sweeping filter → envelope
  // Bright crack that sweeps down into deep rolling thunder
  const lightningNoise = createNoise(ac)
  const lightningFilter = ac.createBiquadFilter()
  lightningFilter.type = 'lowpass'
  lightningFilter.frequency.value = 100
  lightningFilter.Q.value = 0.7
  const lightningGain = ac.createGain()
  lightningGain.gain.value = 0
  lightningNoise.connect(lightningFilter)
  lightningFilter.connect(lightningGain)
  lightningGain.connect(deityGain)
  lightningNoise.start()
  nodes.push(lightningNoise, lightningFilter, lightningGain)

  // Second layer for sub-bass thunder body
  const thunderBody = createNoise(ac)
  const thunderBpf = ac.createBiquadFilter()
  thunderBpf.type = 'lowpass'
  thunderBpf.frequency.value = 80
  thunderBpf.Q.value = 2
  const thunderBodyGain = ac.createGain()
  thunderBodyGain.gain.value = 0
  thunderBody.connect(thunderBpf)
  thunderBpf.connect(thunderBodyGain)
  thunderBodyGain.connect(deityGain)
  thunderBody.start()
  nodes.push(thunderBody, thunderBpf, thunderBodyGain)

  function flash() {
    if (currentDeity !== 'shiva') return
    const now = ac.currentTime

    // Phase 1: bright crack — filter opens wide then sweeps down
    lightningFilter.frequency.cancelScheduledValues(now)
    lightningFilter.frequency.setValueAtTime(5000, now)
    lightningFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.05)
    lightningFilter.frequency.exponentialRampToValueAtTime(400, now + 0.4)
    lightningFilter.frequency.exponentialRampToValueAtTime(100, now + 2.5)

    // Crack envelope: instant attack, multi-phase decay
    lightningGain.gain.cancelScheduledValues(now)
    lightningGain.gain.setValueAtTime(0.001, now)
    lightningGain.gain.linearRampToValueAtTime(0.2, now + 0.003)
    lightningGain.gain.exponentialRampToValueAtTime(0.08, now + 0.06)
    // Brief re-crack (double strike)
    lightningGain.gain.linearRampToValueAtTime(0.12, now + 0.1)
    lightningGain.gain.exponentialRampToValueAtTime(0.04, now + 0.3)
    lightningGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5)

    // Phase 2: deep rolling thunder body follows ~150ms after crack
    thunderBodyGain.gain.cancelScheduledValues(now)
    thunderBodyGain.gain.setValueAtTime(0.001, now + 0.15)
    thunderBodyGain.gain.linearRampToValueAtTime(0.15, now + 0.25)
    // Rolling: multiple swells that decay
    thunderBodyGain.gain.exponentialRampToValueAtTime(0.06, now + 0.8)
    thunderBodyGain.gain.linearRampToValueAtTime(0.1, now + 1.2)
    thunderBodyGain.gain.exponentialRampToValueAtTime(0.03, now + 2.0)
    thunderBodyGain.gain.linearRampToValueAtTime(0.05, now + 2.5)
    thunderBodyGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0)

    setTimeout(flash, 5000 + Math.random() * 10000)
  }
  setTimeout(flash, 2500)

  // Damaru pulse — tuned tap
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
