# AGENTS.md

Working notes for AI agents editing this repository. Read [README.md](README.md)
first for the stack and structure; this file covers the reasoning, the traps,
the security posture and how to verify work here.

Everything below was learned by breaking it. Each invariant is written with
the symptom it produces, because most of them **fail silently and look
completely fine in a screenshot**.

---

## 1. The rule that matters most

**Verify by measuring, not by looking.**

Nearly every bug in this codebase rendered a plausible-looking page. The
sticky stack, the scroll targets, the grain coverage and the panel gaps were
all found by reading geometry in the browser console, never by eye.

Useful shapes:

```js
// walk the whole page and assert nothing is uncovered
for (let y = 0; y <= docH - H; y += 60) {
  window.scrollTo(0, y)
  document.body.getBoundingClientRect()   // force layout
  const el = document.elementFromPoint(innerWidth / 2, H - 20)
  if (!el?.closest('.panel, .footer, .navbar')) gaps++
}
```

Two environment facts that will mislead you:

- **A backgrounded tab runs no rendering steps.** rAF stops, CSS transitions
  freeze mid-value, and IntersectionObserver never fires. A "black screenshot"
  or "opacity stuck at 0" is usually this, not a bug. To distinguish a frozen
  transition from a rule that does not apply, set
  `el.style.transition = 'none'`, force a reflow, then read the computed value.
- **Lenis fights `window.scrollTo`.** Calling it directly desynchronises
  Lenis's internal position and your next assertion is meaningless. Use
  `window.__lenis.stop()` first (exposed in dev only), or drive through real
  UI clicks.

---

## 2. Invariants you must not break

### Sticky elements lie about their position, twice

A pinned panel reports `top: 0` from `getBoundingClientRect()` **and** a
shifted `offsetTop`. Resolving a scroll target from either means "scroll to
where you already are".

Use `documentTop()` in `src/lib/motion.js`, which rebuilds the true position
from the flow: container top plus the heights of preceding siblings. Heights
are unaffected by pinning.

*Symptom if broken: clicking Home or the logo does nothing.*

### Never animate `transform` on the nav pill

`.navbar__indicator` is centred with `transform: translateY(-50%)`. Animating
`transform` replaces that outright, dropping the pill half its height. Animate
`left` and `width` only. Use the `scale` and `translate` longhand properties
if you need an independent transform anywhere.

*Symptom: the pill drops ~19px, pops, and snaps back on a distant jump.*

### `.panel__grain` must be sized in percentages

The grain layer needs `inset: -14%`, scaling with the panel. A fixed height
(`128svh`) leaves a 155svh panel short, producing a hard horizontal edge where
texture becomes flat black, which slides as the panel settles into its pin.

The margin must stay comfortably larger than the 5% drift in the keyframes.

*Symptom: a black band across the lower cards that moves as you scroll.*

### The last panel gets no dwell

`.panel:last-child { min-height: 100svh }`. The final panel is `main`'s last
child, so its sticky range is zero and it cannot pin. Its dwell space would
ride up the bottom of the screen.

*Symptom: a growing black band at the bottom before the footer.*

### `html` and `body` must stay free of `overflow`

`position: sticky` is silently ignored if **any** ancestor has
`overflow: hidden/clip/auto/scroll`. The entire depth effect is sticky.

*Symptom: the whole chapter stack degrades to ordinary scrolling, no error.*

### GSAP `.set()` needs an explicit position

`.set(el, {...}, 0)`. Without the `0`, it lands at the timeline's current end,
so initial states get applied after the animations they were meant to precede.

*Symptom: the intro logo snaps back to solid white after the wipes.*

### rAF-based intros need a wall-clock escape hatch

GSAP runs on rAF, which pauses in background tabs. The preloader carries
`setTimeout(() => tl.progress(1), 9000)`. Without it, a visitor who opens the
site in a background tab returns to a permanently covered page.

### `useReveal` checks rects synchronously before observing

IntersectionObserver delivers its first callback only after a rendering step.
Deep links, restored scroll positions and background tabs would leave content
at `opacity: 0` indefinitely. The hook does a synchronous rect check first,
then observes.

### Lenis caches the document height

It clamps scrolling to a stale limit after a route change, which does not just
break jumps, it makes the lower part of a taller page unreachable. Re-measure
on route change and before programmatic jumps.

