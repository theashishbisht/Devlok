import { useEffect, useRef } from 'react'

export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      baseAlpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      offset: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.85
          ? Math.random() > 0.5
            ? '255,212,168'
            : '160,180,255'
          : '240,238,255',
      depth: Math.random(),
    }))

    const shooters = []
    let scrollY = 0
    const onScroll = () => { scrollY = window.pageYOffset }
    window.addEventListener('scroll', onScroll)

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    function draw(t) {
      ctx.clearRect(0, 0, W, H)

      for (const s of stars) {
        const py = ((s.y - scrollY * s.depth * 0.05) % H + H) % H
        const tw = Math.sin(t * s.speed + s.offset)
        const a = s.baseAlpha * (0.6 + 0.4 * tw)
        ctx.beginPath()
        ctx.arc(s.x, py, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.color},${a})`
        ctx.fill()
        if (s.r > 1.2) {
          ctx.beginPath()
          ctx.arc(s.x, py, s.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${s.color},${a * 0.08})`
          ctx.fill()
        }
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const ss = shooters[i]
        ss.x += Math.cos(ss.angle) * ss.speed
        ss.y += Math.sin(ss.angle) * ss.speed
        ss.life -= 0.015
        if (ss.life <= 0 || ss.x > W + 100 || ss.y > H + 100) {
          shooters.splice(i, 1)
          continue
        }
        const tx = ss.x - Math.cos(ss.angle) * ss.len
        const ty = ss.y - Math.sin(ss.angle) * ss.len
        const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(1, `rgba(255,255,255,${ss.life * 0.7})`)
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(ss.x, ss.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (Math.random() < 0.003) {
        shooters.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.4,
          len: 60 + Math.random() * 80,
          speed: 8 + Math.random() * 6,
          angle: Math.PI * 0.2 + Math.random() * 0.15,
          life: 1,
        })
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="starfield" />
}
