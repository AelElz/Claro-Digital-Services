/*
 * Mechanical check of the things BUILD-SPEC.md promises.
 *
 * Every rule here is one a human reviewer would have to grep for by hand and
 * would eventually stop grepping for. Run from the project root:
 *   node .impeccable/verify.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const files = []
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(jsx?|css)$/.test(name)) files.push(p)
  }
})(join(ROOT, 'src'))

const read = (p) => readFileSync(p, 'utf8')

/*
 * Comments are prose about the code, not code. The first run of this file
 * flagged the index.css comment that says "deliberately no filter: blur()"
 * and the AuthPage comment that says nothing is "written to localStorage",
 * which is the codebase stating the rule it is being checked against.
 */
const decomment = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^\s*\/\/.*$/gm, "")
const rel = (p) => p.slice(ROOT.length)
const fails = []
const warns = []

const scan = (test, label, { warn = false, skip = () => false } = {}) => {
  const hits = []
  for (const p of files) {
    if (skip(p)) continue
    decomment(read(p))
      .split('\n')
      .forEach((line, i) => {
        if (test(line, p)) hits.push(`${rel(p)}:${i + 1}  ${line.trim().slice(0, 90)}`)
      })
  }
  if (hits.length) (warn ? warns : fails).push({ label, hits })
}

/* ---- Banned outright ------------------------------------------------- */

scan(
  (l) => /className=["'`][^"'`]*\beyebrow\b/.test(l),
  'Eyebrow reintroduced. Deleted site-wide; the heading carries its own weight.',
)

scan(
  (l) => /\bfilter:\s*blur\(/.test(l) && !/backdrop-filter/.test(l),
  'filter: blur() — banned on fields; it is the one thing that drops a phone below 60fps.',
  { skip: (p) => /Preloader\.css$/.test(p) },
)

scan(
  (l) => /-webkit-background-clip|background-clip:\s*text/.test(l),
  'Gradient text. Emphasis is weight or size.',
)

scan(
  (l) => /panel--light|var\(--off-white\)/.test(l),
  'Light surface outside index.css. There are no light chapters in this world.',
  { warn: true, skip: (p) => /index\.css$/.test(p) },
)

/* ---- Motion trap: a transition shorthand kills .reveal ---------------- */
{
  const hits = []
  for (const p of files.filter((f) => f.endsWith('.css'))) {
    const css = decomment(read(p))
    /* Selectors that set the transition SHORTHAND. */
    const shorthand = new Set()
    for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      if (/(^|;|\s)transition:\s/.test(m[2])) {
        for (const sel of m[1].split(',')) {
          /*
           * The SUBJECT of a selector is its last compound, not its first.
           * Taking the first token reported `.footer__col a { transition }`
           * as a transition on .footer__col, which carries .reveal, when it
           * is actually on the anchors inside it and harmless. Two of the
           * three findings this check produced were that mistake.
           */
          const compounds = sel.trim().split(/[\s>+~]+/).filter(Boolean)
          const subject = compounds[compounds.length - 1]
          if (!subject) continue
          /*
           * A pseudo-ELEMENT is a separate box, so `.x::after { transition }`
           * says nothing about `.x` — and it is in fact the correct way to
           * give a `.reveal` element a hover transition without stepping on
           * its entrance. A pseudo-CLASS is the same box, so `.x:hover`
           * still counts as `.x`.
           */
          if (subject.includes('::')) continue
          const base = subject.split(':')[0]
          if (base.startsWith('.')) shorthand.add(base.slice(1))
        }
      }
    }
    /* Classes that also carry .reveal in any JSX. */
    for (const j of files.filter((f) => /\.jsx$/.test(f))) {
      /*
       * The class list must contain `reveal` as an EXACT whitespace-delimited
       * token. A regex word boundary treats the hyphen in `reveal-row` as a
       * break, so \breveal\b matched every fill row on the site and reported
       * five components that were never affected.
       */
      for (const m of decomment(read(j)).matchAll(/className=["'`]([^"'`]+)["'`]/g)) {
        const tokens = m[1].split(/\s+/)
        if (!tokens.includes("reveal")) continue
        for (const cls of tokens) {
          if (cls && cls !== 'reveal' && shorthand.has(cls)) {
            hits.push(`${rel(p)} sets shorthand \`transition\` on .${cls}, which also carries .reveal (${rel(j)})`)
          }
        }
      }
    }
  }
  if (hits.length)
    fails.push({
      label:
        'A transition SHORTHAND on an element carrying .reveal replaces the reveal transition and its stagger, and the entrance silently dies. Use transition-property, or scope to a child.',
      hits: [...new Set(hits)],
    })
}

