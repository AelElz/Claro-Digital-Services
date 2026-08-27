import Footer from '../components/Footer'
import Link from '../components/Link'
import Navbar from '../components/Navbar'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './MethodPage.css'

/*
 * The walk, and the one idea this page owns.
 *
 * Four phases are a real sequence, so the page has to get warmer as it goes:
 * wine, plum, crimson, ember. The hue lives in the markup rather than in a
 * nth-child rule because it is content order, not decoration order, and a
 * reader of this file should be able to see the progression without opening
 * the stylesheet.
 *
 * `plum` is not one of the five shared hues in index.css. That file belongs
 * to someone else this week, so MethodPage.css names the two steps it needs
 * from the family tokens directly; everything else about the field is the
 * shared primitive.
 */
const PHASE_HUES = ['wine', 'plum', 'crimson', 'ember']

/*
 * The principles echo the same direction at half strength. They are the
 * quiet reprise, not a second spectrum competing with the phases, and they
 * hand the page over to the ember close.
 */
const PRINCIPLE_HUES = ['violet', 'magenta', 'crimson', 'ember']

/*
 * /method.
 *
 * Black ground, like everywhere else on this site. The page used to paint
 * four dark red bands stepping toward the footer's maroon, which meant the
 * warmth belonged to the backgrounds and the cards had to fight them. It
 * belongs to the fields now: the ground stays black and the four phase
 * cards carry the temperature, so the progression is a thing you can see
 * rather than a caption you have to read.
 */
function MethodPage() {
  const { method } = useContent()
  const revealRef = useReveal()

  return (
    <>
      <Navbar />

      <main className="method" ref={revealRef}>
        <span className="method__grain" aria-hidden="true" />

        <section className="method__band method__band--intro">
          <div className="container">
            <header className="method__head">
              <h1 className="section-title reveal">{method.title}</h1>
              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {method.lede}
              </p>
            </header>

            <ol className="method__phases">
              {method.phases.map((phase, index) => (
                <li
                  className="card method__phase reveal"
                  key={phase.n}
                  style={{ '--i': index + 1 }}
                >
                  <span className="field" data-hue={PHASE_HUES[index]} aria-hidden="true" />

                  {/* The list already announces its own numbering. */}
                  <p className="method__n tnum" aria-hidden="true">
                    {phase.n}
                  </p>

                  <div className="method__phase-body">
                    <h2 className="method__phase-title">{phase.title}</h2>
                    <p className="method__phase-text">{phase.body}</p>
                  </div>

                  <div className="method__deliverables">
                    <h3>{method.deliverablesLabel}</h3>
                    <ul>
                      {phase.deliverables.map((item) => (
                        <li key={item}>
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                            <path
                              d="m5 12.5 4.5 4.5L19 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="method__band method__band--principles">
          <div className="container">
            <h2 className="sub-title reveal">{method.principlesTitle}</h2>

            <div className="method__principles">
              {method.principles.map((principle, index) => (
                <article
                  className="card method__principle reveal"
                  key={index}
                  style={{ '--i': index + 1 }}
                >
                  <span className="field" data-hue={PRINCIPLE_HUES[index]} aria-hidden="true" />
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="method__band method__band--stats">
          <div className="container">
            <dl className="method__stats">
              {/*
               * Keyed on the index, not on the label. The label is copy, so a
               * language switch would change the key and remount the item
               * without `is-in`, which is opacity 0 (see AGENTS.md). This
               * list is fixed length and never reorders.
               */}
              {method.stats.map((stat, index) => (
                <div className="method__stat reveal" key={index} style={{ '--i': index }}>
                  <dt className="tnum">
                    {stat.value}
                    <span>{stat.suffix}</span>
                  </dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="method__band method__band--cta">
          <div className="container">
            <div className="card method__cta reveal">
              <span className="field" data-hue="ember" aria-hidden="true" />
              <h2 className="section-title">{method.ctaTitle}</h2>
              <p>{method.ctaBody}</p>

              <div className="method__cta-actions">
                <Link className="btn btn--primary" to="/contact">
                  {method.ctaPrimary}
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
                <Link className="btn btn--ghost" to="/work">
                  {method.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default MethodPage
