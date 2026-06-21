# Session Log — cushlabs

Entries are newest-first. Each entry documents one Claude Code working session.

---

## Session: 2026-06-21

### Accomplished

- Verified portfolio data layer is in sync (validated 64 sibling PORTFOLIO.md files, 0 corruption, 0 missing thumbnails); confirmed `generate-projects` produced only timestamp/byte-count churn — no real drift.
- Added `live_url: https://marketsignal.cushlabs.ai` to cushlabs-marketsignal PORTFOLIO.md (was empty → card had no Live button). Verified URL live (HTTP 200, public landing). Shipped via marketsignal PR #207 (squash-merged to main) + cushlabs PR #112 (regenerated `projects.generated.json`, merged).
- Recorded 9 deployment URLs into internal `all-repos-urls.csv`: 1 public promotion (MarketSignal) + 8 admin/stealth/infra URLs into a new `additionalUrls` column, each mapped to the correct repo via repo configs.
- Security: gitignored `all-repos-urls.csv` (held stealth/admin URLs, was one `git add` from leaking into the public portfolio repo).

### Decisions Made

- Only MarketSignal promoted to a public Live URL: the other 8 are admin panels (admin.cushlabs.ai, /admin paths), stealth deploys (connect/app.cushlabs.ai, admin.nyenglishteacher.com), or internal infra (vitals.cushlabs.ai). Publishing them would be a brand/security problem.
- Did NOT promote `ny-ai-chatbot.vercel.app/demo` — the project already has a better custom-domain Live URL; the raw vercel.app would be a downgrade.
- Logged to `docs/SESSION_LOG.md` (the actively maintained file) rather than the stale `docs/SESSION-LOG.md`.

### Immediate Next Steps

- [ ] Triage 7 open Dependabot alerts on cushlabs (2 high: astro SSRF, vite fs.deny bypass). Confirm static-site/dev-only scope and dismiss-or-bump per the established pattern in CLAUDE.md.
- [ ] Consolidate the two divergent session-log files (`SESSION_LOG.md` vs `SESSION-LOG.md`) — pick one, migrate, and align global + repo CLAUDE.md.

### Technical Debt

- Two session-log files coexist with conflicting conventions (underscore = active per global skill; hyphen = older rich tech-debt doc per repo CLAUDE.md). Needs a decision + merge.

### Open Questions / Blockers

- None.

---

## Session: 2026-06-20

### Accomplished

- Added `scripts/list-portfolio.mjs` — read-only tool that lists every portfolio project and its URLs (portfolio page / GitHub / demo / live / homepage) from the committed `projects.generated.json`, no GitHub API calls. Modes: default table (POSTED vs HIDDEN), `--csv`, `--json`.
- Refreshed `src/data/projects.generated.json` via `pnpm generate-projects` — now **38 projects** (was 34), 9 featured, 27 excluded by `portfolio_enabled: false`. Auto-filed sync issue #109 (1 data-quality warning).
- Documented the new tool in `CLAUDE.md` (Portfolio Pipeline → "Listing portfolio repos & their URLs") and gitignored the generated `portfolio-urls.{csv,json}`.
- Added `scripts/list-all-repos.mjs` — full GitHub inventory (all 65 repos via `gh repo list`, merged with portfolio data) grouped posted / hidden / not-listed, with all URLs. Modes: table / `--csv` / `--json`. Documented in CLAUDE.md ("Listing ALL repos & their URLs").

### Decisions Made

- Best programmatic source for "what's in the portfolio + URLs" is the local `projects.generated.json`, not the GitHub API — it carries the curated priority/URL metadata the API lacks.
- Three repo buckets clarified: POSTED (priority < 99), HIDDEN (synced but priority ≥ 99), EXCLUDED (`portfolio_enabled: false`, dropped before JSON — found via PORTFOLIO.md grep).

### Immediate Next Steps

