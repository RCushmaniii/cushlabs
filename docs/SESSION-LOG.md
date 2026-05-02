# CushLabs.ai — Session Log & Tech Debt

> Living document for the cushlabs.ai marketing site.
> Captures shipped work, open technical debt, prioritized backlog, and recurring failure modes worth remembering.
> Newest session at the bottom of "Session History" section. Update at the end of every working session.

---

## Active Technical Debt

Things that shipped but have a known gap. These should be cleaned up before they compound.

| # | Item | Severity | Notes |
|---|------|----------|-------|
| 1 | `src/pages/es/privacy.astro` is the old generic policy | **High (legal)** | PR #74 rewrote `src/pages/privacy.astro` with full Messenger Assistant disclosures (data collection, retention windows, third-party processors: Meta, Anthropic, Cloudflare, Sentry; GDPR-style rights). Spanish version was never updated — still reflects "Última actualización: Febrero 2026". Mexican LFPDPPP compliance hinges on the Spanish disclosure since CushLabs serves Mexican customers via Facebook Messenger. |
| 2 | `BaseLayout.astro` canonical prop has a footgun | Medium | When a page passes an absolute URL to the `canonical` prop, `new URL(absolute, Astro.site)` short-circuits and the explicit URL wins — silently bypassing `Astro.site` config. Caused PR #80's "Non-canonical page in sitemap" Ahrefs errors when `/messenger-assistant/` shipped with `canonical="https://cushlabs.ai/..."` while sitemap used `https://www.cushlabs.ai/...`. Fix: in `BaseLayout.astro` strip protocol+host from any incoming `canonical` before joining with `Astro.site`. |
| 3 | No standalone Voice Agent service page on main site | Medium (revenue) | AI Voice Agent is a productized offering ($1,497 US / $10,997 MXN) with a live subdomain at voice.cushlabs.ai. cushlabs.ai has no `/voice-agent/` page to drive deep links, capture SEO, or convert prospects. |
| 4 | No HowTo schema | Low | Only outstanding "Known Issue" in CLAUDE.md. FAQPage schema is already implemented EN+ES. |
| 5 | SEO automation only wired for cushlabs.ai | Low | Per memory `project_seo_automation`: GSC/Bing/IndexNow scripts work for cushlabs.ai. voice.cushlabs.ai, soyconverso, and other CushLabs domains still need the same automation replicated. |

---

## Backlog (Prioritized)

Work that is planned but not yet started. Bundle related items into single PRs per CLAUDE.md guidance.

### High priority

- **ES privacy.astro Messenger-specific rewrite** — addresses tech-debt #1. Port PR #74's structure to Spanish: same sections, same disclosures, Spanish-native phrasing (not Google-translated). Update `lastUpdated` to current date.
- **Voice Agent service page** (`/voice-agent/` + `/es/voice-agent/`) — addresses tech-debt #3. Slim intro page covering: what it is, pricing ($1,497 / $10,997 MXN), 3 industries it fits, ROI vs receptionist, primary CTA → `voice.cushlabs.ai` for live demo, secondary CTA → `/consultation`. Source content: `docs/voice-cushlabs-ai-briefing.md`.

### Medium priority

- **`BaseLayout` canonical guardrail** — addresses tech-debt #2. One-line fix in `src/layouts/BaseLayout.astro:24-26`. Strip protocol+host from `canonical` prop before passing to `new URL(canonicalPath, Astro.site)` so absolute URLs can't bypass site config.
- **HowTo schema** — addresses tech-debt #4. Probably best-fit on `/messenger-assistant/` or `/voice-agent/` as "How to add an AI assistant to your business in 3 steps".

### Low priority

- **SEO automation replication for voice.cushlabs.ai** — addresses tech-debt #5. Port the GSC sitemap submission, Bing IndexNow script, and weekly cron from cushlabs.ai to the voice subdomain repo. Tracked in memory `project_seo_automation`.
- **Title pixel-width audit on `/data-deletion/` and new `/es/data-deletion/`** — currently both end in `| CushLabs.ai`. Worth checking against Ahrefs's pixel threshold while we're already in the title-tightening mindset.

---

## Recurring Failure Modes

Patterns that have bitten this project before. Re-read this section before shipping any change to the listed surfaces.

### 1. Bilingual parity drift on new pages

**What happened:** PR #74 shipped `/data-deletion/` (EN-only). `BaseLayout` auto-emits hreflang tags pointing at `/es/data-deletion/` — which 404'd. Ahrefs flagged 4 cascading errors on the next crawl ("Hreflang to redirect or broken page", "404 page", "4XX page", "Page links to broken page").

**Rule:** Every new EN page MUST ship with its ES counterpart in the same PR. No "I'll add the Spanish version later." The hreflang machinery in `BaseLayout` makes the gap immediately visible to crawlers.

### 2. Bare-domain canonical bypassing `Astro.site`

