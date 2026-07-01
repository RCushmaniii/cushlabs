# Session Log — cushlabs

> Living document for cushlabs.ai — shipped work, open technical debt, prioritized backlog, recurring failure modes. Session entries are newest-first under "Session History."
> Consolidated 2026-06-21: this file absorbed the former `docs/SESSION-LOG.md` rich tech-debt doc (now deleted). `SESSION_LOG.md` is the single source of truth — the `/session-logger` skill writes here.

---

## Active Technical Debt

Things that shipped with a known gap. Open items first; key resolved items kept for the trail.

| #     | Item                                                                    | Severity   | Notes                                                                                                                                                                                                               |
| ----- | ----------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | EN privacy "Your Rights" lacks Mexican-specific framing                 | Low        | ES privacy names LFPDPPP / derechos ARCO (PR #86); EN still says generic "depending on your location." Fine for a global EN audience, but worth a lawyer review if English-speaking Mexican residents are expected. |
| 2     | `js-yaml` (via `gray-matter`) flagged by `npm audit` (moderate)         | Low        | Build-time only; parses trusted PORTFOLIO.md files. Not a Dependabot alert. Revisit if gray-matter ships a patched js-yaml.                                                                                         |
| 3     | Legacy `src/components/home/` folder is dead but retained               | Low        | Live pages use `home2/`. The old `home/Hero.astro` still carries a stale "20+ Years IT Experience" string (never rendered). Remove the folder or update it if ever revived.                                         |
| ~~—~~ | ~~ES privacy generic policy~~                                           | ~~High~~   | Resolved — PR #86 (2026-05-02).                                                                                                                                                                                     |
| ~~—~~ | ~~No standalone Voice Agent page~~                                      | ~~Medium~~ | Resolved — PR #85 (2026-05-02).                                                                                                                                                                                     |
| ~~—~~ | ~~`BaseLayout` canonical footgun (absolute URL bypasses `Astro.site`)~~ | ~~Medium~~ | Resolved — PR #93 (2026-05-10) strips protocol+host before `new URL(p, Astro.site)`.                                                                                                                                |
| ~~—~~ | ~~No HowTo schema~~                                                     | ~~Low~~    | Resolved — PR #100 (2026-05-18) added HowTo JSON-LD to all 4 service pages (EN/ES).                                                                                                                                 |
| ~~—~~ | ~~SEO automation only wired for cushlabs.ai~~                           | ~~Low~~    | Resolved — 2026-05-12 replicated GSC/IndexNow to voice, ny-eng, marketsignal (PRs #28/#170/#174).                                                                                                                   |
| ~~—~~ | ~~Two divergent session-log files~~                                     | ~~Medium~~ | Resolved — 2026-06-21 merged `SESSION-LOG.md` into this file and deleted the hyphen copy.                                                                                                                           |

---

## Backlog (Prioritized)

Planned but not started. Bundle related items into single PRs per CLAUDE.md.

### High priority

_(none open)_

### Medium priority

_(none open — canonical guardrail and HowTo schema both shipped)_

### Low priority

- **Triage portfolio sync issue #109** — 1 data-quality warning from the 2026-06-20 `generate-projects` run.
- **Flesh out thin project detail pages** — e.g. cushlabs-messenger (1 screenshot, no solution/metrics).
- **Title pixel-width audit** on `/data-deletion/` and `/es/data-deletion/` (both end in `| CushLabs.ai`) against Ahrefs's pixel threshold.
- **Remove the dead `src/components/home/` folder** (tech-debt #3) once confirmed nothing imports it.

---

## Roadmap

Directional ideas with a longer horizon than the Backlog. Themes, not tickets — promote to Backlog once scope is concrete.

### Product expansion

- **WhatsApp Business as a third channel** — Messenger Assistant tech is reusable. Many Mexican SMBs live on WhatsApp first, Facebook second. Spec a WhatsApp variant to broaden TAM without rebuilding the AI core. Validate demand via 2–3 prospects first.
- **Outbound voice product** — currently disclaimed on the voice page. Productize if a real prospect asks; until then keep it custom-quoted.
- **Multi-page / franchise Messenger setups** — disclaimed on `/messenger-assistant/` ("scoped separately"). Productize once a real client justifies it.
- **AI Customer Support Chatbot dedicated page** — exists as a `/services` block (`support-assistants`) but has no standalone landing like `/messenger-assistant/` or `/voice-agent/`. Could be the third standalone product page once content is ready.

### Distribution & growth

- **Bilingual SEO automation as a productized offering** — the GSC/Bing/IndexNow weekly cron + structured-data audit pattern is itself a consultable service for bilingual local businesses.
- **Insurance-vertical landing page** — per memory `project_outreach_pipeline`, insurance is the active beachhead. A vertical landing page (insurance copy + pricing + case studies) would compound outbound.

### Internal tooling

- **Pre-deploy SEO audit script: extend to FAQ/HowTo schema validation** — currently catches title/description/trailing-slash issues; schema validation closes the structured-data loop.
- **Automated Ahrefs digest parser** — generalize the one-off post-SEO-PR verification into a parser that extracts errors/warnings from any Ahrefs digest and posts a structured summary.

### Compliance & legal

- **EN privacy LFPDPPP framing review** (tech-debt #1) — lawyer review on whether EN should mirror the Mexican-specific framing.
- **Terms of Service freshness audit** — `terms.astro` / `es/terms.astro` haven't been touched since the Messenger Assistant launched; audit the same way privacy was.

---

## Recurring Failure Modes

Patterns that have bitten this project before. Re-read before shipping any change to the listed surfaces.

### 1. Bilingual parity drift on new pages

**What happened:** PR #74 shipped `/data-deletion/` (EN-only). `BaseLayout` auto-emits hreflang pointing at `/es/data-deletion/` — which 404'd. Ahrefs flagged 4 cascading errors.

**Rule:** Every new EN page MUST ship with its ES counterpart in the same PR. No "I'll add Spanish later." The hreflang machinery makes the gap immediately visible to crawlers.

### 2. Bare-domain canonical bypassing `Astro.site`

**What happened:** PR #74 passed `canonical="https://cushlabs.ai/..."` (bare domain); Astro's `new URL(absolute, base)` ignores `base` when the URL is already absolute → canonical resolved to `cushlabs.ai` while sitemap used `www.cushlabs.ai`. Ahrefs flagged "Non-canonical page in sitemap."

**Rule:** Don't pass absolute URLs to `BaseLayout`'s `canonical` prop. A permanent guardrail shipped in PR #93 (2026-05-10) strips protocol+host, but prefer omitting `canonical` or passing a path-only string.

### 3. PORTFOLIO.md silent YAML corruption

Documented in `CLAUDE.md` and memory `feedback_portfolio_md_yaml_silent_corruption`. Duplicate top-level YAML keys (often `health_status:`) make gray-matter throw; a silent catch landed projects with `thumbnail: null`. Fix in place: `npm run validate:portfolio-md` runs before every sync and fails loudly. Don't relax that catch block.

### 4. Tailwind 4 utility name collision

Documented in CLAUDE.md and memory `feedback_tailwind4_color_collision`. Custom `--color-base` in `@theme` silently overrode the built-in `text-base` font-size utility. Avoid color names matching `xs`, `sm`, `base`, `lg`, `xl`, `2xl`–`9xl`. Use `canvas`, `surface`, `page`, `app`.

---

## Session History

## Session: 2026-06-30 — MX-first pricing pivot: 3-tier model reconciled site-wide + live

### Accomplished

- **Shipped the bilingual pricing page** (`/pricing`, `/es/precios`) — PR #142. New reusable `src/components/pricing/PricingSection.astro` is the single source of truth for the 3-tier chart; added `routePairs` entry (`/pricing` ↔ `/precios`) to both `src/i18n/index.ts` and `astro.config.mjs`, plus a "Pricing/Precios" nav link in `Header.astro`.
- **Reconciled the ENTIRE site to the locked 3-tier MXN model** — Basic $1,990 / Premium $3,490 / Ultra $5,490 MXN/mo. Retired all legacy US pricing ($997 bundle, $1,497 voice) and stale MXN figures ($8,497/$10,997/$3,500) across `ScenarioQualifier`, `ServiceBlock`, `home2/FAQ`, `services2/FAQ`, both `messenger-assistant` pages, both `voice-agent` pages (body copy + schema `estimatedCost` → MXN). Voice specs corrected: 500 min/$0.50 → 300 answered min/$8.50 MXN/min.
- **Reused `PricingSection` on the services page** (new `headingTag="h2"` prop) instead of maintaining a duplicate chart — zero drift going forward. Deleted dead `services2/InvestmentOverview.astro` and `home/ServicesOverview.astro` (verified zero code imports first).
- **Retired orphaned "Growth Bundle" naming** in Footer + FAQ; footer service links now point at the new `/pricing` (`/es/precios`) page and surface the product name "Recepción Digital."
- Build clean, meta-description gate PASS (108 pages, 120–160 chars), all CI checks green. Squash-merged to `main` → production deploying.

### Decisions Made

- **Option B (all-in MX, both languages, retire US pricing now):** the wrong price had been live too long; reconcile everything in one pass rather than stage EN/ES separately.
- **Single source of truth for pricing:** services page embeds `PricingSection` rather than a parallel component — eliminates the exact drift that caused this multi-price mess.

### Immediate Next Steps

- [ ] Visually verify production `/pricing` and `/es/precios` render the 3-tier chart correctly once the deploy lands.

### Technical Debt

- `home/ServicesOverview.astro` removed, but the rest of the dead `src/components/home/` folder (e.g. `Hero.astro` with the stale tenure string) still lingers — see tech-debt #3 / backlog line 43.

### Open Questions / Blockers

- None.

---

## Session: 2026-06-29 — Portfolio reconciliation: added AI WebScraper + fixed dashboard status drift

### Accomplished

- Reconciled the "43 live vs 35 posted" gap Robert flagged from the OS-dashboard Links tab. Cross-checked the 10 live-but-excluded repos: 9 are correctly `portfolio_enabled: false` (profile README, internal/infra, archived, private client/course tools); only `ai-webscraper` was a genuine add candidate.
- **Added `ai-webscraper` to the portfolio** (priority 18, AI-tools cluster) — PRs `ai-webscraper#67` + `cushlabs#137`. Posted count 35 → 36. Generated two 16:9 WebP assets (crawl-config screen + GPT-4 analysis report) from existing `.github/assets` captures via `sharp`, uploaded to R2 (verified HTTP 200 on cdn.cushlabs.ai). GitHub-only, no live demo.
- **Cleared a dead-demo footgun:** `ai-webscraper`'s GitHub homepage pointed at `ai-webscraper-tan.vercel.app` (404). The detail page's `demoUrl ?? homepage` fallback would have rendered a dead "Live Demo" button. Cleared the GitHub homepage via `gh repo edit`; build confirms 0 dead demo links.
- **Fixed the dashboard "not-listed" mislabel** (`cushlabs-OS-dashboard#32`): `links.json` is hand-curated and not generated from `projects.generated.json`, so status drifts. Cross-checked all 65 entries — `cushlabs-investment-model` and `ai-webscraper` were both drifted. Set `status: posted` + real `portfolioPage`; cleared ai-webscraper's dead `liveUrl`. Surgical 5-line diff, typecheck passes, zero remaining drift.
- Gitignored `src/data/.projects.snapshot.json` (sync-portfolio diff artifact) so it stops appearing as untracked.

### Decisions Made

- ai-webscraper listed GitHub-only (no live demo): containerized FastAPI/Celery/Redis/Supabase stack; a public crawl endpoint would need a rate limiter + paid always-on backend to avoid OpenAI cost drain. Not worth it for a portfolio piece — screenshot showcase matches other infra-heavy entries.
- Priority 18 (not the PORTFOLIO.md's stale `3`): 3 would rank it among flagship work (voice-agent, messenger); mid-pack is honest for a no-live-demo piece.
- "43 live vs 36 posted" is not a bug — "live" counts all deployed repos (superset); "posted" is portfolio-only. Expected to differ.

### Immediate Next Steps

- [ ] Eyeball the new card live after deploy: https://www.cushlabs.ai/projects/ai-webscraper/
- [ ] (Optional) Build a CI guard in `cushlabs-OS-dashboard` that fails when `links.json` status drifts from `projects.generated.json` — prevents the mislabel from recurring. Needs a fetch of the committed cushlabs JSON in CI.
- [ ] Dependency pass: review `cushlabs#76` (TypeScript 5.9→6.0, major) and `ai-webscraper#75` (FastAPI 0.104→0.138) before merging; other open Dependabot PRs are routine.

### Technical Debt

- `links.json` in `cushlabs-OS-dashboard` is hand-curated against the portfolio's real source of truth — drifts silently. Mitigated by this session's cross-check, but no automated guard yet (see Next Steps).

### Open Questions / Blockers

- None.

---

## Session: 2026-06-21 — Homepage chat rework + portfolio audit & full depth sweep

### Accomplished

- **Homepage chat (PR #116/#117/#118):** after several iterations, replaced the in-page chat iframe (which fought page scroll) with a single floating assistant shown on every page incl. home; the "Try It Right Now" section + hero CTA open it via `[data-open-chat]`. Also fixed the hero scroll chevron skipping/overshooting the demo and removed a duplicate "Try the Live Chatbot" arrow. Browser-verified (Playwright): opening the chat moves the page 0px.
- **Portfolio search bypasses the category filter (PR #122, EN/ES)** — searching now looks across all projects, not just the active filter's subset.
- **Portfolio audit + full depth sweep, all 34 posted projects (PR #119/#120/#123/#124 + ~20 sibling repos):** surfaced Solution + Results copy from each repo's PORTFOLIO.md body into frontmatter, added descriptive bilingual (en/es-MX) slide alt. Coverage: empty Solution 19→1, empty Results 19→2, generic alt 11→1. Done via parallel subagents, validated centrally.
- **9 featured** curated for the asymmetrical grid (added AI Writing System via `portfolio-order.json`).
- **cushlabs-sticker-gen:** un-featured + de-prioritized (priority 20), fixed broken images (uploaded 5 assets to R2 — the upload step had never run for this repo), rewrote Challenge/Solution/tagline in a fun, human voice.
- **eslint:** added `scripts/**` override allowing `console` — cleared 16 `no-console` warnings in CLI scripts.
- **Dependabot:** dismissed esbuild, js-yaml, @babel/core as tolerable_risk (all build/dev-only, not in deployed runtime).

### Decisions Made

- One floating chat surface everywhere instead of an embedded in-page iframe — a `position: fixed` overlay can't hijack scroll, ending that whole bug class.
- Featured/priority is curated in `src/data/portfolio-order.json` (overrides PORTFOLIO.md) — the real source of truth for the grid order.
- Sibling PORTFOLIO.md commits use a precise pathspec (not `git add -u`) to avoid sweeping unrelated WIP.
- Left production CSP intact (declined to weaken for a browser extension); reframed experience as "AI-native / Enterprise IT roots" to avoid IT-ageism + a 30-vs-20-year inconsistency.

### Immediate Next Steps

- [ ] Robert: add ny-english-messenger-bot video + real screenshots → then I run R2 upload + regen (featured, currently no slides; copy already surfaced).
- [ ] Robert: set biojalisco-species-id `live_url`/`demo_url` (branded) + add Sentry → then regen.

### Technical Debt

- ny-english-messenger-bot: featured but no slides until screenshots added (being handled).
- biojalisco-species-id: no Sentry (required by standard) + raw `*.vercel.app` URLs (being handled).
- cushlabs self-entry + scrollytelling: empty solution/metrics in JSON — intentional (override / no source). Not page defects.

### Open Questions / Blockers

- None.

---

## Session: 2026-06-21 — UX/SEO audit fixes (PR #114)

### Accomplished

- Shipped PR #114 (squash-merged to main): a multi-part reconciliation from an external Anthropic UX/SEO audit of the live site.
- Homepage copy: benefit-framed hero headline (replaced the "2 AM" clever inversion); project count made consistent at "30+" (killed the 50+ vs 34 collision); pricing aligned to the subscription model (removed stale fixed-price/milestone/refund copy on hero badge, `Guarantee.astro`, About); testimonial reframed — dropped "I'm Pre-Testimonial", now leads with Julio's real LinkedIn rec.
- Bug: chat-demo iframe (`ChatDemo.astro`) was auto-scrolling the page past the hero on load (embed autofocuses its input). Fixed by deferring the iframe `src` via IntersectionObserver.
- i18n: Spanish project cards rendered English everywhere (generated JSON has no ES fields). Added centralized es-MX map `src/data/projectCardsEs.ts`, wired into `/es/portfolio` grid + "Proyectos Relacionados" rail + detail H1 (English fallback).
- Spanish quality: retranslated slangy "¿Hacemos Buen Equipo?" (`WhoItIsFor.astro`) to clean es-MX; brought the compressed Chatbot ES block (`ServiceBlock.astro`) to full EN/ES parity. Standardized discovery call on 30 min (FAQ EN/ES + booking label).
- SEO: `/sitemap.xml` → `/sitemap-index.xml` 301; Organization JSON-LD upgraded to also be a `ProfessionalService` with Guadalajara `PostalAddress`/telephone/priceRange.
- Brand: retired the bare tenure number ("30 yrs" / "20+ years") everywhere → "AI-native / Enterprise IT roots" + career-arc framing (EN/ES). Saved as standing memory preference `feedback_experience_framing_no_tenure_count`.

### Decisions Made

- Left the production CSP intact — declined to weaken `script-src` for the Anthropic browser extension's in-page script probe. Crawlers read static HTML and all audited data (hreflang, meta, schema, alt) was verified already present. Pointed the extension at the local CSP-free dev server (`localhost:4321`) instead.
- Reframed experience as depth + AI-currency rather than a year count (Option A) to neutralize IT-ageism subtext and resolve the 30-vs-20 inconsistency in one move.
- Tabled the audit's proposed ROI estimator — Robert isn't convinced clients would interact with sliders.

### Immediate Next Steps

- [ ] ROI "What's This Costing You?" estimator — tabled; full spec (conservative formula + defaults) is in the PR #114 thread if revisited.
- [x] Consolidated the two divergent session-log files into this one (`SESSION-LOG.md` deleted) and dismissed the esbuild Dependabot alert (#22, `tolerable_risk`). Done 2026-06-21.

### Technical Debt

- `src/components/home/Hero.astro` (legacy, unused — live pages use `home2/`) still carries a "20+ Years IT Experience" string. Harmless (never rendered) but should be removed or updated if that folder is ever revived.

### Open Questions / Blockers

- None.

---

## Session: 2026-06-21

### Accomplished

- Verified portfolio data layer is in sync (validated 64 sibling PORTFOLIO.md files, 0 corruption, 0 missing thumbnails); confirmed `generate-projects` produced only timestamp/byte-count churn — no real drift.
- Added `live_url: https://marketsignal.cushlabs.ai` to cushlabs-marketsignal PORTFOLIO.md (was empty → card had no Live button). Verified URL live (HTTP 200, public landing). Shipped via marketsignal PR #207 (squash-merged to main) + cushlabs PR #112 (regenerated `projects.generated.json`, merged).
- Recorded 9 deployment URLs into internal `all-repos-urls.csv`: 1 public promotion (MarketSignal) + 8 admin/stealth/infra URLs into a new `additionalUrls` column, each mapped to the correct repo via repo configs.
- Security: gitignored `all-repos-urls.csv` (held stealth/admin URLs, was one `git add` from leaking into the public portfolio repo); later deduped the entry into the listings block (`549e875`).
- Patched 6 of 7 Dependabot alerts (both HIGH) via PR #113: astro ^6.1.8→^6.4.8 (SSRF + XSS), plus `overrides` for vite ^7.3.5 (fs.deny + NTLM), qs ^6.15.2 (DoS), @opentelemetry/core ^2.8.0 (baggage). Verified: build 103 pages + SEO gate, 20/20 smoke tests, `npm audit` high 1→0.

### Decisions Made

- Only MarketSignal promoted to a public Live URL: the other 8 are admin panels (admin.cushlabs.ai, /admin paths), stealth deploys (connect/app.cushlabs.ai, admin.nyenglishteacher.com), or internal infra (vitals.cushlabs.ai). Publishing them would be a brand/security problem.
- Did NOT promote `ny-ai-chatbot.vercel.app/demo` — the project already has a better custom-domain Live URL; the raw vercel.app would be a downgrade.
- Logged to `docs/SESSION_LOG.md` (the actively maintained file) rather than the stale `docs/SESSION-LOG.md`.
- Left esbuild at 0.27.7 (low, dev-only): its 0.28.1 fix is outside vite 7.3.5's `esbuild: ^0.27.0` peer range, so forcing it would break the build for a non-deployed issue. Should be dismissed in GitHub as "won't fix — dev-only."

### Immediate Next Steps

- [ ] Dismiss the lone remaining esbuild Dependabot alert (low, dev-only) in GitHub — can't be done via CLI with current perms.
- [ ] Consolidate the two divergent session-log files (`SESSION_LOG.md` vs `SESSION-LOG.md`) — pick one, migrate, and align global + repo CLAUDE.md.

### Technical Debt

- Two session-log files coexist with conflicting conventions (underscore = active per global skill; hyphen = older rich tech-debt doc per repo CLAUDE.md). Needs a decision + merge.
- `js-yaml` (via `gray-matter`) flagged by `npm audit` (moderate) but not Dependabot — build-time only, parses trusted PORTFOLIO.md files. Low risk; revisit if gray-matter ships a patched js-yaml.

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

## Session: 2026-05-02 — Voice Agent page + ES privacy rewrite (PRs #84, #85, #86)

**Trigger:** Synthesis session after PR #80 — captured what shipped, what's outstanding, then knocked out the two high-priority items in sequence.

**Three PRs shipped to main:**

1. **PR #84** (squash-merged 2026-05-02) — the original `docs/SESSION-LOG.md` introduced as a living document. Also moved `docs/voice-cushlabs-ai-briefing.md` from untracked into the repo as the source spec for the Voice Agent page.
2. **PR #85** (squash-merged 2026-05-02, commit `e815cbc`) — `/voice-agent/` and `/es/voice-agent/` standalone landing pages, mirroring `/messenger-assistant/`. Hero with live-demo badge → voice.cushlabs.ai; problem/solution; 5 demo agents named (Clara, James, Sophia, Mike, David); pricing card ($1,497 / $10,997 MXN); ROI table vs receptionist. Adds `learnMoreUrl` to the voice-agent block in `ServiceBlock.astro`. Canonicals resolve to `www.cushlabs.ai`.
3. **PR #86** (squash-merged 2026-05-02, commit `eb02e3f`) — `src/pages/es/privacy.astro` rewritten with full Messenger Assistant disclosures matching the EN structure. KV retention windows (1h/1h/30min) named; third-party processors named; **Tus Derechos** surfaces Mexican LFPDPPP / derechos ARCO.

**Resolved:** tech-debt #1 (ES privacy parity) and #3 (no standalone Voice Agent page). **New tech-debt:** #6 — EN privacy lacks Mexican-specific framing.

**Cross-references:** PRs [#84](https://github.com/RCushmaniii/cushlabs/pull/84) · [#85](https://github.com/RCushmaniii/cushlabs/pull/85) · [#86](https://github.com/RCushmaniii/cushlabs/pull/86)

---

## Session: 2026-04-27 — Ahrefs SEO recovery (PR #80)

**Trigger:** Ahrefs digest showed health score dropped 100 → 96 on the 25 April crawl. +4 errors, +2 warnings.

**Diagnosis:** Three regressions all from PR #74 (Messenger Assistant launch): (1) `/data-deletion/` shipped EN-only → 4 cascading hreflang errors; (2) `/messenger-assistant/` bare-domain canonical bypassed `Astro.site` → +2 "Non-canonical page in sitemap"; (3) both messenger titles crossed Ahrefs's pixel-width threshold → +2 "Title too long".

**Fix — PR #80** (squash-merged 2026-04-27, commit `9c2de0c`): removed bare-domain canonical overrides; created `src/pages/es/data-deletion.astro`; added `/es/privacy/` → `/es/data-deletion/` link; tightened messenger titles to 37ch. Verified post-build: sitemap pairs `/data-deletion/` EN/ES with hreflang; canonicals match sitemap loc.

**Flagged (→ became tech-debt #1):** `es/privacy.astro` was still the old generic policy — a real legal/compliance gap (later fixed in PR #86).

**Cross-references:** [PR #80](https://github.com/RCushmaniii/cushlabs/pull/80) · memory `project_ahrefs_100_milestone` · `docs/seo/HREFLANG-FIX-SUMMARY.md`, `docs/seo/SITEMAP-SEO-ANALYSIS.md`

---

## Cross-references to existing audit docs

This log complements (does not replace) the deeper audit docs in `docs/`:

- `docs/LESSONS-LEARNED.md` — broader project lessons
- `docs/SITE-AUDIT-2026-03-03.md` — earlier full-site audit
- `docs/seo/SEO-FIXES-2025-11-29.md` — earlier SEO fix log
- `docs/seo/SEO-TECHNICAL-CHECKLIST.md` — pre-deploy SEO checklist
- `docs/architecture/BILINGUAL-PARITY-CHECKLIST.md` — EN/ES sync rules
- `docs/voice-cushlabs-ai-briefing.md` — voice.cushlabs.ai product spec
