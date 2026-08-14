import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Logo from './Logo'
import { reducedMotion } from '../lib/motion'
import './Preloader.css'

const TAGLINE = 'Clarodigi · Morocco'
const RINGS = [0.34, 0.52, 0.7, 0.86, 1]

/*
 * A preloader on every visit annoys repeat visitors, so it runs once per
 * browsing session. Flip to false to show it on every load.
 */
const ONCE_PER_SESSION = true
const SESSION_KEY = 'claro:intro-played'

/*
 * Intro sequence.
 *
 *   0.00s  oversized translucent rings scale in behind, staggered
 *   0.60s  wordmark rises and fades in, the glow ramps on the SAME curve,
 *          so it arrives already lit rather than lighting up afterwards
 *   1.00s  two quick left-to-right wipes through three logo states:
 *          solid white -> solid crimson -> the real mark
 *   1.50s  the label pops in letter by letter
 *   2.40s  glass rack-focus exit
 */
function Preloader({ onDone }) {
  const alreadyPlayed =
    ONCE_PER_SESSION &&
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem(SESSION_KEY) === '1'

  const [hidden, setHidden] = useState(alreadyPlayed || reducedMotion())

  const rootRef = useRef(null)
  const glassRef = useRef(null)
  const ringsRef = useRef(null)
  const markRef = useRef(null)
  const whiteRef = useRef(null)
  const crimsonRef = useRef(null)
  const taglineRef = useRef(null)

  useEffect(() => {
    if (hidden) {
      document.documentElement.classList.remove('is-loading')
      onDone?.()
      return
    }

    const finish = () => {
      document.documentElement.classList.remove('is-loading')
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* private mode, the intro simply replays next visit */
      }
      setHidden(true)
      onDone?.()
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })
      const rings = ringsRef.current.children
      const letters = taglineRef.current.querySelectorAll('span')

      /*
       * Every .set() carries an explicit position of 0. Without one it lands
       * at the timeline's CURRENT end, which puts these initial states
       * after the wipes and snaps the mark back to solid white.
       */
      tl.set([whiteRef.current, crimsonRef.current], { '--wipe': 0 }, 0)
      tl.set(markRef.current, { '--g1': 0, '--g2': 0, '--gb': 1, y: 52, opacity: 0 }, 0)
      tl.set(rings, { scale: 0.72, opacity: 0 }, 0)
      tl.set(letters, { y: 16, opacity: 0 }, 0)
      tl.set(glassRef.current, { '--bg-a': 1, '--blur': 0, '--sat': 1 }, 0)

      // 1. rings settle in behind, staggered.
      tl.to(
        rings,
        { scale: 1, opacity: 0.5, duration: 1.1, ease: 'power3.out', stagger: 0.13 },
        0,
      )

      // 2. wordmark rises, glow ramps on the same curve.
      tl.to(
        markRef.current,
        { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
        0.6,
      )
      tl.to(
        markRef.current,
        { '--g1': 9, '--g2': 30, '--gb': 1.14, duration: 0.8, ease: 'power4.out' },
        0.6,
      )

      // 3. the two wipes, each flaring the glow as it passes.
      tl.to(whiteRef.current, { '--wipe': 100, duration: 0.34, ease: 'power2.inOut' }, 1.0)
      tl.to(markRef.current, { '--g1': 14, '--g2': 46, '--gb': 1.24, duration: 0.34 }, 1.0)
      tl.to(crimsonRef.current, { '--wipe': 100, duration: 0.34, ease: 'power2.inOut' }, 1.28)
      tl.to(markRef.current, { '--g1': 18, '--g2': 58, '--gb': 1.3, duration: 0.34 }, 1.28)

      // 4. label, letter by letter.
      tl.to(
        letters,
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.034 },
        1.5,
      )

      // Glow returns to rest before the glass takes over.
      tl.to(markRef.current, { '--g1': 0, '--g2': 0, '--gb': 1, duration: 0.35 }, 2.2)

      /*
       * 5. glass rack-focus exit.
       *
       * The tint thins and the backdrop blur ramps up, so the page is now
       * visible THROUGH the panel but out of focus; the mark drifts forward
       * and blurs away; then the blur runs back to zero and the whole sheet
       * dissolves, the page racks into focus.
       */
      tl.to(
        glassRef.current,
        { '--bg-a': 0.52, '--blur': 34, '--sat': 1.35, duration: 0.5, ease: 'power2.out' },
        2.4,
      )
      tl.to(
        markRef.current,
        { scale: 1.5, '--mark-blur': 16, opacity: 0, duration: 0.7, ease: 'power2.in' },
        2.45,
      )
      tl.to(
        [ringsRef.current, taglineRef.current],
        { opacity: 0, scale: 1.2, duration: 0.6, ease: 'power2.in' },
        2.45,
      )
      tl.to(
        glassRef.current,
        { '--blur': 0, '--bg-a': 0, duration: 0.6, ease: 'power2.inOut' },
        2.95,
      )
      tl.to(rootRef.current, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 3.0)

      /*
       * GSAP runs on rAF, which browsers pause in background tabs, without
       * a wall-clock net the site would sit behind the glass forever.
       */
      const bail = setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1)
      }, 9000)

      return () => clearTimeout(bail)
    }, rootRef)

    return () => ctx.revert()
  }, [hidden, onDone])

  if (hidden) return null

  return (
    <div id="preloader" ref={rootRef} role="presentation">
      <div className="preloader__glass" ref={glassRef} />

      <div className="preloader__stage">
        <div className="preloader__rings" ref={ringsRef} aria-hidden="true">
          {RINGS.map((scale) => (
            <span key={scale} style={{ '--r': scale }} />
          ))}
        </div>

        {/* Three stacked states; the top two wipe away to reveal the real mark. */}
        <div className="preloader__mark" ref={markRef}>
          <div className="preloader__state preloader__state--real">
            <Logo as="div" />
          </div>
          <div className="preloader__state preloader__state--crimson" ref={crimsonRef}>
            <Logo as="div" />
          </div>
          <div className="preloader__state preloader__state--white" ref={whiteRef}>
            <Logo as="div" />
          </div>
        </div>

        <p className="preloader__tagline" ref={taglineRef}>
          {[...TAGLINE].map((char, index) => (
            // eslint-disable-next-line react/no-array-index-key -- fixed string
            <span key={index}>{char === ' ' ? ' ' : char}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

export default Preloader