### A React key taken from translated copy makes content disappear

`key={item.kicker}` looks stable. It is not: the kicker is copy, so switching
language changes the key, and React unmounts the element and mounts a new one
in its place. The replacement arrives without `is-in`, which is `opacity: 0`.

`useReveal` now adopts late-mounted `.reveal` nodes through a MutationObserver,
so the content comes back. That is a safety net, not a licence: a remount still
throws away the element and replays its enter animation, so a whole chapter
visibly re-fades on every switch.

**Key list items on something that is not copy.** An index is right for these
lists, which are fixed length and never reorder. `formula`, `method.phases` and
`about.principles.items` carry an `n` and use it.

*Symptom: switching language empties a section, and switching back does not
bring it back.*

### `place()` must re-run when the labels change, not just the tab

The nav pill is measured from the active link. "Home" is 76px and "Accueil" is
83px, so a language switch resizes the thing the pill sits on without changing
which thing it is. `useLayoutEffect` therefore depends on `nav` as well as on
`place`, or the pill keeps the previous language's width.

*Symptom: the pill under-hangs the word by a few pixels, on one language only.*

### A black-on-black stack has no visible edge, so draw one

The deck used to alternate dark and light, so a chapter sliding over the one
below announced itself by its own colour. Every chapter is black now: an opaque
black panel slides over an opaque black panel and the boundary is invisible.
All you see is the outgoing chapter being cut in half by nothing, sweeping
upward as you scroll. It was reported as flickering, and it is desktop-only
because below 1100px there is no stack.

**The first fix was wrong and is worth knowing about.** Raising `MAX_SHADE` to
0.88 to dim the outgoing chapter out of the way removed the slicing and
introduced a black flash instead: the chapter underneath reached full dim while
the incoming one still had half the screen to cross, so the middle of every
handoff was two thirds near-black. Measured, mean screen luminance fell from
23.5 to 14.5 and climbed back to 28.4. The screen visibly went dark and came
back, which is what a black flash IS.

The edge is drawn explicitly instead: `.panel:not(:first-child)::before` is a
hairline plus a short fall of light, at z-index 4 so the arriving panel is not
dimmed by its own shade. `MAX_SHADE` is back to 0.55 and its ramp completes at
full cover, so the dim is depth again rather than a blackout.

*Symptom of no edge: content chopped mid-glyph by an invisible line.*
*Symptom of over-dimming instead: the screen darkens and recovers mid-handoff.*

### The nav pill must not invert its label while it travels

The indicator takes 0.42s to slide between chapters. While it was a near-solid
white slab whose active label flipped to dark ink, that whole slide left the
outgoing label light-on-white and the incoming one dark-on-dark: both
unreadable, every time the scroll-spy changed chapter.

It is a 13% wash with a hairline edge now and the label stays light throughout,
so nothing has to invert. Measured after the change, every nav label sits
between 7.9:1 and 13.6:1.

### Nothing should animate inside a covered chapter

Every chapter stays in the document while the next slides over it. Seven film
grain layers were re-seeding at once, plus the hero scroll cue six chapters
after anyone could see it, plus an image skeleton that faded to `opacity: 0` and
then swept forever underneath a loaded photograph.

`usePanelStack` sets `data-covered` once the shade is most of the way in, and
index.css pauses the infinite animations inside. Paused, not disabled, so
scrolling back up resumes them without a visible re-seed. A finished skeleton
also takes `visibility: hidden`, which removes it from the rendering path
instead of merely hiding it.

*Symptom: nothing visible. It costs frames and battery and shows up only as
compositing you cannot account for.*

### Lenis never finishes easing, so it poisons any "is it still?" test

Diffing consecutive screenshots to look for flicker reported 0.6% of pixels
changing on every frame pair, on a page that was not moving. That was Lenis
easing asymptotically toward its target and never arriving, so the whole page
drifted by a subpixel between shots. `window.__lenis.stop()` first; with it
stopped the same test reports 0.01%, which is noise.

### Stacked backdrop-filters are the most expensive thing you can ship

The site used to carry progressive-blur edges: three nested `backdrop-filter`
layers across the top and the bottom of the viewport, each re-reading the
composited backdrop of a full-width strip on every frame the page moved.

