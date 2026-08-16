import { DEFAULT_LOCALE, useLocale } from '../lib/locale-context'
import en from './en'
import fr from './fr'

/*
 * Every string on the page, in one place, per language.
 *
 * `en.js` and `fr.js` hold the copy and must keep identical shapes. This
 * module is the only thing components talk to: they call useContent() and
 * destructure the block they need, exactly as they used to destructure the
 * named exports this file replaced.
 *
 *   const { hero } = useContent()
 *
 * Nothing here is locale-aware except the lookup itself. Paths, slugs and
 * form field names stay the same in both languages, so a language switch
 * changes what the page says and never where its links go.
 */

export const dictionaries = { en, fr }

/*
 * Falls back rather than throwing on an unknown code. The locale can come
 * from localStorage, which is to say from something a previous version of
 * this site wrote, or that somebody edited by hand; a page that renders in
 * English is a better answer than a page that does not render.
 */
export function useContent() {
  const { locale } = useLocale()
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
}

/*
 * Turns a label into the path its page would live at. Most of these pages do
 * not exist yet, which is the point: the link carries an honest destination
 * and the router shows the "still being built" page, instead of every dead
 * link quietly dumping the visitor on the contact section.
 *
 * The decomposition step matters for French. NFD splits an accented letter
 * into its base plus a combining mark, and the mark is then stripped with
 * everything else that is not a-z0-9. Without it "Développement" strips the
 * é as an unknown character and slugs to `d-veloppement`.
 */
export const slug = (label) =>
  String(label)
    .normalize('NFD')
    /* A named property rather than a U+0300-U+036F range: the range has to
       be written either as invisible combining characters or as escapes
       nobody can read, and this says what it means. */
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
