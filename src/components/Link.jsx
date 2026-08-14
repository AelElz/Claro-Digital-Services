import { useRouter } from '../lib/router-context'

/*
 * An in-app link.
 *
 * It renders a real href, so middle-click, copy-link and open-in-new-tab all
 * behave normally, and only takes over the plain left-click.
 *
 * Links whose page does not exist yet still point at their real path rather
 * than at the contact section: the router sends unknown paths to the "still
 * being built" page, which tells the visitor the truth instead of silently
 * dropping them somewhere they did not ask for.
 */
/* ref is taken explicitly rather than left to the spread, so forwarding it
   is obvious at the call site instead of relying on React 19's prop ref. */
const isExternal = (to) => /^(https?:)?\/\//.test(to) || to.startsWith('mailto:') || to.startsWith('tel:')

function Link({ to, className = '', children, ref, ...rest }) {
  const { navigate } = useRouter()

  /*
   * Anything off-site is left entirely to the browser: opened in a new tab,
   * and with noopener so the new page cannot reach back through window.opener.
   */
  if (isExternal(to)) {
    return (
      <a
        ref={ref}
        href={to}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    )
  }

  const onClick = (event) => {
    // Let the browser handle anything that is not a plain left-click.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a ref={ref} href={to} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}

export default Link
