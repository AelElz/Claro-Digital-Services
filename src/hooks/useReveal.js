import { useEffect, useRef } from 'react'

/*
 * Staggered enter for everything below the second chapter.
 *
 * Deliberately NOT threshold-based: a section taller than the viewport never
 * reaches 50% visible, so a 0.5 threshold would simply never fire. This
 * triggers on any sliver crossing a band above the fold.
 *
 * The contract with the stylesheet, which must not be inverted: `.reveal` is
 * VISIBLE by default, and only `html.js .reveal` is hidden. main.jsx sets that
 * class synchronously before the first render, so the hidden state exists only
 * where this hook is guaranteed to be running to lift it. A bundle that fails
 * to load, or a route chunk that never arrives, shows its content instead of a
 * column of invisible sections. Never move the hiding onto `.reveal` itself,
 * and never let this hook be the only thing that can make content visible:
 * both safety nets below exist because that failure is invisible in a
 * screenshot. The page renders, the DOM is correct, and nothing is painted.
 */
export function useReveal(options = {}) {
  const { rootMargin = '0px 0px -12% 0px', once = true } = options
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const show = (el) => el.classList.add('is-in')

    /* An element can be a target as well as a container. */
    const collect = (scope) =>
      scope.matches('.reveal')
        ? [scope, ...scope.querySelectorAll('.reveal')]
        : [...scope.querySelectorAll('.reveal')]

    if (!('IntersectionObserver' in window)) {
      collect(root).forEach(show)
      return
    }

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

    /*
     * IntersectionObserver only delivers its first callback after a
     * rendering step, which never happens while the tab is in the
     * background. Land on a deep link or restore a scroll position in a
     * background tab and the content would stay at opacity 0 for as long as
     * the tab is hidden. A synchronous rect check up front settles anything
     * already on screen without waiting for a frame.
     */
    const adopt = (targets) => {
      if (!targets.length) return
      const viewport = window.innerHeight
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < viewport && rect.bottom > 0) show(el)
      })
      targets.forEach((el) => observer.observe(el))
    }

    adopt(collect(root))

    /*
     * Anything mounted after this point has to be picked up too.
     *
     * The target list used to be a snapshot taken once, which quietly
     * assumed the subtree never changes. It does: switching language
     * replaces any list item whose React key is derived from its own copy,
     * and the replacements arrived unobserved, so they sat at opacity 0
     * forever. A whole chapter would vanish on the switch and not come back
     * when you switched back, because the second switch remounted them
     * again.
     *
     * The keys are stable now, so on a language switch this observer sees
     * nothing. It stays because the failure it prevents is invisible: the
     * page renders, the DOM is correct, and the content is simply not
     * painted. childList mutations are rare enough that the callback costs
     * nothing until something actually remounts.
     */
    const structure = new MutationObserver((records) => {
      const fresh = []
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) fresh.push(...collect(node))
        }
      }
      adopt(fresh)
    })

    structure.observe(root, { childList: true, subtree: true })

    return () => {
      structure.disconnect()
      observer.disconnect()
    }
  }, [rootMargin, once])

  return ref
}
