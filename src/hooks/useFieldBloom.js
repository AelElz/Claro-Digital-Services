import { useEffect } from 'react'

/*
 * Turns on every `.field` inside a subtree as it arrives.
 *
 * A field must NOT carry `.reveal` to get this. `html.js .reveal` declares a
 * `transition` shorthand at a specificity `.field` cannot beat, so the
 * shorthand would replace the field's own scale animation and the bloom
 * would silently become a plain fade. That is why this is a second pass over
 * the same root rather than another class on the same element.
 *
 * It takes the ref `useReveal` already returns, so a page runs one root and
 * two passes:
 *
 *   const revealRef = useReveal()
 *   useFieldBloom(revealRef)
 *
 * Shape copied from useReveal deliberately: synchronous rect check first,
 * because IntersectionObserver delivers its first callback only after a
 * rendering step and a background tab never gets one, then observe. The
 * default state is visible, so a browser with no observer at all still shows
 * every field.
 *
 * `once`, always. The bloom is an animation rather than a transition
 * precisely so the compositor can release the layer when it ends (AGENTS.md);
 * re-arming it on the way back up would put that layer straight back.
 */
export function useFieldBloom(ref) {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const fields = [...root.querySelectorAll('.field')]
    if (!fields.length) return

    const show = (el) => el.classList.add('is-in')

    if (!('IntersectionObserver' in window)) {
      fields.forEach(show)
      return
    }

    /* threshold 0, never 0.5: a field spanning a section taller than the
       viewport would never reach half visible, so it would never fire. */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          show(entry.target)
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )

    const viewport = window.innerHeight
    fields.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < viewport && rect.bottom > 0) show(el)
      observer.observe(el)
    })

    /*
     * Fields mounted later have to be picked up too. The /work grid remounts
     * its whole list on a filter change, and an unobserved field arrives at
     * `opacity: 0` under `html.js` and simply never turns on: the card keeps
     * its copy and loses its colour, which is invisible in a screenshot
     * taken before the change.
     */
    const structure = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue
          const fresh = node.matches('.field') ? [node, ...node.querySelectorAll('.field')] : [...node.querySelectorAll('.field')]
          fresh.forEach((el) => {
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight && rect.bottom > 0) show(el)
            observer.observe(el)
          })
        }
      }
    })

    structure.observe(root, { childList: true, subtree: true })

    return () => {
      structure.disconnect()
      observer.disconnect()
    }
  }, [ref])
}
