# Claro Digital

Marketing site for Claro Digital Services, an AI and development agency in
Tangier. Content is the clarodigi.com site translated to English; the design
and motion are a bespoke build in the brand's crimson and black palette.

Live routes: `/`, `/method`, `/contact`, `/sign-in`. Anything else renders a
"still being built" page rather than a dead end.

---

## Stack

| Piece | Version | Why it is here |
| --- | --- | --- |
| React | 19.2 | UI. Uses the React 19 `ref`-as-prop form, so no `forwardRef`. |
| Vite | 8.2 | Dev server and build. Needs Node 20.19+ or 22.12+. |
| GSAP | 3.15 | The intro timeline, and its ticker drives the site's single rAF loop. |
| Lenis | 1.3 | Smooth scroll. It smooths the native scroll, it never replaces it. |
| oxlint | 1.75 | Linting. Fast, zero config. |

There is **no CSS framework, no router library, no state library and no
backend**. Styling is plain CSS with custom properties, one stylesheet per
component. Routing is about forty lines in `src/lib/router.jsx`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the build
npm run lint
```

---

## Layout of the code

```
src/
  content.js          Every user-facing string on the site. Start here.
  index.css           Design tokens, the panel system, shared primitives.
  App.jsx             Route table.
  main.jsx            Entry, wraps the app in RouterProvider.

  lib/
    motion.js         The single rAF loop, Lenis, scrollTo, history nav.
    router.jsx        Router provider (pathname state + pushState).
    router-context.js The context object, split out so the provider can
                      live in a .jsx file without breaking fast refresh.

  hooks/
    usePanelStack.js  Turns the home page sections into the sticky stack.
    useReveal.js      Staggered enter animations via IntersectionObserver.
    useCircularReveal.js  Measures rows for the hover fill.

  components/         Presentational pieces, each with a matching .css
  pages/              One file per route
```

**All copy lives in `src/content.js`.** Nothing user-facing is hardcoded in a
component. To change wording, change that file and nothing else.

---

## The core idea: the chapter stack

The home page is seven full-screen "chapters" that alternate dark and light:

```
Hero (dark) -> Formula (light) -> Services (dark) -> Sectors (light)
-> Work (dark) -> Testimonial (light) -> Contact (dark) -> Footer
```

Every chapter is `position: sticky`, and JavaScript gives each one an
ascending `z-index`. The result is that each chapter pins to the top of the
screen and the next one slides up **over** it, dimming the one underneath
through a `.panel__shade` overlay. Nothing scrolls past; everything stacks.

Two consequences worth understanding before you touch it:

1. **Each panel is taller than the screen.** `min-height: 100svh + 55svh`.
   That extra 55svh (`--dwell`) is empty scroll distance that keeps the pinned
   chapter on screen long enough to read. The visible scene is
   `.panel__inner`, which is exactly one viewport tall and sits at the top of
   the panel.

2. **The last panel gets no dwell** (`.panel:last-child`). It cannot pin, so
   its empty space would scroll up the screen as a black band.

A new chapter is a `<Panel>` in `src/pages/Home.jsx`. Keep the dark/light
alternation going, otherwise two panels of the same tone meet and the depth
effect disappears.

---

## Design system

Everything is a token in `src/index.css`.

**Palette.** Three anchors plus two gradients. Black `#000`, off-white
`#fdfdfd`, and dark maroon `#42101c` for text on light surfaces. Crimson
`#e3355d` is the only accent. Dark and light chapters should end up roughly
balanced across the page; achieve that by alternating whole sections, not by
tinting individual elements.

**Type.** One typeface, Inter Tight, at two weights (400 and 500). Bodoni
Moda is loaded for the logo wordmark only, because that is the Claro mark.

Do not set labels in uppercase with wide letter-spacing. It reads as a second
typeface and cheapens the page. Labels use the same family, size and case as
body copy; the spiral mark in front of an eyebrow carries the emphasis
instead. Every size is fluid via `clamp()`.

**Optical alignment.** Display headings carry a negative
`margin-inline-start` in `em` (about `-0.045em`). Large type looks indented
next to small type because glyph side bearing scales with font size. Keep it
in `em` so it holds across the `clamp()`, and logical so RTL corrects the
opposite edge.

---

## Motion

One rAF loop for the whole site, in `src/lib/motion.js`. Lenis is driven from
GSAP's ticker so the smoothed scroll position and everything that reads it
resolve in the same frame.

The loop has **two phases**, and this matters:

```js
onFrame((time, scrollY, moved) => {
  if (!moved) return          // skip still frames
  const rect = el.getBoundingClientRect()   // READ phase
  write(() => { el.style.setProperty('--x', rect.top) })  // WRITE phase
})
```

Read geometry in the callback, queue every DOM write through `write()`. If a
write lands between two reads the browser recalculates layout for the second
one, and with several effects running you get multiple full layouts a frame.

Everything animated has a `prefers-reduced-motion` fallback (15 files).

---

## Adding a page

1. Create `src/pages/YourPage.jsx` and a matching `.css`.
2. Register it in the `ROUTES` map in `src/App.jsx`.
3. Link to it with `<Link to="/your-page">`, never a bare `<a href>`.

`Link` handles internal navigation client-side, and automatically opens
external URLs (`http`, `mailto:`, `tel:`) in a new tab with
`rel="noopener noreferrer"`.

Any route not in `ROUTES` renders `NotFound`, which says the page is still
being built and shows the path requested. Links to pages that do not exist
yet still point at their real path (`/services/ai-agents`, `/work/klit`), so
they read as honest addresses instead of dumping people on the contact
section.

---

## Deployment

Vercel, static. See [DEPLOY.md](DEPLOY.md) for the rewrite and cache rules and
why `vercel.json` cannot contain comments.

The short version: the SPA rewrite is what stops `/contact` 404ing on a
refresh, and hashed assets are cached for a year while `index.html` is always
revalidated.

---

## Known gaps

- **Roughly 1MB of unused assets** sit in `src/assets/`. Only
  `kintsugi-people.jpg` is imported. The logo SVGs and icons were superseded
  when the mark was inlined as paths, and the backgrounds when the hero
  became a canvas. Vite does not bundle them, so they cost nothing at
  runtime, but they should be deleted.
- **The contact form has no backend.** It composes a message in the visitor's
  own mail client. Nothing is transmitted by the site.
- **`/sign-in` is a prototype, not authentication.** See the security section
  of [AGENTS.md](AGENTS.md) before touching it.
- **English only.** The client's live site is French, and a language switch
  would need `content.js` split per locale.
- **No tests.** Verification so far has been runtime measurement in a browser
  console; see AGENTS.md for the approach.
