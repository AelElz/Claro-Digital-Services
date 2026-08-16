import { useEffect, useRef } from 'react'
import Footer from '../components/Footer'
import Link from '../components/Link'
import Logo from '../components/Logo'
import Mark from '../components/Mark'
import Navbar from '../components/Navbar'
import PromptBar from '../components/PromptBar'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import { clamp, onFrame, reducedMotion, trackRect, write } from '../lib/motion'
import './AboutPage.css'

/* How far in the scene starts, and how far the mark leads it. */
const ZOOM_FROM = 1.24
const DRIFT_PX = 50

/*
 * The window.
 *
 * Depth without a 3D library: three layers at different distances inside one
 * perspective. The glow sits behind, the mark stands in front of it, and the
 * two move by different amounts, which is the whole trick. Scroll drives a
 * slow zoom out, the pointer drives a small tilt.
 *
 * Zoom and tilt live on two nested elements on purpose. Both would otherwise
 * want to write `transform` on the same node and the second one would simply
 * replace the first.
 */
function Stage() {
  const { about } = useContent()
  const frameRef = useRef(null)
  const zoomRef = useRef(null)
  const tiltRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current
    const zoom = zoomRef.current
    if (!frame || !zoom || reducedMotion()) return

    return onFrame((time, scrollY, moved) => {
      if (!moved) return

      const rect = frame.getBoundingClientRect()
      const viewport = window.innerHeight

      /*
       * 0 as the frame's top edge crosses the bottom of the screen, 1 the
       * moment the frame is centred in it. Running the zoom over the whole
       * pass instead would mean it only ever settles once the window has
       * left, so the composed state is the one nobody sees.
       */
      const travel = (viewport + rect.height) / 2
      const progress = clamp((viewport - rect.top) / travel)

      const scale = ZOOM_FROM - (ZOOM_FROM - 1) * progress
      const drift = (0.5 - progress) * DRIFT_PX

      write(() => {
        zoom.style.setProperty('--zoom', String(scale))
        zoom.style.setProperty('--drift', `${drift}px`)
      })
    })
  }, [])

  /*
   * Pointer tilt is written straight to two custom properties and smoothed
   * by a CSS transition rather than interpolated in a frame loop. There is
   * no loop to fall behind, and it costs nothing when the pointer is still.
   */
  useEffect(() => {
    const frame = frameRef.current
    const tilt = tiltRef.current
    if (!frame || !tilt || reducedMotion()) return

    /* Cached. Reading the frame back on every pointer event would force a
       layout per event, and this handler writes two custom properties right
       after, so the two would thrash for as long as the pointer moved. */
    const rectOf = trackRect(frame)

    const onMove = (event) => {
      const rect = rectOf()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      tilt.style.setProperty('--ry', `${x * 9}deg`)
      tilt.style.setProperty('--rx', `${-y * 6}deg`)
    }

    const onLeave = () => {
      tilt.style.setProperty('--ry', '0deg')
      tilt.style.setProperty('--rx', '0deg')
    }

    frame.addEventListener('pointermove', onMove, { passive: true })
    frame.addEventListener('pointerleave', onLeave)
    return () => {
      rectOf.stop()
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="stage" ref={frameRef}>
      {/* Outside the zoom, so the texture stays put while the scene moves. */}
      <span className="stage__grain" aria-hidden="true" />

      <div className="stage__zoom" ref={zoomRef}>
        <div className="stage__tilt" ref={tiltRef}>
          <span className="stage__glow" aria-hidden="true" />

          <div className="stage__front">
            <Logo as="div" className="stage__logo" />
            <PromptBar phrases={about.stage.prompts} />
          </div>
        </div>
      </div>
    </div>
  )
}

function AboutPage() {
  const { about } = useContent()
  const revealRef = useReveal()

  return (
    <>
      <Navbar />

      <main className="about" ref={revealRef}>
        {/*
         * The mark is the headline here, set large and hard against the left
         * column, with the copy stacked beside it.
         */}
        <header className="about__hero container">
          <div className="about__hero-mark">
            <Logo as="div" full className="about__logo reveal" />
          </div>

          <div className="about__hero-copy">
            <p className="eyebrow reveal" style={{ '--i': 1 }}>
              <Mark className="eyebrow__mark" />
              {about.eyebrow}
            </p>
            <h1 className="about__title reveal" style={{ '--i': 2 }}>
              {about.title}
            </h1>
            <p className="about__lede reveal" style={{ '--i': 3 }}>
              {about.lede}
            </p>
          </div>
        </header>

        <section className="about__stage-section">
          <div className="container about__stage-head">
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {about.stage.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {about.stage.title}
            </h2>
            <p className="section-lede reveal" style={{ '--i': 2 }}>
              {about.stage.lede}
            </p>
          </div>

          <div className="container">
            <Stage />
          </div>
        </section>

        <section className="container about__story">
          <div className="about__story-head">
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {about.story.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {about.story.title}
            </h2>
          </div>

          <div className="about__story-body">
            {about.story.paragraphs.map((paragraph, index) => (
              <p className="reveal" key={index} style={{ '--i': index + 1 }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="container about__principles">
          <div className="about__principles-head">
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {about.principles.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {about.principles.title}
            </h2>
          </div>

          <ol className="about__list">
            {about.principles.items.map((item, index) => (
              <li className="about__item reveal" key={item.n} style={{ '--i': index + 1 }}>
                <span className="about__n">{item.n}</span>
                <h3 className="about__item-title">{item.title}</h3>
                <p className="about__item-body">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container about__stats">
          {about.stats.map((stat, index) => (
            <div className="about__stat reveal" key={index} style={{ '--i': index + 1 }}>
              <p className="about__stat-value">
                {stat.value}
                <span>{stat.suffix}</span>
              </p>
              <p className="about__stat-label">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="container about__cta">
          <h2 className="section-title reveal">{about.cta.title}</h2>
          <p className="section-lede reveal" style={{ '--i': 1 }}>
            {about.cta.body}
          </p>

          <div className="about__cta-actions reveal" style={{ '--i': 2 }}>
            <Link className="btn btn--primary" to="/contact">
              {about.cta.action}
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
            </Link>

            <Link className="btn btn--ghost" to="/method">
              {about.cta.secondary}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default AboutPage
