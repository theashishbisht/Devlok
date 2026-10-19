# Changelog — Trimurti (Devlok)

All notable changes to this project will be documented in this file.

---

## [1.0.0] — 2026-10-19

### Added
- Initial release as a **Vite + React** project (migrated from static HTML)
- **Three deity tabs**: Brahma (gold), Vishnu (blue), Mahesh/Shiva (purple)
- **Animated starfield canvas**: 500 twinkling stars with parallax scrolling, shooting stars, warm/cool color variation
- **Floating nebula layers**: two CSS gradient overlays that drift and change color per deity
- **B&W deity artwork** with drop-shadow, hover scale, and per-deity colored glow
- **Scroll-based origin stories**: 5 numbered episodes per god with Sanskrit shlokas, animated into view via IntersectionObserver
- **Attribute cards** per deity (lotus, Vedas, chakra, trishul, etc.)
- **Procedural ambient audio** (Web Audio API, no audio files):
  - Brahma: black hole deep drone — sub-bass oscillator + LFO modulation + dark filtered noise
  - Vishnu: universe cosmic hum — layered Om harmonics (136.1 Hz fundamental) + high shimmer
  - Mahesh: lightning & storm — thunder rumble + howling wind + periodic lightning crackle + damaru pulse
- **Transparent volume slider** on left side with mute toggle, percentage display
- **Text glow/bloom effects** on headings, Sanskrit text, markers, and card titles
- **GitHub Actions CI/CD** for automatic deployment to GitHub Pages on push to `main`
- **Responsive design**: mobile-friendly layout for all sections

---

## [1.1.0] — 2026-10-19

### Improved
- **Audio overhaul**: reduced master gain from 0.3 → 0.15 for comfortable listening at 60% volume
- **Persistent Om background**: 136.1 Hz cosmic Om drone (fundamental + detuned chorus + sub-octave) shared across all deity tabs with slow breath-like LFO
- **Separate deity gain bus**: deity-specific sounds route through their own gain node (0.6) before master, allowing independent mixing
- **Brahma (black hole)**: quieter sub-bass drone with gravitational LFO pulse and filtered dark rumble
- **Vishnu (universe)**: gentler layered harmonics with soft space shimmer and slow cosmic sweep
- **Shiva (storm)**: improved lightning — sharp 5ms crack followed by 1.5s rolling thunder tail; less frequent strikes (4–12s intervals); added damaru pulse with pitch sweep (200→80 Hz); reduced wind and thunder base levels
- **Volume slider**: default changed from 30% to 15% to match new audio levels

### Tech stack
- Vite 5.4 + React 18.3
- Pure CSS (no Tailwind/frameworks)
- Web Audio API for procedural audio
- Canvas API for starfield
- Google Fonts: DM Serif Display + Inter
