# CushLabs Bilingual Blog — Hybrid Content Architecture (Proposal)

**Status:** Decisions locked 2026-07-07 (see §8) — Phase-1 MVP build in progress.
**Created:** 2026-07-07

> **Decisions locked (2026-07-07):** Primary goal = **sales enablement + repurposing** (SEO is a bonus). Primary track = **Spanish/MX first** (EN lighter). Cadence = **aggressive, 1–2 posts/week** — held to a hard per-piece quality bar because posts are client-facing (AI does research/outline/draft/translation; a real CushLabs result or opinion goes in every post). Author = **Robert Cushman, named** (Person schema). Defaults accepted: `/blog/` + `/es/blog/` with Spanish slugs, pure Markdown for v1, add Bing + RSS.
> **Reference implementation:** `C:\Users\Robert Cushman\Projects\ny-eng\docs\BLOG-SYSTEM-PLAYBOOK.md` (the NY English blog — the proven system we port from)
> **Governs:** a re-introduced blog on cushlabs.ai (the blog was removed pre-launch for "no content strategy" — this doc _is_ the strategy).

---

## TL;DR

Port the NY English blog engine, but change **one assumption**: NY English translates and promotes **every** post 1:1. CushLabs runs a **hybrid** — two mostly-independent language tracks (each written natively for its market) **plus** periodic authoritative **cornerstone** articles that _are_ fully bilingual.

**The good news:** NY English's architecture already tolerates asymmetry. Its per-post `customHreflangs` pattern conditionally includes the other language (`...(spanishSlug ? [...] : [])`) — so a single-language post already emits self-referencing hreflang instead of a broken pointer. The "everything translated" rule there is a _content discipline_, not a hard technical constraint. **So the hybrid needs small, specific deltas — not a new engine.**

**The trap to avoid:** cushlabs' _current_ site enforces a strict Bilingual Parity Rule ("fix BOTH or NOTHING") with auto-hreflang that assumes every EN page has an ES twin. Point a single-language blog post at that machinery and you recreate the site's own documented Recurring Failure Mode #1 (EN-only page → hreflang 404 → Ahrefs errors). The blog needs an **explicit carve-out** and the NY English `customHreflangs` approach.

---

## 1. Current state — what cushlabs has vs. what ny-eng has

Three structural differences change the port. None are blockers; all must be handled deliberately.

| Concern                 | ny-eng (the playbook)                       | cushlabs (today)                                                                                                                      | Impact on port                                                                                                                                                                              |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EN URL prefix**       | `/en/blog/` (EN **is** prefixed)            | `prefixDefaultLocale: false` → EN is **unprefixed**                                                                                   | Blog routes are `/blog/<slug>/` (EN) and `/es/blog/<slug>/` (ES). Rewrite ny-eng's `/en/blog/*` routes accordingly. **Biggest mechanical delta.**                                           |
| **Trailing slash**      | `"ignore"`                                  | `"always"`                                                                                                                            | Every canonical/hreflang/sitemap URL must end in `/`. Matches cushlabs' existing gate — reuse it.                                                                                           |
| **Tailwind**            | 3.4 + `@tailwindcss/typography` (JS config) | **Tailwind 4** (`@tailwindcss/vite`, CSS-first `@theme`)                                                                              | `@tailwindcss/typography` works with T4 but is wired via CSS, not `tailwind.config`. Prose theme overrides move into `global.css`. See the T4 migration reference before touching `@theme`. |
| **Content collections** | full `blog` collection                      | **none exist yet**                                                                                                                    | Build the collection from scratch (clean — no legacy to migrate).                                                                                                                           |
| **SEO automation**      | GSC + Bing + IndexNow                       | **GSC + IndexNow present** (`scripts/seo/`: `gsc-client`, `gsc-submit-urls`, `indexnow-submit`, `check-indexing-issues`), **no Bing** | Reuse GSC/IndexNow, add `bing-submit.mjs`. ~60% already built.                                                                                                                              |
| **Build gate**          | blog-SEO + meta-desc + sitemap gates        | **meta-description-gate present**                                                                                                     | Extend the existing gate; add the blog-frontmatter gate.                                                                                                                                    |
| **MDX / RSS / React**   | present                                     | **absent** (only `gray-matter`)                                                                                                       | Add `@astrojs/rss` (and `@astrojs/mdx` only if we want in-post components). React island optional.                                                                                          |

