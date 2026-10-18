import { useState, useEffect } from 'react'
import Starfield from './Starfield'
import DeityPanel from './DeityPanel'
import VolumeSlider from './VolumeSlider'
import { DEITIES } from './data'
import { switchSound } from './audio'

const TABS = ['brahma', 'vishnu', 'shiva']
const TAB_LABELS = { brahma: 'Brahma', vishnu: 'Vishnu', shiva: 'Mahesh' }

export default function App() {
  const [active, setActive] = useState('brahma')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', active)
    switchSound(active)
  }, [active])

  const handleTab = (id) => {
    setActive(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Starfield />
      <div className="nebula-layer nebula-1" />
      <div className="nebula-layer nebula-2" />

      <VolumeSlider deity={active} />

      <div className="page-content">
        <nav className="nav">
          <div className="nav-logo"><span className="dot" /> Trimurti</div>
          <div className="nav-tabs">
            {TABS.map((id) => (
              <button
                key={id}
                className={`nav-tab${active === id ? ' active' : ''}`}
                onClick={() => handleTab(id)}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>
        </nav>

        {TABS.map((id) => (
          <DeityPanel key={id} deity={DEITIES[id]} active={active === id} />
        ))}

        <footer className="footer">
          <div className="footer-om">ॐ</div>
          <p>Trimurti — Brahma, Vishnu &amp; Mahesh. A visual journey through the three supreme gods of Hindu scripture.</p>
        </footer>
      </div>
    </>
  )
}