- [ ] Optional: triage portfolio sync issue #109 (the 1 flagged data gap).
- [ ] Optional: flesh out thin detail pages (e.g. cushlabs-messenger: 1 screenshot, no solution/metrics).

### Technical Debt

- Two session-log files exist (`SESSION_LOG.md` active, `SESSION-LOG.md` stale 2026-05-04) — consider removing the hyphen one.

### Open Questions / Blockers

- None.

---

## Session: 2026-06-09

### Accomplished

- Replaced the retired standalone `cushlabs-demo-chat` worker with the **real product** as the homepage demo: a CushLabs-configured bot on the Converso SaaS (`soyconverso.com`) — grounded RAG, bilingual, CushLabs persona.
- **PR #103** — temporarily hid the old worker demo (inline section, floating widget, hero CTA) while the SaaS instance was built.
- **PR #104** — pointed the inline `ChatDemo` section + the floating widget at `https://www.soyconverso.com/embed/chat`; restored the hero "Try the Live Chatbot" CTA + "Live demo below" trust item; removed the widget's own close × (the SaaS chat renders its own — fixes the old overlap) in favor of a `close-chat` postMessage listener; CSP `frame-src` → soyconverso (dropped the retired worker domain).
- Deleted the orphaned `cushlabs-demo-chat` Cloudflare worker (removed its live endpoint + `ANTHROPIC_API_KEY` secret).
- Verified live (Playwright): widget renders + answers on `/` and `/es/`, UI language matches the page, zero Clerk/CSP console errors.

### Decisions Made

- Reused the existing homepage widget chrome (auto-open, position, mobile fullscreen) and just repointed the iframe URL, rather than swapping in the SaaS's own embed script.

### Immediate Next Steps

- [ ] Optional: give the SaaS `/embed` route its own minimal layout to silence benign font-preload console warnings (low ROI; only matters for a pristine screen-recorded demo).

### Technical Debt

- None new. The retired worker's source (`workers/demo-chat.js`, `wrangler-demo-chat.toml`) is left in the repo for history — harmless, no longer deployed.

### Open Questions / Blockers

- None.

---

## Session: 2026-05-18

### Accomplished

- PR #99 merged: Tailwind v4 cleanup — 4× `shadow-sm` → `shadow-xs` (restores v3 visual intent; in v4 shadow-sm is one tier larger), 18× `focus:outline-none` → `focus:outline-hidden` across 6 files (all paired with `focus:ring-*`; `outline-hidden` is safe in forced-colors/high-contrast mode). Also resolved 4 Dependabot CVEs via `npm audit fix` (2× high `fast-uri ≤3.1.1`, 1× high `devalue 5.6.3–5.8.0`, 1× low `astro <6.1.10`, 1× moderate `brace-expansion 5.0.2–5.0.5`) — 0 vulnerabilities on main.
- PR #100 merged: HowTo schema.org JSON-LD added to all 4 service pages (`/messenger-assistant/`, `/voice-agent/`, and ES equivalents). 3-step onboarding flow with `estimatedCost` in USD (EN) and MXN (ES). Enables Google rich results (numbered steps in SERP).

### Decisions Made

- `outline-hidden` over `outline-none` for all form inputs: preserves outline in Windows High Contrast / forced-colors mode where `focus:ring-*` may be invisible.
- HowTo schema on all 4 pages (not just one): bilingual parity rule; also doubles the schema surface area for rich results across two service types.
- MXN pricing in ES HowTo schema: matched existing pricing strategy (8,497 MXN messenger / 10,997 MXN voice) — not USD converted.

### Immediate Next Steps

- [ ] Validate HowTo rich results in Google Rich Results Test for `/messenger-assistant/` and `/voice-agent/` post-deploy.
- [ ] Run Ahrefs crawl to confirm 0 errors remain after recent PR chain.
- [ ] Triage 2 high-severity Dependabot alerts on `marketsignal` repo (26 total flagged — separate repo, not cushlabs).

### Technical Debt

