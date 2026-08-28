import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Footer from '../components/Footer'
import Link from '../components/Link'
import Navbar from '../components/Navbar'
import { useContent } from '../content'
import { useFieldBloom } from '../hooks/useFieldBloom'
import { useReveal } from '../hooks/useReveal'
import { clamp, onFrame, reducedMotion, trackRect, write } from '../lib/motion'
import './WorkPage.css'

/*
 * /work
 *
 * The record, at full length: thirty six live client engagements ported from
 * clarodigi.com/en/projects. Built on the /about architecture, because that
 * is the page this one is a sibling of: one field at page scale behind a
 * serif headline, hairline-separated bands, `.card` plus `.field` for every
 * surface, the four-stat record, the wine CTA card, black throughout.
 *
 * What it does NOT do is repeat the home page's `Work` chapter. That one is
 * five rows in a table you hover; this is the whole index, and it earns its
 * own page three ways:
 *
 *   THE SPECTRUM   A card's field hue is its discipline, not decoration.
 *                  Ember is development, crimson is e-commerce, magenta is
 *                  design, violet is mobile. Scrolling the grid reads as one
 *                  spectrum that means something, and the filter pills are
 *                  the same four colours.
 *   THE LIGHT      One light source behind the whole grid, following the
 *                  pointer. It is the site's thesis stated literally, and it
 *                  is ONE element for thirty six cards rather than a hover
 *                  glow on each.
 *   THE DEAL       Changing the filter re-deals the grid, staggered, instead
 *                  of swapping one static list for another.
 *
 * The five engagements the home page can put a number on carry that number
 * here and get a double-width card, so the evidence is inside the gallery
 * rather than in a second section above it.
 */

/*
 * Discipline to hue. Walks the family warm to cool in the order the filter
 * lists them, so the pills and the cards agree and the page reads as one
 * spectrum rather than four unrelated colours.
 */
const HUE = {
  web: 'ember',
  ecommerce: 'crimson',
  design: 'magenta',
  mobile: 'violet',
}

/* The index counter is two digits for thirty six entries. */
const pad = (n) => String(n).padStart(2, '0')

/*
 * Where down the viewport a card counts as "reached" for the counter. 0.55
 * rather than 0.5 so the number ticks just after a row crosses the middle,
 * which is where the eye already is.
 */
const READ_LINE = 0.55

/*
 * One screenshot.
 *
 * Its own component because each of the thirty six owns its ready state, and
 * one `useState` per card is what keeps a single image landing from
 * re-rendering the other thirty five.
 *
 * `complete` is checked on mount as well as on the load event: a cached image
 * finishes decoding before React attaches the listener, so the event has
 * already fired, nothing else will fire, and the skeleton would shimmer
 * forever over a picture that is sitting right there. That matters more here
 * than anywhere else on the site, because the filter remounts the whole grid
 * and every image after the first pass is cached. `error` resolves too: a
 * broken image under a permanent skeleton is a wait that never ends.
 */
function Shot({ src }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const img = ref.current
    if (!img) return

    if (img.complete) {
      setReady(true)
      return
    }

    const settle = () => setReady(true)
    img.addEventListener('load', settle)
    img.addEventListener('error', settle)

    return () => {
      img.removeEventListener('load', settle)
      img.removeEventListener('error', settle)
    }
  }, [src])

  return (
    <span className="media works__shot">
      <img
        ref={ref}
        className={`media__img works__img${ready ? ' is-ready' : ''}`}
        src={src}
        /*
         * Empty on purpose. The card announces the client's name and what was
         * built for them in the two lines directly under this, so alt text
         * would read the same project twice to a screen reader. The picture
         * is the evidence for people who can see it.
         */
        alt=""
        width="760"
        height="475"
        loading="lazy"
        decoding="async"
      />
      {/* Sibling, not a child: the crossfade in index.css is keyed on
          `.media__img.is-ready + .media__skeleton`. */}
      <span className="media__skeleton skeleton" aria-hidden="true" />
    </span>
  )
}

