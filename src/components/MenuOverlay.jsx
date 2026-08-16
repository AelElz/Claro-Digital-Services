import { useEffect, useRef } from 'react'
import LangToggle from './LangToggle'
import { useContent } from '../content'
import { freezeBackground, scrollTo } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import './MenuOverlay.css'

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

  /* Escape closes, wherever focus happens to be. */
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
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

        <p className="menu__copyright">{menu.copyright}</p>
        <ul className="menu__legal">
          {menu.legal.map(({ label, to }) => (
            <li key={label}>
              <a className="menu__legal-link" href={to} onClick={go(to)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MenuOverlay