/* ---- Breakpoints ------------------------------------------------------ */

/*
 * A min-width rule that complements a max-width one sits at N+1, so 681 is the
 * partner of 680 and not a fifth breakpoint. Both spellings are allowed.
 */
const BREAKPOINTS = new Set([400, 560, 680, 1100, 401, 561, 681, 1101])
scan((l) => {
  const m = l.match(/@media[^{]*\((?:max|min)-width:\s*(\d+(?:\.\d+)?)px/)
  return m && !BREAKPOINTS.has(Math.round(+m[1]))
}, 'Breakpoint outside 400/560/680/1100.', { warn: true })

/* ---- EN / FR parity --------------------------------------------------- */

const en = (await import(join(ROOT, 'src/content/en.js'))).default
const fr = (await import(join(ROOT, 'src/content/fr.js'))).default
{
  const problems = []
  ;(function cmp(a, b, path) {
    const ta = Array.isArray(a) ? 'array' : typeof a
    const tb = Array.isArray(b) ? 'array' : typeof b
    if (ta !== tb) return problems.push(`${path}: en ${ta}, fr ${tb}`)
    if (ta === 'array') {
      if (a.length !== b.length) problems.push(`${path}: en ${a.length}, fr ${b.length}`)
      a.forEach((v, i) => b[i] !== undefined && cmp(v, b[i], `${path}[${i}]`))
    } else if (ta === 'object' && a) {
      for (const k of Object.keys(a)) k in b ? cmp(a[k], b[k], `${path}.${k}`) : problems.push(`${path}.${k} missing in fr`)
      for (const k of Object.keys(b)) if (!(k in a)) problems.push(`${path}.${k} missing in en`)
    }
  })(en, fr, 'content')
  if (problems.length) fails.push({ label: 'EN/FR shape drift.', hits: problems })
}

/* Locale-independent values must be byte-identical. */
{
  const keyed = (d) => [
    ...d.menu.links.map((l) => l.to),
    ...d.menu.legal.map((l) => l.to),
    ...d.nav.links.map((l) => l.href),
    ...d.work.items.map((i) => i.client),
    ...d.sectors.items.map((i) => i.caseStudy),
    ...d.contactPage.fields.map((f) => f.name),
    d.contact.email,
    d.footer.phone,
  ]
  const a = keyed(en)
  const b = keyed(fr)
  const drift = a.map((v, i) => (v === b[i] ? null : `en "${v}" vs fr "${b[i]}"`)).filter(Boolean)
  if (drift.length) fails.push({ label: 'A path, slug or field name changed with language.', hits: drift })
}

/* ---- Copy rules -------------------------------------------------------- */
{
  const flat = (o, p = '') =>
    typeof o === 'string' ? [[p, o]] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => flat(v, `${p}.${k}`)) : []
  const dashes = [...flat(en, 'en'), ...flat(fr, 'fr')].filter(([, v]) => v.includes('—'))
  if (dashes.length) fails.push({ label: 'Em dash in user-facing copy. Client instruction.', hits: dashes.map(([k]) => k) })
}

/* ---- Security floor ---------------------------------------------------- */

scan(
  (l, p) => /AuthPage/.test(p) && /(localStorage|sessionStorage|document\.cookie)/.test(l),
  'Credential persistence on the sign-in prototype. AGENTS.md section 4 forbids this while there is no backend.',
)
{
  const auth = read(join(ROOT, 'src/pages/AuthPage.jsx'))
  if (!/auth\.notice/.test(auth))
    fails.push({ label: 'The /sign-in prototype notice was removed. It must stay while there is no backend.', hits: ['src/pages/AuthPage.jsx'] })
}

/* ---- Report ------------------------------------------------------------ */

const show = (list, tag) => {
  for (const { label, hits } of list) {
    console.log(`\n${tag} ${label}`)
    for (const h of hits.slice(0, 12)) console.log(`    ${h}`)
    if (hits.length > 12) console.log(`    ...and ${hits.length - 12} more`)
  }
}

show(fails, 'FAIL')
show(warns, 'WARN')

if (!fails.length && !warns.length) console.log('PASS: every spec invariant holds.')
else if (!fails.length) console.log(`\nPASS with ${warns.length} warning group(s).`)
process.exit(fails.length ? 1 : 0)
