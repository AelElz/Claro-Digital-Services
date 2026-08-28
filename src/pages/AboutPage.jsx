import { useEffect, useRef } from 'react'
import Footer from '../components/Footer'
import Link from '../components/Link'
import Logo from '../components/Logo'
import Navbar from '../components/Navbar'
import PromptBar from '../components/PromptBar'
import { useContent } from '../content'
import { useFieldBloom } from '../hooks/useFieldBloom'
import { useReveal } from '../hooks/useReveal'
import { clamp, onFrame, reducedMotion, trackRect, write } from '../lib/motion'
import './AboutPage.css'

/* How far in the scene starts, and how far the dome leads it. */
const ZOOM_FROM = 1.24
const DRIFT_PX = 50

/*
 * The four principles walk the family in order, warm to cool, so the column
 * reads as one spectrum rather than four unrelated cards. Fixed length, and
 * paired with the items by position.
 */
const PRINCIPLE_HUES = ['ember', 'crimson', 'magenta', 'violet']

/*
 * The window.
 *
 * Depth without a 3D library: layers at different distances inside one
 * perspective. The dome sits behind, the mark stands in front of it, and the
 * two move by different amounts, which is the whole trick. Scroll drives a
 * slow zoom out, the pointer drives a small tilt.
 *
 * Zoom and tilt live on two nested elements on purpose. Both would otherwise
 * want to write `transform` on the same node and the second one would simply
 * replace the first.
 *
 * The dome itself used to be four hand-blurred radial ellipses traced off
 * design/Design 6.svg, which predated the field primitive and was therefore a
 * second material doing the field's job. It is three `.field`s now, at three
 * depths, hues walking ember over crimson over wine: the same gradient stops
 * and the same grain rule as every card on the site, only arranged into a
 * dome and pushed apart in Z.
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
          {/* Farthest and widest first, so the near ones paint over them. */}
          <span className="field stage__field stage__field--far" data-hue="wine" aria-hidden="true" />
          <span className="field stage__field stage__field--mid" data-hue="crimson" aria-hidden="true" />
          <span className="field stage__field stage__field--near" data-hue="ember" aria-hidden="true" />

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

  /*
   * Fields bloom on arrival; `useReveal` only adopts `.reveal`.
   *
   * A field must NOT carry `.reveal` as well. `html.js .reveal` declares a
   * `transition` shorthand at a specificity `.field` cannot beat, so the
   * shorthand would replace the field's own scale animation and the bloom
   * would silently become a plain fade. Same trap as the one this page had
   * on `.about__item`; the fix is a separate pass over the same root, which
   * is what this hook is.
   */
  useFieldBloom(revealRef)

  return (
    <>
      <Navbar />

      <main className="about" ref={revealRef}>
        {/*
         * The headline IS the headline. This used to open on the full lockup
         * at 620px as its own title, which put the wordmark twice on one
         * screen: once here and once in the bar sixty pixels above it. The
         * serif carries the page; one field runs behind the whole header, at
         * page scale, the way the home page opens.
         */}
        <header className="about__hero">
          <span className="field about__hero-field" data-hue="crimson" aria-hidden="true" />

          <div className="container about__hero-inner">
            <h1 className="about__title reveal">{about.title}</h1>
            <p className="about__lede reveal" style={{ '--i': 1 }}>
              {about.lede}
            </p>
          </div>
        </header>

        <section className="about__stage-section">
          <div className="container about__stage-head">
            <h2 className="section-title reveal">{about.stage.title}</h2>
            <p className="section-lede reveal" style={{ '--i': 1 }}>
              {about.stage.lede}
            </p>
          </div>

          <div className="container">
            <Stage />
          </div>
        </section>

        <section className="container about__story">
          <div className="about__story-head">
            <h2 className="section-title reveal">{about.story.title}</h2>
          </div>

          <div className="about__story-body">
            {about.story.paragraphs.map((paragraph, index) => (
              /*
               * The opening paragraph is the argument of the whole page, so
               * it is set in the display serif and the rest run as body
               * beneath it. One emphasis, at the top, not three.
               */
              <p
                className={index === 0 ? 'about__story-lead reveal' : 'reveal'}
                key={index}
                style={{ '--i': index + 1 }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="container about__principles">
          <div className="about__principles-head">
            <h2 className="section-title reveal">{about.principles.title}</h2>
          </div>

          <ol className="about__list">
            {about.principles.items.map((item, index) => (
              <li className="card about__item reveal" key={item.n} style={{ '--i': index + 1 }}>
                <span
                  className="field"
                  data-hue={PRINCIPLE_HUES[index % PRINCIPLE_HUES.length]}
                  aria-hidden="true"
                />
                {/*
                 * The hover rim is its own element, not a `transition` on the
                 * card. This <li> carries `.reveal`, and a transition
                 * shorthand on it would replace the reveal's own transition
                 * and its stagger, killing the entrance outright. That bug
                 * shipped here once.
                 */}
                <span className="about__item-ring" aria-hidden="true" />
                <span className="about__n">{item.n}</span>
                <h3 className="about__item-title">{item.title}</h3>
                <p className="about__item-body">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <dl className="container about__stats">
          {about.stats.map((stat, index) => (
            <div className="about__stat reveal" key={index} style={{ '--i': index + 1 }}>
              {/*
               * The suffix drops out of the serif. Bodoni draws "+" and "/"
               * as near-hairlines and at this size in crimson on black they
               * vanish outright, so "70+" reads as "70".
               */}
              <dt>
                {stat.value}
                {stat.suffix ? <span>{stat.suffix}</span> : null}
              </dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <section className="container about__cta">
          <div className="card about__cta-card">
            <span className="field" data-hue="wine" aria-hidden="true" />

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
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default AboutPage
