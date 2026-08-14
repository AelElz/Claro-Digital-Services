import { useEffect } from 'react'
import { clamp, onFrame, write } from '../lib/motion'

const MOBILE = '(max-width: 680px)'
const MAX_SHADE = 0.45

/*
 * Turns the plain section list into the layered stack: each panel sticks and
 * the next one slides over it, dimming the panel underneath.
 *
 * Runs on the shared ticker so the shade tracks the smoothed Lenis position
 * rather than lagging a frame behind it.
 */
export function usePanelStack(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const panels = [...root.querySelectorAll('.panel')]
    if (!panels.length) return

    const mobile = window.matchMedia(MOBILE)

    const layout = () => {
      const viewport = window.innerHeight
      const isMobile = mobile.matches

      panels.forEach((panel, index) => {
        panel.style.zIndex = String(index + 1)

        if (isMobile) {
          panel.style.position = 'relative'
          /*
           * Must be cleared, not left behind. A `top` value on a relative
           * element offsets it and tears holes between the sections.
           */
          panel.style.top = ''
          panel.style.setProperty('--shade', '0')
          return
        }

        panel.style.position = 'sticky'

        /*
         * A panel taller than the viewport has to pin at its BOTTOM, so its
         * lower content is reachable before it locks. Measure the content
         * box, measuring the panel rests it on its own empty padding.
         */
        const content = panel.querySelector('.panel__inner')
        const height = content ? content.offsetHeight : panel.offsetHeight
        panel.style.top = height > viewport ? `${viewport - height}px` : '0px'
      })
    }

    const render = (time, scrollY, moved) => {
      if (!moved || mobile.matches) return
      const viewport = window.innerHeight

      // Read every rect first, then queue the writes: setting a custom
      // property between two reads forces a fresh layout for the second.
      const shades = panels.map((panel, index) => {
        const next = panels[index + 1]
        if (!next) return 0
        // 0 when the next panel's leading edge is at the fold, 1 once it has
        // travelled a full viewport and completely covers this one.
        return clamp((viewport - next.getBoundingClientRect().top) / viewport) * MAX_SHADE
      })

      write(() => {
        panels.forEach((panel, index) => {
          panel.style.setProperty('--shade', String(shades[index]))
        })
      })
    }

    layout()
    const stopFrame = onFrame(render)

    // Fonts land after first paint and change every content height.
    document.fonts?.ready.then(layout)

    window.addEventListener('resize', layout)
    mobile.addEventListener('change', layout)

    return () => {
      stopFrame()
      window.removeEventListener('resize', layout)
      mobile.removeEventListener('change', layout)
      panels.forEach((panel) => {
        panel.style.position = ''
        panel.style.top = ''
        panel.style.zIndex = ''
        panel.style.removeProperty('--shade')
      })
    }
  }, [rootRef])
}
