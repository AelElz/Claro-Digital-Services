import Panel from './Panel'
import Link from './Link'
import Mark from './Mark'
import { slug, useContent } from '../content'
import { useCircularReveal } from '../hooks/useCircularReveal'
import { useReveal } from '../hooks/useReveal'
import './Work.css'

function Work() {
  const { work } = useContent()
  const revealRef = useReveal()
  const hoverRef = useCircularReveal()

  return (
    <Panel id="work" theme="dark" className="work">
      <div ref={revealRef}>
        <div className="panel__head panel__head--split">
          <div>
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {work.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {work.title}
            </h2>
          </div>
          <p className="section-lede reveal" style={{ '--i': 2 }}>
            {work.lede}
          </p>
        </div>

        <div className="work__table" ref={hoverRef}>
          <div className="work__legend reveal" aria-hidden="true">
            <span>{work.columnLeft}</span>
            <span>{work.columnResult}</span>
          </div>

          <ul className="work__list">
            {work.items.map((item, index) => (
              <li className="work__item reveal" key={item.client} style={{ '--i': index + 1 }}>
                <Link className="reveal-row reveal-row--block work__row" to={`/work/${slug(item.client)}`}>
                  <span className="reveal-row__fill" aria-hidden="true" />
                  <span className="reveal-row__text work__cells">
                    <span className="work__client">{item.client}</span>
                    <span className="work__city">{item.city}</span>
                    <span className="work__result">{item.result}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="work__foot reveal">{work.footnote}</p>
        </div>
      </div>
    </Panel>
  )
}

export default Work
