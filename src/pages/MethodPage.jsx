import Footer from '../components/Footer'
import Link from '../components/Link'
import Mark from '../components/Mark'
import Navbar from '../components/Navbar'
import { method } from '../content'
import { useReveal } from '../hooks/useReveal'
import './MethodPage.css'

function MethodPage() {
  const revealRef = useReveal()

  return (
    <>
      <Navbar />

      <main className="method" ref={revealRef}>
        <div className="container method__inner">
          <header className="method__head">
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {method.eyebrow}
            </p>
            <h1 className="section-title reveal" style={{ '--i': 1 }}>
              {method.title}
            </h1>
            <p className="section-lede reveal" style={{ '--i': 2 }}>
              {method.lede}
            </p>
          </header>

          <ol className="method__phases">
            {method.phases.map((phase, index) => (
              <li className="method__phase reveal" key={phase.n} style={{ '--i': index + 1 }}>
                <span className="method__n">{phase.n}</span>

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

          <section className="method__principles">
            <h2 className="method__section-title reveal">{method.principlesTitle}</h2>
            <div className="method__principle-grid">
              {method.principles.map((principle, index) => (
                <article
                  className="method__principle reveal"
                  key={principle.title}
                  style={{ '--i': index + 1 }}
                >
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </section>

          <dl className="method__stats reveal">
            {method.stats.map((stat) => (
              <div key={stat.label}>
                <dt>
                  {stat.value}
                  <span>{stat.suffix}</span>
                </dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>

          <section className="method__cta reveal">
            <h2>{method.ctaTitle}</h2>
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
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default MethodPage
