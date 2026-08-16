import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useContent } from '../content'
import { LOCALES, useLocale } from '../lib/locale-context'
import './LangToggle.css'

/*
 * EN / FR, drawn from design/English.svg and design/French.svg.
 *
 * The two files are one control in two states: the same 113x38 pill, the
 * same two labels, and a rounded highlight that sits over the left half in
 * one and the right half in the other. So this is built the way the chapter
 * nav is built, as one element with a sliding indicator, rather than as two
 * icons that swap.
 *
 * The travel is the chapter pill's own: same curve, same 0.42s, so moving
 * between English and French reads as the same gesture as moving between
 * Home and The Agency.
 */

const TRAVEL =
  'left 0.42s cubic-bezier(0.65, 0, 0.35, 1), width 0.42s cubic-bezier(0.65, 0, 0.35, 1)'

function LangToggle({ className = '' }) {
  const { menu } = useContent()
  const { locale, setLocale } = useLocale()

  const optionRefs = useRef([])
  const indicatorRef = useRef(null)
  /* False until the highlight has been placed once, so it never slides in
     from the left edge on the first paint. */
  const armed = useRef(false)

  const active = Math.max(
    0,
    LOCALES.findIndex((entry) => entry.code === locale),
  )

  /*
   * Measured rather than computed from a percentage. The two labels are the
   * same length today, but the highlight should sit on whatever the option
   * actually is, not on what half of the track happens to be.
   *
   * Written straight to the node: nothing here is React's to reconcile, and
   * `transform` is off limits, exactly as on .navbar__indicator. The element
   * is centred with translateY(-50%) and animating transform would replace
   * that outright, dropping the highlight half its own height mid-slide.
   */
  const place = useCallback(
    (animate) => {
      const option = optionRefs.current[active]
      const indicator = indicatorRef.current
      if (!option || !indicator) return

      const slide = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      indicator.style.transition = slide ? TRAVEL : 'none'
      indicator.style.left = `${option.offsetLeft}px`
      indicator.style.width = `${option.offsetWidth}px`
      indicator.style.opacity = '1'
    },
    [active],
  )

  useLayoutEffect(() => {
    place(armed.current)
    armed.current = true
  }, [place])

  useEffect(() => {
    /* Snap during a resize. Following the drag on a 0.42s ease lags badly,
       and this also re-places the copy in the bar when it crosses back over
       the breakpoint that hides it, where it measured zero. */
    const onResize = () => {
      place(false)
      armed.current = true
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [place])

  return (
    <div className={`lang ${className}`.trim()} role="group" aria-label={menu.language}>
      <span className="lang__indicator" ref={indicatorRef} aria-hidden="true" />

      {LOCALES.map((entry, index) => {
        const isActive = entry.code === locale

        return (
          <button
            key={entry.code}
            type="button"
            className={`lang__option${isActive ? ' lang__option--active' : ''}`}
            ref={(el) => {
              optionRefs.current[index] = el
            }}
            /*
             * The visible label is an abbreviation. `aria-label` gives the
             * language its full endonym, and `lang` on the button tells a
             * screen reader to pronounce "Français" in French rather than
             * reading it with English rules.
             */
            lang={entry.code}
            aria-label={entry.name}
            aria-pressed={isActive}
            onClick={() => setLocale(entry.code)}
          >
            {entry.label}
          </button>
        )
      })}
    </div>
  )
}

export default LangToggle
