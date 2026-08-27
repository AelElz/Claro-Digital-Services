import Link from './Link'
import Logo from './Logo'
import { slug, useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Footer.css'

/*
 * The last chapter.
 *
 * It sits outside the sticky stack, it is the floor the last panel lands on,
 * so it must not be assigned a sticky offset of its own.
 *
 * Read as three things stacked: the sendoff line in the display serif, the
 * index of everything the site holds in the sans, and the small print. One
 * quiet wine field behind all of it, low enough that the columns stay
 * columns rather than becoming a picture with text on it.
 */
function Footer() {
  const { footer, a11y } = useContent()
  const revealRef = useReveal()

  return (
    <footer className="footer" ref={revealRef}>
      <span className="field footer__field" data-hue="wine" aria-hidden="true" />

      <div className="container">
        <div className="footer__sendoff reveal">
          <p className="footer__line">{footer.blurb}</p>

          {/*
           * The site's own button rather than a bespoke gradient pill. The
           * one this replaced painted var(--grad-contact), a token that no
           * longer exists anywhere in the system, so it was rendering with
           * no background at all.
           */}
          <a className="btn btn--primary footer__cta" href={`mailto:${footer.email}`}>
            {footer.contactCta}
            <span className="btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M4 12h15m0 0-6-6m6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>

        <div className="footer__grid">
          {/* Index, not the title: a translated key remounts the column on a
              language switch and it returns without its reveal class. */}
          {footer.columns.map((column, index) => (
            <nav className="footer__col reveal" key={index} style={{ '--i': index + 1 }}>
              <h2 className="footer__col-title">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <Link to={`/services/${slug(link)}`}>{link}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer__col reveal" style={{ '--i': 3 }}>
            <h2 className="footer__col-title">{footer.contactTitle}</h2>
            <ul>
              <li>
                <a href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`}>{footer.phone}</a>
              </li>
              <li>
                <a href={`mailto:${footer.email}`}>{footer.email}</a>
              </li>
              <li>
                <span className="footer__address">{footer.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__legal reveal" style={{ '--i': 4 }}>
          {/*
           * Routed rather than left as the default anchor. Logo's own href is
           * #home, which on any page that is not the home page is a link to
           * nothing; as a <Link> it is the way back from anywhere.
           */}
          <Logo as={Link} to="/" aria-label={a11y.logoHome} />

          <p>{footer.legal}</p>

          <ul>
            {footer.legalLinks.map((link) => (
              <li key={link}>
                <Link to={`/legal/${slug(link)}`}>{link}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
