import { useEffect } from 'react'
import { clamp, onFrame, write } from '../lib/motion'

/*
 * Below this width there is no stack at all. Same 1100 the nav gives up its
 * bar at, so the page changes shape once rather than twice.
 */
const FLAT = '(max-width: 1100px)'

/*
 * How dark a chapter goes as the next one covers it.
 *
 * Depth, and only depth. Pushing this to 0.88 to hide the fact that a black
 * panel sliding over a black panel has no visible edge simply traded one
 * artefact for another: the slicing went away and the screen started going
 * dark mid-handoff instead. The edge is drawn explicitly now (see
 * `.panel:not(:first-child)::before` in index.css), so this is back to being
 * a shadow rather than a blackout.
 */
const MAX_SHADE = 0.55

/*
 * The ramp completes when the incoming panel has FULLY covered, not before.
 *
 * Finishing early (at 55% cover) meant the outgoing chapter hit full dim while
 * the incoming one still had half the screen to travel, so the middle of every
 * handoff was two thirds near-black dimmed chapter and one third new chapter.
 * Measured, mean screen luminance fell from 23.5 to 14.5 and climbed back to
 * 28.4: the screen visibly went dark and came back, which is what a black
 * flash IS.
 *
 * The edge below is what makes the handoff legible now. The shade only has to
 * supply depth.
 */
const SHADE_RAMP = 1

/*
 * How long a pinned chapter holds, as a share of the viewport.
 *
 * This is dead scroll: while a chapter is pinned, the wheel turns and the
 * screen does not change. At 0.55 that was 495px per chapter, and measured,
 * the hero moved its content 0.00x for 400px of scrolling. It reads as the
 * page having stopped responding, and it is worst at the hero because that is
 * the first thing anyone does on the site.
 *
 * The flat chapters below the stack track the scroll at exactly 1.00x, so the
 * contrast made the top half feel broken by comparison.
 *
 * 0.22 is about 200px: a beat where the chapter holds, rather than a third of
 * a screen of nothing happening.
 */
const DWELL = 0.22

/*
 * Where the stack stops.
 *
 * This chapter and every one after it scrolls normally, the way /about does:
 * no pinning, no dwell, no shade, no per-frame work. Only the chapters above
 * it layer.
 *
 * The client asked for this after the stack produced three separate rounds of
 * visual defects in the lower half of the page. It is also the honest reading
 * of what each half is for: the chapters above are the argument and they
 * benefit from being held one at a time, and the ones below are the record,
 * which people scan rather than dwell on.
 *
 * Set to null to put every chapter back in the stack.
 */
const FLAT_FROM = 'work'

/*
 * Turns the plain section list into the layered stack: each panel sticks and
 * the next one slides over it, dimming the panel underneath.
 *
 * Desktop only. On a phone the chapters are ordinary stacked sections: no
 * pinning, no z-index ladder, no dwell, and no per-frame work at all. The
 * stack is a depth effect for a large screen with a pointer; on a 390px
 * screen it buys nothing and costs a shade write per panel per frame plus a
 * page more than twice its own height of empty scroll, on the device least
 * able to afford either. The hook simply does not engage there, and
 * re-engages if the window crosses the breakpoint.
 *
 * When it does run, it runs on the shared ticker so the shade tracks the
 * smoothed Lenis position rather than lagging a frame behind it.
 */
