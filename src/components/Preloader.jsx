import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Logo from './Logo'
import { reducedMotion } from '../lib/motion'
import './Preloader.css'

/*
 * The intro.
 *
 * What was here was a fixed 3.5-second curtain tied to no loading signal at
 * all: it covered the site for three and a half seconds on a fast connection
 * and on a slow one alike, and its exit animated a backdrop-filter blur from
 * 0 to 34px across the whole viewport, which a compositor cannot cache and so
 * re-rasterises every frame, on top of a four-stage filter chain over three
 * stacked copies of the lockup.
 *
 * This one is a floor, not a curtain. It shows the mark while the page is
 * genuinely not ready, and leaves the moment it is:
 *
 *   FLOOR     the shortest it is ever allowed to be, so it cannot flash
 *   MAX_HOLD  the longest it is ever allowed to hold, ready or not
 *   EXIT      the fade out
 *   BAIL      wall clock, for the tab that is never painting at all
 *
 * Worst case on screen is MAX_HOLD + EXIT, a little over 1.2s. Best case is
 * FLOOR + EXIT, about three quarters of a second. The floor came down from
 * 620ms once the production numbers were in: the page is genuinely ready far
 * sooner than the curtain was waiting, and the client asked for no delay. Nothing animates a blur radius; the exit is
 * an opacity fade of an opaque sheet, which is one composited layer.
 */

const ONCE_PER_SESSION = true
const SESSION_KEY = 'claro:intro-played'

const FLOOR = 460
const MAX_HOLD = 1000
const EXIT = 0.28
/*
 * GSAP runs on rAF, which browsers pause outright in a background tab, and
 * the readiness probe below waits on a painted frame, which never arrives
 * there either. Without a wall-clock net a visitor who opens the site in a
 * background tab comes back to a permanently covered, permanently
 * unscrollable page. Reduced to sit just past the designed worst case, so it
 * only ever fires when the frame loop is genuinely not running.
 */
const BAIL = 1600

/*
 * The two things worth waiting for, and nothing else.
 *
 * `document.fonts.ready` because the site is set in a serif that the fallback
 * does not match, and two painted frames because that is the point at which
 * the first render is actually on the glass rather than merely committed.
 */
const whenReady = () =>
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    }),
  ])

function Preloader({ onDone }) {
  const alreadyPlayed =
    ONCE_PER_SESSION &&
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem(SESSION_KEY) === '1'

  const [hidden, setHidden] = useState(alreadyPlayed || reducedMotion())

  const rootRef = useRef(null)
  const fieldRef = useRef(null)
  const markRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    /*
     * `is-loading` puts overflow: hidden on html and body and is removed
     * here and nowhere else, so every path out of this component has to go
     * through a call that clears it. It is idempotent, so clearing it in
     * both the finish path and this one costs nothing.
     */
    if (hidden) {
      document.documentElement.classList.remove('is-loading')
      onDone?.()
      return
    }

    let settled = false
    let cancelled = false
    let leaving = null
    let exit = () => {}

    const start = performance.now()
    const timers = []

    const finish = () => {
      if (settled) return
      settled = true
      document.documentElement.classList.remove('is-loading')
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* private mode: the intro simply plays again next visit */
      }
      /* onDone fires from the `hidden` branch above, once, on the re-render. */
      setHidden(true)
    }

    const ctx = gsap.context(() => {
      const field = fieldRef.current
      const mark = markRef.current
      const bar = barRef.current

      /*
       * Every .set() carries an explicit position of 0. Without one it lands
       * at the timeline's CURRENT end, so the initial states are applied
       * after the animations they were meant to precede.
       */
      const enter = gsap.timeline()
      enter.set(field, { opacity: 0, scale: 1.06 }, 0)
      enter.set(mark, { opacity: 0, y: 20 }, 0)
      enter.set(bar, { scaleX: 0 }, 0)

      /* The field blooms, the same entrance every field on the site makes. */
      enter.to(field, { opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out' }, 0)
      enter.to(mark, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.05)
      /*
       * The bar runs the length of the longest hold, so it is a real bound on
       * the wait rather than a decorative loop: it is snapped to full by the
       * exit below, whenever that comes.
       */
      enter.to(bar, { scaleX: 1, duration: MAX_HOLD / 1000, ease: 'none' }, 0.1)

      exit = () => {
        if (leaving || settled || cancelled) return

        leaving = gsap
          .timeline({ onComplete: finish })
          .to(bar, { scaleX: 1, duration: 0.18, ease: 'power2.out', overwrite: true }, 0)
          .to(mark, { y: -10, duration: EXIT, ease: 'power2.in' }, 0)
          /*
           * The sheet is opaque black and fades as one layer. The old exit
           * ramped a backdrop-filter blur radius across the full viewport,
           * which cannot be cached and repaints everything behind it on
           * every frame of the transition.
           */
          .to(rootRef.current, { opacity: 0, duration: EXIT, ease: 'power2.inOut' }, 0.04)
      }
    }, rootRef)

    /* Ready, plus whatever is left of the floor. */
    whenReady().then(() => {
      if (cancelled) return
      timers.push(setTimeout(exit, Math.max(0, FLOOR - (performance.now() - start))))
    })

    /* Not ready, but out of patience. */
    timers.push(setTimeout(() => exit(), MAX_HOLD))

    /* Not painting at all: skip the animation and hand the page over. */
    timers.push(setTimeout(finish, BAIL))

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      /*
       * The exit timeline is built after the context callback returned, so
       * revert() does not know about it and it has to be killed by hand.
       * Killing it also kills its onComplete, and that call is the only thing
       * that clears `is-loading`, so tearing down mid-exit has to clear it
       * here or the page is handed over unscrollable.
       */
      if (leaving) {
        leaving.kill()
        document.documentElement.classList.remove('is-loading')
      }
      ctx.revert()
    }
  }, [hidden, onDone])

  if (hidden) return null

  return (
    <div id="preloader" ref={rootRef} role="presentation">
      <span className="preloader__field" ref={fieldRef} aria-hidden="true" />

      <div className="preloader__stage">
        <div className="preloader__mark" ref={markRef} aria-hidden="true">
          <Logo as="div" full />
        </div>

        <span className="preloader__bar" aria-hidden="true">
          <span ref={barRef} />
        </span>
      </div>
    </div>
  )
}

export default Preloader