**Net:** roughly **60–70% is reuse/adapt** from the playbook; the genuinely new work is the hybrid content model (below) plus the EN-unprefixed routing rewrite.

---

## 2. The hybrid content model — three post "modes"

The whole hybrid reduces to one new first-class concept: **every post declares its language mode.** And it maps _cleanly_ onto ny-eng's existing folder structure with near-zero engine change:

| Mode                          | Lives in                                         | `translations` frontmatter                | Appears on       | hreflang emitted                                                 |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| **ES-only** (primary track)   | `src/content/blog/es/<slug>.md`                  | _(none)_                                  | `/es/blog/` only | self only (`es-MX`), **no** cross-language alt, x-default → self |
| **EN-only** (secondary track) | `src/content/blog/en/<slug>.md`                  | _(none)_                                  | `/blog/` only    | self only (`en-US`), **no** cross-language alt, x-default → self |
| **Cornerstone** (bilingual)   | a file in **both** `en/` and `es/`, cross-linked | `translations.es` / `translations.en` set | **both** indexes | full `en-US` ↔ `es-MX` pair + x-default → EN                     |

**Why this is elegant:** ny-eng already filters each index by `p.id.startsWith("en/")` / `"es/"`. A cornerstone has one file in each folder; a single-language post has one file total. So the index filtering, pagination, and detail routing **work unchanged** — a post's mode is simply _whether its translation twin exists_. The `translations` frontmatter (already in the schema) becomes the switch.

---

## 3. Reuse / Adapt / Build-new (mapped to the playbook's 8 layers)

