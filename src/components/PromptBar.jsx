import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/motion'
import './PromptBar.css'

/*
 * The prompt bar from design/Design 6.svg, rebuilt in markup so the line can
 * actually type itself.
 *
 * It is a picture of a prompt, not a prompt: there is nothing behind it to
 * send to, so it is not an <input> and not a <button>. A field that looks
 * live and does nothing is worse than an image of one, so the whole thing is
 * aria-hidden and the section around it carries the real copy.
 */

/* Per character, and the two pauses. Deleting is faster than typing, the way
   a real backspace is. */
const TYPE_MS = 62
const DELETE_MS = 26
const HOLD_MS = 1700
const BLANK_MS = 420

function PromptBar({ phrases }) {
  const [text, setText] = useState(reducedMotion() ? phrases[0] : '')
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return

    const root = rootRef.current
    let timer = 0
    let phrase = 0
    let cut = 0
    let deleting = false
    /*
     * Off screen, the timer stops. It is only a few characters a second, but
     * a page that keeps typing to nobody in a background section is exactly
     * the kind of work that has no reason to exist.
     */
    let live = true

    const step = () => {
      if (!live) return

      const full = phrases[phrase]
      cut += deleting ? -1 : 1
      setText(full.slice(0, cut))

      let wait = deleting ? DELETE_MS : TYPE_MS
      if (!deleting && cut === full.length) {
        deleting = true
        wait = HOLD_MS
      } else if (deleting && cut === 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        wait = BLANK_MS
      }

      timer = setTimeout(step, wait)
    }

    /*
     * Start from a synchronous rect check, then observe, the same way
     * useReveal does. IntersectionObserver delivers its first callback only
     * after a rendering step, which never comes in a background tab: waiting
     * for it would leave the bar blank for a visitor who opened the page in
     * a background tab and came back to it.
     */
    const rect = root.getBoundingClientRect()
    live = rect.top < window.innerHeight && rect.bottom > 0
    if (live) timer = setTimeout(step, TYPE_MS)

    /*
     * threshold 0, never 0.5: this sits inside a section far taller than the
     * viewport, which would never reach half visible and would therefore
     * never start.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === live) return
        live = entry.isIntersecting
        clearTimeout(timer)
        if (live) timer = setTimeout(step, TYPE_MS)
      },
      { threshold: 0 },
    )
    observer.observe(root)

    return () => {
      live = false
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [phrases])

  return (
    <div className="prompt" ref={rootRef} aria-hidden="true">
      <span className="prompt__icon prompt__plus" />

      {/* The line is its own element so it can overflow the box it sits in
          and keep its tail, and the caret with it, in view. */}
      <span className="prompt__text">
        <span className="prompt__line">
          {text}
          <span className="prompt__caret" />
        </span>
      </span>

      <span className="prompt__icon prompt__clear" />

      <span className="prompt__divider" />

      <svg className="prompt__mic" viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M12 3.75a2.5 2.5 0 0 1 2.5 2.5v5.5a2.5 2.5 0 0 1-5 0v-5.5a2.5 2.5 0 0 1 2.5-2.5Z"
          fill="currentColor"
        />
        <path
          d="M6 11.25a6 6 0 0 0 12 0M12 17.5V21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      <span className="prompt__send">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path
            d="M12 20V5m0 0-6.5 6.5M12 5l6.5 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
}

export default PromptBar
