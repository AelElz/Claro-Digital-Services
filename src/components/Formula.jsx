import { useEffect, useRef } from 'react'
import Panel from './Panel'
import Mark from './Mark'
import { formula } from '../content'
import { useReveal } from '../hooks/useReveal'
import { clamp, onFrame } from '../lib/motion'
import './Formula.css'

/*
 * Chapter two. Unlike the chapters below it, this one doesn't just fade in:
 * it scales 0.86 -> 1 as it slides up over the hero, so the panel reads as
 * coming forward out of the page rather than scrolling onto it.
 */
function Formula() {
  const revealRef = useReveal()
  const innerRef = useRef(null)

  useEffect(() => {
    const inner = innerRef.current
    const panel = inner?.closest('.panel')
    if (!inner || !panel) return

    if (window.matchMedia('(max-width: 680px)').matches) return

    let last = -1

    return onFrame(() => {
      // 0 when the panel's top edge is at the fold, 1 once it has landed.
      const progress = clamp(1 - panel.getBoundingClientRect().top / window.innerHeight)
      if (Math.abs(progress - last) < 0.001) return
      last = progress
      inner.style.setProperty('--enter', String(progress))
    })
  }, [])

  return (
    <Panel id="agency" theme="light" className="formula" innerRef={innerRef}>
      <div ref={revealRef}>
        <div className="panel__head panel__head--split">
          <div>
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {formula.eyebrow}
            </p>
            <h2 className="section-title reveal" style={{ '--i': 1 }}>
              {formula.title}
            </h2>
          </div>
          <p className="section-lede reveal" style={{ '--i': 2 }}>
            {formula.lede}
          </p>
        </div>

        <ol className="formula__steps">
          {formula.steps.map((step, index) => (
            <li className="formula__step reveal" key={step.n} style={{ '--i': index + 1 }}>
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
