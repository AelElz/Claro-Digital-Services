import { useCallback, useEffect, useState } from 'react'
import { RouterContext } from './router-context'

/*
 * Two pages is not worth a routing library.
 *
 * This is the whole router: the current pathname in state, pushState on
 * navigate, and popstate to keep Back working. It deliberately shares the
 * same history stack the in-page chapter nav already pushes to (see
 * scrollTo in motion.js), so Back walks through chapters and pages alike.
 */

/* Trailing slashes are equivalent: /contact/ and /contact are one route. */
const clean = (path) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path)

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => clean(window.location.pathname))

  useEffect(() => {
    const onPop = () => setPath(clean(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    const next = clean(to.split('#')[0] || '/')
    const changedPage = next !== clean(window.location.pathname)

    window.history.pushState(null, '', to)
    setPath(next)

    // A new page starts at the top; a hash on the same page is handled by
    // the caller, which knows the sticky offsets.
    if (changedPage && !to.includes('#')) window.scrollTo(0, 0)
  }, [])

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}
