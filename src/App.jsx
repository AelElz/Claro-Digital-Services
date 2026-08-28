import { lazy, Suspense, useEffect } from 'react'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import { initSmoothScroll } from './lib/motion'
import { useRouter } from './lib/router-context'

/*
 * Home is eager, every other route is split.
 *
 * All five pages used to be imported statically, so the whole site arrived as
 * one 393KB / 129KB-gzip module and #root stayed empty until every byte of it
 * had downloaded, parsed and executed. Nine visitors in ten land on Home and
 * never open the sign-in page; they were paying for it anyway, on the request
 * that decides whether the site feels instant.
 *
 * Home stays in the entry chunk on purpose. It is the common landing, and
 * splitting it would only trade a smaller entry for a second round trip
 * before anything at all can paint.
 */
const AboutPage = lazy(() => import('./pages/AboutPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const MethodPage = lazy(() => import('./pages/MethodPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const WorkPage = lazy(() => import('./pages/WorkPage'))

/*
 * Anything not listed here is a page that does not exist yet, and gets the
 * "still being built" page rather than being redirected somewhere it was
 * never asked to go.
 */
const ROUTES = {
  '/': Home,
  '/about': AboutPage,
  '/contact': ContactPage,
  '/method': MethodPage,
  '/sign-in': AuthPage,
  '/work': WorkPage,
}

/* Warmed once the page is idle, so a click on the nav has nothing to wait for. */
const PREFETCH = [
  () => import('./pages/AboutPage'),
  () => import('./pages/WorkPage'),
  () => import('./pages/MethodPage'),
  () => import('./pages/ContactPage'),
  () => import('./pages/AuthPage'),
  () => import('./pages/NotFound'),
]

/*
 * The wait between routes is real, so it gets a real placeholder rather than
 * a spinner or a blank frame.
 *
 * It is built from the panel shell every chapter already uses, so the black,
 * the grain and the content box are in place before the route resolves and
 * the arriving page does not shift the ground under itself. The bars are the
 * shape of a page head at the type scale's own sizes: a title over a lede.
 *
 * --dwell: 0, because nothing here pins. A skeleton with 55svh of dwell below
 * it is 155svh of placeholder for a wait measured in tens of milliseconds.
 *
 * aria-hidden, deliberately. There is no copy for a loading state and copy is
 * not this package's to invent, so the placeholder says nothing rather than
 * announcing a hardcoded English string to a French screen reader.
 */
/*
 * Two lines of title over one of lede. Heights are a fraction of the real
 * type sizes rather than the full em box, so each bar reads as a line of text
 * settling in and not as a grey slab.
 */
const SKELETON_BARS = [
  { height: 'calc(var(--fs-display) * 0.62)', width: '72%', gap: '0px' },
  {
    height: 'calc(var(--fs-display) * 0.62)',
    width: '44%',
    gap: 'calc(var(--fs-display) * 0.16)',
  },
  {
    height: 'calc(var(--fs-lede) * 1.1)',
    width: 'min(100%, 38ch)',
    gap: 'clamp(28px, 5vw, 48px)',
  },
]

function RouteSkeleton() {
  return (
    <div className="panel panel--dark" style={{ '--dwell': '0px' }} aria-hidden="true">
      <span className="panel__grain" />

      <div className="panel__inner">
        <div className="container">
          {SKELETON_BARS.map((bar, index) => (
            <span
              key={index}
              className="skeleton"
              style={{
                display: 'block',
                height: bar.height,
                width: bar.width,
                marginBlockStart: bar.gap,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { path } = useRouter()
  const Page = ROUTES[path] ?? NotFound

  // Lenis lives above the routes so the smoothing survives navigation.
  useEffect(() => initSmoothScroll(), [])

  /*
   * Pull the split routes down once the main thread has nothing better to do.
   * Idle time, never the critical path: this must not compete with the entry
   * chunk, the fonts or the first paint, and it does not run at all for a
   * visitor who has asked their browser to save data.
   */
  useEffect(() => {
    if (navigator.connection?.saveData) return

    let cancelled = false
    const warm = () => {
      if (cancelled) return
      PREFETCH.forEach((load) => load())
    }

    const idle = window.requestIdleCallback
    const id = idle ? idle(warm, { timeout: 4000 }) : window.setTimeout(warm, 2000)

    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [])

  return (
    <>
      <Preloader />

      <Suspense fallback={<RouteSkeleton />}>
        <Page />
      </Suspense>
    </>
  )
}

export default App
