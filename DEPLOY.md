# Deployment notes

`vercel.json` is validated against a strict schema that rejects any key it
does not recognise, and JSON has no comment syntax, so the reasoning behind
each rule lives here instead. Do not add `"comment"` keys back to that file:
Vercel fails the deploy with *"should NOT have additional property comment"*.

## Rewrites

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

Routing is client side (`src/lib/router.jsx`). Without this, `/contact`,
`/method` and `/sign-in` work when you navigate to them in the app but 404 on
a refresh or a shared link, because no such file exists on disk.

Rewrites are evaluated **after** the filesystem check, so real files still win
and `/assets/*` is never rewritten. That is why this can safely be a catch-all
rather than trying to exclude asset paths with a lookahead.

## Cache headers

Three rules, first match wins:

| Path | Policy | Why |
| --- | --- | --- |
| `/assets/*` | `max-age=31536000, immutable` | Vite fingerprints these filenames, so the name changes whenever the contents do. A repeat visit, a reload and a scroll all reuse the copy on disk and hit the network for nothing. |
| `/simbol.svg`, `/favicon.svg` | `max-age=86400, stale-while-revalidate=604800` | Served from `public/` under fixed names, so they cannot be immutable. A day of freshness with a week of background revalidation keeps them instant without pinning an old file. |
| everything else | `max-age=0, must-revalidate` | Catches `index.html`, the one file that must always be revalidated. It points at the fingerprinted assets, so caching it would pin visitors to an old deploy. `must-revalidate` still allows a `304`: one small round trip, no download. |
