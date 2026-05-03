# CushLabs.ai — Session Log & Tech Debt

> Living document for the cushlabs.ai marketing site.
> Captures shipped work, open technical debt, prioritized backlog, and recurring failure modes worth remembering.
> Newest session at the bottom of "Session History" section. Update at the end of every working session.

---

## Active Technical Debt

Things that shipped but have a known gap. These should be cleaned up before they compound.

| # | Item | Severity | Notes |
|---|------|----------|-------|
| ~~1~~ | ~~`src/pages/es/privacy.astro` generic policy~~ | ~~High~~ | **Resolved by PR #86 (2026-05-02)** — Spanish privacy now mirrors EN with full Messenger disclosures, plus Mexican LFPDPPP / derechos ARCO framing. |
| ~~3~~ | ~~No standalone Voice Agent service page~~ | ~~Medium~~ | **Resolved by PR #85 (2026-05-02)** — `/voice-agent/` and `/es/voice-agent/` shipped, linking to voice.cushlabs.ai for live demo and `/services` deep-linking via `learnMoreUrl`. |
| 2 | `BaseLayout.astro` canonical prop has a footgun | Medium | When a page passes an absolute URL to the `canonical` prop, `new URL(absolute, Astro.site)` short-circuits and the explicit URL wins — silently bypassing `Astro.site` config. Caused PR #80's "Non-canonical page in sitemap" Ahrefs errors when `/messenger-assistant/` shipped with `canonical="https://cushlabs.ai/..."` while sitemap used `https://www.cushlabs.ai/...`. Fix: in `BaseLayout.astro` strip protocol+host from any incoming `canonical` before joining with `Astro.site`. |
| 4 | No HowTo schema | Low | Only outstanding "Known Issue" in CLAUDE.md. FAQPage schema is already implemented EN+ES. |
| 5 | SEO automation only wired for cushlabs.ai | Low | Per memory `project_seo_automation`: GSC/Bing/IndexNow scripts work for cushlabs.ai. voice.cushlabs.ai, soyconverso, and other CushLabs domains still need the same automation replicated. |
| 6 | EN privacy "Your Rights" lacks Mexican-specific framing | Low | After PR #86, the ES privacy explicitly names LFPDPPP / derechos ARCO; EN still says generic "depending on your location." Probably fine — EN serves a global audience — but worth a lawyer review if any English-speaking Mexican residents are expected. |

---

## Backlog (Prioritized)

Work that is planned but not yet started. Bundle related items into single PRs per CLAUDE.md guidance.

### High priority