/*
 * The pointer light behind the grid.
 *
 * Two numbers written to custom properties and smoothed by a CSS transition,
 * never a frame loop, so there is nothing to fall behind under throttling
 * and it costs nothing while the pointer is still. `trackRect` caches the box
 * so the handler does not force a layout on every pointermove.
 *
 * Its own properties rather than the hero's `--px`/`--py`: those are already
 * registered as inherited numbers by Hero.css, and registering a name twice
 * is not additive.
 */
function useGridLight(sceneRef, lightRef) {
  useEffect(() => {
    const scene = sceneRef.current
    const light = lightRef.current
    if (!scene || !light || reducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const rectOf = trackRect(scene)

    const onMove = (event) => {
      const rect = rectOf()
      light.style.setProperty('--wx', clamp((event.clientX - rect.left) / rect.width).toFixed(3))
      light.style.setProperty('--wy', clamp((event.clientY - rect.top) / rect.height).toFixed(3))
    }

    scene.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      rectOf.stop()
      scene.removeEventListener('pointermove', onMove)
    }
  }, [sceneRef, lightRef])
}

/*
 * The counter and the rail, driven by how far down the grid you are.
 *
 * Written straight to the two nodes rather than held in React state. This
 * runs on every frame the page moves, and a state update here would
 * re-render thirty six cards to change two digits.
 *
 * One rect read in the read phase, one write queued through write(), so it
 * joins the shared bus instead of starting a second rAF loop and cannot
 * interleave a read after somebody else's write.
 */
function useIndexProgress(gridRef, counterRef, railRef, count) {
  useEffect(() => {
    const grid = gridRef.current
    const counter = counterRef.current
    const rail = railRef.current
    if (!grid || !counter || !rail) return

    let last = -1

    return onFrame((time, scrollY, moved) => {
      if (!moved) return

      const rect = grid.getBoundingClientRect()
      /* A one-row grid has no travel; without the guard this divides by its
         own height and the counter sits at NaN. */
      if (rect.height <= 0) return

      const progress = clamp((window.innerHeight * READ_LINE - rect.top) / rect.height)
      /* Never 0 of 36: the first card is reached the moment the grid is. */
      const index = Math.min(count, Math.max(1, Math.ceil(progress * count)))

      write(() => {
        rail.style.setProperty('--fill', progress.toFixed(4))
        if (index === last) return
        last = index
        counter.textContent = pad(index)
      })
    })
  }, [gridRef, counterRef, railRef, count])
}