Measured on a 4x-throttled desktop over an identical scroll: median frame 49ms
with them, 17ms without, and the same scroll completed 38 frames against 101.
They cost roughly two thirds of the frame budget on their own. Disabling the
grain, the fields, the blend modes or the whole sticky stack each moved the
median by one frame quantum; nothing else came close.

They are gone. Do not reintroduce a stacked backdrop-filter. One is a cost you
can argue for; three over each other is not.

*Symptom if broken: the page scrolls at 20fps on desktop and nobody can say why,
because every individual layer looks cheap.*

### A declared transition on a compositable property never lets the layer go

`.field` used to carry `transition: scale …, opacity …`. That declaration is a
standing hint to the compositor: all twelve fields kept their own promoted
layer for the life of the page and were re-composited every frame, long after
their entrance had finished.

Measured: with the transition, p90 33ms and 19 of 99 frames missed; without it,
18ms and 4. Removing the fields entirely scored 17ms and 0, so the transition
was very nearly the whole cost of having them.

The bloom is a `@keyframes` animation on `.is-in` now. An animation ends; once
it has, the element is an ordinary painted box again. **Prefer an animation
over a transition for anything that plays once.**

*Symptom: periodic frame hitches with no obvious cause, on a page whose paint
cost looks fine.*

### Profile the production build, not the dev server

The dev bundle ships `jsxDEV`, `runWithFiberInDEV` and Fast Refresh wrappers,
and they dominate a CPU profile. A whole afternoon went into an anonymous
function in `LangToggle.jsx` that showed as the hottest thing on the page; it
was a Fast Refresh wrapper, and instrumenting the actual forced-layout reads
found four, not thousands.

Desktop p90 measured 33ms in dev and 18ms in production off the same commit.
Build, `vite preview`, then measure.

### Hover fill rows need `overflow: hidden`

`.reveal-row` clips the fill disc, which is always larger than the row.

*Symptom: a huge circle sweeps across the entire page on hover.*

### The hover disc is a fixed 800px element, scaled up

`--fill-size: 800px` in `index.css`, and `FILL_SIZE = 800` in
`useCircularReveal.js`. **These two must match.** The compositor rasterises a
layer at its own size then scales on the GPU, so a fixed small element scaled
6x costs a fraction of a correctly-sized 2500px one.

Do not add `will-change` to it. Promoting a large layer clipped by rounded
corners at the same moment it scales makes the row flash black.

---

## 3. Patterns to follow

**Copy goes in `src/content/`,** read with `useContent()`. Never hardcode
user-facing text in a component, and that includes `aria-label`: a screen
reader is a reader. `en.js` and `fr.js` must stay the same shape, down to
array lengths, or one language silently renders nothing where the other has a
string.

**Paths, slugs and form field names are locale-independent.** `/about` is
`/about` in both, because the router matches the path and there is no
`/a-propos` to match. Client and case-study names are the same string in both
files, so `/work/klit` resolves the same whichever language you are reading.
Only the visible label translates.

**State keyed on copy has to be carried across a switch.** A `<select>` value
is the option's own text, so a language change leaves it holding a string that
is no longer in the list: the box goes blank and a required field silently
becomes unsubmittable. `/contact` maps the selection across by index. Prefer
storing an index over storing a label.

**French punctuation uses ` ` before `? ! : ;`,** written as the escape
and never as the character. An invisible non-breaking space in a source file
is deleted by accident and never noticed.

**Navigate with `<Link to>`,** never a bare anchor. It handles client-side
routing and external URLs (new tab, `rel="noopener noreferrer"`).

**Dead links point at their real path.** A page that does not exist yet still
links to `/services/ai-agents`, and the router renders `NotFound`. Never route
an unbuilt link to the contact section; it silently lies about what happened.

**Scroll-driven effects subscribe to `onFrame` and write through `write()`.**
Do not start a private `requestAnimationFrame` loop. One loop exists; join it.

**Prefer CSS transitions over rAF interpolation** for pointer-following
effects. The cursor label on the testimonial screenshot trails using a
`transform` transition, which needs no loop and cannot fall behind under
throttling.

**Every animation needs a `prefers-reduced-motion` fallback.**

**Do not use `IntersectionObserver` with `threshold: 0.5`** for anything
section-sized. A section taller than the viewport never reaches 50% visible,
so it never fires. Use a centre-line probe or `threshold: 0`.

---

## 4. Security posture

