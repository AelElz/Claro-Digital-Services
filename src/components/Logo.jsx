import {
  DIGITAL,
  DOTS,
  LOCKUP_VIEWBOX,
  SERVICES,
  SYMBOL,
  SYMBOL_AT,
  TRADEMARK,
  WORD,
  WORDMARK_VIEWBOX,
} from './logo-paths'
import './Logo.css'

/*
 * The mark, drawn from the supplied vector rather than rebuilt from a
 * webfont and a set of hand-placed layers.
 *
 * One <svg>, one fill. Everything takes `currentColor`, so the nav can still
 * swap palettes crossing from a dark chapter to a light one by setting
 * `color` alone, and the preloader can stamp the whole mark a flat white or
 * crimson without knowing anything about its internals. The spiral's counter
 * is real negative space in the artwork now, so nothing has to be painted
 * back over it in the colour of the surface behind.
 *
 * Two sizes of the same lockup:
 *
 *   default   "Claro" alone, for the bar and the footer
 *   full      the whole lockup, with "Digital services." and the trademark,
 *             for the intro, where it is large enough to read
 */
function Logo({ as: Tag = 'a', className = '', full = false, ...rest }) {
  const props = Tag === 'a' ? { href: '#home', 'aria-label': 'Claro, home', ...rest } : rest

  return (
    <Tag className={`logo${full ? ' logo--full' : ''} ${className}`.trim()} {...props}>
      <svg
        className="logo__art"
        viewBox={full ? LOCKUP_VIEWBOX : WORDMARK_VIEWBOX}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d={WORD} />
        {DOTS.map((d) => (
          <path key={d.slice(0, 24)} d={d} />
        ))}
        <path d={SYMBOL} transform={SYMBOL_AT} />

        {full ? (
          <>
            <path d={TRADEMARK} />
            <path d={DIGITAL} />
            <path d={SERVICES} />
          </>
        ) : null}
      </svg>
    </Tag>
  )
}

export default Logo
