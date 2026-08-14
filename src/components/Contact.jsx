import Panel from './Panel'
import Mark from './Mark'
import { contact } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Contact.css'

function Contact() {
  const revealRef = useReveal()

  /* Duplicated so the marquee can wrap seamlessly. */
  const ticker = [...contact.ticker, ...contact.ticker, ...contact.ticker]

  return (
    <Panel id="contact" theme="dark" className="contact">
      <div ref={revealRef}>
        <p className="eyebrow reveal">
          <Mark className="eyebrow__mark" />
          {contact.eyebrow}
        </p>

        <p className="contact__display reveal" style={{ '--i': 1 }}>
          {contact.display}
        </p>

        <div className="contact__marquee reveal" style={{ '--i': 2 }} aria-hidden="true">
          <div className="contact__track">
            {ticker.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key -- repeated on purpose
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>

        <div className="contact__grid">
          <h2 className="contact__title reveal" style={{ '--i': 3 }}>
            {contact.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <div className="contact__side">
            <p className="contact__body reveal" style={{ '--i': 4 }}>
              {contact.body}
            </p>

            <div className="contact__actions reveal" style={{ '--i': 5 }}>
              <a className="btn btn--primary" href={`mailto:${contact.email}`}>
                {contact.cta}
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

              <a className="contact__email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default Contact
