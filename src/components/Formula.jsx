import { useEffect, useRef } from 'react'
import Panel from './Panel'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import { clamp, onFrame, reducedMotion, write } from '../lib/motion'
import './Formula.css'

/*
 * Chapter two. Unlike the chapters below it, this one doesn't just fade in:
 * it scales 0.86 -> 1 as it slides up over the hero, so the panel reads as
 * coming forward out of the page rather than scrolling onto it.
 *
 * Three steps, and the numbers are the argument, so they are set in the
 * display serif at stat scale rather than as the small crimson labels they
 * used to be. Each step carries its own field, walking wine -> plum ->
 * crimson so the row warms as the sequence advances.
 */

/* Adjacent cards differ, and they walk the family in order rather than at
   random, so the three read as one spectrum instead of three decisions. */
const HUES = ['wine', 'plum', 'crimson']

function Formula() {
  const { formula } = useContent()
  const revealRef = useReveal()
  const innerRef = useRef(null)

  useEffect(() => {
    const inner = innerRef.current
    const panel = inner?.closest('.panel')
    if (!inner || !panel) return

    /* The phone gets no scrub at all (see the media query in Formula.css),
       and neither does a visitor who asked for less motion, so there is no
       reason to hold a subscription that computes a value nothing reads. */
    if (reducedMotion()) return
    if (window.matchMedia('(max-width: 680px)').matches) return

    let last = -1

    return onFrame((time, scrollY, moved) => {
      /*
       * Skip still frames.
       *
       * Without this guard the rect read below ran on every one of the 60
       * frames a second forever, long after `progress` had clamped to 1 and
       * the panel had stopped moving. Every other subscriber on the bus
       * early-returns here; this one was the exception, and it was the
       * exception on the most expensive read of the set.
       */
      if (!moved) return

      // 0 when the panel's top edge is at the fold, 1 once it has landed.
      const progress = clamp(1 - panel.getBoundingClientRect().top / window.innerHeight)
      if (Math.abs(progress - last) < 0.001) return
      last = progress

      /*
       * Through write(), not straight onto the node. This callback runs in
       * the bus's READ phase, so setting a custom property here invalidated
       * layout for every reader queued behind it and forced a second full
       * layout on each frame of the hero-to-Formula handoff.
       */
      write(() => {
        inner.style.setProperty('--enter', String(progress))
      })
    })
  }, [])

  return (
    <Panel id="agency" theme="dark" className="formula" innerRef={innerRef}>
      <div className="formula__scene" ref={revealRef}>
        {/*
         * The chapter's own light, bled past the container and faded out
         * before the cards start. It carries `is-in` from the markup because
         * it is not an entrance: like the hero's field it is the ground the
         * chapter stands on, and the authored bloom belongs to the cards.
         */}
        <span className="field formula__field is-in" data-hue="wine" aria-hidden="true" />

        <div className="panel__head panel__head--split">
          <h2 className="section-title reveal">{formula.title}</h2>
          <p className="section-lede reveal" style={{ '--i': 1 }}>
            {formula.lede}
          </p>
        </div>

        <ol className="formula__steps">
          {formula.steps.map((step, index) => (
            <li className="card formula__step reveal" key={step.n} style={{ '--i': index + 2 }}>
              <span className="field" data-hue={HUES[index % HUES.length]} aria-hidden="true" />
              <span className="formula__n">{step.n}</span>
              <h3 className="formula__title">{step.title}</h3>
              <p className="formula__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  )
}

export default Formula
