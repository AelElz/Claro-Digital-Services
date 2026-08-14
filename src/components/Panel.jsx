import './Panel.css'

/*
 * One chapter of the stack. Sections alternate dark/light and JS turns them
 * into the layered stack (see usePanelStack), this only builds the shell:
 * grain on dark surfaces, the shade the next panel dims it with, and the
 * measured content box the sticky offset is calculated from.
 */
function Panel({ id, theme = 'dark', className = '', innerRef, children }) {
  return (
    <section
      className={`panel panel--${theme} ${className}`.trim()}
      id={id}
      data-theme-section={theme}
    >
      {theme === 'dark' && <span className="panel__grain" aria-hidden="true" />}

      <div className="panel__inner" ref={innerRef}>
        <div className="container">{children}</div>
      </div>

      <span className="panel__shade" aria-hidden="true" />
    </section>
  )
}

export default Panel
