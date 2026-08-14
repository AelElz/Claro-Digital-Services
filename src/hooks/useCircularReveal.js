import { useEffect, useRef } from 'react'

/* Must match --fill-size in index.css. */
const FILL_SIZE = 800

/*
 * List rows fill with colour on hover, always sweeping out from the left
 * edge. The origin is fixed, so nothing here listens to the pointer: each
 * row is measured once, and again only when its size can have changed.
 *
 * All this publishes is --s, how far the fixed-size disc has to grow to
 * clear the row's far corners from that left-edge origin. CSS owns the rest.
 */
export function useCircularReveal(selector = '.reveal-row') {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const rows = [...root.querySelectorAll(selector)]
    if (!rows.length) return

    const measure = () => {
      for (const row of rows) {
        const { width, height } = row.getBoundingClientRect()
        if (!width) continue
        /*
         * The disc is centred on the left edge at mid height, so the two
         * corners it has to reach are the far ones, both hypot(w, h/2) away.
         */
        const reach = Math.hypot(width, height / 2)
        row.style.setProperty('--s', String((reach * 2) / FILL_SIZE))
      }
    }

    measure()
    // Rows are text-width, so they resize when the webfont lands.
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
      rows.forEach((row) => row.style.removeProperty('--s'))
    }
  }, [selector])

  return ref
}
