import { SYMBOL } from './logo-paths'
import './Mark.css'

/*
 * The Claro symbol on its own (public/simbol.svg), used as the bullet in
 * front of every eyebrow label.
 *
 * The same path the wordmark uses for its final "o", so there is one
 * definition of the mark in the codebase. It takes `currentColor`, and the
 * spiral's counter is a hole in the artwork rather than a shape painted back
 * over it, so it sits on any surface without being told what is behind it.
 */
function Mark({ className = '' }) {
  return (
    <svg
      className={`mark ${className}`.trim()}
      viewBox="0 0 116 116"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={SYMBOL} />
    </svg>
  )
}

export default Mark
