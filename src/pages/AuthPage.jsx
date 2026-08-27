import { useEffect, useMemo, useRef, useState } from 'react'
import Footer from '../components/Footer'
import Link from '../components/Link'
import Navbar from '../components/Navbar'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import './AuthPage.css'

/*
 * Sign in and create account, front end only.
 *
 * There is deliberately no persistence of any kind here. The password lives
 * in component state for exactly as long as the form is open and is never
 * written to localStorage, sessionStorage, a cookie, the URL or a global.
 * A front-end "account system" that stored credentials would be worse than
 * no account system at all, because it would look like it worked. The notice
 * above the form says so in the visitor's own language, and it stays until
 * there is a server behind this page (AGENTS.md section 4).
 */

/*
 * NIST 800-63B: favour length, do not force composition rules, and screen
 * against known-common choices. Eight is the floor; the meter does the rest
 * by encouraging longer rather than punishing shorter.
 */
const MIN_PASSWORD = 8

const COMMON = [
  'password', '12345678', '123456789', 'qwerty', 'letmein', 'welcome',
  'admin', 'iloveyou', 'abc123', '111111', 'claro', 'clarodigi',
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Tab order, which is also the order the first error is looked for in. */
const ORDER = ['name', 'email', 'password', 'confirm']

/* Long enough to read as the form doing something, short enough that nobody
   waits. There is no request behind it; the result says so outright. */
const CHECK_MS = 520

function isCommon(password) {
  const lower = password.toLowerCase()
  return COMMON.some((entry) => lower.includes(entry))
}

/* 0 to 4, weighted toward length rather than symbol soup. */
function strengthOf(password) {
  if (!password) return 0
  if (isCommon(password)) return 0

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length

  let score = 0
  if (password.length >= MIN_PASSWORD) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (variety >= 3) score += 1

  return Math.min(score, 4)
}

function AuthPage() {
  const { auth } = useContent()
  const revealRef = useReveal()
  const [mode, setMode] = useState('signIn')
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [touched, setTouched] = useState({})
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const resultRef = useRef(null)
  const check = useRef(0)

  const isSignUp = mode === 'signUp'
  const copy = auth[mode]

  useEffect(() => () => window.clearTimeout(check.current), [])

  const errors = useMemo(() => {
    const next = {}
    if (isSignUp && !values.name.trim()) next.name = auth.errors.name
    if (!EMAIL.test(values.email.trim())) next.email = auth.errors.email

    if (isSignUp) {
      if (values.password.length < MIN_PASSWORD) next.password = auth.errors.passwordShort
      else if (isCommon(values.password)) next.password = auth.errors.passwordCommon
      if (values.confirm !== values.password) next.confirm = auth.errors.confirm
    } else if (!values.password) {
      next.password = auth.errors.passwordShort
    }

    return next
    /* `auth` changes identity on a language switch, so the messages have to
       be recomputed: without it a field that was already invalid would keep
       showing the previous language's error. */
  }, [auth, isSignUp, values])

  const strength = strengthOf(values.password)
  const meterOn = isSignUp && Boolean(values.password)

  const set = (name) => (event) => {
    const { value } = event.target
    setDone(false)
    setValues((current) => ({ ...current, [name]: value }))
  }

  const blur = (name) => () => setTouched((current) => ({ ...current, [name]: true }))

  /* Warn rather than silently let someone mistype a capitalised password. */
  const onKey = (event) => setCapsLock(event.getModifierState?.('CapsLock') ?? false)

  const swap = () => {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setTouched({})
    setDone(false)
    setCapsLock(false)
    setVisible(false)
    // Never carry a typed password across a mode switch.
    setValues((current) => ({ ...current, password: '', confirm: '' }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })

    /*
     * A rejected submit used to end here with nothing but the error text
     * appearing somewhere below the fold of a phone screen. Focus moves to
     * the first field that is actually wrong, so the message is read out and
     * the caret is already where the fix has to happen.
     */
    const first = ORDER.find((name) => errors[name])
    if (first) {
      setDone(false)
      requestAnimationFrame(() => document.getElementById(`auth-${first}`)?.focus())
      return
    }

    /*
     * The only honest thing to do without a server: confirm the form is
     * valid, then drop the credentials. Nothing is sent and nothing is kept.
     *
     * `touched` is cleared along with them, or the password field would be
     * empty, still marked as touched, and would light up with "use at least
     * eight characters" as its reward for being correct.
     */
    setValues((current) => ({ ...current, password: '', confirm: '' }))
    setTouched({})
    setCapsLock(false)
    setVisible(false)
    setBusy(true)

    check.current = window.setTimeout(() => {
      setBusy(false)
      setDone(true)
      requestAnimationFrame(() => resultRef.current?.focus())
    }, CHECK_MS)
  }

  const invalidOf = (name) => Boolean(touched[name] && errors[name])

  /*
   * The accessible name and the description are two different things, and
   * this page used to run them together.
   *
   * Every <label> wrapped its field's error, its hint, the Show button and
   * the strength meter, so the password input announced as "Password Show
   * password Caps Lock is on Use at least 8 characters Password strength
   * Fair, edit text". The label now wraps the label text alone; everything
   * else sits outside it and is attached here, where a screen reader reads
   * it as description after the name, and only when it exists.
   */
  const describe = (name, extra = []) => {
    const list = [invalidOf(name) ? `auth-${name}-error` : null, ...extra].filter(Boolean)
    return list.length ? list.join(' ') : undefined
  }

  const eye = visible ? (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.3A9.6 9.6 0 0 1 12 5c5 0 9 4.5 9 7a11 11 0 0 1-2.6 3.5M6.2 7.4C4.2 8.8 3 10.8 3 12c0 2.5 4 7 9 7 1.3 0 2.5-.3 3.6-.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <path
        d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )

  return (
    <>
      <Navbar />

      <main className="auth" ref={revealRef}>
        <span className="auth__grain" aria-hidden="true" />

        <div className="container auth__inner">
          <div className="card auth__card reveal">
            <span
              className="field reveal auth__field-light"
              data-hue="crimson"
              aria-hidden="true"
            />

            <h1 className="sub-title auth__title">{copy.title}</h1>
            <p className="auth__lede">{copy.lede}</p>

            {/* Stated up front, not buried, so it is read before anything is typed. */}
            <aside className="auth__notice">
              <strong>{auth.notice.title}</strong>
              <span>{auth.notice.body}</span>
            </aside>

            <form className="auth__form" onSubmit={onSubmit} noValidate>
              {isSignUp && (
                <div className="auth__field">
                  <label className="auth__label" htmlFor="auth-name">
                    {auth.labels.name}
                  </label>
                  <input
                    id="auth-name"
                    className="auth__input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    placeholder={auth.placeholders.name}
                    disabled={busy}
                    value={values.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    aria-invalid={invalidOf('name')}
                    aria-describedby={describe('name')}
                  />
                  {invalidOf('name') && (
                    <p className="auth__error" id="auth-name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="auth__field">
                <label className="auth__label" htmlFor="auth-email">
                  {auth.labels.email}
                </label>
                <input
                  id="auth-email"
                  className="auth__input"
                  type="email"
                  name="email"
                  autoComplete={isSignUp ? 'email' : 'username'}
                  spellCheck="false"
                  autoCapitalize="none"
                  maxLength={254}
                  placeholder={auth.placeholders.email}
                  disabled={busy}
                  value={values.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  aria-invalid={invalidOf('email')}
                  aria-describedby={describe('email')}
                />
                {invalidOf('email') && (
                  <p className="auth__error" id="auth-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="auth__field">
                <label className="auth__label" htmlFor="auth-password">
                  {auth.labels.password}
                </label>

                <span className="auth__password">
                  <input
                    id="auth-password"
                    className="auth__input"
                    type={visible ? 'text' : 'password'}
                    name="password"
                    /* Tells a password manager which one this is. */
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    maxLength={128}
                    placeholder={isSignUp ? auth.placeholders.password : undefined}
                    disabled={busy}
                    value={values.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    onKeyUp={onKey}
                    aria-invalid={invalidOf('password')}
                    aria-describedby={describe('password', [
                      capsLock ? 'auth-caps' : null,
                      meterOn ? 'auth-strength' : null,
                    ])}
                  />
                  {/*
                   * Outside the label, and named from the dictionary rather
                   * than from visible words: inside it, "Show password" was
                   * being read as part of the input's own name.
                   */}
                  <button
                    className="auth__peek"
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    disabled={busy}
                    aria-pressed={visible}
                    aria-label={visible ? auth.labels.hide : auth.labels.show}
                    aria-controls="auth-password"
                  >
                    {eye}
                  </button>
                </span>

                {invalidOf('password') && (
                  <p className="auth__error" id="auth-password-error">
                    {errors.password}
                  </p>
                )}

                {capsLock && (
                  <p className="auth__hint" id="auth-caps" role="status">
                    {auth.labels.capsLock}
                  </p>
                )}

                {meterOn && (
                  <span className="auth__strength" id="auth-strength" data-score={strength}>
                    <span className="auth__meter" aria-hidden="true">
                      {[0, 1, 2, 3].map((step) => (
                        <span key={step} data-on={step < strength} />
                      ))}
                    </span>
                    <span className="auth__strength-label">
                      {auth.labels.strength}: {auth.strengthLabels[strength]}
                    </span>
                  </span>
                )}
              </div>

              {isSignUp && (
                <div className="auth__field">
                  <label className="auth__label" htmlFor="auth-confirm">
                    {auth.labels.confirm}
                  </label>
                  <input
                    id="auth-confirm"
                    className="auth__input"
                    type={visible ? 'text' : 'password'}
                    name="confirm"
                    autoComplete="new-password"
                    maxLength={128}
                    disabled={busy}
                    value={values.confirm}
                    onChange={set('confirm')}
                    onBlur={blur('confirm')}
                    onKeyUp={onKey}
                    aria-invalid={invalidOf('confirm')}
                    aria-describedby={describe('confirm')}
                  />
                  {invalidOf('confirm') && (
                    <p className="auth__error" id="auth-confirm-error">
                      {errors.confirm}
                    </p>
                  )}
                </div>
              )}

              {!isSignUp && (
                <div className="auth__row">
                  <label className="auth__remember">
                    <input type="checkbox" name="remember" disabled={busy} />
                    <span>{auth.labels.remember}</span>
                  </label>
                  {/*
                   * A real destination rather than a button that does
                   * nothing. There is no server to reset anything, so the
                   * recovery that exists is the one on /contact.
                   */}
                  <Link className="auth__link" to="/contact">
                    {auth.labels.forgot}
                  </Link>
                </div>
              )}

              <div className="auth__foot">
                <button
                  className="btn btn--primary auth__submit"
                  type="submit"
                  data-state={busy ? 'checking' : 'idle'}
                  disabled={busy}
                  aria-busy={busy}
                >
                  {copy.submit}
                  <span className="btn__icon" aria-hidden="true">
                    {busy ? (
                      <svg
                        className="auth__spinner"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8.5"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          opacity="0.25"
                        />
                        <path
                          d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <path
                          d="M4 12h15m0 0-6-6m6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </button>

                {/* Present from the first paint so the message lands in a live
                    region that already existed; empty, it takes no space. */}
                <div className="auth__result" data-state={done ? 'done' : 'idle'} role="status">
                  {done && (
                    <>
                      <span className="auth__result-mark" aria-hidden="true">
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
                      <span className="auth__result-text" tabIndex={-1} ref={resultRef}>
                        {auth.demoResult}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </form>

            <p className="auth__switch">
              {copy.switchPrompt}{' '}
              <button className="auth__link" type="button" onClick={swap}>
                {copy.switchAction}
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default AuthPage
