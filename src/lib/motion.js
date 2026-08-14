import gsap from 'gsap'
import Lenis from 'lenis'

/*
 * One rAF loop for the whole site, split into a read phase and a write phase.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF so the smoothed
 * scroll position and every scroll-reading effect resolve in the same frame.
 *
 * The split matters more than it looks. Several effects read geometry and
 * then write a custom property; run them back to back and every write
 * invalidates layout for the next reader, so the browser recalculates the
 * whole page several times a frame. Reads all happen first, writes are
 * queued through write() and flushed afterwards, so layout is computed once.
 */

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null
let refCount = 0
let resizeObserver = null

const subscribers = new Set()
const writes = []
let lastY = -1
let dirty = true
let running = false

function frame(time) {
  const y = window.scrollY
  // Most effects only depend on scroll, so they can skip a still frame.
  const moved = dirty || y !== lastY
  lastY = y
  dirty = false

  writes.length = 0
  for (const fn of subscribers) fn(time, y, moved)
  for (const fn of writes) fn()
  writes.length = 0
}

const markDirty = () => {
  dirty = true
}

function startTicker() {
  if (running) return
  running = true
  gsap.ticker.add(frame)
  window.addEventListener('resize', markDirty)
}

function stopTicker() {
  if (!running) return
  running = false
  gsap.ticker.remove(frame)
  window.removeEventListener('resize', markDirty)
}

/*
 * Read phase. The callback gets (time, scrollY, moved); it may read geometry
 * freely but must push any DOM write through write().
 */
export function onFrame(callback) {
  subscribers.add(callback)
  startTicker()
  return () => {
    subscribers.delete(callback)
    if (!subscribers.size) stopTicker()
  }
}

/* Queue a DOM write to be flushed once every reader has finished. */
export function write(callback) {
  writes.push(callback)
}

export function initSmoothScroll() {
  refCount += 1

  if (!lenis && !reducedMotion()) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.1 })
    // Lenis smooths the native scroll, it never replaces or hijacks it.
    // Added before the frame bus so reads see the settled position.
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    /*
     * Lenis caches the document height and clamps every scroll to it, so a
     * stale value is not a rounding problem: navigating from the short
     * contact page to the tall home page left the limit at the old height,
     * which capped jumps AND made the page refuse to scroll past it. Height
     * here changes on route change, on reveal, and when the webfont lands,
     * so watch the element rather than trying to enumerate the causes.
     */
    resizeObserver = new ResizeObserver(() => lenis?.resize())
    resizeObserver.observe(document.documentElement)

    // Lets a dev console step the scroll without racing the smoothing.
    if (import.meta.env.DEV) window.__lenis = lenis
  }

  return () => {
    refCount -= 1
    if (refCount > 0 || !lenis) return
    gsap.ticker.remove(tick)
    resizeObserver?.disconnect()
    resizeObserver = null
    lenis.destroy()
    lenis = null
  }
}

function tick(time) {
  // GSAP's ticker reports seconds; Lenis expects milliseconds.
  lenis?.raf(time * 1000)
}

/*
 * Where an element sits in the document, ignoring sticky.
 *
 * Every panel is sticky, and a pinned panel lies about its position twice
 * over: its rect reports top: 0 for as long as it is pinned, and its
 * offsetTop is shifted by the pin as well. Resolving a scroll target from
 * either one means "scroll to where you already are", which is why clicking
 * Home or the logo did nothing.
 *
 * A sticky element still reserves its normal space in the flow, so its true
 * position is the container's top plus the heights of the siblings before
 * it. Heights are not affected by pinning.
 */
function documentTop(element) {
  if (getComputedStyle(element).position === 'sticky') {
    const parent = element.parentElement
    let y = documentTop(parent) + (parseFloat(getComputedStyle(parent).paddingTop) || 0)
    for (const sibling of parent.children) {
      if (sibling === element) break
      y += sibling.offsetHeight
    }
    return y
  }

  let y = 0
  let node = element
  while (node) {
    y += node.offsetTop
    node = node.offsetParent
  }
  return y
}

/*
 * Jumps by default. In-page nav should land immediately: smooth-scrolling
 * the full height of a chaptered stack takes seconds and reads as a hang.
 *
 * Pass history: true for user-initiated navigation, so each chapter becomes
 * a real history entry and the browser's Back button walks back through
 * them. Without it the URL never changes and Back leaves the site entirely.
 */
export function scrollTo(target, { immediate = true, history: push = false } = {}) {
  const hash = typeof target === 'string' ? target : `#${target.id}`
  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element) return

  if (push && window.location.hash !== hash) {
    window.history.pushState(null, '', hash)
  }

  const y = documentTop(element)

  if (lenis) {
    /*
     * ResizeObserver delivers after rAF, so on the first frame of a new page
     * the cached limit can still be the previous page's. Re-measuring here
     * costs a read and guarantees the jump is not clamped short.
     */
    lenis.resize()
    lenis.scrollTo(y, { immediate })
    return
  }
  window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' })
}

/* Give up after this many frames rather than fight the layout forever. */
const LANDING_FRAMES = 20

/*
 * Keeps Back and Forward working, and honours a hash typed into the address
 * bar or carried in from another page.
 *
 * The landing scroll retries instead of firing once. Arriving with a hash is
 * the worst moment to measure anything: the chapters may not be in the DOM
 * yet, their sticky offsets are set by a separate effect, the webfont can
 * still reflow them, and Lenis's cached scroll limit may still be the
 * previous page's, which silently clamps the jump short. Re-checking each
 * frame until the position actually holds is far more robust than trying to
 * pick the one correct moment.
 */
export function initHistoryNav() {
  const go = () => scrollTo(window.location.hash || '#home')
  let frames = 0

  const land = () => {
    const hash = window.location.hash
    if (!hash) return

    const element = document.querySelector(hash)
    if (element) {
      scrollTo(hash)
      // Settled once we are where the element says it is.
      if (Math.abs(window.scrollY - documentTop(element)) < 2) return
    }

    if (frames < LANDING_FRAMES) {
      frames += 1
      requestAnimationFrame(land)
    }
  }

  if (window.location.hash) requestAnimationFrame(land)
  window.addEventListener('popstate', go)
  return () => window.removeEventListener('popstate', go)
}

export const clamp = (value, min = 0, max = 1) =>
  value < min ? min : value > max ? max : value
