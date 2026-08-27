import { useEffect, useRef, useState } from 'react'
import Footer from '../components/Footer'
import Link from '../components/Link'
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

/* The mail client takes a moment to come forward; the button holds its busy
   state for that long rather than flicking through it in one frame. */
const HANDOFF_MS = 900

function ContactPage() {
  const { contact, contactPage } = useContent()
  const revealRef = useReveal()
  const [values, setValues] = useState({})
  /*
   * The time trap used to be an invisible third exit from onSubmit: fill the
   * form from an autofill entry, press Send inside three seconds and
   * absolutely nothing happened, with no message of any kind. It is a state
   * now instead of a silent return. The button is plainly unavailable and
   * visibly filling toward being available, so the wait is legible without
   * ever announcing that it is a spam check.
   */
  const [armed, setArmed] = useState(false)
  /* idle | sending | sent | error */
  const [status, setStatus] = useState('idle')
  const openedAt = useRef(Date.now())
  const handoff = useRef(0)

  const busy = status === 'sending'

  useEffect(() => {
    const left = Math.max(0, MIN_FILL_MS - (Date.now() - openedAt.current))
    const id = window.setTimeout(() => setArmed(true), left)
    return () => window.clearTimeout(id)
  }, [])

  /* The handoff timer outlives a fast navigation away otherwise. */
  useEffect(() => () => window.clearTimeout(handoff.current), [])

  const set = (name) => (event) => {
    const { value } = event.target
    /* Editing after a send returns the form to its own resting state, so the
       confirmation never sits over a message that has since changed. */
    setStatus((current) => (current === 'idle' ? current : 'idle'))
    setValues((current) => ({ ...current, [name]: value }))
  }

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

    /*
     * Honeypot: a real visitor never sees this field, a bot fills everything.
     * This one stays silent on purpose. Telling a scripted submitter which
     * check it failed is the one thing that makes the check worthless, and
     * no person can reach this branch.
     */
    if (values.website) return

    /* The button is disabled until this is true, so a person cannot land
       here. Kept as the actual guard rather than trusting the disabled
       attribute, which a submit from the keyboard could outrun. */
    if (!armed || Date.now() - openedAt.current < MIN_FILL_MS) return

    setStatus('sending')

    try {
      window.location.href = composeMailto(values, contactPage)
    } catch {
      /*
       * There was no error state at all before this: a browser with no mail
       * handler, or a navigation the platform refuses, left the visitor
       * looking at an unchanged form. Now they get the address itself, which
       * is the only recovery that does not need a server.
       */
      setStatus('error')
      return
    }

    handoff.current = window.setTimeout(() => setStatus('sent'), HANDOFF_MS)
  }

  const arrow = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M4 12h15m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const spinner = (
    <svg className="contact-form__spinner" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path
        d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )

  return (
    <>
      <Navbar />

      <main className="contact-page" ref={revealRef}>
        <span className="contact-page__grain" aria-hidden="true" />

        <div className="container contact-page__inner">
          <header className="contact-page__head">
            <h1 className="section-title reveal">{contactPage.title}</h1>
            <p className="section-lede reveal" style={{ '--i': 1 }}>
              {contactPage.lede}
            </p>
          </header>

          <div className="contact-page__body">
            <div className="card contact-page__form-card reveal" style={{ '--i': 2 }}>
              <span
                className="field reveal contact-page__field"
                data-hue="crimson"
                aria-hidden="true"
              />

              <form className="contact-form" onSubmit={onSubmit}>
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

                {contactPage.fields.map((field) => {
                  const value = values[field.name] ?? ''
                  const near = field.max ? value.length > field.max * 0.8 : false

                  return (
                    <div
                      className={`contact-form__field${
                        field.type === 'textarea' ? ' contact-form__field--wide' : ''
                      }`}
                      key={field.name}
                    >
                      <label className="contact-form__label" htmlFor={`contact-${field.name}`}>
                        {field.label}
                        {field.required && <em aria-hidden="true">*</em>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          id={`contact-${field.name}`}
                          className="contact-form__input contact-form__input--select"
                          name={field.name}
                          required={field.required}
                          disabled={busy}
                          value={value}
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
                          id={`contact-${field.name}`}
                          className="contact-form__input"
                          name={field.name}
                          rows={6}
                          placeholder={field.placeholder}
                          required={field.required}
                          maxLength={field.max}
                          disabled={busy}
                          value={value}
                          onChange={set(field.name)}
                        />
                      ) : (
                        <input
                          id={`contact-${field.name}`}
                          className="contact-form__input"
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          required={field.required}
                          maxLength={field.max}
                          autoComplete={field.autoComplete}
                          spellCheck={field.type === 'email' ? 'false' : undefined}
                          disabled={busy}
                          value={value}
                          onChange={set(field.name)}
                        />
                      )}

                      {/*
                       * Digits only, and only once the cap is close enough to
                       * matter. maxLength already enforces it, so this is the
                       * warning rather than the control, and it carries no
                       * copy to translate.
                       */}
                      {near && (
                        <span className="contact-form__count tnum" aria-hidden="true">
                          {value.length}/{field.max}
                        </span>
                      )}
                    </div>
                  )
                })}

                <div className="contact-form__foot">
                  <button
                    className="btn btn--primary contact-form__submit"
                    type="submit"
                    data-state={armed ? status : 'arming'}
                    style={{ '--arm': `${MIN_FILL_MS}ms` }}
                    disabled={!armed || busy}
                    aria-busy={busy}
                  >
                    {contactPage.submit}
                    <span className="btn__icon" aria-hidden="true">
                      {busy ? spinner : arrow}
                    </span>
                    {/* The wait, drawn. Nothing says why, only that it ends. */}
                    {!armed && <span className="contact-form__arm" aria-hidden="true" />}
                  </button>

                  {/*
                   * Mounted from the first paint and filled later. A live
                   * region that appears at the same moment as its text is not
                   * reliably announced, so the region is always here and only
                   * its contents change. Empty it has no box and no margin,
                   * so it costs nothing while it waits.
                   */}
                  <div
                    className="contact-form__status"
                    data-state={status}
                    role="status"
                    aria-live="polite"
                  >
                    {status === 'sent' && (
                      <>
                        <span className="contact-form__status-mark" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                            <path
                              d="m5 12.5 4.5 4.5L19 7"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="contact-form__status-text">
                          {contact.body}
                          <a
                            className="contact-form__status-link"
                            href={`mailto:${contactPage.email}`}
                          >
                            {contactPage.email}
                          </a>
                        </span>
                      </>
                    )}

                    {status === 'error' && (
                      <>
                        <span className="contact-form__status-mark" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                            <path
                              d="M12 7v6m0 4h.01"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                        <span className="contact-form__status-text">
                          {contactPage.emailLabel}
                          <a
                            className="contact-form__status-link"
                            href={`mailto:${contactPage.email}`}
                          >
                            {contactPage.email}
                          </a>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <aside className="card contact-page__aside reveal" style={{ '--i': 3 }}>
              <span
                className="field reveal contact-page__field"
                data-hue="wine"
                aria-hidden="true"
              />

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

          <Link className="contact-page__back" to="/">
            {contactPage.back}
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default ContactPage
