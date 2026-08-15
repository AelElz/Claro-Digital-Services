import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from './Link'
import Logo from './Logo'
import MenuOverlay from './MenuOverlay'
/* `menu` is also the name of a nav link's submenu below, hence the alias. */
import { nav, menu as menuContent } from '../content'
import { onFrame, scrollTo } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import './Navbar.css'

const TRAVEL =
  'left 0.42s cubic-bezier(0.65, 0, 0.35, 1), width 0.42s cubic-bezier(0.65, 0, 0.35, 1)'

/* Nav centre, 12px offset plus half the 64px pill. */
const PROBE_Y = 44

/*
 * Which panel is under a given screen line.
 *
 * Panels overlap in the sticky stack, so a naive "first one that matches"
 * picks whichever appears earliest in the DOM, usually the one underneath.
 * The visible panel is the one with the highest z-index crossing the line.
 */
function panelAt(panels, y) {
  let best = null
  let bestZ = -Infinity

  for (const panel of panels) {
    const rect = panel.getBoundingClientRect()
    if (rect.top > y || rect.bottom < y) continue
    const z = Number(panel.style.zIndex || 0)
    if (z >= bestZ) {
      bestZ = z
      best = panel
    }
  }
  return best
}

function Navbar() {
  const { path, navigate } = useRouter()
  const [theme, setTheme] = useState('dark')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  /* Drawer only: the disclosure state of the row that carries a submenu. */
  const [subOpen, setSubOpen] = useState(false)

  const linkRefs = useRef([])
  const indicatorRef = useRef(null)
  const burgerRef = useRef(null)
  /* False until the pill has been placed once, so it never slides in from 0. */
  const armed = useRef(false)

  /*
   * The pill always slides, whether the tab changed from a click or from the
   * scroll-spy, so the nav behaves the same way however you moved.
   *
   * Written straight to the node rather than held in state: this runs on
   * every chapter change while scrolling, and there is nothing here React
   * needs to reconcile.
   */
  const place = useCallback((animate) => {
    const link = linkRefs.current[active]
    const pill = indicatorRef.current
    if (!link || !pill) return

    const slide = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pill.style.transition = slide ? TRAVEL : 'none'
    pill.style.left = `${link.offsetLeft}px`
    pill.style.width = `${link.offsetWidth}px`
    pill.style.opacity = '1'
  }, [active])

  useLayoutEffect(() => {
    place(armed.current)
    armed.current = true
  }, [place])

  useEffect(() => {
    // Snap during a resize; following the drag with a 0.42s ease lags badly.
    const onResize = () => {
      place(false)
      armed.current = true
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [place])

  /*
   * Chapter-adaptive: every frame, read the panel behind the pill and the
   * panel crossing the centre line, and swap the palette and the active tab
   * to match. A centre-line probe rather than IntersectionObserver, a
   * section taller than the viewport never reaches 50% visible, so a 0.5
   * threshold would simply never fire for it.
   */
  useEffect(() => {
    const panels = [...document.querySelectorAll('.panel')]
    if (!panels.length) return

    const hrefs = nav.links.map((link) => link.href.slice(1))

    return onFrame((time, scrollY, moved) => {
      if (!moved) return

      const behind = panelAt(panels, PROBE_Y)
      if (behind) setTheme(behind.dataset.themeSection || 'dark')

      const centre = panelAt(panels, window.innerHeight / 2)
      if (!centre) return
      const index = hrefs.indexOf(centre.id)
      if (index === -1) return

      setActive(index)
    })
  }, [])

  /*
   * A chapter link means two different things depending on where you are.
   * On the home page it is a scroll; from another page it is a navigation.
   *
   * The navigation case deliberately does not scroll here. The chapters do
   * not exist yet at this point, and they have no sticky offsets until the
   * panel stack has measured them, so anything scrolled now resolves to 0.
   * Carrying the hash in the URL instead lets Home scroll to it after mount,
   * once the stack is laid out (see initHistoryNav).
   */
  const goToChapter = (href) => {
    if (path === '/') {
      scrollTo(href, { history: true })
      return
    }
    navigate(`/${href}`)
  }

  const select = (index, href, hasSubmenu) => (event) => {
    event.preventDefault()

    /*
     * Inside the open drawer, a row that owns a submenu discloses it rather
     * than navigating. There is no hover on a phone, so tapping the row is
     * the only gesture available to reach what is under it, and the drawer
     * only exists below 1100px: if it is open, we are on a small screen.
     *
     * Home itself is not lost. The logo sits a thumb away in the same bar
     * and goes to the top of the home page from anywhere.
     */
    if (hasSubmenu && open) {
      setSubOpen((wasOpen) => !wasOpen)
      return
    }

    /*
     * A mouse click leaves the link focused, and the Home menu opens on
     * :focus-within, so it would hang open over the page long after the
     * scroll has left the nav. Keyboard activation reports detail 0 and must
     * keep its focus, otherwise tabbing loses its place.
     */
    if (event.detail > 0) event.currentTarget.blur()
    setOpen(false)
    setActive(index)
    goToChapter(href)
  }

  /* The logo is the way home from anywhere, including from an open menu. */
  const jump = (href) => (event) => {
    event.preventDefault()
    setOpen(false)
    setMenuOpen(false)
    goToChapter(href)
  }

  const bar = (
    <header
      className={`navbar navbar--${theme}`}
      data-open={open || undefined}
      data-menu={menuOpen ? 'open' : undefined}
    >
      <Logo onClick={jump('#home')} />

      {/*
       * The chapter drawer's own button. Plain text, because the bars now
       * belong to the burger and two identical icons in one bar would read
       * as two ways to open the same thing.
       */}
      <button
        type="button"
        className="navbar__toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => {
          // Closing the drawer collapses the disclosure with it, so it opens
          // the same way every time rather than remembering.
          setSubOpen(false)
          setOpen((wasOpen) => !wasOpen)
        }}
      >
        Menu
      </button>

      <nav
        id="primary-navigation"
        className={`navbar__links${open ? ' navbar__links--open' : ''}`}
        aria-label="Primary"
      >
        <span className="navbar__indicator" ref={indicatorRef} aria-hidden="true" />

        {nav.links.map(({ label, href, menu: submenu }, index) => {
          const link = (
            <a
              key={label}
              /*
               * The pill is placed from offsetLeft/offsetWidth, which are
               * read against the nearest positioned ancestor. A menu item
               * wraps its link in a relatively positioned box, so the ref
               * has to sit on whichever element is the direct child of
               * .navbar__links, or the pill measures from inside the wrapper
               * and lands at its left edge.
               */
              ref={
                submenu
                  ? undefined
                  : (el) => {
                      linkRefs.current[index] = el
                    }
              }
              className={`navbar__link${index === active ? ' navbar__link--active' : ''}`}
              href={href}
              aria-current={index === active ? 'page' : undefined}
              /* Only a disclosure while the drawer is open; a plain link
                 otherwise, which is what it still is on a desktop. */
              aria-expanded={submenu && open ? subOpen : undefined}
              onClick={select(index, href, Boolean(submenu))}
            >
              {label}
              {submenu ? (
                <svg
                  className="navbar__caret"
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </a>
          )

          if (!submenu) return link

          return (
            <div
              key={label}
              className="navbar__item"
              data-sub={subOpen ? 'open' : undefined}
              ref={(el) => {
                linkRefs.current[index] = el
              }}
            >
              {link}

              {/*
               * Opened by :hover and :focus-within, so there is no state and
               * no listener behind it. Closing the mobile panel is the one
               * thing CSS cannot do, and it rides the bubble from the link
               * rather than an onClick on <Link>, whose own handler would be
               * overwritten by a passed one and break client-side routing.
               */}
              <div className="navbar__menu" onClick={() => setOpen(false)}>
                <ul className="navbar__menu-list">
                  {submenu.map((entry) => (
                    <li key={entry.to}>
                      <Link className="navbar__menu-link" to={entry.to}>
                        {entry.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="navbar__actions">
        <Link className="navbar__signin" to="/sign-in">
          {nav.signIn}
        </Link>
      </div>

      {/*
       * The two bars are the design asset (48x1, 6px apart) drawn as spans
       * rather than the SVG file, so each one can travel and turn on its
       * own. Longhand `translate` and `rotate` rather than a `transform`
       * shorthand: they compose, and the bar has to do both at once.
       */}
      <button
        type="button"
        className="navbar__burger"
        ref={burgerRef}
        aria-label={menuOpen ? menuContent.close : menuContent.open}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => {
          // Two menus open at once is never the intent, and on mobile the
          // drawer sits directly under the sheet.
          setOpen(false)
          setMenuOpen((wasOpen) => !wasOpen)
        }}
      >
        <span className="navbar__burger-bars" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
    </header>
  )

  return (
    <>
      {bar}
      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        buttonRef={burgerRef}
      />
    </>
  )
}

export default Navbar
