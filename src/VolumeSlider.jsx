import { useState, useCallback } from 'react'
import { setVolume, initAudio, switchSound } from './audio'

export default function VolumeSlider({ deity }) {
  const [vol, setVol] = useState(0.3)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)

  const handleStart = useCallback(() => {
    if (!started) {
      initAudio()
      switchSound(deity)
      setStarted(true)
    }
  }, [started, deity])

  const handleChange = (e) => {
    const v = parseFloat(e.target.value)
    setVol(v)
    setVolume(v)
    setMuted(v === 0)
    if (!started) handleStart()
  }

  const toggleMute = () => {
    if (!started) {
      handleStart()
      return
    }
    if (muted) {
      setVolume(vol || 0.3)
      setMuted(false)
    } else {
      setVolume(0)
      setMuted(true)
    }
  }

  const icon = !started
    ? '🔇'
    : muted || vol === 0
    ? '🔇'
    : vol < 0.3
    ? '🔈'
    : vol < 0.6
    ? '🔉'
    : '🔊'

  return (
    <div className="volume-slider">
      <button className="volume-btn" onClick={toggleMute} title={started ? 'Toggle mute' : 'Click to start cosmic audio'}>
        {icon}
      </button>
      <div className="volume-track">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : vol}
          onChange={handleChange}
          className="volume-range"
          orient="vertical"
        />
      </div>
      <span className="volume-label">{!started ? 'Play' : muted ? 'Muted' : Math.round((muted ? 0 : vol) * 100) + '%'}</span>
    </div>
  )
}
