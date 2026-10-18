(function () {
  'use strict';

  /* ── STARFIELD CANVAS ── */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shootingStars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Generate stars
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      baseAlpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      // Color: mostly white, some warm, some blue
      color: Math.random() > 0.85
        ? (Math.random() > 0.5 ? '255,212,168' : '160,180,255')
        : '240,238,255',
      // Parallax depth (0 = far/slow, 1 = near/fast)
      depth: Math.random()
    });
  }

  // Shooting stars
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.4,
      len: 60 + Math.random() * 80,
      speed: 8 + Math.random() * 6,
      angle: Math.PI * 0.2 + Math.random() * 0.15,
      life: 1
    });
  }

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.pageYOffset; });

  function drawStars(time) {
    ctx.clearRect(0, 0, W, H);

    // Stars
    for (const s of stars) {
      const parallax = scrollY * s.depth * 0.05;
      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      const alpha = s.baseAlpha * (0.6 + 0.4 * twinkle);
      const drawY = ((s.y - parallax) % H + H) % H;

      ctx.beginPath();
      ctx.arc(s.x, drawY, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${alpha})`;
      ctx.fill();

      // Bloom/glow for brighter stars
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, drawY, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha * 0.08})`;
        ctx.fill();
      }
    }

    // Shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.015;

      if (ss.life <= 0 || ss.x > W + 100 || ss.y > H + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - Math.cos(ss.angle) * ss.len;
      const tailY = ss.y - Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(255,255,255,${ss.life * 0.7})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Random shooting star
    if (Math.random() < 0.003) spawnShootingStar();

    requestAnimationFrame(drawStars);
  }
  requestAnimationFrame(drawStars);

  /* ── TAB SWITCHING ── */
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.deity-panel');
  const root = document.documentElement;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const god = tab.dataset.god;
      root.setAttribute('data-theme', god);

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        p.classList.remove('active');
        if (p.dataset.god === god) p.classList.add('active');
      });

      // Re-observe story items for the newly visible panel
      document.querySelectorAll('.deity-panel.active .story-item').forEach(item => {
        item.classList.remove('visible');
        observer.observe(item);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ── SCROLL REVEAL ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.story-item').forEach(item => observer.observe(item));

  // Set initial theme
  root.setAttribute('data-theme', 'brahma');
})();
