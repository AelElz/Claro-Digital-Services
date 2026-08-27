# Owner's integration pass

Applied by me after the nine build agents land, on files they own during the run.

## From the client, mid-run

1. **The big logo on the pages is overkill.** `/about` renders the full lockup at
   `--logo-w: min(100%, 620px)` (AboutPage.css:20-24) as its hero headline, with a
   comment claiming "the mark is the headline on this page". In this world it is not:
   the Bodoni headline is, and the wordmark is already in the bar sixty pixels away.
   - Remove `<Logo as="div" full className="about__logo reveal" />` (AboutPage.jsx:136).
   - Collapse `.about__hero` from a two-column grid to one column so the headline runs
     at full measure instead of being squeezed beside a hole where the logo was.
   - Delete `.about__logo` and `.about__hero-mark`.
   - Preloader keeps its lockup: an intro is where a logo belongs, and it is brief.

## Mine, deferred to avoid editing files agents own

2. Dead content keys once every eyebrow is stripped: `hero.eyebrow`, `formula.eyebrow`,
   `services.eyebrow`, `work.eyebrow`, `sectors.eyebrow`, `testimonial.eyebrow`,
   `contact.eyebrow`, `about.eyebrow`, `about.*.eyebrow`, `method.eyebrow`,
   `notFound.eyebrow`, `contactPage.eyebrow`, `auth.eyebrow`. Remove from BOTH
   en.js and fr.js, keeping shapes identical, and re-run the parity check.
3. Re-check `.reveal` entrance survives: no component may redeclare `transition`
   on an element carrying `.reveal`.
4. Confirm no agent reintroduced `.eyebrow`, a light panel, a smooth gradient wash,
   `filter: blur()` on a field, or a breakpoint outside 400/560/680/1100.
5. Verify EN and FR both still render every surface.
6. DESIGN.md, written from the built world at finish.

## Found while agents ran

7. **`color-mix()` with no fallback** (Navbar.css:66,70,78,79,84,85 and possibly
   elsewhere). Unregistered custom properties store any token stream, so the
   two-declaration fallback trick does NOT work here: a browser that cannot parse
   `color-mix` fails at var() substitution and the property lands `unset`. That
   makes `--nav-fill` transparent, i.e. the bar loses its background entirely on
   Safari < 16.2. Either put the fallback at the point of USE
   (`background: rgba(...); background: var(--nav-fill);`) or spell the values as
   rgba. The audience is phones in Morocco; do not assume a 2023 baseline.
8. **Fields carrying `.reveal`.** Work.jsx adds `className="field reveal ..."` so
   useReveal picks the field up. Under `html.js` that element then gets BOTH the
   reveal's `translate: 0 14px` and the field's `scale(1.08)` bloom. Better: teach
   useReveal to observe `.field` directly and drop `.reveal` from fields, so the two
   entrances stay distinct the way the spec describes.
9. `.footer__col` and `.about__item` still set a `transition` SHORTHAND while
   carrying `.reveal`, which deletes the reveal entrance. Verified by
   `.impeccable/verify.mjs`.
10. Contact.css still uses `background-clip: text` (gradient text), which is banned.
