# Product

Claro Digital Services SARL ("Clarodigi") — an AI and development agency in Tangier, Morocco.
This repository is the agency's own marketing site.

## Platform

web

## Stack

React 19, Vite 8, plain CSS (one file per component, no framework). Hand-rolled router in
`src/lib/router.jsx`. Lenis smooth scroll and GSAP share a single rAF frame bus in
`src/lib/motion.js`. Linting by oxlint. Deployed on Vercel. No test suite.

**There is no backend.** No API, no database, no auth, no environment variables. The contact
form composes a `mailto:` in the visitor's own mail client; `/sign-in` is a non-functional
front-end prototype.

## Users

Business decision-makers in Morocco and the francophone market: founders, marketing leads and
operations leads evaluating an agency to build or rebuild something they will run on for years.
They arrive from search, referral and social.

**Most of them are on a phone.** The client has stated this directly and it outranks desktop
polish in every trade-off. The reading scene is a phone held one-handed, often in the evening,
often on a mid-range Android on a Moroccan mobile network.

They read English or French, and the live client site is French-first.

## Product Purpose

Convince a company that Claro is the agency that will still be a good decision in three years,
and get them to start a conversation. The site sells judgment and follow-through, not features.

## Positioning

Against cheap template shops on one side and large consultancies on the other: senior work,
direct contact with the developers, and delivery discipline. The proof is the record, not
adjectives.

## Operating Context

Bilingual EN/FR, switchable at runtime, persisted per visitor. Routes are locale-independent.
The site is small: six built routes plus a deliberate "still being built" page for everything
that does not exist yet.

## Capabilities and Constraints

- No backend of any kind. Nothing can be verified, stored or transmitted server-side.
- Every string is in `src/content/{en,fr}.js` and must exist in both files with identical shape.
- Paths, slugs and form field names never change with language.
- 23 links resolve to `NotFound` on purpose: six case studies, fifteen service pages, two legal
  pages. They point at their real future paths and must not be rerouted to the contact section.
- `vercel.json` uses a strict schema; unknown keys fail the deploy.

## Brand Commitments

- The wordmark is real vector artwork, generated into `src/components/logo-paths.js` from
  `design/logo.svg` and `public/simbol.svg`. Regenerate it; never hand-edit it.
- Crimson `#e3355d`, wine `#7d1d33`, plum `#a82947`, ink `#42101c` on black. Crimson leads.
- No em dashes in any user-facing copy. Stated explicitly by the client.
- No uppercase-plus-wide-tracking labels.
- No site-wide custom cursor. Removed deliberately once already.
- Flat fills on cards, not smooth gradient washes. The client rejected those by name as "AI
  slop". Heavily grained gradient FIELDS are a different material and are approved for the
  2026 redesign; a smooth CSS gradient on a card is still refused.

## Evidence on Hand

Real, verified, reusable as proof. Nothing here may be inflated or invented:

- 70+ engagements delivered; 4.8/5 average satisfaction; 12+ cities in Morocco; founded 2022.
- No delay has gone unreported. This is the delivery claim the agency stakes itself on.
- Named clients: KLIT (Casablanca), Overto (Tangier), Perfect Drive (Rabat), Startup Olympus
  (Rabat), Kintsugi People (Casablanca).
- Case studies: Pastaleena, R7 Immo, Santos, Kintsugi People, Overto, KLIT.
- One real testimonial: Asmaa Niang, founder of Kintsugi People.
- One real client screenshot: kintsugi-people.com.
- Six sectors served, each with three concrete deliverables.
- Contact: contact@clarodigi.com, +212 715-659-190, Boulevard Mohammed V, Tanger 90000.

**There is no team roster.** The site has never named an individual besides the testimonial
author, and inventing colleagues on a real company's site is out of bounds.

## Product Principles

- Diagnosis before design. The brief is where projects are won or lost.
- Built to be handed over: readable, documented, no lock-in.
- AI where it earns its place, not as a label on the invoice.
- Say it early. If something slips, the client hears it the day we know.

## Accessibility & Inclusion

Both languages ship with localized `aria-label`s and a correct `<html lang>`. Every animation
needs a `prefers-reduced-motion` fallback. Touch targets meet 44px on coarse pointers. The
sign-in prototype carries a visible notice telling people not to enter a real password, and
that notice may not be removed while there is no backend.

## Open Decisions

- `/work`, `/insights` and `/legal/*` are unbuilt and out of scope for the current pass.
- Footer says "Legal Notice" where the menu says "Terms of Service". Both 404.
