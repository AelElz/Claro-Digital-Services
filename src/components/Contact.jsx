import Panel from './Panel'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './Contact.css'

/*
 * The closing chapter.
 *
 * One statement over one field, the ticker as texture under it, then the ask.
 * The eyebrow that used to sit above the statement is gone, along with every
 * other one on the site: the line reads perfectly well without a label telling
 * you a section has started.
 */
function Contact() {
  const { contact } = useContent()
  const revealRef = useReveal()

  /* Duplicated so the marquee can wrap seamlessly. */
  const ticker = [...contact.ticker, ...contact.ticker, ...contact.ticker]

  return (
    <Panel id="contact" theme="dark" className="contact">
      <div className="contact__scene" ref={revealRef}>
        {/*
         * Not given `.reveal`: useReveal only writes `is-in` onto that class,
         * and `html.js .reveal` declares a transition the field cannot beat,
         * which would replace the bloom with a plain fade. The field is ground
         * here rather than an entrance, so it arrives already settled.
         */}
        <span className="field contact__field is-in" data-hue="crimson" aria-hidden="true" />

        <p className="contact__display reveal">{contact.display}</p>

        <div className="contact__marquee reveal" style={{ '--i': 1 }} aria-hidden="true">
          <div className="contact__track">
            {ticker.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key -- repeated on purpose
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>

        <h2 className="contact__title reveal" style={{ '--i': 2 }}>
          {contact.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>

        <p className="contact__body reveal" style={{ '--i': 3 }}>
          {contact.body}
        </p>

        <div className="contact__actions reveal" style={{ '--i': 4 }}>
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
    </Panel>
  )
}

export default Contact