_(no high-priority items currently open — both prior items shipped 2026-05-02 via PR #85 and PR #86)_

### Medium priority

- **`BaseLayout` canonical guardrail** — addresses tech-debt #2. One-line fix in `src/layouts/BaseLayout.astro:24-26`. Strip protocol+host from `canonical` prop before passing to `new URL(canonicalPath, Astro.site)` so absolute URLs can't bypass site config.
- **HowTo schema** — addresses tech-debt #4. Probably best-fit on `/messenger-assistant/` or `/voice-agent/` as "How to add an AI assistant to your business in 3 steps".

### Low priority

- **SEO automation replication for voice.cushlabs.ai** — addresses tech-debt #5. Port the GSC sitemap submission, Bing IndexNow script, and weekly cron from cushlabs.ai to the voice subdomain repo. Tracked in memory `project_seo_automation`.
- **Title pixel-width audit on `/data-deletion/` and new `/es/data-deletion/`** — currently both end in `| CushLabs.ai`. Worth checking against Ahrefs's pixel threshold while we're already in the title-tightening mindset.

---

## Roadmap

Directional ideas with a longer horizon than the Backlog. Themes, not tickets — Backlog items are sized work; Roadmap items are "what could this become" before the spec exists. Promote a Roadmap entry to Backlog once the scope is concrete.

### Product expansion

- **WhatsApp Business as a third channel** — Messenger Assistant tech is reusable. Many Mexican SMBs live on WhatsApp first, Facebook second. Spec'ing a WhatsApp variant would broaden TAM without rebuilding the AI core. Validate demand via 2–3 prospects before committing.
- **Outbound voice product** — currently disclaimed on the voice page ("Outbound calling campaigns — available as a separate engagement"). If a real prospect asks for it, productize it. Until then, keep it custom-quoted.
- **Multi-page / franchise Messenger setups** — disclaimed on `/messenger-assistant/` ("scoped separately"). Same logic: productize once a real client justifies it.
- **AI Customer Support Chatbot dedicated page** — already exists as a service block on `/services` (`support-assistants` ID) but no standalone landing like `/messenger-assistant/` or `/voice-agent/`. Could be the third standalone product page once content is ready.

### Distribution & growth

- **Bilingual SEO automation as a productized offering** — the GSC/Bing/IndexNow weekly cron + structured-data audit pattern that lives on cushlabs.ai is itself a consultable service. Sell to bilingual local businesses ("we'll set up the same SEO discipline that ranks our own site").
- **Insurance-vertical landing page** — per memory `project_outreach_pipeline`, insurance is the active beachhead. A vertical-specific landing page with insurance copy + pricing + case studies would compound outbound efforts.

### Internal tooling

- **Pre-deploy SEO audit script: extend to FAQ schema and HowTo schema validation** — the script currently catches title/description/trailing-slash issues. Adding schema validation closes the loop on the structured-data side.
- **Automated Ahrefs digest parser** — the verification routine that fires after big SEO PRs (e.g., trigger `trig_01P4s9QfqPVBPxrnVUJ4kdUZ`) is currently one-off. A general parser that extracts errors/warnings from any Ahrefs digest email and posts a structured summary would standardize SEO regression detection.

### Compliance & legal

- **EN privacy LFPDPPP framing review** — tracked as tech-debt #6. The ES privacy explicitly names LFPDPPP / derechos ARCO; EN says generic "depending on your location." A lawyer review could clarify whether the EN should mirror the Mexican-specific framing for English-speaking Mexican residents.
- **Terms of Service freshness audit** — `src/pages/terms.astro` and `src/pages/es/terms.astro` exist but haven't been touched since the Messenger Assistant launched. Should be audited the same way privacy was: do the terms reflect actual product behavior?

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

### 2026-05-02 — Voice Agent page + ES privacy rewrite (PRs #84, #85, #86)

**Trigger:** Synthesis session after PR #80 — captured what shipped, what's outstanding, then knocked out the two high-priority items in sequence.

**Three PRs shipped to main:**

1. **PR #84** (squash-merged 2026-05-02) — `docs/SESSION-LOG.md` introduced as living document for the cushlabs.ai marketing site. Tracks accomplishments, active tech debt, prioritized backlog, recurring failure modes. Also moved `docs/voice-cushlabs-ai-briefing.md` (Robert wrote 2026-04-13) from untracked into the repo as the source spec for the Voice Agent service page.

2. **PR #85** (squash-merged 2026-05-02, commit `e815cbc`) — `/voice-agent/` and `/es/voice-agent/` standalone landing pages. Mirrors `/messenger-assistant/` pattern. Hero with live-demo badge → voice.cushlabs.ai; problem section ("cost of a missed call"); solution narrative; "Hear it for yourself" callout naming the 5 demo agents (Clara, James, Sophia, Mike, David); pricing card ($1,497 / $10,997 MXN, 500 min, dual CTAs); ROI table vs receptionist; FinalCTA. Adds `learnMoreUrl` to the voice-agent block in `ServiceBlock.astro` so `/services` deep-links to the new standalone page (matching messenger-assistant wiring). Sitemap pairs EN/ES with proper hreflang. Canonicals resolve to `www.cushlabs.ai` — no PR #74-style bare-domain regression.

3. **PR #86** (squash-merged 2026-05-02, commit `eb02e3f`) — `src/pages/es/privacy.astro` rewritten with full Messenger Assistant disclosures matching PR #74's EN structure. Section parity (Información General, Información que Recopilamos, Cómo Usamos Tu Información, Retención de Datos, Procesadores Externos, Tus Derechos, Eliminación de Datos, Seguridad de Datos, Cookies, Privacidad de Menores, Cambios a Esta Política, Contáctanos). Cloudflare Workers KV retention windows (1h/1h/30min) named explicitly. Third-party processors (Meta, Anthropic, Cloudflare, Sentry) named with their roles. **Tus Derechos** surfaces Mexican LFPDPPP / derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) — Spanish-native localization of the EN's generic "depending on your location" wording. lastUpdated bumped to mayo de 2026.

**What this resolved:**
- Tech-debt #1 (ES privacy parity / legal exposure) → done
- Tech-debt #3 (no standalone Voice Agent page) → done

**New tech-debt added:**
- #6 — EN privacy "Your Rights" lacks Mexican-specific framing. Probably fine for a global EN audience but flagged for awareness.

**Cross-references:**
- PR #84: https://github.com/RCushmaniii/cushlabs/pull/84
- PR #85: https://github.com/RCushmaniii/cushlabs/pull/85
- PR #86: https://github.com/RCushmaniii/cushlabs/pull/86

---

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