- None new. Tailwind v4 semantic debt (shadow-sm, outline-none) fully resolved.

### Open Questions / Blockers

- None.

---

## Session: 2026-05-12

### Accomplished

- Replicated SEO submission pattern across all 3 sibling repos in a single session (PRs merged: voice #28, ny-eng #170, marketsignal #174). All 4 CushLabs GSC properties now actively submit sitemaps via the shared `seo-automation-489217` service account.
- **voice.cushlabs.ai**: Net-new `scripts/seo/` (gsc-client, gsc-submit-urls, indexnow-submit) + new IndexNow key `485cbb85cc48b5ade1af60d3d2227032`. Live GSC submission verified pre-merge (0 errors). IndexNow verification pending Render auto-deploy of key file.
- **ny-eng (nyenglishteacher.com)**: Migrated existing `gsc-client.mjs` from file-on-disk (`gsc-credentials.json`) to env-decode (`GOOGLE_SA_KEY_BASE64`). One-file change; all 9 sibling scripts (gsc-submit-urls, gsc-page-queries, gsc-performance, gsc-index-status, bing-\*, indexnow-submit, etc.) work transparently. Live submission verified (0 errors). Robert's `feat/past-tenses-bonus-1-cheat-sheet` WIP stashed/restored — non-destructive.
- **marketsignal.cushlabs.ai**: Additive — left existing OAuth-based `submit-index.ts` (IndexNow + Bing + Indexing API) untouched, added parallel `gsc-client.ts` + `gsc-submit-sitemap.ts` for canonical sitemap submission. `pnpm seo:gsc` new; `pnpm seo:submit` updated to chain both. Live submission verified (0 errors).
- Deleted `cushlabs-seo` GCP project (shut down, scheduled for deletion 2026-06-11) — was redundant after pivoting to legacy `seo-automation-489217`.

### Decisions Made

- **One repo at a time, separate PRs:** explicit safety constraint per Robert's "make sure you're not doing any damage" instinct. Each PR independently revertible; would have caught any single-repo regression without affecting the others.
- **ny-eng: Path A (migrate) over Path B (leave alone):** single-file gsc-client change with transparent downstream effect on 9 sibling scripts. Removes credential file from working tree, matches cushlabs/voice convention.
- **marketsignal: additive over replacement:** existing `submit-index.ts` does IndexNow + Bing well; the only gap was sitemap submission. Added that as parallel path without touching existing functionality.
- **Reused shared SA across all 4 properties:** no new GCP projects, no new "Add User" attempts in GSC (which had triggered the "email not found" bug yesterday). Same `GOOGLE_SA_KEY_BASE64` value in all 4 repos' `.env.local` — single point of truth.
- **TypeScript for marketsignal scripts, .mjs for voice/ny-eng/cushlabs:** matched each repo's existing convention (marketsignal is .ts-heavy via tsx; others are .mjs).

### Immediate Next Steps

- [ ] Verify voice.cushlabs.ai IndexNow submission once Render finishes the auto-deploy (key file at `/485cbb85cc48b5ade1af60d3d2227032.txt` must be reachable before Bing accepts submissions). Wakeup scheduled.
- [ ] Wire `pnpm seo:submit` into a post-deploy hook on each repo's deployment platform (Vercel/Render) for hands-free ongoing submission.
- [ ] Optional cleanup: remove the OAuth-based Google Indexing API path from marketsignal's `submit-index.ts` (it returns 403 for all non-JobPosting URLs; the new GSC sitemap path makes it redundant).
- [ ] Run Ahrefs crawl across all 4 properties to baseline post-submission state.

### Technical Debt

- voice.cushlabs.ai IndexNow verification pending production deploy (key file 404 at last check).
- marketsignal has 26 Dependabot alerts (14 high, 8 moderate, 4 low) flagged on push — separate from this work, needs triage.
- cushlabs still has 2 high-severity Dependabot alerts (carried over from prior sessions).

### Open Questions / Blockers

- None.

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
