import { useEffect, useRef, useState } from 'react'
import Panel from './Panel'
import Link from './Link'
import shot from '../assets/kintsugi-people.jpg'
import { useContent } from '../content'
import { trackRect } from '../lib/motion'
import { useReveal } from '../hooks/useReveal'
import './Testimonial.css'

/*
 * The client's own words, as a pull quote.
 *
 * It used to be a two-column block: quote left, screenshot right, both at
 * about the same weight, which made the chapter read as a layout rather than
 * as somebody speaking. It is one centred column now, the quote in the
 * display serif over a single magenta field, the attribution small in the
 * sans below it, and the client's page underneath as a card. One voice, then
 * the evidence.
 */
function Testimonial() {
  const { testimonial } = useContent()
  const revealRef = useReveal()
  const shotRef = useRef(null)
  const imgRef = useRef(null)
  const [shotReady, setShotReady] = useState(false)

  /*
   * The screenshot is 138KB over whatever connection the visitor has, and it
   * used to leave a 598x312 empty box for the whole download. It gets the
   * skeleton until the bytes are actually decoded, then a crossfade.
   *
   * `complete` is checked on mount as well as the load event, because a
   * cached image finishes decoding before React attaches the listener: the
   * event has already fired, nothing else will fire, and the skeleton would
   * shimmer forever over a picture that is sitting right there.
   *
   * `error` resolves too. A broken image with a permanent skeleton over it
   * is a wait that never ends; the alt text is the honest fallback.
   */
  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    if (img.complete) {
      setShotReady(true)
      return
    }

    const settle = () => setShotReady(true)
    img.addEventListener('load', settle)
    img.addEventListener('error', settle)

    return () => {
      img.removeEventListener('load', settle)
      img.removeEventListener('error', settle)
    }
  }, [])

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
    /* Cached: this handler writes a style, so reading the rect back on every
       event would thrash layout for the whole time the pointer is inside. */
    const rectOf = trackRect(frame)

    const place = (event) => {
      const rect = rectOf()
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
      rectOf.stop()
      frame.removeEventListener('pointerenter', onEnter)
      frame.removeEventListener('pointermove', place)
      frame.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <Panel id="testimonial" theme="dark" className="testimonial">
      <div className="testimonial__inner" ref={revealRef}>
        <h2 className="sub-title testimonial__title reveal">{testimonial.title}</h2>

        {/*
         * The figure is the .reveal node and the field is its child, so the
         * bloom is driven by the figure arriving. Giving the field .reveal
         * directly would hand it the reveal's transition shorthand in place
         * of its own scale bloom.
         */}
        {/*
         * Quote and screenshot are one row from 1100px up.
         *
         * They were a single centred column, which made the chapter 1239px of
         * content inside a 900px viewport. Every chapter here is a PINNED
         * panel, so a chapter taller than the viewport can never be seen
         * whole: you scroll, it stays put, and the parts that do not fit are
         * simply gone. Measured before the change, the section was 1950px for
         * 900px of screen.
         */}
        <div className="testimonial__body">
          <div className="testimonial__col">
        <figure className="testimonial__figure reveal" style={{ '--i': 1 }}>
          <span className="field testimonial__glow" data-hue="magenta" aria-hidden="true" />

          <blockquote className="testimonial__quote">{testimonial.quote}</blockquote>

          <figcaption className="testimonial__caption">
            <span className="testimonial__author">{testimonial.author}</span>
            <span className="testimonial__role">{testimonial.role}</span>
          </figcaption>
        </figure>

        <p className="testimonial__metric reveal" style={{ '--i': 2 }}>
          <span className="testimonial__metric-value">{testimonial.metric}</span>
          <span className="testimonial__metric-label">{testimonial.metricLabel}</span>
        </p>
          </div>

        {/*
         * The wrapper carries .reveal and the card carries the hover, so the
         * card is free to declare its own `transition` without replacing the
         * reveal's opacity/translate pair and its stagger. That collision is
         * silent: the entrance simply never happens.
         */}
        <div className="testimonial__shot reveal" style={{ '--i': 3 }}>
          <Link
            className="card shot"
            to={testimonial.shotHref}
            ref={shotRef}
            aria-label={`${testimonial.shotAlt}. ${testimonial.shotCursor}`}
          >
            <span className="media shot__media">
              <img
                ref={imgRef}
                className={`media__img shot__img${shotReady ? ' is-ready' : ''}`}
                src={shot}
                alt={testimonial.shotAlt}
                width="1600"
                height="835"
                loading="lazy"
                decoding="async"
              />

              {/* After the image in source order: index.css crossfades it out
                  with `.media__img.is-ready + .media__skeleton`. */}
              <span className="media__skeleton skeleton" aria-hidden="true" />
            </span>

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
      </div>
    </Panel>
  )
}

export default Testimonial
