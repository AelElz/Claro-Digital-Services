import { useEffect } from 'react'
import Preloader from './components/Preloader'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/AuthPage'
import ContactPage from './pages/ContactPage'
import Home from './pages/Home'
import MethodPage from './pages/MethodPage'
import NotFound from './pages/NotFound'
import { initSmoothScroll } from './lib/motion'
import { useRouter } from './lib/router-context'

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
}

function App() {
  const { path } = useRouter()
  const Page = ROUTES[path] ?? NotFound

  // Lenis lives above the routes so the smoothing survives navigation.
  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Preloader />

      <Page />

      {/* Fixed glass edges over everything, top and bottom. */}
      <span className="edge-blur edge-blur--top" aria-hidden="true" />
      <span className="edge-blur edge-blur--bottom" aria-hidden="true" />
    </>
  )
}

export default App
