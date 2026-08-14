import { useState } from 'react'
import Panel from './Panel'
import Link from './Link'
import Mark from './Mark'
import { sectors, slug } from '../content'
import { useCircularReveal } from '../hooks/useCircularReveal'
import { useReveal } from '../hooks/useReveal'
import './Sectors.css'

function Sectors() {
  const revealRef = useReveal()
  const hoverRef = useCircularReveal()
  const [active, setActive] = useState(0)
  const current = sectors.items[active]

  return (
    <Panel id="sectors" theme="light" className="sectors">
      <div ref={revealRef}>
        <div className="panel__head panel__head--split">
          <div>
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {sectors.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {sectors.title}
            </h2>
          </div>
          <p className="section-lede reveal" style={{ '--i': 2 }}>
            {sectors.lede}
          </p>
        </div>

        <dl className="sectors__stats reveal">
          {sectors.stats.map((stat) => (
            <div key={stat.label}>
              <dt>
                {stat.value}
                <span>{stat.suffix}</span>
              </dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <div className="sectors__body reveal" style={{ '--i': 1 }}>
          <ul className="sectors__nav" ref={hoverRef} role="tablist" aria-label="Sectors">
            {sectors.items.map((item, index) => (
              <li key={item.name}>
                <button
                  type="button"
                  role="tab"
                  id={`sector-tab-${index}`}
                  aria-selected={index === active}
                  aria-controls="sector-panel"
                  className={`reveal-row sectors__tab${
                    index === active ? ' sectors__tab--active' : ''
                  }`}
                  onClick={() => setActive(index)}
                >
                  <span className="reveal-row__fill" aria-hidden="true" />
                  <span className="reveal-row__text">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

          {/*
           * Keyed on the active index so React remounts it, that restarts
           * the enter animation on every switch instead of leaving the new
           * copy sitting in the finished state.
           */}
          <div
            className="sectors__detail"
            id="sector-panel"
            role="tabpanel"
            aria-labelledby={`sector-tab-${active}`}
            key={active}
          >
            <p className="sectors__kicker">{current.name}</p>
            <h3 className="sectors__title">{current.title}</h3>
            <p className="sectors__lede">{current.body}</p>

            <ul className="sectors__points">
              {current.points.map((point) => (
                <li key={point}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            <div className="sectors__case">
              <span className="sectors__case-label">{sectors.caseLabel}</span>
              <span className="sectors__case-name">{current.caseStudy}</span>
              <Link className="sectors__case-cta" to={`/work/${slug(current.caseStudy)}`}>
                {sectors.caseCta}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                  <path
                    d="M4 12h15m0 0-6-6m6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default Sectors
