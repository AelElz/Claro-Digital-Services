import { useMemo, useRef, useState } from 'react'
import Footer from '../components/Footer'
import Mark from '../components/Mark'
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
 * no account system at all, because it would look like it worked.
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
  const [done, setDone] = useState(false)
  const resultRef = useRef(null)

  const isSignUp = mode === 'signUp'
  const copy = auth[mode]

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

  const set = (name) => (event) => {
    setDone(false)
    setValues((current) => ({ ...current, [name]: event.target.value }))
  }

  const blur = (name) => () => setTouched((current) => ({ ...current, [name]: true }))

  /* Warn rather than silently let someone mistype a capitalised password. */
  const onKey = (event) => setCapsLock(event.getModifierState?.('CapsLock') ?? false)

  const swap = () => {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setTouched({})
    setDone(false)
    // Never carry a typed password across a mode switch.
    setValues((current) => ({ ...current, password: '', confirm: '' }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })
    if (Object.keys(errors).length) return

    /*
     * The only honest thing to do without a server: confirm the form is
     * valid, then drop the credentials. Nothing is sent and nothing is kept.
     */
    setValues((current) => ({ ...current, password: '', confirm: '' }))
    setDone(true)
    requestAnimationFrame(() => resultRef.current?.focus())
  }

  const field = (name) => ({
    id: `auth-${name}`,
    invalid: Boolean(touched[name] && errors[name]),
    describedBy: touched[name] && errors[name] ? `auth-${name}-error` : undefined,
  })

  return (
    <>
      <Navbar />

      <main className="auth" ref={revealRef}>
        <div className="container auth__inner">
          <div className="auth__card reveal">
            <p className="eyebrow">
              <Mark className="eyebrow__mark" />
              {auth.eyebrow}
            </p>

            <h1 className="auth__title">{copy.title}</h1>
            <p className="auth__lede">{copy.lede}</p>

            {/* Stated up front, not buried, so it is read before anything is typed. */}
            <aside className="auth__notice">
              <strong>{auth.notice.title}</strong>
              <span>{auth.notice.body}</span>
            </aside>

            <form className="auth__form" onSubmit={onSubmit} noValidate>
              {isSignUp && (
                <label className="auth__field" htmlFor={field('name').id}>
                  <span className="auth__label">{auth.labels.name}</span>
                  <input
                    id={field('name').id}
                    className="auth__input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    placeholder={auth.placeholders.name}
                    value={values.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    aria-invalid={field('name').invalid}
                    aria-describedby={field('name').describedBy}
                  />
                  {field('name').invalid && (
                    <span className="auth__error" id="auth-name-error">
                      {errors.name}
                    </span>
                  )}
                </label>
              )}

              <label className="auth__field" htmlFor={field('email').id}>
                <span className="auth__label">{auth.labels.email}</span>
                <input
                  id={field('email').id}
                  className="auth__input"
                  type="email"
                  name="email"
                  autoComplete={isSignUp ? 'email' : 'username'}
                  spellCheck="false"
                  autoCapitalize="none"
                  maxLength={254}
                  placeholder={auth.placeholders.email}
                  value={values.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  aria-invalid={field('email').invalid}
                  aria-describedby={field('email').describedBy}
                />
                {field('email').invalid && (
                  <span className="auth__error" id="auth-email-error">
                    {errors.email}
                  </span>
                )}
              </label>

              <label className="auth__field" htmlFor={field('password').id}>
                <span className="auth__label">{auth.labels.password}</span>

                <span className="auth__password">
                  <input
                    id={field('password').id}
                    className="auth__input"
                    type={visible ? 'text' : 'password'}
                    name="password"
                    /* Tells a password manager which one this is. */
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    maxLength={128}
                    placeholder={isSignUp ? auth.placeholders.password : undefined}
                    value={values.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    onKeyUp={onKey}
                    aria-invalid={field('password').invalid}
                    aria-describedby={field('password').describedBy}
                  />
                  <button
                    className="auth__peek"
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-pressed={visible}
                  >
                    {visible ? auth.labels.hide : auth.labels.show}
                  </button>
                </span>

                {capsLock && (
                  <span className="auth__hint" role="status">
                    {auth.labels.capsLock}
                  </span>
                )}

                {field('password').invalid && (
                  <span className="auth__error" id="auth-password-error">
                    {errors.password}
                  </span>
                )}

                {isSignUp && values.password && (
                  <span className="auth__strength" data-score={strength}>
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
              </label>

              {isSignUp && (
                <label className="auth__field" htmlFor={field('confirm').id}>
                  <span className="auth__label">{auth.labels.confirm}</span>
                  <input
                    id={field('confirm').id}
                    className="auth__input"
                    type={visible ? 'text' : 'password'}
                    name="confirm"
                    autoComplete="new-password"
                    maxLength={128}
                    value={values.confirm}
                    onChange={set('confirm')}
                    onBlur={blur('confirm')}
                    aria-invalid={field('confirm').invalid}
                    aria-describedby={field('confirm').describedBy}
                  />
                  {field('confirm').invalid && (
                    <span className="auth__error" id="auth-confirm-error">
                      {errors.confirm}
                    </span>
                  )}
                </label>
              )}

              {!isSignUp && (
                <div className="auth__row">
                  <label className="auth__remember">
                    <input type="checkbox" name="remember" />
                    <span>{auth.labels.remember}</span>
                  </label>
                  <button className="auth__link" type="button">
                    {auth.labels.forgot}
                  </button>
                </div>
              )}

              <button className="btn btn--primary auth__submit" type="submit">
                {copy.submit}
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

              {done && (
                <p className="auth__result" role="status" tabIndex={-1} ref={resultRef}>
                  {auth.demoResult}
                </p>
              )}
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
