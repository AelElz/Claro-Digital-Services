import { useEffect, useRef } from 'react'

/*
 * Staggered enter for everything below the second chapter.
 *
 * Deliberately NOT threshold-based: a section taller than the viewport never
 * reaches 50% visible, so a 0.5 threshold would simply never fire. This
 * triggers on any sliver crossing a band above the fold.
 */
export function useReveal(options = {}) {
  const { rootMargin = '0px 0px -12% 0px', once = true } = options
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = root.matches('.reveal')
      ? [root, ...root.querySelectorAll('.reveal')]
      : [...root.querySelectorAll('.reveal')]
    if (!targets.length) return

    const show = (el) => el.classList.add('is-in')

    if (!('IntersectionObserver' in window)) {
      targets.forEach(show)
      return
    }

    /*
     * IntersectionObserver only delivers its first callback after a
     * rendering step, which never happens while the tab is in the
     * background. Land on a deep link or restore a scroll position in a
     * background tab and the content would stay at opacity 0 for as long as
     * the tab is hidden. A synchronous rect check up front settles anything
     * already on screen without waiting for a frame.
     */
    const viewport = window.innerHeight
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < viewport && rect.bottom > 0) show(el)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('is-in')
          }
        })
      },
      { rootMargin, threshold: 0 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [rootMargin, once])

  return ref
}
