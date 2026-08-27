import { useEffect, useRef } from 'react'
import LangToggle from './LangToggle'
import { useContent } from '../content'
import { freezeBackground, scrollTo } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import './MenuOverlay.css'

/* Anything that can take focus inside the sheet. Written as one selector so
   the trap below and the browser agree on what "focusable" means. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/*
 * The full-screen menu.
 *
 * It stays mounted and is hidden with visibility, rather than being unmounted
 * when closed. That keeps the closing animation, and visibility: hidden also
 * takes every link out of the tab order and out of the accessibility tree, so
 * a closed menu cannot be tabbed into.
 *
 * It must not be rendered inside <header>: the bar carries a backdrop-filter,
 * which makes it the containing block for fixed descendants, so `inset: 0`
 * inside it would resolve to the bar itself rather than to the viewport.
 */
function MenuOverlay({ open, onClose, buttonRef }) {
  const { path, navigate } = useRouter()
  const { menu, a11y } = useContent()
  const panelRef = useRef(null)
  const firstLinkRef = useRef(null)

  /*
   * Escape closes, and Tab cannot leave.
   *
   * The trap is not decoration. This element declares aria-modal, which tells
   * assistive technology to ignore everything outside its own subtree, and
   * the burger that opens it lives in the bar, OUTSIDE that subtree and
   * deliberately painted above it. Without a close control inside the sheet
   * and a trap around it, a screen reader user could open this and have no
   * announced way back out; with both, the sheet is genuinely self-contained
   * and the burger is a second, sighted way to do the same thing.
   */
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      /* Read on every Tab rather than cached: the foot's controls change
         with the locale, and a cached list would hand focus to a node React
         has already replaced. */
      const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.getClientRects().length > 0,
      )
      if (!nodes.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const here = document.activeElement
      const outside = !panel.contains(here)

      if (event.shiftKey ? here === first || outside : here === last || outside) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  /*
   * The page behind an opaque layer should neither move nor paint. The
   * fixed edge blurs go with it: three stacked backdrop-filters that nobody
   * can see are still three stacked backdrop-filters to composite every
   * frame the sheet is travelling.
   */
  useEffect(() => {
    freezeBackground(open)
    document.documentElement.classList.toggle('is-covered', open)
    return () => {
      freezeBackground(false)
      document.documentElement.classList.remove('is-covered')
    }
  }, [open])

  /*
   * Focus moves into the panel on open and back to the burger on close, so a
   * keyboard never lands on a control it cannot see. Skipped on the first
   * render, which would otherwise steal focus on page load.
   */
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) firstLinkRef.current?.focus()
    else if (wasOpen.current) buttonRef.current?.focus()
    wasOpen.current = open
  }, [open, buttonRef])

  /*
   * Written out rather than reusing <Link>, because every entry has to close
   * the menu as well as navigate, and Link spreads its extra props after its
   * own onClick, so passing one would replace the navigation instead of
   * adding to it. The modifier-key guard is the same: anything that is not a
   * plain left-click belongs to the browser.
   */
  const go = (to) => (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    onClose()

    // Home from the home page is a scroll, not a navigation: the router
    // would see the same path, do nothing, and leave you where you were.
    if (to === '/' && path === '/') {
      scrollTo('#home', { history: true })
      return
    }
    navigate(to)
  }

  return (
    <div
      className="menu"
      id="site-menu"
      ref={panelRef}
      data-state={open ? 'open' : 'closed'}
      role="dialog"
      aria-modal="true"
      aria-label={a11y.siteMenu}
    >
      <nav className="menu__nav" aria-label={a11y.pages}>
        <ul className="menu__list">
          {menu.links.map(({ label, to }, index) => (
            <li className="menu__item" key={label} style={{ '--i': index }}>
              <a
                className="menu__link"
                href={to}
                ref={index === 0 ? firstLinkRef : undefined}
                aria-current={path === to ? 'page' : undefined}
                onClick={go(to)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="menu__foot">
        {/*
         * The bar's own copy of this is hidden below 560px, where five
         * controls will not fit across a phone. Here it is never hidden, so
         * the language is always one tap from the burger whatever the size.
         */}
        <div className="menu__lang">
          <p className="menu__lang-label">{menu.language}</p>
          <LangToggle />
        </div>

        <ul className="menu__legal">
          {menu.legal.map(({ label, to }) => (
            <li key={label}>
              <a className="menu__legal-link" href={to} onClick={go(to)}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <p className="menu__copyright">{menu.copyright}</p>

        {/*
         * The close control the dialog needs, and it belongs at the foot
         * rather than at the top corner: the burger already occupies that
         * corner, painted above this sheet and mid-way through folding into
         * an X, and a second close mark forty pixels under it would read as
         * two different controls for one job. Down here it is also where a
         * thumb already is on a phone.
         */}
        <button type="button" className="menu__close" onClick={onClose}>
          <span className="menu__close-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
              <path
                d="M6 6 18 18M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {menu.close}
        </button>
      </div>
    </div>
  )
}

export default MenuOverlay
