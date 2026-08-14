import { SPIRAL_CARVE, SPIRAL_FIELD } from './Logo'
import './Mark.css'

/*
 * The Claro symbol on its own (public/simbol.svg), used as the bullet in
 * front of every eyebrow label.
 *
 * Same two paths as the wordmark's final "o", so there is one definition of
 * the mark in the codebase: the disc takes `currentColor` and the spiral is
 * carved back out of it in --logo-counter, the colour of the surface behind.
 */
function Mark({ className = '' }) {
  return (
    <svg
      className={`mark ${className}`.trim()}
      viewBox="0 0 34.2285 30.6876"
      aria-hidden="true"
      focusable="false"
    >
      <path d={SPIRAL_FIELD} fill="currentColor" />
      <path d={SPIRAL_CARVE} fill="var(--logo-counter, #000)" />
    </svg>
  )
}

export default Mark
