import Panel from './Panel'
import Link from './Link'
import { slug, useContent } from '../content'
import { useCircularReveal } from '../hooks/useCircularReveal'
import { useReveal } from '../hooks/useReveal'
import './Work.css'

/*
 * The record.
 *
 * Five engagements, one line each: who, where, what came of it. The same
 * markup reads two ways, because the two devices cannot be given the same
 * thing. On a desktop it is a table whose rows fill with light under the
 * pointer; on a phone a hover fill is unreachable, so each engagement is a
 * card you tap, with a visible affordance where the fill would have been.
 *
 * The chapter gets one field, low-strength and masked at both ends, so the
 * hero's light is still in the room without competing with five lines of
 * text set over it.
 */
function Work() {
  const { work } = useContent()
  const revealRef = useReveal()
  const hoverRef = useCircularReveal()

  return (
    <Panel id="work" theme="dark" className="work">
      <div className="work__scene" ref={revealRef}>
        {/*
         * The field carries .reveal because that is the only class useReveal
         * looks for; without it the field never gets .is-in and stays at
         * opacity 0 under html.js. See Work.css for why the reveal's own
         * transition is extended rather than replaced.
         */}
        <span className="field reveal work__field" data-hue="magenta" aria-hidden="true" />

        <div className="panel__head panel__head--split">
          <h2 className="section-title reveal">{work.title}</h2>
          <p className="section-lede reveal" style={{ '--i': 1 }}>
            {work.lede}
          </p>
        </div>

        <div className="work__table" ref={hoverRef}>
          {/* Column headings exist only where there are columns. */}
          <div className="work__legend reveal" aria-hidden="true">
            <span>{work.columnLeft}</span>
            <span>{work.columnResult}</span>
          </div>

          <ul className="work__list">
            {/*
             * Keyed on the index, not on the client name. The list is fixed
             * length and never reorders, and a key taken from copy changes
             * with the language, which remounts the row without .is-in and
             * empties the chapter (AGENTS.md).
             */}
            {work.items.map((item, index) => (
              <li className="work__item reveal" key={index} style={{ '--i': index + 1 }}>
                <Link
                  className="reveal-row reveal-row--block work__row"
                  to={`/work/${slug(item.client)}`}
                >
                  <span className="reveal-row__fill" aria-hidden="true" />
                  <span className="reveal-row__text work__cells">
                    <span className="work__client">{item.client}</span>
                    <span className="work__city">{item.city}</span>
                    <span className="work__result">{item.result}</span>
                    <span className="work__go" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
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

          <p className="work__foot reveal">{work.footnote}</p>
        </div>
      </div>
    </Panel>
  )
}

export default Work
