import Logo from './Logo'
import Link from './Link'
import { slug, useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Footer.css'

/*
 * Sits outside the sticky stack, it is the floor the last panel lands on,
 * so it must not be assigned a sticky offset of its own.
 */
function Footer() {
  const { footer } = useContent()
  const revealRef = useReveal()

  return (
    <footer className="footer" ref={revealRef}>
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand reveal">
            <Logo />
            <p className="footer__blurb">{footer.blurb}</p>
          </div>

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
            <a className="footer__contact-cta" href={`mailto:${footer.email}`}>
              {footer.contactCta}
            </a>
          </div>
        </div>

        <div className="footer__legal">
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
