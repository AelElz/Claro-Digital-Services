import { useRef, useState } from 'react'
import Panel from './Panel'
import Link from './Link'
import { slug, useContent } from '../content'
import { useCircularReveal } from '../hooks/useCircularReveal'
import { useReveal } from '../hooks/useReveal'
import { reducedMotion } from '../lib/motion'
import './Sectors.css'

/*
 * The family, walked in order, one hue per sector, so moving down the list
 * moves the light warm to cool rather than jumping around inside it. Six
 * sectors against five hues, so the last returns to the first; it is aimed
 * from a different corner (see the inline --fx/--fy below), so it reads as
 * the far end of the walk rather than as a repeat.
 */
const HUES = ['ember', 'crimson', 'magenta', 'violet', 'wine', 'ember']

/*
 * Six sectors, a tablist and one detail card.
 *
 * The card is a .card with a field in it, and the field is what actually
 * carries the switch: choosing a sector changes the hue and moves the light
 * across the card, so the answer to "did that do anything" is a change in
 * the temperature of the whole panel, not a paragraph swap.
 *
 * The roles here used to be a promise the component did not keep. It
 * declared role="tablist" / role="tab" / aria-selected / aria-controls, all
 * correctly wired, and then implemented none of the keyboard model those
 * roles commit to: six tabs in the tab order, arrow keys dead. A tablist is
 * a contract, so the contract is honoured below.
 */
function Sectors() {
  const { sectors, a11y } = useContent()
  const revealRef = useReveal()
  const hoverRef = useCircularReveal()
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const tabsRef = useRef([])

  const count = sectors.items.length
  const current = sectors.items[active]

  /*
   * Arrow keys on a tablist ACTIVATE as they move, they do not just move
   * focus: with automatic activation the panel is always the panel for the
   * tab you are on, so a keyboard reader never has to guess whether they
   * still need to press Enter.
   */
  const select = (next) => {
    setActive(next)

    const tab = tabsRef.current[next]
    if (!tab) return

    /*
     * preventScroll, then scroll the strip by hand. Native focus scrolling
     * walks every scrollable ancestor including the document, and this page
     * is driven by Lenis, whose position a direct document scroll silently
     * desynchronises (AGENTS.md). Only the strip is allowed to move.
     */
    tab.focus({ preventScroll: true })

    const list = listRef.current
    if (!list || list.scrollWidth <= list.clientWidth) return

    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    })
  }

  const onKeyDown = (event) => {
    /*
     * Both axes. The strip is horizontal on a phone and vertical on a wide
     * screen, and a reader who cannot see which it is should not have to
     * find out by trial.
     */
    const next = {
      ArrowRight: (active + 1) % count,
      ArrowDown: (active + 1) % count,
      ArrowLeft: (active - 1 + count) % count,
      ArrowUp: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }[event.key]

    if (next === undefined) return
    event.preventDefault()
    select(next)
  }

  return (
    <Panel id="sectors" theme="dark" className="sectors">
      <div ref={revealRef}>
        <div className="panel__head panel__head--split">
          <h2 className="section-title reveal">{sectors.title}</h2>
          <p className="section-lede reveal" style={{ '--i': 1 }}>
            {sectors.lede}
          </p>
        </div>

        <dl className="sectors__stats reveal">
          {/* Keyed on the index. A key taken from copy changes with the
              language, which remounts the node (AGENTS.md); the list is fixed
              length and never reorders, so the index is the stable one. */}
          {sectors.stats.map((stat, index) => (
            <div key={index}>
              <dt>
                {stat.value}
                {/* The suffix leaves the serif: Bodoni draws + and / as
                    hairlines that vanish outright at this size. */}
                <span>{stat.suffix}</span>
              </dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <div className="sectors__body reveal" style={{ '--i': 1 }}>
          {/*
           * A div, not a ul. role="tablist" replaces the list semantics, and
           * a listitem is not a permitted child of a tablist, so the li
           * wrappers were markup that only made the tree wrong.
           */}
          <div
            className="sectors__nav"
            ref={(node) => {
              listRef.current = node
              hoverRef.current = node
            }}
            role="tablist"
            aria-label={a11y.sectors}
            onKeyDown={onKeyDown}
          >
            {sectors.items.map((item, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                id={`sector-tab-${index}`}
                aria-selected={index === active}
                aria-controls="sector-panel"
                /* Roving tabindex: one stop for the whole list, so Tab
                   leaves the tablist instead of walking through six. */
                tabIndex={index === active ? 0 : -1}
                ref={(node) => {
                  tabsRef.current[index] = node
                }}
                className={`reveal-row sectors__tab${
                  index === active ? ' sectors__tab--active' : ''
                }`}
                onClick={() => setActive(index)}
              >
                <span className="reveal-row__fill" aria-hidden="true" />
                <span className="reveal-row__text">{item.name}</span>
              </button>
            ))}
          </div>

          {/*
           * Keyed on the active index so React remounts it. That is what
           * replays the field's bloom on every switch: the reveal hook
           * adopts late-mounted .reveal nodes, so the new field is measured,
           * turned on, and opens in its new hue. An index is a safe key here
           * (fixed length, never reorders); a key taken from copy would
           * remount the panel on a language switch instead.
           */}
          <div
            className="card sectors__detail"
            id="sector-panel"
            role="tabpanel"
            aria-labelledby={`sector-tab-${active}`}
            key={active}
          >
            <span
              className="field reveal sectors__field"
              data-hue={HUES[active]}
              style={{
                '--fx': `${90 - active * 9}%`,
                '--fy': `${10 + active * 9}%`,
                '--fx2': `${16 + active * 7}%`,
                '--fy2': `${94 - active * 7}%`,
              }}
              aria-hidden="true"
            />

            <h3 className="sub-title sectors__title">{current.title}</h3>
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
