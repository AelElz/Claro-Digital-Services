import Panel from './Panel'
import Link from './Link'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Services.css'

/*
 * The four families, each one a card that opens the method page.
 *
 * It used to be a flat list of rows with a coloured kicker. It is four cards
 * now, each with a field bleeding from its top edge, and the hues walk
 * ember -> crimson -> magenta -> violet in reading order so the set warms and
 * cools across the grid as one spectrum rather than four unrelated choices.
 */
const HUES = ['ember', 'crimson', 'magenta', 'violet']

function Services() {
  const { services } = useContent()
  const revealRef = useReveal()

  return (
    <Panel id="services" theme="dark" className="services">
      <div ref={revealRef}>
        <div className="panel__head">
          <h2 className="section-title reveal">{services.title}</h2>
        </div>

        <ul className="services__list">
          {/*
           * Keyed on the index, not on the copy. The list is fixed and never
           * reorders, and a key taken from a translated string changes when
           * the language does, which remounts the card: it comes back
           * without its reveal class, so it fades in again or, before
           * useReveal learned to adopt new nodes, never reappeared at all.
           */}
          {services.items.map((item, index) => (
            <li className="services__item reveal" key={index} style={{ '--i': index + 1 }}>
              {/*
               * The whole card is the link, so the tap target is the card and
               * nothing needs a coarse-pointer minimum.
               */}
              <Link className="card services__card" to="/method">
                <span className="field" data-hue={HUES[index % HUES.length]} aria-hidden="true" />
                <span className="services__label">{item.kicker}</span>
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

export default Services