| Playbook layer                              | Verdict           | Notes                                                                                                                                                                                                                        |
| ------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Config & settings** (`config.ts`)      | ✅ Reuse          | Add `blogSetting.postsPerPage`. Put NAP here (fix ny-eng's split-brain per its §14).                                                                                                                                         |
| **2. i18n routing map** (`i18n.ts`)         | 🔧 Adapt          | cushlabs already has `src/i18n/`. Add blog `TKey`s. Keep `getHreflangCode` → `en-US`/`es-MX`. **Rework for unprefixed EN.**                                                                                                  |
| **3. Content schema** (`content.config.ts`) | ✅ Reuse + extend | Port the schema verbatim; add a `langMode`-deriving helper (or just derive from `translations` presence). Keep `faq[]`/`serviceArea[]` conditional JSON-LD.                                                                  |
| **4. JSON-LD** (`components/seo/*`)         | ✅ Reuse          | Swap ny-eng's `ProfessionalService`/author (English-coach) for CushLabs' `Organization`/`ProfessionalService` (already on the marketing site) + author = Robert. Article + Breadcrumb + conditional FAQ/Service.             |
| **5. Base layout**                          | 🔧 Adapt          | cushlabs has `BaseLayout.astro` with **rigid** auto-hreflang. Add a blog path that accepts `customCanonical` + `customHreflangs` (ny-eng's pattern) and **bypasses** the parity assumption. **This is the core code delta.** |
| **6. Blog routes**                          | 🔧 Adapt          | Three files, but at `/blog/` (EN, unprefixed) and `/es/blog/`. Port `[...page].astro` + `[slug].astro` logic; conditional hreflang built from `translations`.                                                                |
| **7. Blog UI**                              | ✅ Reuse          | Cards, filter bar, related, prev/next, share bar — restyle to cush-orange/Space Grotesk. Skip TTS/flip-cards (English-teaching features, not needed).                                                                        |
| **8. Sitemap + automation**                 | 🔧 Adapt          | Extend cushlabs' existing `sitemap()` serialize; **derive blog translation pairs from the collection** (fix ny-eng's hand-maintained-map debt, its §14.1). Add Bing script.                                                  |

---

## 4. The four hybrid-specific deltas (the parts that need real thought)

### 4a. Per-post language mode

Derive it, don't hand-maintain it: `mode = translations?.es || translations?.en ? "bilingual" : "single"`. No new frontmatter field strictly required — presence of a reciprocal `translations` entry _is_ the mode. (Optional explicit `langMode` enum for clarity/validation.)

### 4b. Conditional hreflang (the correctness crux)

- **Single-language post:** emit **only** its own hreflang (`en-US` _or_ `es-MX`) as self-referencing, `x-default` → self. Do **not** emit the other language. Do **not** add it to any bilingual sitemap pair. This is the exact opposite of the site's default behavior — hence the carve-out.
- **Cornerstone:** full `en-US` ↔ `es-MX` + `x-default` → EN, both directions reciprocal (validated).
- A build validator should assert: if post A claims `translations.es = X`, then post X must exist and reciprocally point back. Non-reciprocal links fail the build (kills the #1 manual-error class from ny-eng's §14).

### 4c. Language-switcher UX on single-language posts

ny-eng's header toggle assumes every page has a translation to switch to. On an **ES-only** post, the EN toggle has no target. Decide the behavior (proposed: **toggle takes you to the other language's blog index**, not a 404, and not a hidden control — a hidden toggle looks broken). Small but real UX/SEO detail.

### 4d. Governance — exempt the blog from the strict parity rule

The repo's CLAUDE.md parity rule ("fix BOTH or NOTHING") and Recurring Failure Mode #1 stay in force **for marketing/core pages**. Add an explicit written carve-out: **blog posts may be single-language by design**, governed by the reciprocal-`translations` validator instead of blanket parity. Without this, every future audit/AI session will "fix" the missing translations and undo the strategy.

---

## 5. Content strategy (the actual plan)

### Two tracks + cornerstones

- **Primary track — Spanish / MX (es-MX):** doubles as Facebook + LinkedIn repurposing fuel _and_ faces far less Spanish-language competition for AI/SEO/local-business topics — a winnable niche. Written natively, not translated.
- **Secondary track — English / US-Canada:** bigger search volume, feeds the USD-market side. Lighter cadence to start.
- **Cornerstones (bilingual, ~1 per 6–8 posts):** evergreen pillar articles on universal high-value queries; full es-MX transcreation; the ranking + authority anchors that the track articles link _up_ to (pillar-cluster model).

### Rules that keep it from failing

1. **Weight, don't split evenly.** One strong track beats two starved ones. Primary (ES) gets the rhythm; EN runs opportunistically until data justifies more.
2. **Native per-language keyword research.** Never research in EN and translate the keywords — Spanish searchers use different terms. Use the GSC/Bing query data we already pull.
3. **Quality over Max-license volume.** AI powers research/outline/first-draft/translation/SEO analysis; human judgment and real CushLabs results go on top. 10 excellent posts > 100 thin ones (thin AI content is a 2026 ranking _liability_).
4. **Every post is engineered to repurpose** (see workflow) and to serve outreach (objection-handlers, case studies you can send prospects).
5. **Blog runs _behind_ the outreach pipeline** on the time budget — it's a compounding parallel asset, never the primary near-term revenue lever.

### Repurposing workflow (one artifact → three channels)

Blog post (canonical, SEO'd) → **Facebook post** (native-language excerpt + link/visual) → **LinkedIn** (article or post, usually EN for the professional network). Cornerstones get both-language social. Track which track earns traffic in GSC and reallocate.

---

## 6. Starter content (react to these — not final)

**Primary track — Spanish / MX (native es-MX, salon/spa/clinic + local-SMB intent):**

1. "Cómo responder los mensajes de Facebook de tu negocio en segundos (sin estar pegado al celular)"
2. "¿Le sirve un chatbot con IA a un salón de belleza? La respuesta honesta"
3. "Más citas desde Facebook sin contratar a nadie: la guía para dueños de negocio"
4. "Reseñas de Google para negocios locales: cómo conseguir más y responderlas bien"
5. "Tu negocio no necesita página web si tienes bien puesto tu Facebook"

**Secondary track — English / US-Canada (SMB owner + build-vs-buy intent):**

1. "Why your business loses Facebook leads after 6pm — and the 5-second fix"
2. "AI Messenger assistant vs. a human VA: the honest cost comparison"
3. "The 15-minute rule: how Facebook's 'responds quickly' badge actually works"
4. "Bilingual customer support without hiring bilingual staff"
5. "Build vs. buy: should a small business make its own AI chatbot in 2026?"

**Cornerstones (bilingual, evergreen — dogfood CushLabs' own expertise):**

1. EN "The complete guide to AI customer service for local businesses" / ES "Guía completa de atención al cliente con IA para negocios locales"
2. EN "How to turn Facebook Messenger into a sales channel" / ES "Cómo convertir Facebook Messenger en un canal de ventas"
3. EN "Local SEO for bilingual businesses: the 2026 playbook" / ES "SEO local para negocios bilingües: la guía 2026"

---

## 7. Phased rollout (kept lean, behind outreach)

- **Phase 0 — Decisions (Robert):** confirm primary track, cadence, and the open decisions in §8.
- **Phase 1 — Engine MVP (agent-time ~30–60 min build):** content collection + schema, `/blog/` + `/es/blog/` (index, pagination, detail), Base-layout blog path with conditional hreflang, Article+Breadcrumb JSON-LD, reciprocal-translation validator, sitemap serialize extension. Ship with **2 posts** (1 ES, 1 EN) + **1 cornerstone** to prove all three modes end-to-end.
- **Phase 2 — SEO automation:** wire blog URLs into GSC/IndexNow (present) + add Bing; RSS feed; verify Rich Results.
- **Phase 3 — Cadence + repurposing:** sustainable rhythm on the primary track; social repurposing; monthly GSC review to reallocate effort.

---

## 8. Open decisions for Robert

1. **Primary track:** Spanish/MX (my recommendation) — confirm or override.
2. **Cadence:** proposed 1 primary-track post / 1–2 weeks, EN opportunistic, cornerstone every 6–8 posts. Realistic?
3. **URL words:** `/blog/` + `/es/blog/` with Spanish slugs on ES posts (e.g. `/es/blog/mas-citas-desde-facebook/`) — consistent with the site's ES-slug convention. OK?
4. **Author identity:** posts authored as "Robert Cushman / CushLabs" (E-E-A-T) — confirm the byline/author-schema identity.
5. **In-post components (MDX):** add `@astrojs/mdx` for interactive posts, or keep pure Markdown for v1? (Recommend pure MD for MVP.)

---

## 9. Confidence

- **Architecture is right: ~90%.** The hybrid maps cleanly onto the proven ny-eng structure; the deltas are specific and bounded. The 10% is the EN-unprefixed routing rewrite and the Tailwind-4 prose wiring — both mechanical, discoverable at build time.
- **Business value is conditional: ~70%.** Fully realized _if_ run as a quality repurposing + sales-enablement engine behind outreach; not realized if it becomes a volume play or displaces near-term sales. This is a governance/discipline risk, not a technical one.

---

## 10. Cross-references

- `C:\Users\Robert Cushman\Projects\ny-eng\docs\BLOG-SYSTEM-PLAYBOOK.md` — the full build spec we port from
- `C:\Users\Robert Cushman\Projects\ny-eng\docs\BILINGUAL-SEO-SITEMAP.md` — portable bilingual SEO spec
- `docs/architecture/BILINGUAL-SYSTEM-GUIDE.md`, `docs/architecture/BLOG-I18N-EDGE-CASES.md` — cushlabs' own imported lessons
- `~/.claude/reference/tailwind-4-migration.md` — required reading before touching `@theme` for prose
