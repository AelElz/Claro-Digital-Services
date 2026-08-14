import { useEffect, useRef } from 'react'
import Panel from './Panel'
import Link from './Link'
import Mark from './Mark'
import shot from '../assets/kintsugi-people.jpg'
import { testimonial } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Testimonial.css'

function Testimonial() {
  const revealRef = useReveal()
  const shotRef = useRef(null)

  /*
   * The label rides the pointer only while it is over the screenshot, and
   * the real cursor is hidden for that area alone, so the swap reads as a
   * property of this image rather than a site-wide affectation.
   *
   * The trailing comes from a CSS transition on transform, not a rAF lerp:
   * each move re-eases toward the new position, which looks the same, runs
   * on the compositor, needs no loop to start and stop, and cannot fall
   * behind if frames are being throttled.
   */
  useEffect(() => {
    const frame = shotRef.current
    if (!frame) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const label = frame.querySelector('.shot__cursor')

    const place = (event) => {
      const rect = frame.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    const onEnter = (event) => {
      // Land at the entry point rather than gliding in from the last spot.
      label.style.transition = 'none'
      place(event)
      // Force the jump to commit before the transition is restored.
      void label.offsetWidth
      label.style.transition = ''
      frame.classList.add('is-live')
    }

    const onLeave = () => frame.classList.remove('is-live')

    frame.addEventListener('pointerenter', onEnter)
    frame.addEventListener('pointermove', place)
    frame.addEventListener('pointerleave', onLeave)

    return () => {
      frame.removeEventListener('pointerenter', onEnter)
      frame.removeEventListener('pointermove', place)
      frame.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <Panel id="testimonial" theme="light" className="testimonial">
      <div ref={revealRef}>
        <div className="panel__head">
          <p className="eyebrow reveal">
            <Mark className="eyebrow__mark" />
            {testimonial.eyebrow}
          </p>
          <h2 className="section-title reveal" style={{ '--i': 1 }}>
            {testimonial.title}
          </h2>
        </div>

        <div className="testimonial__body">
          <div className="testimonial__quote-col">
            <figure className="testimonial__figure reveal" style={{ '--i': 2 }}>
              <blockquote className="testimonial__quote">{testimonial.quote}</blockquote>

              <figcaption className="testimonial__caption">
                <span className="testimonial__author">{testimonial.author}</span>
                <span className="testimonial__role">{testimonial.role}</span>
              </figcaption>
            </figure>

            <div className="testimonial__metric reveal" style={{ '--i': 3 }}>
              <span className="testimonial__metric-value">{testimonial.metric}</span>
              <span className="testimonial__metric-label">{testimonial.metricLabel}</span>
            </div>
          </div>

          <Link
            className="shot reveal"
            style={{ '--i': 4 }}
            to={testimonial.shotHref}
            ref={shotRef}
            aria-label={`${testimonial.shotAlt}. ${testimonial.shotCursor}`}
          >
            <img
              className="shot__img"
              src={shot}
              alt={testimonial.shotAlt}
              width="1600"
              height="835"
              loading="lazy"
              decoding="async"
            />

            <span className="shot__cursor" aria-hidden="true">
              {testimonial.shotCursor}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path
                  d="M7 17 17 7m0 0H8m9 0v9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </Panel>
  )
}

export default Testimonial
