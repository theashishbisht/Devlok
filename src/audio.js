let ctx = null
let masterGain = null
let currentNodes = []
let currentDeity = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.3
    masterGain.connect(ctx.destination)
  }
  return ctx
}

function stopCurrent() {
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
  // Black hole: deep sub-bass drone + filtered noise rumble + slow LFO modulation
  const nodes = []

  // Sub-bass drone at ~30Hz
  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 30
  const g1 = ac.createGain()
  g1.gain.value = 0.4
  osc1.connect(g1)
  g1.connect(masterGain)
  osc1.start()
  nodes.push(osc1, g1)

  // Second harmonic at ~60Hz
  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 60
  const g2 = ac.createGain()
  g2.gain.value = 0.15
  osc2.connect(g2)
  g2.connect(masterGain)
  osc2.start()
  nodes.push(osc2, g2)

  // LFO to modulate the drone
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.05
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 8
  lfo.connect(lfoGain)
  lfoGain.connect(osc1.frequency)
  lfo.start()
  nodes.push(lfo, lfoGain)

  // Filtered dark noise
  const noise = createNoise(ac)
  const lpf = ac.createBiquadFilter()
  lpf.type = 'lowpass'
  lpf.frequency.value = 80
  lpf.Q.value = 5
  const ng = ac.createGain()
  ng.gain.value = 0.2
  noise.connect(lpf)
  lpf.connect(ng)
  ng.connect(masterGain)
  noise.start()
  nodes.push(noise, lpf, ng)

  return nodes
}

function buildVishnu(ac) {
  // Universe: layered harmonic tones (Om-like) + cosmic shimmer
  const nodes = []

  // Fundamental Om drone
  const freqs = [136.1, 272.2, 408.3]
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator()
    osc.type = i === 0 ? 'sine' : 'triangle'
    osc.frequency.value = f
    const g = ac.createGain()
    g.gain.value = i === 0 ? 0.25 : 0.08
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    nodes.push(osc, g)
  })

  // Slow chorus / shimmer
  const osc3 = ac.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = 136.5
  const g3 = ac.createGain()
  g3.gain.value = 0.12
  osc3.connect(g3)
  g3.connect(masterGain)
  osc3.start()
  nodes.push(osc3, g3)

  // High shimmer
  const noise = createNoise(ac)
  const bpf = ac.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 3000
  bpf.Q.value = 2
  const ng = ac.createGain()
  ng.gain.value = 0.03
  noise.connect(bpf)
  bpf.connect(ng)
  ng.connect(masterGain)
  noise.start()
  nodes.push(noise, bpf, ng)

  return nodes
}

function buildShiva(ac) {
  // Lightning/thunder + worldly storm: rumble + crackle + wind
  const nodes = []

  // Deep thunder rumble
  const osc1 = ac.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = 40
  const lpf1 = ac.createBiquadFilter()
  lpf1.type = 'lowpass'
  lpf1.frequency.value = 100
  const g1 = ac.createGain()
  g1.gain.value = 0.15
  osc1.connect(lpf1)
  lpf1.connect(g1)
  g1.connect(masterGain)
  osc1.start()
  nodes.push(osc1, lpf1, g1)

  // Storm wind (filtered noise)
  const wind = createNoise(ac)
  const bpf = ac.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 400
  bpf.Q.value = 0.5
  const wg = ac.createGain()
  wg.gain.value = 0.12
  wind.connect(bpf)
  bpf.connect(wg)
  wg.connect(masterGain)
  wind.start()
  nodes.push(wind, bpf, wg)

  // Wind modulation (howling)
  const lfo = ac.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.15
  const lfoG = ac.createGain()
  lfoG.gain.value = 200
  lfo.connect(lfoG)
  lfoG.connect(bpf.frequency)
  lfo.start()
  nodes.push(lfo, lfoG)

  // Lightning crackle (high-passed noise bursts via LFO on gain)
  const crackle = createNoise(ac)
  const hpf = ac.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 2000
  const cg = ac.createGain()
  cg.gain.value = 0
  crackle.connect(hpf)
  hpf.connect(cg)
  cg.connect(masterGain)
  crackle.start()
  nodes.push(crackle, hpf, cg)

  // Periodic lightning flashes
  function flash() {
    if (currentDeity !== 'shiva') return
    const now = ac.currentTime
    cg.gain.setValueAtTime(0, now)
    cg.gain.linearRampToValueAtTime(0.3, now + 0.02)
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    setTimeout(flash, 2000 + Math.random() * 5000)
  }
  setTimeout(flash, 1000)

  // Damaru-like rhythmic pulse
  const pulse = ac.createOscillator()
  pulse.type = 'sine'
  pulse.frequency.value = 90
  const pg = ac.createGain()
  pg.gain.value = 0
  pulse.connect(pg)
  pg.connect(masterGain)
  pulse.start()
  nodes.push(pulse, pg)

  function beat() {
    if (currentDeity !== 'shiva') return
    const now = ac.currentTime
    pg.gain.setValueAtTime(0.15, now)
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    setTimeout(beat, 3000 + Math.random() * 2000)
  }
  setTimeout(beat, 2000)

  return nodes
}

export function switchSound(deity) {
  if (deity === currentDeity) return
  currentDeity = deity
  stopCurrent()

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
  return masterGain ? masterGain.gain.value : 0.3
}

export function initAudio() {
  getCtx()
}
