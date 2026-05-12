# Session Log — cushlabs

Entries are newest-first. Each entry documents one Claude Code working session.

---

## Session: 2026-05-11

### Accomplished
- Restored GSC submission pipeline end-to-end (PR #96 merged d6629d0). New `scripts/seo/gsc-client.mjs` reads service-account JSON via `GOOGLE_SA_KEY_BASE64` env var (base64) instead of file-on-disk. New `scripts/seo/gsc-submit-urls.mjs` (restored from 65939dd) wired to `npm run seo:gsc` / `seo:gsc:url` / `seo:submit`.
- Resolved the "Add user — email not found" blocker by reusing the legacy `seo-api-access@seo-automation-489217.iam.gserviceaccount.com` (still in user's GCP, already Owner on 4 GSC properties). Generated fresh JSON key from that SA, encoded → `.env.local`, deleted JSON.
- **First successful GSC sitemap submission since the d865f97 deletion**: `https://www.cushlabs.ai/sitemap-index.xml` submitted, 0 errors, last-submitted timestamp recorded in GSC.
- Discovered the SA already has `siteOwner` permission on 3 additional sibling properties: `voice.cushlabs.ai`, `nyenglishteacher.com`, `marketsignal.cushlabs.ai` — replication to those domains is now a script copy + SITE_URL swap, no new GCP/GSC setup.

### Decisions Made
- **Reuse the legacy SA over the freshly-created one in `cushlabs-seo` project:** legacy SA already had Owner on `sc-domain:cushlabs.ai` (no propagation/GSC-bug risk); the new `cushlabs-seo` SA was failing the "Add user" lookup repeatedly (likely a real GSC frontend bug, not pure propagation per another assistant's diagnosis). The `cushlabs-seo` SA + GCP project can be deleted later as cleanup.
- **PowerShell-side base64 encoding with no stdout echo:** `[Convert]::ToBase64String([IO.File]::ReadAllBytes(...))` reads bytes via .NET, pipes through `Add-Content` / `Set-Content` directly to `.env.local`. The base64 value never streams through chat or shell stdout. JSON file deleted immediately after.

### Immediate Next Steps
- [ ] Replicate `scripts/seo/gsc-client.mjs` + `gsc-submit-urls.mjs` into `voice.cushlabs.ai`, `nyenglishteacher.com`, `marketsignal.cushlabs.ai` repos (same SA, swap SITE_URL/SITE_PROPERTY).
- [ ] Re-run Ahrefs crawl now that sitemap is freshly submitted to GSC + IndexNow; confirm error count dropped to 0 from yesterday's 4.
- [ ] Triage the still-outstanding 2 high-severity Dependabot alerts on default branch.
- [ ] Delete the unused `cushlabs-seo` GCP project + service account (cleanup; not blocking anything).

### Technical Debt
- 2 high-severity Dependabot alerts on default branch (still outstanding from yesterday).
- Indexing API `--all` mode in `gsc-submit-urls.mjs` will return errors for non-JobPosting/BroadcastEvent URLs — that's a Google API restriction, not a bug. Sitemap submission (`--sitemap`, the default) is the correct primary path.

### Open Questions / Blockers
- None.

---

## Session: 2026-05-10

### Accomplished
- PR #92 merged: defaulted site theme to `light` (removed time-of-day logic in `ThemeScript.astro`); fixed 3 reported Tailwind v4 warnings (`bg-gradient-to-b` → `bg-linear-to-b`, `focus:z-[9999]` → `focus:z-9999`, `flex-shrink-0` → `shrink-0`); swept 35 files for the same legacy v3 patterns (17× `flex-shrink-*`, 17× `bg-gradient-*`, 2× arbitrary `-z-[5]`).
- PR #93 merged: Dependabot fix via `package.json` overrides (`fast-xml-parser ≥5.7.0`, `yaml ≥2.8.3`); `npm audit fix` cleared incidental postcss XSS; canonical guardrail added to `BaseLayout.astro` (strips protocol+host before `new URL(p, Astro.site)`, closes recurring failure mode #2 from PR #80).
- SEO: tightened 7 over-length titles/descriptions on `/services/` (EN+ES) and `/voice-agent/` (EN+ES); added `ny-english-messenger-bot` to `metaTitles` overrides on `[slug].astro` (EN+ES). Replaced `&` with comma in services title to avoid `&amp;` (5ch) pushing rendered length past 60.
- Fixed regex bug in `scripts/audit-predeploy.ts`: alternation `["']` was truncating descriptions at apostrophes (e.g. "Driver's License"); switched to backreference `(["'])(.*?)\1`.

### Decisions Made
- Deferred `shadow-sm` → `shadow-xs` migration (83 occurrences, 43 files): semantic shift, every shadow gets one tier larger; needs side-by-side visual review before flipping.
- Deferred `outline-none` migration (18 occurrences, 6 files): in v4 it actually removes outlines (was no-op in v3); accessibility risk for keyboard users, needs per-case decision (`outline-hidden` vs `focus-visible:ring-*`).
- Discarded `projects.generated.json` from both PR commits per CLAUDE.md "stage explicitly" rule — it regenerates on every build with timestamp drift.

### Immediate Next Steps
- [ ] `shadow-sm` → `shadow-xs` migration with side-by-side visual review (83 sites).
- [ ] `outline-none` accessibility audit per-case across 6 files.
- [ ] HowTo schema on `/messenger-assistant/` or `/voice-agent/` ("How to add an AI assistant in 3 steps") — Low-priority tech debt #4.
- [ ] Port GSC/IndexNow scripts to voice.cushlabs.ai repo.

### Technical Debt
- `shadow-sm` semantic drift not yet addressed (deferred from PR #92).
- `outline-none` accessibility risk not yet addressed (deferred from PR #92).
- HowTo schema still missing site-wide.

### Open Questions / Blockers
- None.

---

## Session: 2026-05-09

### Accomplished
- Diagnosed Ahrefs audit cascade: 4 errors / 11 warnings / 74 notices traced to a single root cause — 4 `noindex` Messenger OAuth callback pages (`/messenger-assistant/{connect,connected}/` EN+ES) leaking into `sitemap-index.xml`.
- Shipped fix on `fix/ahrefs-noindex-sitemap-cascade` (PR #95): sitemap filter excludes the 4 OAuth routes; `robots.txt` adds explicit `Disallow` rules; duplicate H1 on `connected.astro` (EN+ES) demoted to H2; meta descriptions on `connect.astro` (EN+ES) extended from ~115 chars to 153 EN / 151 ES (Ahrefs 150–160 sweet spot).
- Verified post-build: 94 sitemap URLs (was 99 — dropped 4 noindex + 1 internal), zero `connect`/`connected` paths in sitemap, single H1 per page, predeploy audit passes.

### Decisions Made
- **Belt-and-suspenders robots.txt + sitemap filter:** even though sitemap exclusion alone would resolve the hard error, added explicit `Disallow:` so crawlers don't waste budget and the cascade notices clear faster.
- **Demote H1 → H2 on connected error state:** simpler than refactoring to a single dynamic H1; both states render in static HTML even though only one is visible at runtime.
- **Did not include `projects.generated.json`** in PR — it regenerates on every build and would sweep unrelated portfolio diff into an SEO-only PR.
- **GSC service-account auth via base64 env var, not JSON file on disk:** existing project convention is dotenv for all secrets (Brevo, Cloudflare, etc.). Storing the service-account JSON as `GOOGLE_SA_KEY_BASE64` in `.env.local` mirrors that pattern and avoids credential files in the repo. Single-var base64 chosen over multiple separate fields to sidestep the `private_key` newline-escaping footgun.
- **Decision on previous GSC tooling (deleted in d865f97):** the deletion rationale "IndexNow handles passive Bing notification" was incorrect — IndexNow requires active POST submission. Replaced with new `scripts/seo/indexnow-submit.mjs` (committed 0c4a433); GSC submitter to be restored once fresh service-account credentials are provisioned.

### Immediate Next Steps
- [x] Merge PR #95 and confirm Vercel production deploy. (merged adae75d, prod sitemap verified at 92 URLs, zero noindex paths)
- [x] Submit URLs to IndexNow (Bing/Yandex/Seznam/Naver). (202 Accepted for 92 URLs)
- [ ] Provision fresh GCP service account `seo-api-access@cushlabs-seo.iam.gserviceaccount.com`, add as Owner on GSC `sc-domain:cushlabs.ai`, base64-encode JSON key into `.env.local` as `GOOGLE_SA_KEY_BASE64`. (Steps documented in session transcript 2026-05-10.)
- [ ] Restore `scripts/seo/gsc-client.mjs` + `gsc-submit-urls.mjs` from commit 65939dd, swap file-read for env-decode, wire `npm run seo:gsc` into package.json.
- [ ] Trigger fresh Ahrefs crawl post-deploy and confirm error count drops from 4 to 0.
- [ ] Triage 2 high-severity Dependabot alerts on default branch (surfaced during this session's pushes).

### Technical Debt
- 2 new high-severity Dependabot alerts surfaced on push (default branch). Need triage — could be follow-up to the recent CVE sweep in PR #93.
- Pre-existing lint errors in Header/Footer/RecentWork/portfolio (`anchor-is-valid`, `no-noninteractive-element-interactions`) unrelated to this PR.

### Open Questions / Blockers
- None.

---

