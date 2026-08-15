import { useEffect, useRef } from 'react'
import { onFrame, reducedMotion, trackRect } from '../lib/motion'
import './HeroBackground.css'

/*
 * The moving curtain behind the name.
 *
 * Three layers, all generated, so there is no image to load and nothing to
 * go soft on a retina display:
 *
 *   1. slow crimson blooms drifting on independent sine paths, which is what
 *      makes the field feel lit from behind rather than painted;
 *   2. the vertical curtain, a band of light per column whose brightness is
 *      the sum of three sines at different rates, so the highlights never
 *      settle into a visible loop;
 *   3. a soft light that follows the pointer.
 *
 * Cost discipline, because this is the most expensive thing on the page:
 * the curtain reuses ONE cached gradient and varies globalAlpha per band
 * rather than building a gradient per band per frame, the vignette is baked
 * once per resize, the backing store is deliberately low resolution (the
 * whole image is soft gradients, so nothing shows), it renders at 30fps, and
 * it stops entirely once the hero has scrolled away.
 */

const BANDS = 26
const FPS = 30
const BLOOMS = [
  { hue: [227, 53, 93], rx: 0.34, ry: 0.55, sx: 0.07, sy: 0.045, px: 0.3, py: 0.4, a: 0.55 },
  { hue: [125, 29, 51], rx: 0.46, ry: 0.42, sx: -0.05, sy: 0.062, px: 0.68, py: 0.58, a: 0.6 },
  { hue: [168, 41, 71], rx: 0.28, ry: 0.36, sx: 0.09, sy: -0.038, px: 0.5, py: 0.28, a: 0.45 },
]

function HeroBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const still = reducedMotion()
    const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 }
    let width = 0
    let height = 0
    let curtain = null
    let vignette = null

    const resize = () => {
      /*
       * 0.75x, not devicePixelRatio. At 2x this canvas fills the viewport
       * five times over per frame and dominates the page's frame budget;
       * there is no detail in a gradient field for the extra pixels to
       * resolve, so the resolution buys nothing.
       */
      const scale = 0.75
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (!width || !height) return
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      ctx.setTransform(scale, 0, 0, scale, 0, 0)

      // Cached: neither of these changes between frames.
      curtain = ctx.createLinearGradient(0, 0, 0, height)
      curtain.addColorStop(0, 'rgba(255, 236, 240, 0.05)')
      curtain.addColorStop(0.45, 'rgba(255, 214, 224, 0.16)')
      curtain.addColorStop(1, 'rgba(255, 255, 255, 0.34)')

      vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.16,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.78,
      )
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.72)')
    }

    const draw = (t) => {
      if (!width || !height) return

      ctx.globalAlpha = 1
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // 1. drifting blooms.
      ctx.globalCompositeOperation = 'lighter'
      for (const b of BLOOMS) {
        const cx = (b.px + Math.sin(t * b.sx) * 0.16) * width
        const cy = (b.py + Math.cos(t * b.sy) * 0.12) * height
        const r = Math.max(b.rx * width, b.ry * height)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        const [red, green, blue] = b.hue
        grad.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${b.a})`)
        grad.addColorStop(0.55, `rgba(${red}, ${green}, ${blue}, ${b.a * 0.22})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }

      // 2. the curtain. One cached gradient, per-band brightness via alpha.
      const bandWidth = width / BANDS
      ctx.fillStyle = curtain
      for (let i = 0; i < BANDS; i += 1) {
        const wave =
          Math.sin(i * 0.35 + t * 0.62) * 0.5 +
          Math.sin(i * 0.13 - t * 0.41) * 0.34 +
          Math.sin(i * 0.71 + t * 0.24) * 0.16
        if (wave <= 0) continue
        ctx.globalAlpha = Math.min(1, wave ** 1.6)
        // A hairline overlap, so the bands read as one cloth and not as a
        // fence with seams between the slats.
        ctx.fillRect(i * bandWidth, 0, bandWidth + 0.6, height)
      }
      ctx.globalAlpha = 1

      // 3. pointer light.
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06
      const px = pointer.x * width
      const py = pointer.y * height
      const pr = Math.max(width, height) * 0.34
      const glow = ctx.createRadialGradient(px, py, 0, px, py, pr)
      glow.addColorStop(0, 'rgba(227, 53, 93, 0.3)')
      glow.addColorStop(0.5, 'rgba(227, 53, 93, 0.08)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'source-over'

      // Vignette, so the centred name always has a dark seat under it.
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)
    }

    resize()

    if (still) {
      draw(0)
      const redraw = () => {
        resize()
        draw(0)
      }
      window.addEventListener('resize', redraw)
      return () => window.removeEventListener('resize', redraw)
    }

    /* Cached, so a pointer crossing the hero does not force a layout on
       every event just to normalise its position. */
    const rectOf = trackRect(canvas)

    const onMove = (event) => {
      const rect = rectOf()
      pointer.tx = (event.clientX - rect.left) / rect.width
      pointer.ty = (event.clientY - rect.top) / rect.height
    }

    const interval = 1 / FPS
    let nextFrame = 0

    const render = (time, scrollY) => {
      // Once the hero is covered there is nothing to see; keep painting it
      // and every later chapter pays for a canvas nobody is looking at.
      if (scrollY > window.innerHeight * 1.1) return
      if (time < nextFrame) return
      nextFrame = time + interval
      draw(time)
    }

    const stop = onFrame(render)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      stop()
      rectOf.stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas className="hero-bg" ref={canvasRef} aria-hidden="true" />
}

export default HeroBackground
