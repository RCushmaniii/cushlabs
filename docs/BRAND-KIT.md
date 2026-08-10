# Brand Kit — moved

**The CushLabs brand kit is not maintained in this repo.** It lives in `operating-system`, which is
the canonical source and the one the OS dashboard renders.

| What you want                                                                 | Where it is                               |
| ----------------------------------------------------------------------------- | ----------------------------------------- |
| Colour, type, voice, naming, claims, Spanish, per-surface application         | `operating-system/cushlabs/brand-kit.md`  |
| The mark itself — story, specs, minimum sizes, clear space, do/don't, roadmap | `operating-system/cushlabs/brand-mark.md` |
| Master files — SVG (true vector), PNG, mono black/white, on-light/on-dark     | `operating-system/cushlabs/assets/`       |

Local paths:

- `file:///C:/Users/Robert%20Cushman/Projects/operating-system/cushlabs/brand-kit.md`
- `file:///C:/Users/Robert%20Cushman/Projects/operating-system/cushlabs/brand-mark.md`

## Why this is a pointer and not a copy

This repo carried a full duplicate of the kit for a few hours on 2026-08-10. Two copies of one
document is a drift generator, and this repo already has a rule about exactly that shape of problem —
see the capability-registry note at the top of [`CLAUDE.md`](../CLAUDE.md). A brand kit fails the same
way an approval status does: the copy someone reads goes stale, and nobody notices until it has
already produced wrong work.

**Do not restore a copy here. Add to the canonical files instead.**

## What this repo still owns

The kit describes the mark. This repo owns the _implementation_ of it on cushlabs.ai, which is a
separate concern and stays here:

- Deployed assets under `public/images/logo/`, `public/favicon*`, `public/apple-touch-icon.png`,
  `public/icon-512.png`, and `public/images/og/`
- The light/dark swap wiring in `src/components/Header.astro`, `src/components/Footer.astro`, and
  `src/layouts/LandingLayout.astro`
- The icon `<link>` tags and their `?v=N` cache-busting query in `src/layouts/BaseLayout.astro` and
  `src/layouts/LandingLayout.astro`
- `docs/email-signature.html`

**Before replacing any logo asset here, read "Shipping the mark to a web surface" in
`brand-mark.md`.** It holds the three deployment rules — new art means a new filename, favicons use
`?v=N`, and the `og:image` stays PNG — each learned by breaking this site.
