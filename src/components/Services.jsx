import Panel from './Panel'
import Link from './Link'
import Mark from './Mark'
import { services } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Services.css'

function Services() {
  const revealRef = useReveal()

  return (
    <Panel id="services" theme="dark" className="services">
      <div ref={revealRef}>
        <div className="panel__head">
          <p className="eyebrow reveal">
            <Mark className="eyebrow__mark" />
            {services.eyebrow}
          </p>
          <h2 className="section-title reveal" style={{ '--i': 1 }}>
            {services.title}
          </h2>
        </div>

        <ul className="services__list">
          {services.items.map((item, index) => (
            <li className="services__item reveal" key={item.kicker} style={{ '--i': index + 1 }}>
              {/*
               * A plain card, not a fill row. These open the method page, so
               * they behave like the hero's button: a quiet lift on hover
               * and a real navigation, rather than a sweep of colour.
               */}
              <Link className="services__row" to="/method">
                <span className="services__text">
                  <span className="services__kicker">{item.kicker}</span>
                  <span className="services__title">{item.title}</span>
                  <span className="services__body">{item.body}</span>
                  <span className="services__cta">
                    {services.cta}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <path
                        d="M4 12h15m0 0-6-6m6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

export default Services
