import './Panel.css'

/*
 * One chapter of the stack. JS turns these into the layered stack (see
 * usePanelStack); this only builds the shell: the grain, the shade the next
 * panel dims it with, and the measured content box the sticky offset is
 * calculated from.
 *
 * The grain used to be rendered only for theme="dark", back when the deck
 * alternated with off-white chapters. Every chapter is black now, so the
 * condition did nothing except leave the three formerly-light panels with no
 * texture at all, which showed up as a hard horizontal seam where a grained
 * panel met an ungrained one.
 */
function Panel({ id, theme = 'dark', className = '', innerRef, children }) {
  return (
    <section
      className={`panel panel--${theme} ${className}`.trim()}
      id={id}
      data-theme-section={theme}
    >
      <span className="panel__grain" aria-hidden="true" />

      <div className="panel__inner" ref={innerRef}>
        <div className="container">{children}</div>
      </div>

      <span className="panel__shade" aria-hidden="true" />
    </section>
  )
}

export default Panel
