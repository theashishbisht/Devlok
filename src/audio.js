let ctx = null
let masterGain = null
let deityGain = null
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
