import { useEffect, useRef } from 'react'

function StoryItem({ story }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="story-item" ref={ref}>
      <div className="story-marker">{story.num}</div>
      <div className="story-content">
        <h3>{story.title}</h3>
        <p>{story.text}</p>
        <span className="sanskrit">{story.sanskrit}</span>
      </div>
    </div>
  )
}

export default function DeityPanel({ deity, active }) {
  if (!active) return null

  return (
    <div className="deity-panel">
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot">{deity.badge}</span> {deity.badgeText}
        </div>
        <h1>{deity.title.replace(deity.name, '').trim()} <em>{deity.name}</em></h1>
        <p>{deity.heroDescription}</p>
        <a href={`#story-${deity.id}`} className="hero-cta">Read the Origin ↓</a>
      </section>

      <section className="silhouette-section">
        <div className="deity-image-wrap">
          <img src={deity.image} alt={deity.imageAlt} className="deity-image" />
          <div className={`image-glow image-glow--${deity.id}`} />
        </div>
      </section>

      <section className="story-section" id={`story-${deity.id}`}>
        <div className="story-header">
          <div className="section-num">Origin Story</div>
          <h2>
            {deity.id === 'brahma' && 'The Birth of Creation'}
            {deity.id === 'vishnu' && 'The Eternal Preserver'}
            {deity.id === 'shiva' && 'The Timeless Ascetic'}
          </h2>
          <p>
            {deity.id === 'brahma' && 'How Lord Brahma emerged from the cosmic void and gave form to all existence.'}
            {deity.id === 'vishnu' && 'How Lord Vishnu emerged as the sustainer of all worlds and the guardian of cosmic balance.'}
            {deity.id === 'shiva' && 'How Lord Shiva — the one who was never born and will never die — stands beyond the cycle he himself dissolves.'}
          </p>
        </div>
        <div className="story-timeline">
          {deity.stories.map((s) => (
            <StoryItem key={s.num} story={s} />
          ))}
        </div>
      </section>

      <section className="attr-section">
        <div className="attr-grid">
          {deity.attributes.map((a, i) => (
            <div className="attr-card" key={i}>
              <div className="attr-icon">{a.icon}</div>
              <h4>{a.title}</h4>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
