import { useEffect, useRef } from 'react'
import { useContent } from '../content'
import { clamp, onFrame, reducedMotion, scrollTo, trackRect, write } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import './Hero.css'

/*
 * Chapter one.
 *
 * The name sits over one crimson field, and the whole scene is a scrub:
 * scroll progress across the first viewport drives the parallax, the
 * push-back and the fade, so leaving the hero reads as moving through it
 * rather than past it.
 *
 * The field is CSS. What used to be here was a 30fps canvas painting drifting
 * blooms; it looked good and was carefully cost-managed, but it was a second
 * material doing the same job as the fields on every card below, and a
 * full-viewport canvas is the largest frame cost a phone pays on this page.
 */
function Hero() {
  const { hero } = useContent()
  const { navigate } = useRouter()
  const rootRef = useRef(null)
  const contentRef = useRef(null)
  const fieldRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    const field = fieldRef.current
    if (!root || !content || !field) return

    let last = -1

    return onFrame((time, scrollY, moved) => {
      if (!moved) return

      /*
       * Measured from the scroll position, not from the panel's rect. The
       * hero is the first panel in the stack, so it pins at top: 0 and its
       * rect reports 0 forever, which would freeze the scrub at zero.
       */
      const progress = clamp(scrollY / window.innerHeight)
      if (Math.abs(progress - last) < 0.001) return
      last = progress

      write(() => {
        content.style.setProperty('--p', String(progress))
        /* The light stays a beat behind the copy, which is what sells it as
           being behind the page rather than printed on it. */
        field.style.setProperty('--scrub', String(progress * 0.5))
      })
    })
  }, [])

  /*
   * Pointer light, fine pointers only. Two numbers written to custom
   * properties that CSS transitions; no rAF loop, and nothing to fall behind
   * under throttling. trackRect caches the box so this does not force a
   * layout on every pointermove (see AGENTS.md).
   */
  useEffect(() => {
    const field = fieldRef.current
    if (!field || reducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const rectOf = trackRect(field)

    const onMove = (event) => {
      const rect = rectOf()
      field.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
      field.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      rectOf.stop()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section className="panel panel--dark hero" id="home" data-theme-section="dark" ref={rootRef}>
      <span className="hero__field" ref={fieldRef} aria-hidden="true" />
      <span className="panel__grain" aria-hidden="true" />

      <div className="panel__inner hero__inner" ref={contentRef}>
        <div className="container hero__content">
          <h1 className="hero__name">
            {hero.name.split(' ').map((word) => (
              <span className="hero__word" key={word}>
                <span>{word}</span>
              </span>
            ))}
          </h1>

          <p className="hero__tagline">{hero.tagline}</p>
          <p className="hero__subtitle">{hero.subtitle}</p>

          <div className="hero__actions">
            {/* Goes to the contact page, not the closing chapter. */}
            <a
              className="btn btn--primary"
              href="/contact"
              onClick={(event) => {
                event.preventDefault()
                navigate('/contact')
              }}
            >
              {hero.primary}
              <span className="btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path
                    d="M4 12h15m0 0-6-6m6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>

            <a
              className="btn btn--ghost"
              href="#work"
              onClick={(event) => {
                event.preventDefault()
                scrollTo('#work')
              }}
            >
              {hero.secondary}
            </a>
          </div>

          <dl className="hero__stats">
            {hero.stats.map((stat) => (
              <div className="hero__stat" key={stat.label}>
                <dt>
                  {stat.value}
                  <span>{stat.suffix}</span>
                </dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <span className="hero__cue" aria-hidden="true">
        <span />
      </span>
    </section>
  )
}

export default Hero
