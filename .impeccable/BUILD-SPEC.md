# Claro 2026 — build spec

Read this before touching anything. Every agent working on this redesign builds
against this one vocabulary. Deviating "because it looked better here" is how a
redesign turns into eleven redesigns.

## The world

Black, always. There is no light section anywhere on this site any more. The old
deck alternated dark chapters with off-white ones; it does not now. `.panel--light`
still exists because `usePanelStack` and the nav's palette probe read it, but it
resolves to the same ground as everything else. Never reintroduce a light surface.

Reference: Framer "State of Sites '26". Pure black, huge display serif, grainy
saturated gradient fields bleeding off hairline-bordered near-black cards, pill
buttons, generous black space. Adapted to Claro's crimson family rather than
Framer's blue/green/orange.

## Type

- `var(--font-display)` = Bodoni Moda, 400, one weight. Headlines, big numbers,
  pull quotes. Nothing else.
- `var(--font-sans)` = Inter Tight, 400/500. All body, UI, nav, labels, forms.
- Scale: `--fs-display`, `--fs-title`, `--fs-sub`, `--fs-stat`, `--fs-lede`,
  `--fs-body`, `--fs-label`. **Use these.** The audit found 60 of 95 font-size
  declarations bypassing the scale; do not add to that.
- `.section-title` is the display face already. `.sub-title` is the smaller one.
- Display type needs optical indent correction: `margin-inline-start: -0.055em`.
- **Bodoni draws `+`, `/`, `%` and `-` as near-hairlines.** At stat size in
  crimson on black they disappear. Any suffix or symbol attached to a number goes
  in the SANS at ~0.44em, weight 500, raised with `vertical-align`. See
  `.hero__stat dt span` in Hero.css for the pattern. This is not optional; it
  shipped as a visible bug once already.

## Colour

Family, warm to cool through magenta. Nothing crosses to blue or green.

`--ember #ff5a1f` · `--crimson #e3355d` · `--magenta #c62a8a` ·
`--violet #6d2ea8` · `--plum #a82947` · `--wine #7d1d33` · `--ink #42101c`

Text: `--fg` (white), `--fg-2` (body, 8.1:1 on black), `--fg-3` (3.7:1 — LARGE
TEXT ONLY, never under 24px). Lines: `--line`, `--line-2`.
Surfaces: `--surface`, `--surface-2`.

Use the tokens. The audit found 41 rgba() re-spellings of colours that already
have tokens and 13 off-system hex values. Do not add more.

## The field — the one material

```html
<span class="field" data-hue="ember" aria-hidden="true" />
```

Put it as the first child of a `.card`. Hues: `ember`, `crimson`, `magenta`,
`violet`, `wine`. Aim it with `--fx` / `--fy` (first stop) and `--fx2` / `--fy2`
(second) in a scoped rule; default is upper right.

Rules:
- **Never `filter: blur()`.** A large blurred layer is the one thing that will
  drop a mid-range phone below 60fps. The softness is in the gradient stops.
- The grain is not decoration on the gradient, it IS the material. A smooth
  gradient with no grain is the wash the client rejected by name as "AI slop".
- Give adjacent cards different hues, walking the family in order rather than
  at random, so a row reads as one spectrum.

## Containers

`.card` — `--surface` fill, 1px `--line` border, `--r-card` radius, `overflow:
hidden`. Corner language is `--r-card` / `--r-inner` / `--r-pill`. Nothing
invents its own radius.

Buttons keep `.btn` / `.btn--primary` / `.btn--ghost`. Pills, never rectangles.

## Motion

- **Default state is VISIBLE.** Anything that hides content for an entrance is
  gated behind `html.js`. This site has already shipped a bug where a failed
  observer left whole sections permanently invisible.
- `.reveal` = copy settling: 14px, 0.55s, staggered by `--i`. Small and quick.
- `.field` = the authored entrance: blooms from `scale(1.08)` + opacity 0.
- **Never redeclare `transition` on an element that also carries `.reveal`.**
  The shorthand replaces the reveal's own transition and its stagger, and the
  entrance silently dies. The audit caught this on `.shot`, `.about__item` and
  `.method__phase`. Use `transition-property` additively or scope to a child.
- Every animation needs a `prefers-reduced-motion` fallback.

## Mobile first

Design the 390px case first; the desktop is the enhancement. Lower clamp bounds
are the real design. Breakpoints in use: 400, 560, 680, 1100. Do not invent new
ones. Tap targets 44px on `(pointer: coarse)`, via an out-of-flow pseudo-element
so it costs no layout.

## Banned

- **Eyebrows / kickers above headings.** Deleted site-wide. The heading carries
  its own weight. `.eyebrow` no longer exists; do not reintroduce it. If a mark
  is genuinely needed inline, `.mark-inline` exists.
- Gradient text. Emphasis is weight or size.
- Uppercase plus wide letter-spacing labels.
- Em dashes in user-facing copy. Client instruction.
- Smooth gradient washes on cards without grain.
- Nested cards.
- Any new colour outside the family.

## Copy

Never hardcode user-facing text. It lives in `src/content/en.js` and `fr.js`,
read via `useContent()`. Both files must keep identical shape — same keys, same
array lengths. If you need a new string, add it to BOTH. Never invent a claim:
the numbers are 70+, 4.8/5, 12+ cities, since 2022, no unreported delay.

Paths and slugs never change with language.

## Reference implementation

`src/components/Hero.jsx` + `src/components/Hero.css` are built and verified.
Read them before starting. They show the field at page scale, the display type
with its indent correction, the sans-suffix pattern, the mask that stops a field
cutting hard at a panel edge, and the pointer light done with two custom
properties and a CSS transition instead of a frame loop.

## Verify before you finish

`npm run lint` and `npm run build` must both pass. You cannot open a browser;
measure by reading the CSS and the built output.
