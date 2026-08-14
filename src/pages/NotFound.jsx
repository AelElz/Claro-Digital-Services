import Footer from '../components/Footer'
import Link from '../components/Link'
import Mark from '../components/Mark'
import Navbar from '../components/Navbar'
import { notFound } from '../content'
import { useReveal } from '../hooks/useReveal'
import { useRouter } from '../lib/router-context'
import './NotFound.css'

/*
 * Every route that has no page yet lands here, rather than being quietly
 * redirected to the contact section. Showing the path they asked for makes
 * it obvious the link was understood and simply is not built yet.
 */
function NotFound() {
  const revealRef = useReveal()
  const { path } = useRouter()

  return (
    <>
      <Navbar />

      <main className="notfound" ref={revealRef}>
        <div className="container notfound__inner">
          <p className="eyebrow reveal">
            <Mark className="eyebrow__mark" />
            {notFound.eyebrow}
          </p>

          <h1 className="notfound__title reveal" style={{ '--i': 1 }}>
            {notFound.title}
          </h1>

          <p className="notfound__body reveal" style={{ '--i': 2 }}>
            {notFound.body}
          </p>

          <p className="notfound__path reveal" style={{ '--i': 3 }}>
            <span>{notFound.pathLabel}</span>
            <code>{path}</code>
          </p>

          <div className="notfound__actions reveal" style={{ '--i': 4 }}>
            <Link className="btn btn--primary" to="/contact">
              {notFound.contact}
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
            </Link>

            <Link className="btn btn--ghost" to="/">
              {notFound.home}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default NotFound