export function usePanelStack(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const panels = [...root.querySelectorAll('.panel')]
    if (!panels.length) return

    const flat = window.matchMedia(FLAT)

    let engaged = false
    let stopFrame = null
    let cancelled = false

    /*
     * Hand the panels back exactly as they were found. Everything the stack
     * sets is inline, so leaving any of it behind at a narrow width is a real
     * bug rather than dead weight: a stale `top` offsets a relative element
     * and tears holes between the sections, and a stale z-index outlives the
     * ladder that made sense of it.
     *
     * --dwell is the exception, and it is set rather than cleared. The
     * stylesheet defaults it to 55svh, which is the reading pause a pinned
     * chapter needs; nothing pins here, so that same 55svh would be empty
     * black scrolled past between every pair of sections.
     */
    const flatten = () => {
      panels.forEach((panel) => {
        panel.style.position = ''
        panel.style.top = ''
        panel.style.zIndex = ''
        panel.style.removeProperty('--shade')
        delete panel.dataset.covered
        delete panel.dataset.edge
        panel.style.setProperty('--dwell', '0px')
      })
    }

    /*
     * Every read, then every write.
     *
     * This used to write zIndex and position, read offsetHeight, then write
     * top, once per panel. Each read after a write forces the browser to
     * recalculate the whole page, so a seven-chapter stack cost seven
     * synchronous layouts, and this is bound to resize. Reading all seven
     * heights up front costs one.
     */
    const layout = () => {
      const viewport = window.innerHeight

      /*
       * A panel taller than the viewport has to pin at its BOTTOM, so its
       * lower content is reachable before it locks. Measure the content box:
       * measuring the panel rests it on its own dwell.
       */
      const heights = panels.map((panel) => {
        const content = panel.querySelector('.panel__inner')
        return content ? content.offsetHeight : panel.offsetHeight
      })

      const last = panels.length - 1
      const flatFrom = FLAT_FROM ? panels.findIndex((p) => p.id === FLAT_FROM) : -1
      const stackEnds = flatFrom === -1 ? last : flatFrom - 1

      panels.forEach((panel, index) => {
        const height = heights[index]
        const overflow = Math.max(0, height - viewport)
        const stacked = flatFrom === -1 || index < flatFrom

        /*
         * The z-index ladder continues through the flat run. A sticky panel
         * carries an explicit z-index and an unpositioned one does not, so
         * without this the last pinned chapter would paint OVER the flat
         * chapter scrolling up in front of it.
         */
        panel.style.zIndex = String(index + 1)

        /*
         * Only a chapter that slides over another needs its leading edge
         * drawn; between two flat sections there is no overlap and a hairline
         * would just be a rule nobody asked for. The first flat chapter still
         * slides over the last pinned one, so it keeps its edge.
         */
        if (index > 0 && index <= stackEnds + 1) panel.dataset.edge = ''
        else delete panel.dataset.edge

        if (!stacked) {
          panel.style.position = 'relative'
          panel.style.top = ''
          panel.style.setProperty('--dwell', '0px')
          panel.style.removeProperty('--shade')
          delete panel.dataset.covered
          return
        }

        panel.style.position = 'sticky'
        panel.style.top = overflow > 0 ? `${viewport - height}px` : '0px'

        /*
         * The knob the stylesheet documents, actually set.
         *
         * A panel reserves 100svh + dwell of flow and pins for whatever of
         * that the viewport does not cover, so for a chapter that fits, the
         * pinned reading pause IS the dwell. A chapter taller than the
         * viewport spends `overflow` of its own scroll just revealing itself,
         * and pins for dwell - overflow; adding the overflow back gives every
         * chapter the same pause on screen regardless of how much copy it
         * carries. Chapters that fit resolve to exactly the 55svh the
         * stylesheet's fallback assumed, so nothing that already looked right
         * moves.
         *
         * The last panel gets none. It is main's final child, so its sticky
         * range is zero and it cannot pin; its dwell would ride up the bottom
         * of the screen as a growing black band before the footer.
         */
        /*
         * The last PINNED chapter keeps its dwell. The rule below is about
         * main's final child, which has no sticky range at all because there
         * is nothing after it in its containing block; the last stacked
         * chapter still has the whole flat run after it, so it pins normally
         * and the first flat chapter rises over it.
         */
        /*
         * The hero gets none.
         *
         * Dwell is dead scroll, and the first chapter is the worst possible
         * place for it: the very first thing anyone does on the site is turn
         * the wheel, and with a hold there the screen does not answer. The
         * chapter below still slides up over it, so the layering is intact;
         * the hero simply does not hold first.
         */
        const dwell = index === 0 || index === last ? 0 : Math.round(overflow + DWELL * viewport)
        panel.style.setProperty('--dwell', `${dwell}px`)
      })
    }

    const render = (time, scrollY, moved) => {
      if (!moved) return
      const viewport = window.innerHeight

      // Read every rect first, then queue the writes: setting a custom
      // property between two reads forces a fresh layout for the second.
      const flatFrom = FLAT_FROM ? panels.findIndex((p) => p.id === FLAT_FROM) : -1
      const shades = panels.map((panel, index) => {
        const next = panels[index + 1]
        if (!next) return 0
        /* A flat chapter is never covered; the one after it follows in flow
           rather than sliding over it. Only the last pinned chapter still
           dims, because the first flat one does slide over it. */
        if (flatFrom !== -1 && index >= flatFrom) return 0
        // 0 when the next panel's leading edge is at the fold, 1 once it has
        // travelled a full viewport and completely covers this one.
        return clamp((viewport - next.getBoundingClientRect().top) / (viewport * SHADE_RAMP)) * MAX_SHADE
      })

      write(() => {
        panels.forEach((panel, index) => {
          panel.style.setProperty('--shade', String(shades[index]))
          /*
           * Once a chapter is nearly covered, nothing inside it needs to keep
           * animating. The attribute is only touched when it actually changes,
           * because writing a dataset property is a style invalidation and
           * this runs on every moving frame.
           */
          const covered = shades[index] > MAX_SHADE * 0.82
          if (covered !== (panel.dataset.covered !== undefined)) {
            if (covered) panel.dataset.covered = ''
            else delete panel.dataset.covered
          }
        })
      })
    }

    /*
     * The one entry point. Called on mount, on resize, when the breakpoint is
     * crossed, and once the webfont lands and changes every content height.
     * Engaging and disengaging happen here so the frame subscription exists
     * only while there is a stack to drive.
     */
    const apply = () => {
      if (cancelled) return

      if (flat.matches) {
        if (!engaged) return
        engaged = false
        stopFrame?.()
        stopFrame = null
        flatten()
        return
      }

      if (!engaged) {
        engaged = true
        stopFrame = onFrame(render)
      }
      layout()
    }

    /*
     * Below the breakpoint on first paint there is nothing to engage, but the
     * dwell still has to be zeroed or every section carries 55svh of empty
     * black it will never pin over.
     */
    if (flat.matches) flatten()
    else apply()

    // Fonts land after first paint and change every content height.
    document.fonts?.ready.then(apply)

    window.addEventListener('resize', apply)
    flat.addEventListener('change', apply)

    return () => {
      cancelled = true
      stopFrame?.()
      window.removeEventListener('resize', apply)
      flat.removeEventListener('change', apply)
      panels.forEach((panel) => {
        panel.style.position = ''
        panel.style.top = ''
        panel.style.zIndex = ''
        panel.style.removeProperty('--shade')
        delete panel.dataset.covered
        panel.style.removeProperty('--dwell')
      })
    }
  }, [rootRef])
}