### Current state, verified

- No backend, no API keys, no `.env`, no secrets in source or in `dist/`
- No source maps shipped
- No `dangerouslySetInnerHTML`, no `eval`, no `new Function`, no `innerHTML` writes
- Every `target="_blank"` carries `rel="noopener noreferrer"`
- Storage is two entries and neither is personal: one `sessionStorage` flag for
  the intro, and `claro:locale` in `localStorage`, which holds `en` or `fr`.
  Every access to it is wrapped, because `localStorage` throws outright in
  Safari's private mode rather than returning null. Anything read back out of
  it is validated against the known locales before use.

### The contact form (`/contact`)

No backend. `Send` composes a `mailto:` in the visitor's own mail client, so
no field value is transmitted by the site.

Protections in place: honeypot field, a 3-second minimum fill time, per-field
length caps, and control-character stripping before the URL is composed.
`encodeURIComponent` already escapes CR, LF and `&`, so a value cannot forge a
`&bcc=` parameter; the stripping is defence in depth so safety does not rest
on one call staying put.

Tested against CRLF injection, `&bcc=` forgery, null bytes, a 5000-character
flood and a script tag. In every case the resulting URL contained only the
`subject` and `body` parameters.

### The sign-in page (`/sign-in`) is not authentication

This is the most important thing in this file.

It is a front-end prototype. With no server there is nothing to verify a
password against. It is built to store **nothing**: no localStorage, no
sessionStorage, no cookie, no URL parameter, no global. The password lives in
component state while the form is open and is cleared on submit and on mode
switch.

The page carries a **visible notice** telling people not to enter a password
they use elsewhere.

**Do not remove that notice, and do not add credential persistence, while
there is no backend.** A login form that looks functional but does nothing is
how someone hands over a password they use on their bank. If you are asked to
"make it work" client-side, refuse and explain why: any client-side check is
readable and bypassable, and any client-side store is plaintext to anyone with
the device.

When a real backend arrives, the page needs: server-side validation, password
hashing (argon2id or bcrypt), rate limiting, HTTP-only session cookies, CSRF
protection, and a breached-password check. None of that can live in the
browser.

### If you add a backend

Everything currently safe becomes unsafe by default. At minimum: server-side
validation of every field (the client caps are a UX affordance, not a control),
rate limiting, CSRF tokens, and secrets in environment variables that are never
prefixed `VITE_`, since anything so prefixed is inlined into the public bundle.

---

## 5. Future enhancements

Roughly in order of value.

1. **A backend for the contact form.** The mailto flow works but loses anyone
   without a configured mail client. Needs server-side validation, rate
   limiting and spam filtering.
2. **Build the unbuilt routes.** 23 links currently resolve to `NotFound`:
   six project case studies, fifteen service pages, two legal pages. The
   paths and slugs already exist (`slug()` in `content.js`).
3. **Delete the unused assets.** About 1MB in `src/assets/`; only
   `kintsugi-people.jpg` is imported.
4. **Real authentication**, if accounts are actually wanted. See above.
5. **A third locale, if one is ever wanted.** English and French are done.
   Adding one is a new file in `src/content/`, an entry in `LOCALES`, and
   nothing else; the toggle measures its own options, so it grows on its own.
   Layout already uses logical properties, so RTL would not be a rewrite,
   though the pill would need more than two positions to stay readable.
6. **Tests.** The invariants in section 2 are exactly what a small Playwright
   suite should assert: no gaps across the scroll, nav targets landing, grain
   coverage, no uncovered band at the bottom.
7. **An image pipeline.** The one screenshot was hand-optimised with `sips`
   (951KB PNG to 138KB JPEG). Anything more than a couple of images wants
   responsive `srcset` and AVIF/WebP.

---

## 6. Do not

- Do not reintroduce a site-wide custom cursor. It was removed deliberately.
  The only cursor swap is scoped to the testimonial screenshot.
- Do not add uppercase plus wide letter-spacing to labels.
- Do not use em dashes in user-facing copy. This was an explicit request.
- Do not add `"comment"` keys to `vercel.json`. Its schema sets
  `additionalProperties: false` and the deploy fails. Reasoning goes in
  DEPLOY.md.
- Do not swap the framework for performance reasons. Past slowness was layout
  thrashing, canvas overdraw and stacked `backdrop-filter`, never React.