**What happened:** PR #74 also passed `canonical="https://cushlabs.ai/messenger-assistant/"` (bare domain) to `BaseLayout`. Astro's `new URL(absolute, base)` ignores `base` when `absolute` is already absolute → canonical resolved to `cushlabs.ai` while sitemap used `www.cushlabs.ai`. Ahrefs flagged "Non-canonical page in sitemap" on the next crawl.

**Rule:** Don't pass absolute URLs to `BaseLayout`'s `canonical` prop. Either omit it entirely (and let pathname-based default win) or pass a path-only string. See tech-debt #2 for the proposed permanent guardrail.

### 3. PORTFOLIO.md silent YAML corruption

Documented extensively in `CLAUDE.md` ("Recurring Failure: Silent YAML Corruption") and memory `feedback_portfolio_md_yaml_silent_corruption`. Summary: duplicate top-level YAML keys (most often `health_status:`) cause gray-matter to throw, the previous version of `tryLocalPortfolioMd()` silently caught it, and projects landed in `projects.generated.json` with `thumbnail: null`. Fix in place: `npm run validate:portfolio-md` runs before every sync and fails loudly. Don't relax that catch block.

### 4. Tailwind 4 utility name collision

Documented in CLAUDE.md ("Tailwind 4 Migration Gotchas") and memory `feedback_tailwind4_color_collision`. Custom `--color-base` defined in `@theme` silently overrode the built-in `text-base` font-size utility. Avoid color names matching `xs`, `sm`, `base`, `lg`, `xl`, `2xl`–`9xl`. Use `canvas`, `surface`, `page`, `app`.

---

## Session History

### 2026-04-27 — Ahrefs SEO recovery (PR #80)

**Trigger:** Ahrefs digest showed health score dropped 100 → 96 on the 25 April crawl. +4 errors, +2 warnings.

**Diagnosis:** Three independent regressions all introduced by PR #74 (the Messenger Assistant launch a few days prior):

1. `/data-deletion/` shipped EN-only → 4 cascading errors via BaseLayout's hreflang auto-emission to non-existent `/es/data-deletion/`.
2. `/messenger-assistant/` (EN+ES) had explicit bare-domain canonical (`cushlabs.ai`) that bypassed `Astro.site = www.cushlabs.ai` → +2 "Non-canonical page in sitemap".
3. Both messenger titles crossed Ahrefs's pixel-width threshold → +2 "Title too long".

**Fix shipped — PR #80** (squash-merged 2026-04-27, commit `9c2de0c`):

- Removed bare-domain canonical override from `src/pages/messenger-assistant.astro` and `src/pages/es/messenger-assistant.astro`. `BaseLayout` now resolves canonical from pathname against `Astro.site`.
- Created `src/pages/es/data-deletion.astro` — full Spanish translation matching the EN structure (Hero, "Qué Datos Conservamos", three deletion options, "Qué Haremos", "Qué No Podemos Eliminar", Contact).
- Added `/es/privacy/` → `/es/data-deletion/` link to `src/pages/es/privacy.astro` for parity with EN privacy page.
- Tightened titles: EN messenger 49ch → 37ch, ES messenger 51ch → 37ch.

**Verified post-build:**
- `dist/sitemap-0.xml` pairs `/data-deletion/` and `/es/data-deletion/` with proper `xhtml:link` hreflang entries.
- `messenger-assistant` canonical now matches sitemap loc (both `www.cushlabs.ai`).

**Verification automation:** One-shot remote agent scheduled for 2026-05-01 09:00 America/Mexico_City (trigger `trig_01P4s9QfqPVBPxrnVUJ4kdUZ`). Reads next Ahrefs digest from Gmail; falls back to live URL fetches if no fresh email arrives.

**Flagged but NOT addressed in this session** (now tracked in tech-debt #1): `src/pages/es/privacy.astro` is still the old generic policy — PR #74 only rewrote the EN version. Real legal/compliance gap.

**Cross-references:**
- PR #80: https://github.com/RCushmaniii/cushlabs/pull/80
- Memory: `project_ahrefs_100_milestone.md` (note: 100 health score originally hit 2026-03-31 in a single session; tracking the recovery to that level)
- Related docs: `docs/seo/HREFLANG-FIX-SUMMARY.md`, `docs/seo/SITEMAP-SEO-ANALYSIS.md`

---

## Cross-references to existing audit docs

This log complements (does not replace) the deeper audit and lessons-learned docs already in `docs/`:

- `docs/LESSONS-LEARNED.md` — broader project lessons
- `docs/SITE-AUDIT-2026-03-03.md` — earlier full-site audit
- `docs/seo/SEO-FIXES-2025-11-29.md` — earlier SEO fix log
- `docs/seo/SEO-TECHNICAL-CHECKLIST.md` — pre-deploy SEO checklist
- `docs/architecture/BILINGUAL-PARITY-CHECKLIST.md` — EN/ES sync rules
- `docs/voice-cushlabs-ai-briefing.md` — voice.cushlabs.ai product spec (driver for backlog item: Voice Agent service page)
