import { useEffect, useRef } from 'react'
import HeroBackground from './HeroBackground'
import Mark from './Mark'
import { hero } from '../content'
import { clamp, onFrame, scrollTo, write } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import './Hero.css'

/*
 * Chapter one. The name sits dead centre over the moving curtain, and the
 * whole scene is a scrub: scroll progress across the first viewport drives
 * the parallax, the push-back and the fade, so leaving the hero reads as
 * moving through it rather than past it.
 */
function Hero() {
  const { navigate } = useRouter()
  const rootRef = useRef(null)
  const contentRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    const bg = bgRef.current
    if (!root || !content || !bg) return

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
        bg.style.setProperty('--bg-scale', String(1 + progress * 0.16))
        bg.style.setProperty('--bg-y', `${progress * -40}px`)
      })
    })
  }, [])

  return (
    <section
      className="panel panel--dark hero"
      id="home"
      data-theme-section="dark"
      ref={rootRef}
    >
      <div className="hero__bg" ref={bgRef}>
        <HeroBackground />
      </div>
      <span className="panel__grain" aria-hidden="true" />

      <div className="panel__inner hero__inner" ref={contentRef}>
        <div className="container hero__content">
          <p className="eyebrow hero__eyebrow">
            <Mark className="eyebrow__mark" />
            {hero.eyebrow}
          </p>

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