function WorkPage() {
  const { workPage } = useContent()
  const revealRef = useReveal()
  useFieldBloom(revealRef)

  const sceneRef = useRef(null)
  const lightRef = useRef(null)
  const gridRef = useRef(null)
  const counterRef = useRef(null)
  const railRef = useRef(null)
  const pillRef = useRef(null)
  const filterRefs = useRef([])

  /*
   * `filter` is the discipline key, `pass` counts how many times it has been
   * changed. Both are needed: the key decides what is shown, the count
   * decides HOW it arrives.
   *
   * On the first pass the cards carry `.reveal` and settle as you scroll to
   * them, the way every other section of the site does. On every pass after
   * that the list has been re-dealt by a deliberate act, all of it at once
   * and mostly above the fold, so the cards carry their own staggered deal
   * animation instead. A `.reveal` cannot do that second job: the list
   * remounts, `useReveal` adopts the new nodes through its MutationObserver
   * inside the same task, and a class added before the browser has ever
   * computed the "before" style produces no transition at all.
   */
  const [filter, setFilter] = useState('all')
  const [pass, setPass] = useState(0)

  const { projects, filters } = workPage

  /* Recomputed only when the language or the filter changes, not per frame. */
  const counts = useMemo(() => {
    const table = { all: projects.length }
    for (const project of projects) {
      for (const tag of project.tags) table[tag] = (table[tag] ?? 0) + 1
    }
    return table
  }, [projects])

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.tags.includes(filter))),
    [projects, filter],
  )

  useGridLight(sceneRef, lightRef)
  useIndexProgress(gridRef, counterRef, railRef, visible.length)

  /*
   * The pill under the active filter.
   *
   * Box offsets only, never `transform`. The nav's indicator has to animate
   * `left`/`width` because it is centred with `translateY(-50%)` and a
   * transform transition would replace that centring outright (AGENTS.md);
   * this one dodges the trap by taking the button's own `offsetTop` instead
   * of being centred at all, which also keeps it correct when the row wraps
   * to two lines. It wraps between 680 and roughly 1000px, and a pill parked
   * halfway between the two rows was the first thing this page got wrong.
   *
   * `filters` is a dependency even though `place` never reads it: the labels
   * do. "All" and "Tout" are different widths, so a language switch resizes
   * the thing the pill sits on without changing which thing it is, and the
   * pill would keep the previous language's width.
   */
  const active = filters.findIndex((f) => f.key === filter)

  const place = useCallback(() => {
    const button = filterRefs.current[active]
    const pill = pillRef.current
    if (!button || !pill) return

    pill.style.top = `${button.offsetTop}px`
    pill.style.left = `${button.offsetLeft}px`
    pill.style.width = `${button.offsetWidth}px`
    pill.style.opacity = '1'
  }, [active])

  /* Before paint, so the pill is never seen at 0,0 on the way to its place. */
  useLayoutEffect(place, [place, filters])

  /*
   * Re-measured when the webfont lands, which changes every label's width,
   * and on resize, which is what makes the row wrap in the first place.
   */
  useEffect(() => {
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [place])

  const choose = (key) => () => {
    if (key === filter) return
    setFilter(key)
    setPass((n) => n + 1)
  }

  return (
    <>
      <Navbar />

      <main className="works" ref={revealRef}>
        {/*
         * The headline is the headline. One field behind the whole header at
         * page scale, the way /about and the home page open, and no eyebrow
         * above it: the sentence carries its own weight.
         */}
        <header className="works__hero">
          <span className="field works__hero-field" data-hue="crimson" aria-hidden="true" />

          <div className="container works__hero-inner">
            <h1 className="works__title reveal">{workPage.title}</h1>
            <p className="works__lede reveal" style={{ '--i': 1 }}>
              {workPage.lede}
            </p>

            <dl className="works__meta reveal" style={{ '--i': 2 }}>
              {workPage.meta.map((fact, index) => (
                <div className="works__fact" key={index}>
                  {/*
                   * The suffix drops out of the serif. Bodoni draws "+" as a
                   * near-hairline and at this size in crimson on black it
                   * vanishes outright, so "12+" reads as "12".
                   */}
                  <dt>
                    {fact.value}
                    {fact.suffix ? <span>{fact.suffix}</span> : null}
                  </dt>
                  <dd>{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/*
         * Bar and grid share a parent so the bar unsticks at the end of the
         * index instead of following the record and the close all the way to
         * the footer.
         *
         * NOTHING in this subtree may take `overflow: hidden/clip/auto`.
         * `position: sticky` is silently ignored if any ancestor has it, and
         * the bar would simply scroll away with no error anywhere. The one
         * element here that scrolls is `.works__filters`, which is a
         * descendant of the sticky element rather than an ancestor of it.
         */}
        <section className="works__browse">
          <div className="works__bar">
            <div className="container works__bar-inner">
              <div className="works__filters" role="group" aria-label={workPage.filterLabel}>
                {/* Behind the buttons, so the label never sits on a moving
                    edge. Placed from JS; hidden until it has been. */}
                <span className="works__pill" ref={pillRef} aria-hidden="true" />

                {filters.map((entry, index) => (
                  <button
                    className="works__filter"
                    type="button"
                    key={entry.key}
                    ref={(el) => {
                      filterRefs.current[index] = el
                    }}
                    /*
                     * Undefined for 'all', which is the absence of a filter
                     * and therefore of a colour. React drops the attribute
                     * entirely and the dot hangs off `[data-hue]` in the
                     * stylesheet, so "All" does not wear e-commerce's crimson
                     * and claim to mean it.
                     */
                    data-hue={HUE[entry.key]}
                    aria-pressed={entry.key === filter}
                    onClick={choose(entry.key)}
                  >
                    {entry.label}
                    <span className="works__filter-n">{counts[entry.key] ?? 0}</span>
                  </button>
                ))}
              </div>

              {/*
               * How far down the index you are, not which card is which:
               * the grid packs its double-width cards densely, so visual
               * order and source order are not the same thing. aria-hidden
               * because it changes on every scroll tick and announcing that
               * would be unusable; the count below is what gets announced.
               */}
              <p className="works__count" aria-hidden="true">
                <span className="works__count-n" ref={counterRef}>
                  01
                </span>
                <span className="works__count-total">/{visible.length}</span>
              </p>
            </div>

            <span className="works__rail" aria-hidden="true">
              <span className="works__rail-fill" ref={railRef} />
            </span>

            {/* The one thing a screen reader should hear when the filter
                changes: how many projects are left. */}
            <p className="works__status" role="status">
              {`${visible.length} ${workPage.resultsLabel}`}
            </p>
          </div>

          <div className="works__index" ref={sceneRef}>
            {/* One light for thirty six cards. */}
            <span className="works__light" ref={lightRef} aria-hidden="true" />

            <div className="container">
              {/*
               * Keyed on the filter so a change remounts the list and the
               * deal animation plays on nodes the browser has never laid out
               * before. The key is the filter KEY, which is locale
               * independent: a key taken from a label would change with the
               * language and re-deal the whole grid on a language switch.
               */}
              <ul className="works__grid" key={filter} ref={gridRef} data-pass={pass || undefined}>
                {visible.map((project, index) => (
                  <li
                    className={pass ? 'works__item works__item--dealt' : 'works__item reveal'}
                    key={project.slug}
                    data-wide={project.result ? '' : undefined}
                    /*
                     * The stagger is per row on the first pass and per card
                     * on a deal. A raw index would give the thirty sixth
                     * card a two second delay before it is allowed to
                     * appear, and it is revealed the moment it scrolls into
                     * view, so it would sit blank while you looked at it.
                     */
                    style={{ '--i': pass ? Math.min(index, 15) : index % 4 }}
                  >
                    {/*
                     * The link is the card. It carries no `.reveal`, so it is
                     * free to declare a transition of its own for the hover
                     * without deleting the entrance the <li> owns.
                     *
                     * `/work/<slug>` has no page yet and renders the "still
                     * being built" page. That is deliberate: a dead link
                     * points at its real path rather than quietly dropping
                     * the visitor on the contact form (AGENTS.md).
                     */}
                    <Link className="card works__card" to={`/work/${project.slug}`}>
                      <span
                        className="field works__card-field"
                        data-hue={HUE[project.tags[0]]}
                        aria-hidden="true"
                      />

                      <Shot src={`/work/${project.slug}.webp`} />

                      <span className="works__body">
                        <span className="works__tags">
                          {project.tags
                            .map((tag) => filters.find((f) => f.key === tag)?.label ?? tag)
                            .join(', ')}
                        </span>

                        <h2 className="works__name">{project.name}</h2>
                        <p className="works__blurb">{project.body}</p>

                        {project.result ? (
                          <span className="works__metric">
                            <span className="works__metric-label">{workPage.resultLabel}</span>
                            <span className="works__metric-value">{project.result}</span>
                          </span>
                        ) : null}

                        <span className="works__go" aria-hidden="true">
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
            </div>
          </div>
        </section>

        <dl className="container works__stats">
          {workPage.stats.map((stat, index) => (
            <div className="works__stat reveal" key={index} style={{ '--i': index + 1 }}>
              <dt>
                {stat.value}
                {stat.suffix ? <span>{stat.suffix}</span> : null}
              </dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <section className="container works__cta">
          <div className="card works__cta-card">
            <span className="field" data-hue="wine" aria-hidden="true" />

            <h2 className="section-title reveal">{workPage.cta.title}</h2>
            <p className="section-lede reveal" style={{ '--i': 1 }}>
              {workPage.cta.body}
            </p>

            <div className="works__cta-actions reveal" style={{ '--i': 2 }}>
              <Link className="btn btn--primary" to="/contact">
                {workPage.cta.action}
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
                {workPage.cta.secondary}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default WorkPage
