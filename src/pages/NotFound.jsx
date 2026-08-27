import Footer from '../components/Footer'
import Link from '../components/Link'
import Navbar from '../components/Navbar'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import { useRouter } from '../lib/router-context'
import './NotFound.css'

/*
 * Twenty-three real links land here: six case studies, fifteen service pages
 * and two legal pages that have paths but no page yet. That is too many for
 * an error dump, so this is built as a chapter of the site rather than as a
 * dead end. One field, the display serif, the path they asked for set as code
 * so it is obvious the link was understood, and two ways onward.
 */
function NotFound() {
  const { notFound } = useContent()
  const revealRef = useReveal()
  const { path } = useRouter()

  return (
    <>
      <Navbar />

      <main className="notfound" ref={revealRef}>
        <span className="field reveal notfound__field" data-hue="crimson" aria-hidden="true" />
        <span className="panel__grain" aria-hidden="true" />

        <div className="container notfound__inner">
          <h1 className="notfound__title reveal" style={{ '--i': 1 }}>
            {notFound.title}
          </h1>

          <p className="notfound__body reveal" style={{ '--i': 2 }}>
            {notFound.body}
          </p>

          <p className="notfound__path reveal" style={{ '--i': 3 }}>
            <span className="notfound__path-label">{notFound.pathLabel}</span>
            <code className="notfound__code">{path}</code>
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
