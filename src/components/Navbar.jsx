import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from './Link'
import Logo from './Logo'
import { nav } from '../content'
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

  const linkRefs = useRef([])
  const indicatorRef = useRef(null)
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

  const select = (index, href) => (event) => {
    event.preventDefault()
    setOpen(false)
    setActive(index)
    goToChapter(href)
  }

  const jump = (href) => (event) => {
    event.preventDefault()
    setOpen(false)
    goToChapter(href)
  }

  return (
    <header className={`navbar navbar--${theme}`} data-open={open || undefined}>
      <Logo onClick={jump('#home')} />

      <button
        type="button"
        className="navbar__toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="navbar__toggle-bars" aria-hidden="true" />
        Menu
      </button>

      <nav
        id="primary-navigation"
        className={`navbar__links${open ? ' navbar__links--open' : ''}`}
        aria-label="Primary"
      >
        <span className="navbar__indicator" ref={indicatorRef} aria-hidden="true" />

        {nav.links.map(({ label, href }, index) => (
          <a
            key={label}
            ref={(el) => {
              linkRefs.current[index] = el
            }}
            className={`navbar__link${index === active ? ' navbar__link--active' : ''}`}
            href={href}
            aria-current={index === active ? 'page' : undefined}
            onClick={select(index, href)}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="navbar__actions">
        <a className="navbar__schedule" href="#contact" onClick={jump('#contact')}>
          {nav.schedule}
        </a>
        <Link className="navbar__signin" to="/sign-in">
          {nav.signIn}
        </Link>
        <a className="navbar__contact" href="#contact" onClick={jump('#contact')}>
          {nav.contact}
        </a>
      </div>
    </header>
  )
}

export default Navbar
