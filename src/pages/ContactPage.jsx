import { useEffect, useRef, useState } from 'react'
import Footer from '../components/Footer'
import Mark from '../components/Mark'
import Navbar from '../components/Navbar'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './ContactPage.css'

/*
 * There is no backend behind this build, so rather than pretend the form
 * posts somewhere, Send composes the message in the visitor's own mail
 * client, addressed to the same inbox the live site uses. Nothing is sent
 * anywhere until they press send themselves, and no field value ever leaves
 * the browser over the network.
 */

/*
 * Strips control characters, which are the only part of a field value that
 * could mean something structural rather than textual.
 *
 * encodeURIComponent already escapes CR, LF and & so a value cannot break
 * out of the body parameter and forge a mailto header such as `&bcc=`. This
 * is the belt to that braces: it means the strings are already clean before
 * they reach the encoder, so the safety does not rest on one call being
 * present. Each value is also clamped, so no field can inflate the URL.
 */
const sanitise = (value, max) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex -- stripping controls is the point
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max)

/*
 * Takes the dictionary rather than reaching for it, because there are two of
 * them now: the labels in the body and the subject line have to be the
 * language the visitor filled the form in, not whichever one this module
 * happened to import.
 */
function composeMailto(values, contactPage) {
  const lines = contactPage.fields
    .map((field) => [field, sanitise(values[field.name], field.max ?? 200)])
    .filter(([, value]) => value)
    .map(([field, value]) => `${field.label}: ${value}`)

  /*
   * The select's first option is its own placeholder and carries an empty
   * value, so an untouched field is already falsy here. Comparing against
   * that option rather than against the words "Choose" keeps the guard true
   * in both languages if the empty value is ever dropped.
   */
  const placeholder = contactPage.fields.find((field) => field.name === 'service')?.options[0]
  const service = sanitise(values.service, 60)
  const chosen = service && service !== placeholder

  const subject = chosen
    ? `${contactPage.mailSubject}: ${service}`
    : contactPage.mailSubject

  return `mailto:${contactPage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

/* Nobody reads and completes this form in under three seconds. */
const MIN_FILL_MS = 3000

function ContactPage() {
  const { contactPage } = useContent()
  const revealRef = useReveal()
  const [values, setValues] = useState({})
  const openedAt = useRef(Date.now())

  const set = (name) => (event) =>
    setValues((current) => ({ ...current, [name]: event.target.value }))

  /*
   * A select's value is the option's own text, so switching language leaves
   * it holding a string that no longer appears in the list. The browser
   * shows an empty box, and `source` is required, so a half-filled form
   * quietly becomes unsubmittable and the visitor is not told why.
   *
   * The options are the same list in both languages, in the same order, so
   * the answer survives as its index. Anything that does not match is left
   * alone rather than guessed at.
   */
  const previous = useRef(contactPage)
  useEffect(() => {
    const before = previous.current
    previous.current = contactPage
    if (before === contactPage) return

    setValues((current) => {
      const next = { ...current }
      for (const field of contactPage.fields) {
        if (field.type !== 'select') continue
        const was = before.fields.find((entry) => entry.name === field.name)
        const index = was?.options.indexOf(current[field.name]) ?? -1
        /* Index 0 is the placeholder, which carries an empty value anyway. */
        if (index > 0) next[field.name] = field.options[index]
      }
      return next
    })
  }, [contactPage])

  const onSubmit = (event) => {
    event.preventDefault()

    // Honeypot: a real visitor never sees this field, a bot fills everything.
    if (values.website) return
    // Time trap: catches the scripted submitters that leave the trap alone.
    if (Date.now() - openedAt.current < MIN_FILL_MS) return

    window.location.href = composeMailto(values, contactPage)
  }

  return (
    <>
      <Navbar />

      <main className="contact-page" ref={revealRef}>
        <div className="container contact-page__inner">
          <header className="contact-page__head">
            <p className="eyebrow reveal">
              <Mark className="eyebrow__mark" />
              {contactPage.eyebrow}
            </p>
            <h1 className="section-title reveal" style={{ '--i': 1 }}>
              {contactPage.title}
            </h1>
            <p className="section-lede reveal" style={{ '--i': 2 }}>
              {contactPage.lede}
            </p>
          </header>

          <div className="contact-page__body">
            <form className="contact-form reveal" style={{ '--i': 3 }} onSubmit={onSubmit}>
              {/* Spam trap, hidden from people and from assistive tech. */}
              <input
                className="contact-form__trap"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                onChange={set('website')}
              />

              {contactPage.fields.map((field) => (
                <label
                  className={`contact-form__field${
                    field.type === 'textarea' ? ' contact-form__field--wide' : ''
                  }`}
                  key={field.name}
                >
                  <span className="contact-form__label">
                    {field.label}
                    {field.required && <em aria-hidden="true">*</em>}
                  </span>

                  {field.type === 'select' ? (
                    <select
                      className="contact-form__input"
                      required={field.required}
                      value={values[field.name] ?? ''}
                      onChange={set(field.name)}
                    >
                      {field.options.map((option, index) => (
                        <option key={option} value={index === 0 ? '' : option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="contact-form__input"
                      rows={6}
                      placeholder={field.placeholder}
                      required={field.required}
                      maxLength={field.max}
                      value={values[field.name] ?? ''}
                      onChange={set(field.name)}
                    />
                  ) : (
                    <input
                      className="contact-form__input"
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      maxLength={field.max}
                      autoComplete={field.autoComplete}
                      spellCheck={field.type === 'email' ? 'false' : undefined}
                      value={values[field.name] ?? ''}
                      onChange={set(field.name)}
                    />
                  )}
                </label>
              ))}

              <button className="btn btn--primary contact-form__submit" type="submit">
                {contactPage.submit}
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
              </button>
            </form>

            <aside className="contact-page__aside reveal" style={{ '--i': 4 }}>
              <div className="contact-page__detail">
                <h2>{contactPage.emailLabel}</h2>
                <a href={`mailto:${contactPage.email}`}>{contactPage.email}</a>
              </div>
              <div className="contact-page__detail">
                <h2>{contactPage.phoneLabel}</h2>
                <a href={`tel:${contactPage.phone.replace(/[^+\d]/g, '')}`}>{contactPage.phone}</a>
              </div>
              <div className="contact-page__detail">
                <h2>{contactPage.addressLabel}</h2>
                <p>{contactPage.address}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default ContactPage
