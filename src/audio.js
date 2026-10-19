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
  // AUM chanting — cycles through Aa → Uu → Mm vowel phases
  // Mimics deep group chanting like "Om 1008 times" meditation recordings
  const nodes = []
  const omGain = ac.createGain()
  omGain.gain.value = 0.55
  omGain.connect(masterGain)

  // Rich voice source: multiple detuned sawtooths filtered to sound vocal
  const voiceFreqs = [136.1, 136.3, 135.8, 68.05, 68.2]
  const voiceGains = [0.18, 0.08, 0.06, 0.12, 0.05]
  const oscs = []
  voiceFreqs.forEach((f, i) => {
    const osc = ac.createOscillator()
    osc.type = i < 3 ? 'sawtooth' : 'sine'
    osc.frequency.value = f
    const g = ac.createGain()
    g.gain.value = voiceGains[i]
    osc.connect(g)
    g.connect(omGain)
    osc.start()
    oscs.push(osc)
    nodes.push(osc, g)
  })

  // Formant filter 1 — sweeps through A→U→M vowel positions
  const formant1 = ac.createBiquadFilter()
  formant1.type = 'bandpass'
  formant1.frequency.value = 700
  formant1.Q.value = 3
  const f1Gain = ac.createGain()
  f1Gain.gain.value = 0.25
  nodes.push(formant1, f1Gain)

  // Formant filter 2 — second formant for vowel realism
  const formant2 = ac.createBiquadFilter()
  formant2.type = 'bandpass'
  formant2.frequency.value = 1200
  formant2.Q.value = 4
  const f2Gain = ac.createGain()
  f2Gain.gain.value = 0.08
  nodes.push(formant2, f2Gain)

  // Nasal resonance for the "Mm" phase
  const nasal = ac.createBiquadFilter()
  nasal.type = 'bandpass'
  nasal.frequency.value = 300
  nasal.Q.value = 8
  const nasalGain = ac.createGain()
  nasalGain.gain.value = 0.15
  nodes.push(nasal, nasalGain)

  // Connect voice → formants → omGain
  oscs.forEach(osc => {
    osc.connect(formant1)
    osc.connect(formant2)
    osc.connect(nasal)
  })
  formant1.connect(f1Gain)
  f1Gain.connect(omGain)
  formant2.connect(f2Gain)
  f2Gain.connect(omGain)
  nasal.connect(nasalGain)
  nasalGain.connect(omGain)

  // Breath noise — adds air/texture to the chant
  const breath = createNoise(ac)
  const breathFilter = ac.createBiquadFilter()
  breathFilter.type = 'bandpass'
  breathFilter.frequency.value = 1500
  breathFilter.Q.value = 0.5
  const breathGain = ac.createGain()
  breathGain.gain.value = 0.015
  breath.connect(breathFilter)
  breathFilter.connect(breathGain)
  breathGain.connect(omGain)
  breath.start()
  nodes.push(breath, breathFilter, breathGain)

  // AUM cycle: ~6s per Om, repeating
  // Aa (open vowel) → Uu (closed vowel) → Mm (nasal hum) → breath pause
  let omActive = true
  function chantCycle() {
    if (!omActive) return
    const now = ac.currentTime
    const dur = 5.5

    // Breath envelope: swell in, sustain, fade out
    omGain.gain.cancelScheduledValues(now)
    omGain.gain.setValueAtTime(0.05, now)
    omGain.gain.linearRampToValueAtTime(0.55, now + 0.6)
    omGain.gain.setValueAtTime(0.55, now + dur * 0.7)
    omGain.gain.linearRampToValueAtTime(0.3, now + dur * 0.85)
    omGain.gain.linearRampToValueAtTime(0.05, now + dur)

    // "Aa" phase (0–35%): open vowel, F1≈700, F2≈1200
    formant1.frequency.cancelScheduledValues(now)
    formant1.frequency.setValueAtTime(700, now)
    formant2.frequency.cancelScheduledValues(now)
    formant2.frequency.setValueAtTime(1200, now)
    nasalGain.gain.cancelScheduledValues(now)
    nasalGain.gain.setValueAtTime(0.02, now)

    // "Uu" phase (35–65%): closed vowel, F1≈300, F2≈700
    const uStart = now + dur * 0.35
    formant1.frequency.linearRampToValueAtTime(300, uStart)
    formant2.frequency.linearRampToValueAtTime(700, uStart)

    // "Mm" phase (65–100%): nasal, close formants down, boost nasal
    const mStart = now + dur * 0.65
    formant1.frequency.linearRampToValueAtTime(250, mStart)
    formant2.frequency.linearRampToValueAtTime(400, mStart)
    nasalGain.gain.linearRampToValueAtTime(0.02, uStart)
    nasalGain.gain.linearRampToValueAtTime(0.25, mStart)
    formant1.frequency.linearRampToValueAtTime(200, now + dur)
    nasalGain.gain.linearRampToValueAtTime(0.3, now + dur)

    // Breath texture follows envelope
    breathGain.gain.cancelScheduledValues(now)
    breathGain.gain.setValueAtTime(0.005, now)
    breathGain.gain.linearRampToValueAtTime(0.02, now + 0.5)
    breathGain.gain.linearRampToValueAtTime(0.008, now + dur * 0.6)
    breathGain.gain.linearRampToValueAtTime(0.003, now + dur)

    // Next cycle after brief silence (group takes a breath)
    setTimeout(chantCycle, (dur + 0.8) * 1000)
  }
  chantCycle()

  // Store cleanup flag on the gain node so stopOm can halt the cycle
  omGain._stopCycle = () => { omActive = false }
  nodes.push(omGain)

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
  // Damru-focused: rhythmic double-tap pattern + resonant body + subtle drone
  const nodes = []

  // Low tonic drone — Shiva's meditative base
  const drone = ac.createOscillator()
  drone.type = 'sine'
  drone.frequency.value = 68
  const droneGain = ac.createGain()
  droneGain.gain.value = 0.07
  drone.connect(droneGain)
  droneGain.connect(deityGain)
  drone.start()
  nodes.push(drone, droneGain)

  // Damru membrane — sharp pitch-swept tone (high → low)
  const membrane = ac.createOscillator()
  membrane.type = 'triangle'
  membrane.frequency.value = 80
  const membraneLpf = ac.createBiquadFilter()
  membraneLpf.type = 'lowpass'
  membraneLpf.frequency.value = 1200
  membraneLpf.Q.value = 2
  const membraneGain = ac.createGain()
  membraneGain.gain.value = 0
  membrane.connect(membraneLpf)
  membraneLpf.connect(membraneGain)
  membraneGain.connect(deityGain)
  membrane.start()
  nodes.push(membrane, membraneLpf, membraneGain)

  // Damru snap — short noise burst for the "slap" attack
  const snap = createNoise(ac)
  const snapBpf = ac.createBiquadFilter()
  snapBpf.type = 'bandpass'
  snapBpf.frequency.value = 2000
  snapBpf.Q.value = 1.5
  const snapGain = ac.createGain()
  snapGain.gain.value = 0
  snap.connect(snapBpf)
  snapBpf.connect(snapGain)
  snapGain.connect(deityGain)
  snap.start()
  nodes.push(snap, snapBpf, snapGain)

  // Resonant body ring — damru's hollow wooden body
  const body = ac.createOscillator()
  body.type = 'sine'
  body.frequency.value = 350
  const bodyBpf = ac.createBiquadFilter()
  bodyBpf.type = 'bandpass'
  bodyBpf.frequency.value = 400
  bodyBpf.Q.value = 6
  const bodyGain = ac.createGain()
  bodyGain.gain.value = 0
  body.connect(bodyBpf)
  bodyBpf.connect(bodyGain)
  bodyGain.connect(deityGain)
  body.start()
  nodes.push(body, bodyBpf, bodyGain)

  // Single damru strike
  function strike(loud) {
    const now = ac.currentTime
    const vol = loud ? 1.0 : 0.7

    // Membrane: pitch sweep 280→80 Hz
    membrane.frequency.cancelScheduledValues(now)
    membrane.frequency.setValueAtTime(280, now)
    membrane.frequency.exponentialRampToValueAtTime(80, now + 0.12)

    // Membrane envelope
    membraneGain.gain.cancelScheduledValues(now)
    membraneGain.gain.setValueAtTime(0.001, now)
    membraneGain.gain.linearRampToValueAtTime(0.14 * vol, now + 0.003)
    membraneGain.gain.exponentialRampToValueAtTime(0.04 * vol, now + 0.08)
    membraneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    // Snap attack
    snapGain.gain.cancelScheduledValues(now)
    snapGain.gain.setValueAtTime(0.001, now)
    snapGain.gain.linearRampToValueAtTime(0.08 * vol, now + 0.002)
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    // Body resonance ring
    body.frequency.setValueAtTime(350 + (loud ? 30 : 0), now)
    bodyGain.gain.cancelScheduledValues(now)
    bodyGain.gain.setValueAtTime(0.001, now + 0.005)
    bodyGain.gain.linearRampToValueAtTime(0.06 * vol, now + 0.01)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  }

  // Rhythmic pattern: "dug-dug ... dug-dug ... dug-dug-dug"
  // Mimics the damru being twisted back and forth
  let patternIdx = 0
  const patterns = [
    [0, 180],
    [0, 180],
    [0, 150, 300],
  ]

  function playPattern() {
    if (currentDeity !== 'shiva') return
    const pat = patterns[patternIdx % patterns.length]
    pat.forEach((delay, i) => {
      setTimeout(() => {
        if (currentDeity !== 'shiva') return
        strike(i === 0)
      }, delay)
    })
    patternIdx++
    const nextDelay = 1800 + Math.random() * 800
    setTimeout(playPattern, nextDelay)
  }
  setTimeout(playPattern, 1500)

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
