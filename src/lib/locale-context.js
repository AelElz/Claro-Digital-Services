import { createContext, useContext } from 'react'

/*
 * Kept apart from the provider for the same reason RouterContext is: Fast
 * Refresh only tracks a module when everything it exports is a component,
 * so a hook living beside LocaleProvider would silently break hot reload
 * for every consumer.
 *
 * It is also what keeps `content/index.js` and `lib/locale.jsx` from forming
 * a cycle. The provider reads the dictionaries to set the document title;
 * the content module reads the locale to pick one. Both import this, and
 * this imports neither.
 */

export const DEFAULT_LOCALE = 'en'

/* The order here is the order the toggle draws them in: EN then FR, the way
   the design asset has it. `label` is the two letters in the pill, `name`
   the full endonym, used for the accessible name. */
export const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
]

export const LOCALE_CODES = LOCALES.map((locale) => locale.code)

export const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

export const useLocale = () => useContext(LocaleContext)
