# Session Log — cushlabs

> Living document for cushlabs.ai — shipped work, open technical debt, prioritized backlog, recurring failure modes. Session entries are newest-first under "Session History."
> Consolidated 2026-06-21: this file absorbed the former `docs/SESSION-LOG.md` rich tech-debt doc (now deleted). `SESSION_LOG.md` is the single source of truth — the `/session-logger` skill writes here.

---

## Active Technical Debt

> Open items first, highest severity first. Each has a **Next:** line — an item with no next
> action is homework nobody asked for, so either write the action or close it.
> Resolved items collapse to one line under [Resolved](#resolved-technical-debt); the trail stays so a
> future session does not re-litigate a settled decision.

**9 open** · 18 resolved · last reconciled 2026-09-02

### #27 — A Page can connect and nobody is told; the confirmation cannot list the Pages because the Worker never sends their names

**Medium** · opened 2026-09-02 · blocks: the "we'll email you" promise on the connected page

Two gaps in the same Worker function, `cushlabs-messenger-bot/src/lib/oauth.ts` (Step 5 and
Step 6 of the OAuth callback), both found while fixing the connected page in PR #296:

1. **No alert on connect.** After storing the page token the callback writes `log.info` and
   redirects. Nothing emails or WhatsApps Robert. The connected page used to promise "an onboarding
   email within 1 business day"; that promise is now softened to no timeframe, but even "we'll email
   you" depends on a human noticing a log line. The live client connected during a call, which is
   why it has not bitten yet.
2. **No full page list.** `redirectToConnected` sends `page_name` as a prose summary that
   truncates past three pages ("A, B and 4 others"), plus `page_count` and `page_ids`. IDs are
   not names, so the site cannot render the list from them. The site now reads a `page_names`
   param (every name, one per line, URL-encoded) and falls back to the prose until it arrives.

**Next:** paste the prompt at the end of the 2026-09-02 session entry into a session opened in
`cushlabs-messenger-bot`. It adds `page_names: names.join("\n")` to the redirect and a WhatsApp
owner alert on connect using the existing owner-alert send path. Nothing on this site changes
when it ships; the list renders the moment the param appears.

### #26 — The Camila demo chat is a second unauthenticated path that writes real calendar events

**Medium** · opened 2026-08-27 · blocks: nothing today

`POST /book` is now gated by Turnstile, but `cushlabs-camila-demo` is exempted by
`isInternalCall()` because it reaches the booking Worker over a service binding with no browser to
challenge. That exemption is correct and unforgeable from outside — the risk is upstream of it.
The demo chat itself is a public, unauthenticated endpoint whose Claude tool loop can call
`create_booking`, so anyone who can talk to Camila can still put an event on Robert's real
calendar with a real Meet link. Nothing has abused it; the shape is the same one that produced the
2026-08-15 booking.

**Next:** decide whether demo-originated bookings should hit the real calendar at all. Cheapest
real fix is a distinct `source`-scoped path that writes to a separate demo calendar; second
cheapest is a per-session booking cap in `cushlabs-camila-demo` keyed on the chat session, which
the existing KV limiter there can already carry.

### #25 — The secrets guard hook blocks any assistant edit to the secret scanner it protects

**Medium** · opened 2026-08-26 · blocks: PR #284 only

The `PreToolUse` guard at `~/.claude/hooks-guard-secrets.mjs` matches on path name, so
`scripts/audit-secrets.mjs` and `tests/audit-secrets.test.ts` are both unreadable to an assistant.
That is correct for a `.env`; it is self-defeating here, because those two files **are** the scanner
and its fixtures. The consequence: nobody but Robert can write the exclusion that stops the scanner
flagging its own planted test values, so PR #284 stays red indefinitely.

The findings themselves are settled — Robert confirmed 2026-08-26 that every planted value is
fabricated. **This is not an exposure item.** It is a tooling deadlock.

**Next:** allowlist exactly those two paths in the hook, then the fixture exclusion is a few
minutes of work. Do not widen the pattern — two paths, not a directory.

### #12 — Instagram advertised as "Coming", submission deliberately queued behind another Meta review

**Medium** · opened 2026-08-15 · reclassified 2026-08-20 · blocks: nothing today

`/pricing/` and `/es/precios/` show the Instagram assistant as Coming on Premium and Ultra, and the
registry records `meta-instagram-messaging-permissions` as `not_submitted`.

**This is sequencing, not neglect** — Robert confirmed 2026-08-20 that another Meta review sits ahead
of it in the critical path, and stacking a second submission behind an unresolved one risks both.
Downgraded from High for that reason. The wording promises no date, so nothing on the site is
overclaiming while it waits.

When it is time: the 2026-07-31 rejection's documented cause — a screencast that didn't prove _the
app_ performed the action — is reusable, so the next attempt starts ahead of the last.

**Next:** after the in-flight Meta review clears, submit `instagram_manage_messages` **alone**,
without `instagram_manage_comments` — that is the permission class Meta already refused once, and
bundling them risks the whole request.

### #20 — Videos have no real captions (keyboard access resolved)

**Medium** · opened 2026-08-18 · keyboard half resolved 2026-08-20 (PR #268)

**Resolved:** all four video surfaces are keyboard-operable, verified by driving a browser —
`role=button`, `tabindex`, `aria-label`, Enter/Space, and focus moving to the player on
activation. The empty `<track kind="captions">` elements are gone from all five sites; they
declared a caption track that does not exist, which made assistive tech report captions as
available when none were.

**Still open:** there are no real captions. ~38 videos (34 portfolio + 4 site) and zero `.vtt`
files in the repo or on the CDN — both the sidecar path and a `captions.vtt` were checked for a
sample and returned 404. Robert confirmed 2026-08-20 that most have none at all. Any burned-in
subtitles help a deaf viewer but do not satisfy 1.2.2: they cannot be turned off, translated, or
read by a screen reader.

**Next:** content work, not code. Generate `.vtt` per language for the videos that matter most —
the two site portfolio videos first, since those are what a prospect actually watches — then wire
`src` + `srclang` + `label` + `default`. Everything else is already in place to receive them.

### #24 — Text over hero images and gradients is unverified for contrast

**Low** · opened 2026-08-20 · blocks: a confident AA claim

`scripts/audit-contrast.mjs` reports PASS in both themes, but it refuses to grade ~108 text nodes in
light mode and ~69 in dark that sit on a background image or gradient — a computed
`backgroundColor` cannot express those, and guessing produced nonsense on the first run.

The maths was done by hand for the homepage hero once (the veil is `rgba(20,17,13,0.62–0.88)`, so
white text clears 5.28:1 even against a pure-white photo pixel) but the other heroes have not been
checked, and a photo swap could silently break any of them.

**Next:** extend the auditor to sample actual rendered pixels behind those nodes via a screenshot
instead of reading CSS, which removes the blind spot permanently.

### #13 — Voice de-prioritized for sales, but the site still leads with it

**Medium**

Added 2026-08-15 from Tier Spec v1.2 §3. Voice is "on the grid, never pitched" — yet it keeps a full service page (`voice-agent.astro` + `es/`), a nav entry, a slot in the `/demos/` live strip, and a mention in the site meta description. More structurally: voice is the only capability that makes Ultra a _different_ product rather than a bigger one, and once Instagram + WhatsApp land in **Premium**, Ultra's $2,000/mo premium rests on priority support and industry tuning alone. Either pitch voice, re-cut Ultra around something else (volume, locations, SLA), or accept Ultra as a list-price-only tier. **Robert's call — see `operating-system/cushlabs/tier-feature-spec.md` §7.5.**

**Next:** Robert confirmed 2026-08-20 that voice stays de-prioritized. Decide what Ultra is FOR once Instagram and WhatsApp land in Premium — volume, locations, or SLA — because voice is currently the only thing making Ultra a different product rather than a bigger one. See `operating-system/cushlabs/tier-feature-spec.md` §7.5.

### #23 — `/demos/` runs a private design system and an incomplete tab pattern

**Medium**

Found 2026-08-18. `IndustryMessengerDemo.astro:455-483` defines its own CSS-variable palette (~50 hardcoded hexes, including a hardcoded copy of the brand orange) plus 20 more accent hexes as per-industry gradient art — the largest colour sprawl in the repo, and prospect-facing. It also declares `role="tablist"`/`role="tab"`/`aria-selected` (`:401`, `:623-635`) with **no `aria-controls`, no `role="tabpanel"`, no arrow-key navigation** — the APG contract those roles promise is unimplemented (**4.1.2 A**). Either complete the pattern or drop the roles for plain `aria-pressed` buttons. Heading order is also inverted: `LiveDemoStrip`'s h2 renders before the page's only h1.

**Next:** the contrast half is done (2026-08-20: `--accent-ink` white→black, `--ink-faint` darkened in both themes). What remains is (a) the `role="tablist"` that declares no `aria-controls`, no `tabpanel`, and no arrow-key navigation — either complete the APG pattern or drop the roles for plain `aria-pressed` buttons, and (b) the ~50 hardcoded hexes plus 20 per-industry gradient colours, which should reference the brand tokens.

### #1 — EN privacy "Your Rights" lacks Mexican-specific framing

**Low**

ES privacy names LFPDPPP / derechos ARCO (PR #86); EN still says generic "depending on your location." Fine for a global EN audience, but worth a lawyer review if English-speaking Mexican residents are expected.

**Next:** Robert's steer 2026-08-20 is that the framing should be more Mexican. The ES page already names LFPDPPP and derechos ARCO; bring the EN page to the same specificity rather than leaving it on generic "depending on your location", since English-speaking residents of Mexico have the same ARCO rights. Legal text — load the `legal-pages` skill, and note where an actual lawyer is required.

### Resolved technical debt

Kept for the trail. Newest numbers first.

- **#8 Self-portfolio `demoUrl` pointed at the non-www apex** — Resolved 2026-09-02 (PR #300). `src/data/projectDetails.ts:146` now `https://www.cushlabs.ai/`, which removes the only redirecting internal link on the site (a 307 on 4 pages, Ahrefs 3XX warning). IndexNow submitted after merge.
- **#19 Booking success announced without verification** — Resolved 2026-08-20 (PR #270). `data.ok` was the entire success test, so a worker replying ok without creating an event still rendered "You're Booked." `eventId` and `meetLink` had been in `BookingResponse` since the worker was written and neither was ever read. Now a missing `eventId` throws instead of claiming success, and the Meet link plus a booking reference render when returned — the join link is built in JS rather than shipping a dead `href="#"`. Verified by driving the real wizard with a mocked API in both directions. Two things found while in there: the summary said **"Central Time (GMT-6)"**, which is ambiguous and wrong for half the year for a US visitor (US Central shifts; Mexico City is UTC−6 year-round) — now "Mexico City time (UTC−6)" in both languages; and `PUBLIC_BOOKING_API_URL` was missing from `.env.example`, so an unset value silently disabled the primary conversion page with no build error.
- **#18 Imported docs describing a different site** — Resolved 2026-08-20 (PR #271). 16 files deleted, 9 bannered with a `NOT THIS REPO` block naming exactly what is wrong. Inbound references were checked first: every link came from another doc in the same imported cluster or from SESSION_LOG, nothing in code, config or CI. Deleted the quiz system, free-assets router, Supabase migration, Netlify/Hostinger deployment guides, the Next.js/shadcn toolkit, WindsurfRules, and `BOOKING-SYSTEM.md` (which claimed a Cal.com widget). Kept, with banners, the bilingual and SEO docs whose reasoning generalises. Also fixed `docs/templates/readme-instructions.md`, which was seeding every new repo's README with "Node.js 18.17+" while Astro 7 requires >= 22.12. New `npm run audit:docs` flags foreign-stack markers in unbannered docs and `npm run` references to scripts that do not exist — advisory, not a gate, since a legitimate mention of another project is not a defect. 43 flagged docs → 27, every remaining heavy offender bannered.
- **#10 Hand-written SEO meta maps were a second, unvalidated claims surface** — Resolved 2026-08-20 (PR #269), and the audit found the maps were the smaller half of the problem. Measured on a real build of the 72 project pages (57% of the site's URLs): **50 descriptions were cut off mid-sentence** with an ellipsis, and **18 of 36 SPANISH pages served an ENGLISH description** because the ES chain never consulted `esCard.tagline` despite Spanish copy existing for 30 of 36 projects — it reached for the GitHub blurb, prefixed with the title, to dodge a duplicate-description warning. Both are now zero, as are the 6 over-length and 10 under-length titles (`/projects/cushlabs/` rendered as "CushLabs.ai | CushLabs.ai"). Fixed structurally: `src/lib/meta.ts` composes best-first and trims on a sentence boundary, `tagline` now outranks the GitHub description, and `meta-description-gate.mjs` fails the build when an `/es/` page serves English — verified by injecting one. The remaining concern from the original entry stands and is narrower now: the override entries themselves are still hand-written and unvalidated against what each repo does.
- **#21 Orange as body text failed AA on light backgrounds** — Resolved 2026-08-20. Fixed with a theme-aware `--accent-text` token (`#ba4d2d` light / `#ff6a3d` dark) plus an `.on-dark` class for dark bands inside light pages; 300 `text-cush-orange` occurrences across 73 files became `text-accent-text`. `--color-cush-orange` is unchanged for fills and borders. Measured 252 failures → 0 in both themes with the new `scripts/audit-contrast.mjs`.
- **#22 Muted greys failed non-text contrast** — Resolved 2026-08-20 for the greys (`--ink-faint` light `#8b95a3`→`#626d7d`, dark `#6b7788`→`#8594a9`; both verified ≥4.5:1 on every surface they paint on). The `border-border` form-field boundary at 1.24:1 was NOT changed — it is a border, not text, and needs a design decision about how visible field edges should be. Reopen as a design task if that matters.
- **#16 / #3 Orphaned components carrying stale claims** — Resolved 2026-08-20. Verified 16 of 53 orphaned via a real transitive import graph (1,572 lines) and deleted, including all of `src/components/home/`. The four fabricated testimonials and their stock avatars went with them. The "17+ years Fortune 500" claim in that entry was already gone — a repo-wide sweep found zero aggregate career-year claims and zero personal "bilingual" claims in `src/`.
- **#11 CFDI promised to USD clients** — Resolved 2026-08-20. Robert confirmed a US client receives a traditional itemized invoice, not a CFDI. Corrected on the USD lines of `PricingSection` (EN+ES), `salons.astro`, and both terms pages, which now scope CFDI to clients invoiced in Mexico. MXN surfaces unchanged. `salons.astro`'s "card/invoice billing" comment also corrected — card is not live in any currency.

- **#17 `npm run check` is red on `main` and is being ignored** — **Resolved 2026-08-19 (PR #266).** 26 errors → **0**, and CI now runs the gate before the build so it cannot rot again — the root cause was that `ci.yml` ran `npm run build` and `npm test` but never `
- **#15 Primary CTA fails WCAG AA contrast across 45 files** — **Resolved 2026-08-18 (PR #264).** White on `#ff6a3d` is **2.85:1** — fails AA for both normal (4.5) and large (3.0) text.
- **#14 Client proposals with negotiated pricing are committed to a PUBLIC repo** — **Resolved 2026-08-19 (PR #265).** Removed `demos/azucar/proposal.html` (Susy had converted, so it had served its purpose) and all of `demos/latiendita/` (prospect never responded).
- **#9 Portfolio generator published any repo without a `PORTFOLIO.md`** — **Resolved 2026-08-05 (near miss).** Found while fixing #7.
- **#7 Two thin repo pages generate + enter the sitemap with no inbound link** — **Resolved 2026-08-05, and it was never "Low."** Root cause was the generator's default, not the two repos: a missing `PORTFOLIO.md` fell through to `priority: 99`, which hides the CARD but still buil
- **#6 Ungated client proposal reachable at `/azucar/`** — **Resolved 2026-08-05** — `public/azucar/index.html` deleted.
- **#5 `/azucar/` landing page missing its meta description** — **Resolved 2026-08-05** as a side effect of #6 — the page that was missing the description was the ungated proposal, now deleted.
- **#4 "Owner lead alerts" (Basic tier) not fully delivered until Meta approves** — **Resolved 2026-07-09** — WhatsApp owner alert LIVE (es\*MX template Active, verified send 200).
- **#2 `js-yaml` (via `gray-matter`) flagged by `npm audit` (moderate)** — **Resolved 2026-08-12** — turned out to be 2 separate HIGH-severity Dependabot alerts (js-yaml on two paths, plus nanoid), not the build-time-only nit previously assumed.

## Backlog (Prioritized)

**NEXT UP — approved 2026-08-27, not started.** Swap the Camila demo's `create_booking` tool for a
WhatsApp `notify_owner` alert; keep the read-only slot lookup. Closes tech debt #26. Feasibility
and template approval already verified — full detail in the HANDOFF block at the top of the
2026-08-27 session entry. **Answer the 24-hour-window pricing question before writing code.**

Planned but not started. Bundle related items into single PRs per CLAUDE.md.

### High priority

_(none open)_

### Medium priority

- **Rotate `CF_AI_TOKEN` in `cushlabs-messenger-bot/.dev.vars`, then re-ingest the corrected RAG
  corpus** — the bot-content reconciliation shipped same night (bot PR #270, live KV + QA-gated),
  but the token is dead at Cloudflare (invalid since ≤2026-08-13, last ingest 2026-07-02), so the
  corrected prose can't be embedded and stale "2-week / SPEI-OXXO / sin costo extra" chunks remain
  retrievable. Steps + verification: bot repo `docs/SESSION_LOG.md` Open Items #15.
- **Confirm CFDI on the USD surfaces** (remainder of tech debt #11). The card question is settled —
  card is not live, docs corrected 2026-08-06. Left over: `PricingSection.astro:156` and
  `salons.astro:96`/`:317` promise a **CFDI** to a USD/US audience, and `salons.astro:7`'s header
  comment still says "card/invoice billing", contradicting its own body. Confirm whether a US client
  receives a CFDI or a plain invoice, then fix via the `copywriting` skill (published copy).
- **Triage stale open PRs** — ~~**#224**~~ **no longer open** (verified against `gh pr list`
  2026-08-19; this line asserted it needed review for an unknown stretch after it had already been
  closed or merged). ~~**#204**~~ **closed 2026-08-12** — superseded by #207 two days after it
  opened, which shipped a safer live-only version with more features; nothing on the branch was
  worth carrying forward. ~~Dependabot #215~~ **merged 2026-08-12** (resolved a medium security
  alert). Remaining open Dependabot PRs: #128, #198, #217, #218, #219, #220 — #218 (TypeScript 5→7)
  and #220 (ESLint 9→10) are majors and need a build check, not a blind merge.
- **Ahrefs 2026-07-25 crawl fixes — one item left** (tech debt #8).
  1. `src/data/projectDetails.ts:146` → `https://www.cushlabs.ai/` (kills the 3XX warning).
     Still open as of 2026-08-05.
  2. ~~`PORTFOLIO.md` exclusions for `cushlabs-ai-dispatch` / `cushlabs-stickers-releases`~~ —
     **done 2026-08-05.** Both sibling repos committed, `cushlabs-ai-dispatch` migrated
     `master` → `main`, and the generator's default flipped to opt-in (tech debt #7, #9).
  3. ~~Delete `public/azucar/index.html`~~ — **done 2026-08-05**, shipped separately (tech debt #6).
     Pulled out of this bundle because a paying client's proposal being publicly reachable is a
     confidentiality fix, not an SEO one, and it should not wait on a portfolio-data regen.
  4. `npm run seo:indexnow` — run after item 1 lands, so one submission covers everything.

### Low priority

- ~~**Triage portfolio sync issue #109**~~ — **closed 2026-08-06.** The issue itself was closed
  2026-06-22, and the underlying warning ("`ny-english-messenger-bot`: no portfolio slides") is moot:
  that repo has no `PORTFOLIO.md`, so under the opt-in rule from PR #222 it is no longer published at
  all and is absent from `projects.generated.json`. Verified both, not just the issue state.
  **The repo now has zero open issues.**
- **Flesh out thin project detail pages** — e.g. cushlabs-messenger (1 screenshot, no solution/metrics).
- **Title pixel-width audit** on `/data-deletion/` and `/es/data-deletion/` (both end in `| CushLabs.ai`) against Ahrefs's pixel threshold.
- **Remove the dead `src/components/home/` folder** (tech-debt #3) once confirmed nothing imports it.
- **Label EN Services example figures as USD** — the community-manager / receptionist cost examples on `/services/` don't state a currency (external-audit item, 2026-07-07).
- **Add meta description to `/azucar/`** (tech-debt #5) — pre-existing gap found in the 2026-07-15 blog audit.
- **AI Voice Agent blog article** — no blog coverage yet. EN-native missed-calls angle ("every missed call is a customer calling your competitor") proposed 2026-07-15; pairs with `/voice-agent/`. Would balance the blog beyond Messenger. Needs a hero.

---

## Roadmap

Directional ideas with a longer horizon than the Backlog. Themes, not tickets — promote to Backlog once scope is concrete.

### Product expansion

- **WhatsApp Business as a third channel** — Messenger Assistant tech is reusable. Many Mexican SMBs live on WhatsApp first, Facebook second. Spec a WhatsApp variant to broaden TAM without rebuilding the AI core. Validate demand via 2–3 prospects first.
- **Outbound voice product** — currently disclaimed on the voice page. Productize if a real prospect asks; until then keep it custom-quoted.
- **Multi-page / franchise Messenger setups** — disclaimed on `/messenger-assistant/` ("scoped separately"). Productize once a real client justifies it.
- **AI Customer Support Chatbot dedicated page** — exists as a `/services` block (`support-assistants`) but has no standalone landing like `/messenger-assistant/` or `/voice-agent/`. Could be the third standalone product page once content is ready.
- **Messenger premium upgrades (HELD)** — see `docs/strategy/MESSENGER-PREMIUM-UPGRADES-HELD.md`. WhatsApp channel, in-chat booking, Meta notifications, operator-alert webhook, self-serve content-edit UI, etc. All List 2 (roadmap/shovel-ready), off the public page. Promotion trigger: built AND mapped into a pricing tier (no à-la-carte).

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

### 0. A CSP that blocks your own endpoint, hidden by a catch block that says nothing

**What happened, twice.** The booking worker's domain was missing from `connect-src`; the symptom was
"No available times" and it took a debugging session to find. It is listed under Resolved in
CLAUDE.md. Then it happened again on 2026-08-18 with `formspree.io`: the contact form on **both**
languages had been dropping every lead, showing "Something went wrong" and logging nothing.

**Why it hides so well.** The CSP lives in `vercel.json`, the `fetch` lives in a component, and
nothing connects them. `npm run build` passes, tests pass, the page renders, and the failure only
exists in a real browser on the real domain — so local dev and CI both report green.

**Rules.**

1. **Adding or changing any `fetch` destination means editing `connect-src` in the same commit.**
   New third-party form handler, new worker, new analytics endpoint — same commit, no exceptions.
2. **Never write a bare `catch` on a network call.** `console.error` at minimum, `Sentry.captureException`
   preferred. A caught-and-silenced network error is indistinguishable from a working feature.
3. **A failure must never render as a plausible normal state.** "No available times" for an outage
   and "Something went wrong" for a blocked request both read as ordinary. Distinguish the cases and
   always give a recovery path.
4. **Verify against the live header, not the repo:** `curl -sI https://www.cushlabs.ai/contact/`.

### 0b. A quality gate nothing runs is a quality gate that is already broken

**What happened.** `npm run check` sat at 26 errors on `main`. `ci.yml` ran `npm run build` and
`npm test` but never `npm run check`, so nothing caused it to go red and nothing forced anyone to
fix it once it had. Separately, `tests/*.ts` were in no tsconfig `include`, so `tsc --noEmit`
reported clean while **silently skipping the entire test suite**.

**Rule.** Every gate the repo defines has to run in CI, or delete the gate. A check that only fails
on someone's laptop trains the team to ignore its output — and the habit generalises: the contact
form that dropped every lead, and the booking button that bricked itself, both survived in a repo
where red output was normal. Also: `tsc` passing means nothing until you have confirmed which files
it actually looked at.

### 0c. When a linter says a guard is unnecessary, check whether the TYPE is lying

**What happened.** 17 `no-unnecessary-condition` errors flagged `?? 0` and `?? ""` fallbacks on
GitHub API fields in `scripts/`. Octokit's generated types declare `stargazers_count`, `pushed_at`,
and `archived` as always present; the API omits them depending on endpoint, permissions, and repo
visibility. Obeying the linter would have deleted the only thing keeping `undefined` out of
`projects.generated.json` — the same corruption shipped in April 2026 by a different route.

**Rule.** A "this check can never fire" diagnostic is a claim about the _types_, never about
runtime. For anything crossing a trust boundary — an HTTP API, a file on disk, `JSON.parse`,
`Record` index access — assume the type is optimistic and keep the guard. Where the type can be
corrected, correct it (`api/demo.ts` now declares `Record<string, DemoConfig | undefined>`, which is
simply true) rather than suppressing the rule. Suppress only with the reason written inline.

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

### 5. Parallel sessions on the same repo → merge wars

**What happened (2026-07-12):** two Claude sessions edited cushlabs concurrently — one on ToS/pricing copy, one on the blog. `main` went through a revert cascade (#175 merged on a stale base and reverted #171/#116; #176 restored it), which silently re-introduced stale "2-week"/SPEI-OXXO strings onto an in-flight branch during an auto-merge. Cost ~20 minutes and four re-merges on PR #174. **Rule:** one actor per repo at a time (CLAUDE.md "One Branch at a Time — Sequential, Never Parallel"). When a second session is unavoidable, the later actor works in an isolated `git worktree` off latest `main`, re-runs any idempotent fix **after** merging to catch silent reverts, and greps for stale strings before pushing. Never trust a clean auto-merge on churned files — verify. **Corollary (2026-07-15, #175/#176):** always `git fetch && git rebase origin/main` (or branch fresh) before opening a PR when other merges may have landed. A branch cut from a stale local `main` carries old copies of files main has since changed; GitHub's squash then reverts them silently. Verify a merge changed **only** the files you touched (`git show --stat HEAD`).

### 6. Removed-feature redirects block its own relaunch

**What happened (2026-07-08):** the blog was removed pre-launch with permanent `/blog→/portfolio` redirects (`/blog`, `/blog/`, `/blog/:path*`, and the `/es/blog` set) in `vercel.json`. When the blog relaunched (#168) those redirects were never removed — they hijacked the new blog **index and both RSS feeds** (leaf post pages happened to serve, so the relaunch looked live). Fixed in #172.

**Rule:** when relaunching a previously-removed feature, grep `vercel.json` (and any redirects config) for stale rules targeting its paths and delete them. Verify the **index and feed URLs**, not just a leaf page — a leaf can pass while the entry points 302 away.

### 7. About page EN/ES are separate files, not one locale-branched page

**What happened (2026-07-16):** added an "In plain English" statement to `src/pages/about.astro`, populating both its `content.en` and `content.es` objects. EN rendered; ES did not. `/es/about` is served by a **separate file** — `src/pages/es/about.astro` — with its own standalone `content` object, so the EN file's `content.es` is dead code no route ever reads. Robert caught the missing ES statement in production; fixed in #192.

**Rule:** the About page does NOT follow the single-file `content[locale]` pattern most pages use. EN = `src/pages/about.astro`, ES = `src/pages/es/about.astro` — two files, two `content` objects. Any About edit must touch BOTH. (The dead `content.es` inside `about.astro` renders nothing — ignore or delete it.)

### 8. "Hidden" in the portfolio pipeline never meant "not published"

**What happened (2026-08-05):** `priority: 99` was treated for months as the way a repo stays off the site — it is what a missing `PORTFOLIO.md` defaulted to, and tech-debt #7 described those repos as merely "hidden." It only hides the **card on `/portfolio`**. `src/pages/projects/[slug].astro` still generated a full detail page in EN and ES, sitemapped, built from raw GitHub metadata. `/projects/cushlabs-ai-dispatch/` was live claiming a "Claude Dispatch platform for multi-tenant operations, mobile integration, and AI agent coordination" for a repo containing two markdown files. Worse, because the default was opt-**out**, the regen that removed those pages simultaneously pulled in `cush-health` — the private repo holding a 23-year medical record — and would have published it on the next commit.

**Rule:** the portfolio is **opt-in**. No `PORTFOLIO.md` → not published, enforced in `generate-projects.ts`, and every skipped repo is printed by name on every run. Two corollaries, both learned the hard way:

1. **Never gate on repo visibility instead.** 10 of the 36 published projects are private on purpose (marketsignal, messenger-bot, OS-dashboard). Private ≠ unpublishable; the signal is an authored `PORTFOLIO.md`, nothing else.
2. **After ANY `generate-projects` run, diff the project list before committing** — `REMOVED` and `ADDED` both matter. The dangerous half of that diff is what got added while you were looking at what got removed.

---

## Session History

## Session: 2026-09-05 — Funnel attribution connected pricing, booking, demos, contact, and WhatsApp

**PR:** [#301](https://github.com/RCushmaniii/cushlabs/pull/301)

Implemented the first site-side measurement layer from the September 2 marketing audit. A shared
Vercel Analytics client now preserves first-touch UTM/referrer/landing-page context for the browser
session and attaches page, locale, plan, service, and CTA placement to conversion events. The site
records demo opens, pricing-plan selections, booking CTA clicks, booking starts/completions, contact
form completions, and WhatsApp clicks without sending names, email addresses, phone numbers, notes,
or message text to analytics.

Pricing CTAs now carry Basic/Premium/Ultra intent into the EN and ES booking routes, where the
selected plan is acknowledged before scheduling. Successful Formspree leads also include source,
campaign, and original landing page so the notification arrives with usable acquisition context.

Corrected the salon outreach playbook's default opener, time-saver opener, and Booksy objection:
they now advertise Facebook Messenger only, matching the live offer; Instagram remains Coming.

**Verification:** production build PASS (126 pages); meta-description gate PASS (124 checked);
commercial-terms validation PASS; targeted ESLint PASS; TypeScript PASS; Vitest 31/31 PASS.

## Session: 2026-09-02 — The screen a client sees right after connecting promised a timeline, an email, and named "4 others"

**PR:** [#296](https://github.com/RCushmaniii/cushlabs/pull/296) here (open) · [#291](https://github.com/RCushmaniii/cushlabs/pull/291) merged at the start of the session (the "trained on" claim and the trial-length drift from the previous session).

### What was wrong

`/messenger-assistant/connected/` and its Spanish twin are the first thing a client sees after
approving CushLabs in Facebook's consent dialog. Four defects, all on that screen:

1. **"Live within 5 business days"** in step 3, in both meta descriptions, and in step 2 of the
   connect page one screen earlier. `commercial-terms.json` `delivery_timing.never_say` already bans
   promising a timeline; this was the same promise with a number on it. Replaced with the canonical
   `combined_en` / `combined_es` statement, read from the file, not retyped.
2. **"Onboarding email within 1 business day."** Nothing sends it. The Worker's OAuth callback logs
   and redirects; no alert reaches a human. Softened to "We'll email you to schedule your content
   intake call" with no timeframe. The alert is bot-repo work, tech debt #27.
3. **"on<strong>Page Name</strong>"** with no space. The source had "on" and the `<strong>` on
   separate lines and Astro's HTML compression ate the newline. Now one line with a literal space
   and a comment so the next formatter pass does not re-wrap it.
4. **"Azúcar, CushLabs and 4 others."** The Worker sends `page_name` as a prose summary capped at
   three names (added 2026-08-04 after a client watched a demo page get named instead of their own),
   plus `page_count` and `page_ids`. IDs are not names. The page now reads a `page_names` param
   (one name per line) and renders every Page as a checklist with the count in the sentence; a single
   page, or today's prose-only Worker, still renders as a sentence. Names are inserted via
   `textContent` only; an injected `<img onerror>` renders as text.

**Naming.** The sentence said "CushLabs Messenger Assistant". The Meta app the client had just
approved in Facebook's own dialog is **CushLabs Messaging Platform** (app 848827908228231, per
`capability-registry.json`), and that is the name they will find under Business Integrations when
they go looking to revoke it. Both screens now say "CushLabs Messaging Platform, the Meta app behind
your AI Messenger Assistant", with the product name copied exactly from `brand-kit.md` §07.

### Verified

`npm run check`, full build, `meta-description-gate` (the first drafts of both descriptions were
194 and 246 characters and failed the 160 cap; trimmed), `validate-terms`, 31 smoke tests, and seven
query-string cases driven through Chromium against the built HTML (legacy prose, six-page list,
single page, XSS attempt, ES list, ES prose, error state).

### Recurring failure mode, reinforced

The delivery-timeline promise was removed from the footer, hero, about page and homepage
description on 2026-07-01 and the phrase went into `never_say`. It survived here because the
connect flow said "5 business days", not "days, not weeks", and `validate-terms` matches phrases.
Same lesson as 2026-08-27: a phrase list catches last time's sentence. The gate should match the
shape "N business days" / "N días hábiles" near "live" / "producción"; not done this session.

### Paste-ready prompt for the bot repo (closes tech debt #27)

```
In src/lib/oauth.ts, two changes to the OAuth callback, one PR.

1. In the Step 6 redirect (the redirectToConnected call that already sends page_name, page_id, page_count and page_ids), add page_names: names.join("\n") — every connected page name, newline-separated. cushlabs.ai PR #296 already reads this param (split on "\n") and renders every Page as a list; until it arrives the site falls back to the prose page_name. Keep page_name exactly as it is for the fallback. Add a joinPageNames-style unit test asserting the param round-trips through URLSearchParams with a name containing a comma and an ampersand.

2. In Step 5, after the page tokens are stored, send Robert a WhatsApp owner alert that a page connected: page names, page ids, and whether conversation routing was enabled for each. Use the existing owner-alert send path the bot already uses for lead alerts; do not add a new provider. Fire it once per connect, not once per page. If the send fails, log it and still redirect — the alert must never block onboarding. Do not promise the client anything from the bot side; the site copy already says only "we'll email you".

Verify both against the real redirect URL shape in a test, run the full test suite, and open the PR. Do not touch the site.
```

### Later the same day — debt cleanup before closeout (PR #300)

- **Tech debt #8 closed.** One line in `projectDetails.ts`; the site now has zero redirecting
  internal links.
- **Retired demo-worker source deleted.** `workers/demo-chat.js` and `wrangler-demo-chat.toml`
  were left in the repo "for history" when the worker was retired and removed from Cloudflare
  (2026-06-21 entry). Today's marketing audit (`docs/MARKETING-LEAD-GENERATION-AUDIT-2026-09-02.md`,
  committed in the same PR) found the file still hard-codes "projects start at $3,500 USD", the exact
  pricing model reconciled out of the live assistant on 2026-08-27. Verified before deleting: not in
  the Cloudflare account's worker list, no reference in `package.json`, `.github/`, or any page;
  the only code mentions are two explanatory comments. Git history keeps the source. The CSP
  `connect-src` allowance for its `workers.dev` host was removed from `vercel.json` in the same
  commit.
- **Dependabot #297 merged** (fast-uri patch, CI green). #292 (minor-and-patch group of 7) was
  still being rebased by Dependabot at closeout; #293 (eslint-plugin-astro 1→3), #294 (eslint 9→10)
  and #295 (googleapis 171→176) are majors and were deliberately left. **Next:** merge #292 once
  its checks are green; take the three majors one at a time, each with a local `npm run check`
  and, for googleapis, a dry run of `scripts/seo/gsc-submit-urls.mjs`.

## Session: 2026-08-27 (later) — The homepage chatbot was quoting a pricing model we no longer sell

**PR:** [#287](https://github.com/RCushmaniii/cushlabs/pull/287) here (merged, live) · [ai-chatbot-saas#95](https://github.com/RCushmaniii/ai-chatbot-saas/pull/95) (merged, deployed, verified).

### The headline

The assistant embedded on this site — the Converso tenant at `soyconverso.com`, mounted by `BaseLayout.astro` — was answering prospects with **"$3,500 USD fixed-price projects"** and two claims `claims-policy.json` explicitly bans ("30 years in IT"; "native-level bilingual developer" applied to Robert). Its knowledge base had never been reconciled against the canonical files. 13 stale chunks were replaced with 48 (24 EN / 24 ES) rewritten from `commercial-terms.json`, `service-reference.md`, `claims-policy.json`, `capability-registry.json` and `ADVERTISED-COMMITMENTS.md`. Full detail lives in that repo's own session log; what matters here is that **this site's chat widget is a claims surface owned by another repo, and nothing was comparing it to the canonical files.**

### Shipped in THIS repo (PR #287)

The homepage FAQ promised a cancellation notice period the contract does not require, in both languages — EN _"cancel any time with 30 days' notice"_, ES _"cancelar cuando quieras avisando con 30 días"_. `commercial-terms.json` has `notice_period_days: 0` and lists that exact promise under `cancellation.never_say`. Both now use the canonical statement. Live and verified on `/` and `/es/`.

**`validate-terms` passed on all 126 pages while both lines were live**, which is the more important finding. It matched banned phrases with a literal `includes()`; the banned string is `"30 days notice"` and the page said `"30 days' notice"` — a possessive apostrophe defeated the gate. The Spanish sentence reordered the words and evaded `"30 días de aviso"` the same way. Matching is now apostrophe- and whitespace-insensitive, plus two accent-folded **shape** rules that catch the notice-period claim regardless of word order in either language. Confirmed the rules fire on both original sentences and stay silent on the canonical statements and on the legitimate _"invoices are due within 30 days of receipt"_ term in `terms.astro`.

### New recurring failure mode — a phrase list only catches last time's sentence

This is the second time a banned-phrase gate reported green over live drift. A gate built from string literals encodes the exact sentence someone wrote before; the next writer paraphrases and walks straight through it. When a claim matters enough to gate, gate the **shape**, not the sentence — and prove the rule fires on the real drift before trusting it.

### Open items raised, not closed

- **PR #284 is still red, and no assistant can fix it.** Confirmed this session: the failing check is `npm run audit:secrets`, flagging its own fixtures at `tests/audit-secrets.test.ts:21,23`. That is [tech debt #25](#25--the-secrets-guard-hook-blocks-any-assistant-edit-to-the-secret-scanner-it-protects) — the guard hook makes the scanner and its fixtures unreadable to an assistant, so only Robert can write the exclusion. No new information; recorded here so the next session does not re-diagnose it.
- **Dependabot backlog is not mergeable as a batch.** `ai-chatbot-saas` #64/#65 wait on the AI SDK v2→v3 bump, #58 is redundant and needs **closing with a comment, not merging**. `ai-idea-validator` has ten open including `next 15→16` and `typescript 5.9→7.0`. None were merged.
- **`AI-ASSISTANT-ONBOARDING.md` §2 and `ADVERTISED-COMMITMENTS.md` §4 Theme 3 still advertise Facebook comment→DM**, which the registry holds as `rejected` + `do_not_advertise`. The bot was written to never mention it; these two docs seed generated copy, so it will regenerate from them. **Next:** strike the comment-reply bullets from both and bump the §-reconciliation stamp in the same PR.
- **`ADVERTISED-COMMITMENTS.md` §5.1 contradicts its own §2.2** — "Free 2-week trial" and "30 days' notice" against §2.2's 1 week and no notice. Same class as the FAQ bug just fixed, in the file the bot repo reads first. **Next:** reconcile §5.1 to `commercial-terms.json` and bump the stamp.

## Session: 2026-08-27 — A stranger booked a real slot on the calendar; the booking endpoint now has a bot gate

### HANDOFF — next session starts here

**Robert approved the build and then restarted his machine. Nothing below is started.**

**Build:** replace the Camila demo's in-chat calendar booking with the WhatsApp owner-alert flow.
In `workers/camila-demo.js`, swap the `create_booking` tool for a `notify_owner` tool that fires
a WhatsApp alert instead of writing a real calendar event. **Keep `get_available_slots`** — it is
read-only and it is what makes the demo feel real. This also **closes tech debt #26**, because
removing the calendar write closes the second unauthenticated door by construction.

**ANSWER THIS FIRST — Robert's question, and it changes the design, not just the estimate.**
He believes utility-template cost is exempt or reduced when the alert comes to him and he
interacts with his own number — the 24-hour customer service window / free in-window utility rule.
He is probably right _today_. But the capability registry already carries
`meta-whatsapp-pricing-change-2026-10-01`, which says in-window utility templates **and** service
messages **start being charged on 2026-10-01** — 35 days out as of this entry. That would end
exactly the exemption he is counting on. Verify against Meta's live pricing documentation before
writing any code, then tell him what the real steady-state cost is on both sides of that date.

**Feasibility — already verified against live Meta on 2026-08-27. Do not re-derive it:**

| Fact               | Value                                                                              | How it was checked  |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------- |
| Permission         | `meta-whatsapp-single-tenant-production` = `approved`, `reachable_by: robert_only` | capability registry |
| Template           | `cliente_necesita_atencion` APPROVED, UTILITY, **es_MX and en_US**, 4 params       | live Graph API      |
| WABA (correct one) | **1669695934130784**                                                               | live Graph API      |
| Sender             | +1 307-284-2785, quality GREEN, display name APPROVED                              | live Graph API      |

**The trap, which has already cost a broken alert once (2026-07-30):** there are TWO WABAs.
NY English is `2185606682173313` and does **not** carry that template. Always query the WABA that
owns the SENDER. Re-check any time with, from `cushlabs-whatsapp`:
`node --env-file=.dev.vars scripts/template-status.mjs 1669695934130784`

**Do not build the send path — reuse it.** `cushlabs-messenger-bot/src/lib/alert.ts` already POSTs
to a bridge endpoint on the `cushlabs-whatsapp` Worker over a **service binding** (a Worker cannot
fetch another same-account Worker by its public URL — Cloudflare error 1042; this repo already hit
that with `env.BOOKING`). `camila-demo` already has a KV `RATE_LIMIT` binding to reuse for dedup.

**Three decisions still open, all needing Robert:**

1. **Dedup.** A stranger on the public demo buzzes Robert's real phone. Proposed default: one alert
   per visitor session, on the existing KV limiter.
2. **Cost exposure.** Publicly triggerable billed messages — sizing depends on the pricing answer above.
3. **Honest demo copy.** The alert reaches Robert, not a real Lumière Medspa owner. The demo must
   say "in production this arrives on the business owner's phone" rather than imply a real medspa
   is being notified. Load the `bot-launch-gate` skill for the honest-demo rules before writing copy.

**Not verified:** an actual end-to-end send through the bridge from the demo Worker. Deliberately
not fired — it would have buzzed Robert's phone unannounced. That is the one live test to run first.

**What happened.** A consultation appeared for 2026-08-27 09:00 under "John Cu", guest
`doheveh885@joystill.com`. Created 2026-08-15 01:49 Guadalajara, 12 days ahead. Robert attended;
nobody showed.

**Diagnosis: the site's own booking Worker made it, from a real form submission — not a test, not an
agent.** The event description matches `createBooking()`'s template byte for byte, and
`creator` is the OAuth credential the Worker holds, which is what every booking looks like. The
guest domain is a burner: no A record, NameSilo free DNS (`ns{1,2,3}.dnsowl.com`), MX pointing at
`mail.wallywatts.com` / `mail.wabblywabble.com`. Truncated name, one-word note, invite never
accepted. A probe or a tire-kicker, with no payload in any field.

**The actual hole.** `POST /book` had rate limiting (D1, 5/hour — that part was already right and
was briefly misreported as missing during this session from a front-end-only read) but **no proof of
a human**. CORS is browser-enforced and stops nothing arriving by curl, so anyone could create real
events, with real Meet links, on the real calendar.

**Shipped (PR #286).** Three checks on `POST /book`, cheapest first:

1. **Honeypot** — `company`, rendered off-screen and pulled out of the tab order and the
   accessibility tree, so no human including a screen-reader user can reach it.
2. **Origin / Referer** — removes the zero-effort case. Forgeable, and treated as such.
3. **Cloudflare Turnstile** — the real gate. Widget `cushlabs-booking` (managed mode, domains
   `cushlabs.ai`, `www.cushlabs.ai`, `vercel.app`, `localhost`), minted through the
   Cloudflare API using wrangler's own credential. `TURNSTILE_SECRET_KEY` is a Worker secret;
   `PUBLIC_TURNSTILE_SITE_KEY` is set on all three Vercel environments.

**Two things that would have broken and did not:**

- **The Lumière demo's in-chat booking.** `cushlabs-camila-demo` reaches this Worker over a
  service binding with no browser, no Origin and no Turnstile token. It is exempted by
  `isInternalCall()`, which keys on `url.hostname === "booking"` — the literal host that
  `bookingFetch()` writes, and one Cloudflare can never route to from the public internet.
- **Deploy ordering.** The front end ships the token first; the Worker starts requiring it second.
  Reversed, every booking on the live site fails in the window between the two.

**Also fixed: the phone field was collected and thrown away.** `BookingFormSteps.astro` has read
`booking-phone` into `formData` since it was written and never put it in the request body, and
the Worker never read one. Every event on that calendar carries an email and no callback number.
Both halves fixed together.

**Turnstile fails CLOSED** — a siteverify outage blocks booking rather than reopening the endpoint,
and the form says so with the WhatsApp fallback rather than dying silently the way debt #19 did.

**Availability was reviewed and deliberately left alone.** Weekdays already open at 09:00
(`WEEKDAY_MORNING_HOURS=09:00-14:00`, plus `16:00-20:00`; Saturday `09:00-13:00`; Sunday
blocked; 3.5h minimum lead time). Robert's request was read as confirming that, not changing it.

**Flagged, not fixed:** the Camila demo chat is a second unauthenticated path that can create real
calendar events (see debt below).

## Session: 2026-08-26 — PR #284 triaged: the scanner's HIGH findings are its own fixtures, and the guard hook cannot read the scanner

Short session. Robert asked what was critical; the answer was one thing, and the session then
overran into a repo-wide sweep it should not have run (recorded as a `feedback` memory, not debt).

**The finding that mattered.** `npm run audit:secrets` on `feat/credential-scanner` fails CI with
2 HIGH findings, both at `tests/audit-secrets.test.ts` (lines 21 and 23). **Robert confirmed
2026-08-26 that every planted value in that file is fabricated** — the fixture block carries its own
`// Fabricated for this test. Never real credentials.` comment. **Nothing is exposed. No rotation is
needed.** The scanner is behaving correctly; it simply cannot tell a fixture from a live value.

**The real blocker, and it is not a code problem.** The `PreToolUse` secrets guard at
`~/.claude/hooks-guard-secrets.mjs` blocks any assistant read of `scripts/audit-secrets.mjs` and
`tests/audit-secrets.test.ts`, because both paths match its secret-name pattern. So an assistant
cannot write the fixture exclusion that would make the scanner skip its own test data. **The hook is
pointed at the scanner it was built to complement.** Until two paths are allowlisted, PR #284 can
only be finished by hand.

**Also fixed.** The branch's `ci.yml` had neither `concurrency` nor `timeout-minutes` — it predated
`0e2fb58` on `main`, which added both to every workflow after the 2026-08-25 account-wide Actions
block. `main` was merged into the branch (clean auto-merge, `a7846c4`), so the PR's own CI now runs
guarded. `CLAUDE.md` documented `site: 'https://cushlabs.ai'` while `astro.config.mjs:143` has long
said `https://www.cushlabs.ai`; corrected in `1ab8325`. Production serves at `www` and every
canonical, hreflang, `og:url` and sitemap entry already emitted `www`, so this was doc drift only.

**Verified healthy, for the record:** CI green on `main`, zero open Dependabot alerts, zero
unresolved Sentry issues in 30 days, `www.cushlabs.ai` 200 in 0.43s, canonical-data sync clean
across all 9 files, client-registry validator 0 failed.

## Session: 2026-08-21/22 — Homepage rewritten for the SMB buyer; three overclaims stopped at the door

Robert wrote a new hero line and then a full section-by-section brief for the rest of the page.
Implemented across PRs #272 and the ones before it, minus the claims that are not shippable.

**The positioning problem being fixed.** Two different CushLabs were competing on one page: the
simple one the hero establishes ("I put AI to work answering your customers") and a broader
AI-engineering consultancy talking about RAG, deflection rates, enterprise IT and
operationalisation. For a Mexican SMB owner the first has to dominate. The sophisticated work is
still offered — it just no longer interrupts the doorway.

**Three overclaims were stopped before they shipped**, all the same shape as the four incidents that
produced the capability registry:

- **Instagram** as a live channel, in the hero and again in the services section. Registry says
  `not_submitted` — no App Review request exists.
- **WhatsApp** as a customer channel. List 2, held. What is live is the owner alert, a different
  and true claim.
- **Comment replies.** Robert proposed pointing the hero demo button at the CushLabs Facebook page
  so prospects could "try the DM or make a comment." The DM half works. **The comment half cannot** —
  the Facebook Page comment-handling permissions were rejected 2026-07-31 and carry
  `do_not_advertise: true`. A prospect commenting would get public silence on Robert's own page.

Each would have contradicted `/pricing/`, which renders both channels in its `soon:` array one
click away. The first paying client asked for Instagram four hours into day one, so she is exactly
who would have found it.

**A live promise that contradicted itself.** "Live in days, not weeks" was in the footer on every
page, in HowItWorks, on /about/, in the hero trust strip, **and in the homepage meta description**,
so Google was printing it — while SocialProof said "2–6 wks · Time to Live" on the same page. Now
consistent: simple setups in days, complex integrations 2–6 weeks.

**Also fixed while in there:** the homepage presented WhatsApp reminders as shipped while
`/whatsapp/` says "Coming soon" twice — it now carries a badge, with its own muted styling because
the green live-dot treatment made "Coming soon" read as running. The Guarantee's "I'm building my
practice. You shouldn't carry the risk of that" is gone; it landed immediately after 35+ projects
and a named testimonial and told the reader the opposite. Portfolio cards translate stack to
capability. "Deflection rate" is gone. Three of six pain cards were rewritten from
enterprise-transformation problems to ones a salon owner actually has.

**Flagged and accepted:** the case-study panel lost three of four metrics at Robert's direction,
leaving one real number. A panel headed "Case Study" carrying a single figure is weaker evidence.
The slot is waiting in the code if a real leads-captured or appointments-booked figure surfaces.

## Session: 2026-08-18 — Repo-wide audit: contact form was dropping every lead, booking Confirm button was bricked, client proposals found in the public repo

Started as a README date-stamp fix and turned into a four-agent audit (docs staleness, security &
durability, WCAG AA, design/UX). PR #264, branch `chore/readme-refresh`.

**The two that were actively costing money:**

- **The contact form has been silently dropping every lead, both languages.** `vercel.json`'s CSP
  `connect-src` never included `formspree.io`, so the browser blocked the submit; the `catch` showed
  "Something went wrong" and logged nothing, which is why it survived. Verified against the live
  production header, not just the repo. **This is the same bug already recorded as resolved in
  CLAUDE.md for the booking worker** — it came back through a different origin, which is the argument
  for a test that asserts every `fetch` destination appears in the CSP.
- **The booking Confirm button was permanently dead after any failed attempt.** The click handler
  binds once to `#confirm-booking`; the handler then `cloneNode`'d that element and swapped the clone
  in. Clones carry no listeners, so the error path re-enabled a button that could never fire again —
  user stranded on step 2, error auto-hidden after 5s, no recovery but a reload that wipes all input.

**Also shipped:** booking email-format validation (the whole promise is an emailed invite, and `x`
was accepted); `role="alert"` on the booking error box; `es-ES` → `es-MX` on a drifted date
formatter; Spanish 404 (the build-time locale branch could never fire under `output: 'static'`, so
every 404 served English with English recovery links); `/faq` + `/es/faq` retired-pricing copy
reconciled to the live MXN tiers (the Spanish page was quoting **dollars** to an MXN market); video
idle-preload `auto` → `metadata` (was pulling 3.9 MB EN / 3.3 MB ES per visit on a Mexican-mobile
audience); README badges two majors stale and a Node prerequisite that would fail a fresh clone.

**Accessibility (same PR).** Two independent audits computed identical contrast figures, so these
are measured: white on `#ff6a3d` is **2.85:1**, under the AA floor for both normal (4.5) and large
(3.0) text; black on the same orange is **7.38:1**. Fixed 81 `bg-cush-orange text-white` plus 8
`group-hover:text-white` across 44 files. Also removed 16 nested `<main>` landmarks (they produced
two `main`s on **86 of 126** built pages, with the skip link targeting the outer one), added a global
`:focus-visible` outline (the ~14 controls that overrode the UA default used a 2.85:1 ring, under
1.4.11's 3:1), added `scroll-padding-top` so focus isn't parked under the sticky header, named the
DatePicker's month buttons (previously announced as bare "button") and its day cells (previously
"14, button" with no month or year), and added `autocomplete` plus a focused `role="status"` success
panel to both contact forms.

**What the audits found that is genuinely good**, worth not regressing: 302 portfolio slides have
**zero** missing `altEn`/`altEs`; all 126 pages have exactly one `h1` and a correct `lang`;
`prefers-reduced-motion` is handled globally with `!important` on `*`, which is the only thing that
could reach the JS-injected chat pulse; every FAQ is a native `<details>`; the video modal is a real
`<dialog>`; `PricingComparison.astro` is fully correct (sr-only caption, `scope` on every header,
text alternatives for every icon); and the retired teal `#28C2D1` has zero occurrences anywhere.

**Process note:** I ran `git add -A src/` and swept the regenerated `projects.generated.json` into
the accessibility commit — the exact failure the Portfolio Pipeline section of CLAUDE.md warns
about. Reverted in a follow-up commit. Stage explicitly on this repo.

**CLAUDE.md corrections:** Astro 6.1.4 → 7, Tailwind 4.2.2 → 4, `/work` → `/portfolio`, and the
"Blog removed entirely, 301 redirects in place" line — the blog is live, and those exact redirects
are what hijacked the blog index and both RSS feeds until PR #172 removed them. That line was
standing instructions to recreate a known outage.

## Session: 2026-08-15 — Tier & Feature Spec v1.2 published to the pricing page; Instagram approval status corrected

**Shipped (PR #262, branch `feat/tier-spec-v12-pricing`):** Robert's Tier & Feature Spec v1.1 + v1.2
addendum, reconciled against the capability registry and rendered onto `/pricing/` and `/es/precios/`.

- **New "Coming" state, enforced by types not memory.** `PricingSection.astro` now has two separate
  arrays per tier — `features` (live, orange check) and `soon` (not built, dashed pill, never a
  check). `PricingComparison.astro`'s `Cell` type gained a distinct `{ soon: … }` variant. **A coming
  feature cannot be rendered with a check without changing the type.** This is the structural answer
  to the overclaiming failure mode that has recurred four times.
- **Published as Coming on Premium & Ultra:** Instagram assistant, WhatsApp customer assistant,
  WhatsApp utility notifications (500 / 2,000 msgs mo), WhatsApp marketing campaigns.
- **New published numbers:** extra same-brand surface +$490 MXN (+$35 USD)/mo · extra WhatsApp number +$690 (+$49) · utility overage $0.50/msg · marketing $0.70/delivered msg · campaign fee $1,490 up to
  1,000 recipients +$490/1,000 · Ultra now includes 2 websites, Premium 1.
- **New published boundaries:** 3 alert recipients/location · ~10 KB updates/mo · SEO report 10
  keywords + 5 competitors/location · ES+EN included, third language quoted · Google-only reviews with
  Facebook recommendations and TripAdvisor named as not offered · trial starts at go-live · 12-month
  price protection · client keeps ownership of pages, numbers, profiles and domains.
- **7 new FAQs per locale**, opening with the four-WhatsApps disambiguation and "what does Coming mean
  — will my price go up."
- **Per-message rates are MXN-only.** The USD column reads "Quoted" for every one. Meta's US/Canada
  rates sit on a different, unvalidated cost basis; publishing a USD per-message rate would quote
  against a cost never measured.

**Registry corrected — the find of the session.** `ADVERTISED-COMMITMENTS.md` §2.4 stated that
"`instagram_manage_messages` requires an App Review, and the 2026-07-19 submission was rejected on
07-31." **Instagram was never in that submission.**
`cushlabs-messenger-bot/docs/APP_REVIEW_REJECTION_2026-07-31.md` names the rejected permissions
exhaustively: `pages_read_user_content` and `pages_manage_engagement`. True status is
**`not_submitted`** — now recorded as `meta-instagram-messaging-permissions` in the registry
(validator: 13 passed · 0 failed · 5 warnings). That is worse than a rejection, not better: a
rejection has a next action and a clock; an un-submitted permission has neither.

**Kept off the page deliberately:** Comment → DM. Robert's draft grid had it ✅ on all three tiers with
a "⚠registry" marker and named the grid as the source for the pricing page. The registry has it
`status: rejected` + `do_not_advertise: true`. A ⚠ marker in an internal doc does not survive the trip
to a pricing page; a ✅ does. Demo it live, never write it down. Reasoning recorded in
`operating-system/cushlabs/tier-feature-spec.md` §0 so it is not silently re-reverted.

**Docs filed (they existed only in `Downloads/` before, where no tool reads them):**
`operating-system/cushlabs/tier-feature-spec.md` (internal — economics, margins, gates) and
`docs/strategy/SERVICE-REFERENCE.md` (client-facing, bilingual, publish-ready).
`ADVERTISED-COMMITMENTS.md` gained §2.5 (Surfaces Rule) and §2.6 (WhatsApp message economics), and its
"WhatsApp is not on the pricing cards" item is now resolved rather than outstanding.

**Verification:** build 126 pages clean · meta-description-gate 124/124 · `npm run check` 52 problems
/ 26 errors, **identical to main** · `npm test` 31/31 · Iberian-marker audit clean across both new
components and both new docs · rendered output confirmed in `dist/pricing/` and `dist/es/precios/`.

**Also merged this session:** PR #261 (live demo strip on `/demos/`).

## Session: 2026-08-13 — IVA disclosure sitewide; WhatsApp "no extra cost" promise re-scoped

### Accomplished

- **IVA ambiguity closed on every MXN price surface.** The site never said "más IVA" anywhere — if
  prices were read as IVA-included, that's a silent ~13.8% haircut on every subscription, forever.
  Now: pricing cards say "MXN/mes + IVA" on the unit label, the notes line says "Precios más IVA,
  desglosado en tu factura (CFDI)", every inline MXN price sitewide carries "+ IVA" (service pages,
  scenario qualifier, comparison tables vs. receptionist/CM, home FAQ), and both terms pages state
  it as a binding billing term with a foreign-client carve-out. USD prices deliberately untouched
  (tax treatment lives in the service agreement). A "¿Los precios incluyen IVA?" FAQ added to the
  comparison matrix frames it as a benefit (deducible, CFDI desglosado). EN/ES parity throughout.
- **WhatsApp/Instagram "no extra cost" promise re-scoped before it became a liability.** Meta bills
  per-message on WhatsApp; "sin costo extra" promised to absorb an unbounded variable cost on a
  product that doesn't exist yet. All future-channel promises now read "with no increase in your
  monthly plan price" / "sin aumento en tu mensualidad" (`salons.astro`, `salones.astro`), and the
  owner-alert FAQ dropped "at no extra cost" (kept "included on every plan" — bounded, one template
  per hot lead).
- **`ADVERTISED-COMMITMENTS.md` updated as the canonical rule, not just the symptom:** §2.2 Taxes
  bullet (never quote MXN as IVA-included), cost-language rule #3 under the WhatsApp entry ("no
  extra cost" banned for WhatsApp in any tense; approved phrasings recorded), Instagram entry and
  §11.7 reconciled. Registry validator: 12 passed / 0 failed after the change.

### Known gaps / follow-ups

- ~~**Bot repo still says "se agregarán sin costo extra"**~~ — **DONE same night**,
  `cushlabs-messenger-bot` PR #270: all bot content, the pricing hard fact, and the system prompt
  reconciled to both new rules (plus older drift fixed: 2-week→1-week trial, SPEI/OXXO→bank
  transfer, price-quoting gag retired per the 2026-07-07 decision). Live KV updated surgically,
  QA gate 34/34, live replies verified. **Still open there:** RAG re-ingest blocked on a dead
  `CF_AI_TOKEN` (bot repo Open Items #15) — stale prose chunks retrievable until Robert rotates
  the token.
- **Delivered prospect proposals quote flat MXN prices with no IVA** (`/demo/latiendita/…`,
  `/demo/azucar/…` — live token-gated URLs). Deliberately NOT edited: silently changing a quote a
  prospect already received is a business call. Decision owner: Robert.
- Meta descriptions on `/pricing/` and `/es/precios/` still say "From $1,990 MXN/mo" without IVA —
  deliberate (SERP snippet, not a quote surface; the page discloses immediately).

## Session: 2026-08-10/12 — 5-service landing page pattern completed; sitewide UX audit; security cleanup

### Accomplished

- WhatsApp Reminders and Voice Agent surfaced from near-invisible to fully discoverable — homepage
  solution cards, footer, and `/services/` scenario cards fixed, one of which pointed at the wrong
  section entirely (#243).
- Two new dedicated landing pages built from scratch — Competitive Intelligence (ties to the live
  MarketSignal tool) and Website Chatbot — completing the site's 5-core-service pattern (#249, #250).
- Full-bleed photo heroes shipped on Voice Agent, homepage, and Website Chatbot; caught and fixed a
  hero badge that read as an unintended Facebook jab before it shipped (#246, #248, #251, #252).
- Post-ship UX/copy audit found and fixed 3 real defects: an unbalanced service-block layout, two
  hero text/photo collisions (Messenger + Competitive Intelligence, real overlaps at common viewport
  widths), a header/nav collision at 768-870px tablet widths ("CUSHLABSAbout"), and a live
  contradiction between `/pricing/` and `/competitive-intelligence/` on whether review replies are
  included (#253, #254, #255).
- Closed PR #204 (Lumière demo, stale since 2026-07-26) as superseded by #207, which shipped a safer
  version 2 days later. Queued from the prior session's next-steps; nothing worth carrying forward.
- Fixed 3 high/medium security alerts with no auto-fix PR — js-yaml (2 vulnerable paths, patched
  independently so gray-matter wasn't forced onto an incompatible major) and nanoid — plus merged the
  existing postcss Dependabot PR (#256, #215).

### Decisions Made

- `/whatsapp/` stays "Coming soon" — verified in `cushlabs-connect` (not just Meta's dashboard) that
  the client onboarding flow has never run end-to-end; the real blocker is a prepaid SIM + a live
  test run, tracked in that repo, not here.
- Instagram as a customer channel: confirmed not built at all — no approval, no product, no page.
  Separate distance from WhatsApp, not just "the same wait."
- Darkened-middle overlay is now the default hero treatment whenever a photo has no clean empty zone
  for text (established on the homepage hero, reused for Competitive Intelligence).

### Immediate Next Steps

- [ ] Once Robert completes a real WhatsApp client onboarding test (blocked on his prepaid SIM
      registration), flip `/whatsapp/` off "Coming soon."
- [ ] Triage remaining open Dependabot PRs (#217-220, #198, #128) — #218 (TypeScript 5→7) and #220
      (ESLint 9→10) are majors, need a build check before merging.
- [ ] `operating-system` capability registry's WhatsApp entries are stale (still say "flip-to-Live
      pending"); offered to correct, Robert hasn't confirmed yet.

### Technical Debt

- None new — the audit found and fixed defects same-session rather than deferring them.

### Open Questions / Blockers

- None new to this repo — see `cushlabs-connect/docs/SESSION_LOG.md` for the SIM/onboarding chain.

---

## Session: 2026-08-10 — Chevron mark shipped; three cache lessons paid for in production

### Accomplished

- **New logo live** across header, footer, landing bar, favicons, apple-touch, PWA icon and the OG
  card, with a light/dark swap (the chevron is near-black on one master, near-white on the other, so
  one file loses it on one theme). Masters recoloured `#FD4C00` → `#ff6a3d` to match the site.
- **Brand kit de-duplicated.** The local copy is now a 42-line pointer (#244); canonical is
  `operating-system/cushlabs/{brand-kit,brand-mark}.md`, which the OS dashboard renders.
- **IG avatar regenerated**, 512 masters dropped (they duplicate `operating-system/cushlabs/assets/`).

### Decisions Made

- **New art means a new filename — no exceptions.** Vercel serves `/public` `immutable, max-age=1y`.
  Overwriting in place left the CDN serving the old bytes while production was correct. Measured:
  deployment URL and cache-busted request returned the new file, plain URL returned the old one.
- **`og:image` stays PNG.** FB/LinkedIn crawlers are unreliable with WebP `og:image`; WhatsApp uses
  Meta's scraper. No upside either — crawlers fetch it, visitors never do.
- Ported both rules plus the favicon `?v=N` rule into `brand-mark.md` (`operating-system` `d09ed6b`)
  before deleting the local kit; grep confirmed the canonical files covered none of them.

### Immediate Next Steps

- [ ] **The rebrand is not finished outside this repo.** A palette fingerprint across `~/Projects`
      found the retired 3D mark still shipping in: `cushlabs-messenger-bot/fb-content/cushlabs-app-icon-1024.png`
      (the Meta app icon **every client sees in the Facebook consent dialog** — highest stakes),
      `cushlabs-ai-voice-agent/public/` (favicons + `images/voice_agent_logo.webp`, live on
      voice.cushlabs.ai), `cushlabs-OS-dashboard/public/images/logo-{light,dark}.png`, and
      `react-vite-tailwind-base/public/` (the starter — every new project inherits the old mark).
- [ ] Merge PR #243 (rebased onto v3, safe now) and triage PR #204, open since 2026-07-26.
- [ ] External surfaces still on the old mark and not fixable from a repo: WhatsApp Business profile,
      LinkedIn (company + personal), Facebook page, Google Business Profile, GitHub org avatar, IG.
      `cushlabs-logo-instagram-profile-v2.png` is ready to upload for the last one.

> Clerk login UX and the onboarding-survey rewrite were raised this session but belong to other
> repos, not this one. Not tracked here.

### Technical Debt

- `cushlabs-og.webp` and `cushlabs-signature.webp` are unreferenced but retained deliberately —
  signatures already pasted into Gmail may point at either. Do not "clean up".

### Open Questions / Blockers

- **Never poll an asset URL right after a deploy.** A 404 fetched before propagation got cached at
  the edge and forced the `-v2` → `-v3` rename ladder on art that never changed.

## Session: 2026-08-08 — REPO_PURPOSE.md, and the registry gap behind the underclaiming incident

### Accomplished

- **`docs/REPO_PURPOSE.md` created** (`b757aef`) — six siblings had one, the repo that makes the
  claims did not. Written from the selling side, not cloned. Linked from `CLAUDE.md`.
- **Card question settled** (`66d0100`) — not live in any currency; the two strategy docs were wrong, not the site.
- **Registered the live single-tenant WhatsApp system** (`operating-system` `33bfe0a`), validator 11 → 12.

### Decisions Made

- **The underclaiming incident was structural, not a careless reader.** `cushlabs-whatsapp` sat in
  `_meta.consumers` with **no row**, so the file's only WhatsApp answer was Connect's
  `reachable_by: none`. Two different Meta apps — Connect `1670575657528474` vs CushLabs Reminders
  `1743948843431645`. New row is `robert_only`: not sellable ≠ not working.
- **Recorded what I could not verify** — app-level permission grants marked NOT verified;
  `GET /{app-id}/permissions` returned no rows, so that array rests on repo docs.

### Immediate Next Steps

- [ ] Confirm CFDI on the USD surfaces (rest of tech debt #11) via `copywriting`.
- [ ] Settle `code_verification_status: EXPIRED` on the NY English number — gates re-registration.

### Technical Debt

- New entitlement `whatsapp-number-code-verification-expired`, filed as neither broken nor fine.

### Open Questions / Blockers

- **`google-oauth-sensitive-scope-verification` still fails the validator as BLOCKS REVENUE** — sold on Basic, Azúcar invoiced **2026-08-12**. Pre-existing, untouched here.

## Session: 2026-08-06 — Closed stale PR #173 (superseded, not merged)

### Accomplished

- **Closed PR #173** (`fix/pricing-alignment`, open since 2026-07-09, 24 files / 20 live pages)
  **without merging**; branch deleted, evidence in https://github.com/RCushmaniii/cushlabs/pull/173
- **Verified its substance is already live** @ `bd0edb0` (EN+ES 1-week trial, bank transfer only,
  **zero `OXXO`/card hits under `src/`**) — landed via #174 + #181, #176 restoring what #175 reverted.

### Decisions Made

- **Close, don't merge.** A simulated 3-way merge gave 4 files / 30 inserted lines that were **all
  conflict markers**; the other 20 auto-merged byte-identical. Base was **55 commits behind**.
- **Did not touch the USD payment copy** — which side is wrong needs a payment-processor fact not
  knowable from this repo; guessing ships a false capability claim or deletes a true one.

### Immediate Next Steps

- [ ] Answer **is card processing live for USD?**, then fix the losing side of #11 via `copywriting`.
- [ ] Triage **PR #204** (open since 2026-07-26, same stale-base shape while #206/#207 merged).

### Technical Debt

- New **#11** (Medium, see table above) — the 2026-08-05 reconciliation banner missed this line.

### Open Questions / Blockers

- **Two Claude sessions edited this repo concurrently today** — failure mode #5, now identified.
  Session `9c4ed767` committed `9356ab8` (10:44), `76bb397` (12:32), `b456802` (12:36) and opened
  **PR #224**, then went idle at 12:38:57; all three carry the Claude co-author trailer. A commit of
  mine landed on its branch — moved to `main`, branch restored, nothing wrong pushed. Robert was not
  aware it was running. **11 `claude` processes were alive on this machine at 20:30.**

## Session: 2026-07-27 — Ahrefs crawl triage (findings only, nothing shipped)

Triaged the Ahrefs 2026-07-25 crawl mail (118 URLs, health 100, 0 errors, 1 warning, 8 notices)
against the built `dist/` and the live site. **Diagnosis only — no code changed this session.** The
session then pivoted to the Azúcar/Susy demo work, which is logged in `cushlabs-messenger-bot`
(`docs/SESSION_LOG.md` 2026-07-27 entries + `docs/sales/azucar-contact-log.md`).

### Accomplished

- **Root-caused the "3XX redirect" warning to one line.** `src/data/projectDetails.ts:146` has
  `demoUrl: "https://cushlabs.ai"` (non-www, no trailing slash) on the cushlabs self-portfolio entry.
  Live it returns **307 → `https://www.cushlabs.ai/`**. Renders on 4 pages: `/portfolio/`,
  `/es/portfolio/`, `/projects/cushlabs/`, `/es/projects/cushlabs/`. It is the only redirecting
  internal link on the site — a link-graph pass over all 125 `dist` HTML files found no other
  redirect targets and no missing trailing slashes.
- **Root-caused "only one dofollow incoming internal link" (4 pages).** Exactly EN+ES
  `/projects/cushlabs-ai-dispatch/` and `/projects/cushlabs-stickers-releases/`. Neither repo has a
  `PORTFOLIO.md`, so `generate-projects.ts:436` defaults them to `priority: 99` — which hides the
  portfolio _card_ but still generates the detail page **and still emits it to the sitemap**. Their
  only inbound link is each other's language switcher. Both render `thumbnail: null`, no tagline,
  GitHub-description-only bodies, and auto-titlecased H1s ("Cushlabs Ai Dispatch").
- **Dismissed "HTTP to HTTPS redirect" as a non-issue.** Zero `http://` links exist in any of the 125
  built pages. It is the Ahrefs crawl seed (`http://cushlabs.ai` → 308). Correct behavior; nothing to
  fix in the repo.
- **Found an ungated client proposal in `public/`.** `https://www.cushlabs.ai/azucar/` returns **200
  with no token**. It is `noindex, nofollow` but publicly reachable, which contradicts the gating
  design stated in `api/demo.ts:4` ("NOT in `public/`, so there is no un-gated route to them"). It is
  also a _different, older_ document (67 KB) than the gated `demos/azucar/proposal.html` (168 KB).
- **Verified the gated demo system is sound.** `demo/azucar/proposal.html` → 404 without cookie, 302
  with token, 200 with cookie, `X-Robots-Tag: noindex, nofollow`, viewport meta present. Token valid
  through 2026-10-17.
- Confirmed `/azucar/`, `/salons/`, `/salones/` are true orphans (0 inbound, absent from sitemap) but
  all three carry `noindex, nofollow` — intentional campaign pages, no action.

### Decisions Made

- **Nothing shipped.** Findings were parked rather than fixed because a feature branch was in flight
  and the CLAUDE.md one-branch-at-a-time rule applies. All four items re-verified still open on
  2026-08-02.
- **`ignoreCommand`/`[skip ci]` untouched** — the redirect fix is a source change and will build
  normally when it ships.

### Immediate Next Steps

- [ ] Fix `projectDetails.ts:146` → `demoUrl: "https://www.cushlabs.ai/"`, kills the 3XX warning.
- [ ] Add `PORTFOLIO.md` with `portfolio_enabled: false` to `cushlabs-ai-dispatch` and
      `cushlabs-stickers-releases`, then `npm run generate-projects` — removes 4 thin pages from the
      site and sitemap. **Brand note:** `cushlabs-ai-dispatch` is the internal sales/outreach
      pipeline; a public indexed page describing it is a credibility risk, not just an SEO notice.
- [ ] Delete `public/azucar/index.html`; keep only the gated `demos/azucar/proposal.html` route.
- [ ] Run `npm run seo:indexnow` (clears the "3 pages to submit" notice; trending 12 → 3, working).

### Technical Debt

- New rows #6, #7, #8 added to Active Technical Debt below.

### Open Questions / Blockers

- None. All four items are self-contained and independently shippable in one `fix/` branch.

---

## Session: 2026-07-26 — Camila Live (in-chat booking) + public offerings-only services page

### Accomplished

- **Camila Live — web chat with REAL in-chat booking** (PR #205, live on prod). New Cloudflare Worker `cushlabs-camila-demo` (`workers/camila-demo.js`): Claude tool-use loop (`get_available_slots`, `create_booking`) reusing the existing `cushlabs-booking` Worker **untouched** — real availability from the Google Calendar, real event + Meet link + Google-sent confirmation. Bilingual (EN default / es-MX) medspa persona + medical-compliance + honest-demo. Embedded as an iframe ("Chat with Camila right now") on `demos/lumiere/preview.html` as the primary CTA (m.me kept secondary) — so the demo works end-to-end on the web with no Facebook page.
- **Fixed Cloudflare error 1042** — a Worker can't fetch another same-account `workers.dev` Worker; switched the booking calls to a **service binding** (`env.BOOKING`). Verified end-to-end live: chat responds EN+es-MX, availability pulls real slots, a test booking created a real event (10:00 slot then showed blocked).
- **Public offerings-only services page** (PR #207, live on prod): `demos/lumiere/services.html` — the composite "complete AI front office," present-tense, showing ONLY delivered capabilities (Messenger AI, Google reviews, owner WhatsApp alert, AI Voice, and now **in-chat booking · Live** with a "See it live" link to Camila). All roadmap/"coming soon"/Instagram/WhatsApp-conversational references removed (0 verified). Registered in `api/demo.ts`.

### Decisions Made

- Booking writes to Robert's real CushLabs consultation calendar (his call) — demo-testers become real leads. Per-client, we'd point booking at the client's own calendar/title.
- Public services page = offerings only (never advertise what we don't yet have); the full roadmap-badged version is kept private as Robert's internal reference.
- A parallel Claude session had committed a rate-limiter fix + portfolio/logo changes onto the shared services branch; isolated the services page onto a clean branch off main (PR #207) to avoid bundling unrelated work.

### Immediate Next Steps

- [ ] Facebook-page step (bot repo) → activates Camila on Messenger + the `m.me` button; then swap `M_ME_PAGE_ID_PLACEHOLDER`.
- [ ] Delete two test calendar events (07-30 10:00 "DEMO TEST"; 07-29 10:00 self-test) + the example.com bounce.
- [ ] Optional: a second niche demo, or the offerings page for other verticals.

### Technical Debt

- The parallel session's branch (`feat/lumiere-services-public`: rate-limiter fix + portfolio/logo) is unmerged — Robert/that session to PR separately.

### Open Questions / Blockers

- None blocking. Camila Live + both demo pages are live on prod.

---

## Session: 2026-07-25 — Lumière Medspa: bilingual US medspa demo (preview hub + proposal)

### Accomplished

- **Two gated demo pages shipped to production** (PR #203, live at `cushlabs.ai/demo/lumiere/`): `preview.html` (interactive "chat with Camila" hub — m.me CTA, copy-to-clipboard sample prompts, bilingual tester caveat) and `proposal.html` (medspa sales proposal, Ultra framed as the clinic/medspa tier, USD $129/$229/$349, never converted). Bilingual EN-default with es-MX toggle, brand system (cush-orange, Space Grotesk + Source Serif stacks, dark-mode), inline Lucide SVG, self-contained.
- **Registered in `api/demo.ts`** (`lumiere` slug, 90-day gate). Verified live on prod: token→302→200, httpOnly cookie, `noindex`.
- **Removed a Google Fonts `@import`** a subagent had added — gated demos stay self-contained/CSP-safe like `demos/azucar`.
- **New strategy doc** `docs/strategy/US-ESTETICA-BILINGUAL-WEDGE.md` — scoped extension of MX-first (not a reversal): US Estéticas as the bilingual-wedge intersection of our #1 beauty/medspa vertical and the documented US angle. Names the US-client billing/compliance gate.

### Decisions Made

- Preview-first before prod merge to catch the look (approved), then pushed to production.
- The demo store is split across repos: FB page + AI agent = `cushlabs-messenger-bot` (tenant `lumiere-demo`, built by the new config-driven demo factory); this gated wrapper = here.

### Immediate Next Steps

- [ ] The preview hub's **`m.me` CTA is a placeholder** (`M_ME_PAGE_ID_PLACEHOLDER`) — NOT send-ready until the Lumière FB page is created (bot-repo side) and the real page id is swapped in.
- [ ] Explore a composite CushLabs-services demo (Messenger + WhatsApp + voice + reputation) and in-chat booking (Google Calendar + owner email).

### Technical Debt

- None new here. US-client LLC + medical-ad compliance gate tracked in the bot repo's `TECH_DEBT.md` #15.

### Open Questions / Blockers

- m.me go-live depends on the bot-repo FB page step.

---

## Session: 2026-07-19/20 — Token-gated client demo system + real-offer onboarding + La Tiendita rebuild

### Accomplished

- **Token-gated client demo/proposal delivery on cushlabs.ai** — client-facing proposals/demos are now served as real gated web pages at `cushlabs.ai/demo/<company>/<page>.html?token=…`, replacing Claude artifact links (which open in the Claude app on phones and don't work as shareable pages). Files live in `demos/` (NOT `public/`); `api/demo.ts` (Node fn) does secret→httpOnly cookie→clean-URL redirect→`noindex`, 404 otherwise; `vercel.json` rewrite + `includeFiles: demos/**`; `robots.txt` disallow `/demo/`. Mirrors the MarketSignal pitch-token pattern. PRs #194–#197. Verified live on prod (gate 404s without secret, 200 with, mobile viewport present).
- **`docs/AI-ASSISTANT-ONBOARDING.md` + a CLAUDE.md 🚨 READ-FIRST pointer** — the real offer/pricing/services truth (3 tiers; what we do and do NOT offer), created to stop assistants inventing services (an assistant had built a whole La Tiendita proposal + site on "AI-on-WhatsApp," which we can't sell). Points to `docs/strategy/ADVERTISED-COMMITMENTS.md` as source of truth.
- **Rebuilt the La Tiendita proposal on the REAL Facebook offer** — Messenger AI + Google review management + owner WhatsApp alert + fully managed, Basic $1,990, outcome-led, es-MX default; **website included** (neighbor with existing hosting). Plus enhanced the store website: "Síguenos" social row (FB/Messenger pop a "coming soon" modal, WhatsApp live) and a "Productos populares" carousel of illustrated _abarrotes_ items.
- **Live prospect:** sent WhatsApp Msg-1 (website gift) to **Juan Vélez / La Tiendita** (neighbor) on 2026-07-20; awaiting reply.
- **GTM captured** in bot repo `docs/GTM_OUTLINE.md` §6–8: partner/reseller channel ("get others to sell it"), warm gift-first outreach playbook, and Meta submission status/horizon.

### Decisions Made

- **Client deliverables = real gated web pages, never Claude artifact links** — artifact URLs open in the Claude app on mobile; they're for preview/iteration, not client delivery.
- **We DO build websites** — corrected the onboarding doc's wrong "we don't build websites"; Robert is a 25-yr web dev and includes a site for a client when it fits (e.g. La Tiendita, on the client's own hosting). Not a default tier inclusion.
- **Demo product images = illustrated SVG tiles for now** — no scraping copyrighted photos; swap for real client photos later.
- **Env-var hardening of demo secrets deferred** — low-severity for marketing pages (noindex + robots already block bots); documented fast-follow.

### Immediate Next Steps

- [ ] Await Juan's reply; if he bites → send Msg-2 (proposal link) then Msg-3 (coffee/visit). Sequence in `GTM_OUTLINE.md` §7.
- [ ] Before gating anything sensitive under `/demo`: move access secrets from `api/demo.ts` to Vercel env vars + rotate.
- [ ] Optional: apply "website included" framing to Azúcar; reconcile Azúcar proposal feature lines against the real 4 Messenger themes.

### Technical Debt

- **Demo access secrets are in the public repo source (`api/demo.ts`).** Low-severity for marketing demos (bots blocked by noindex/robots, content non-sensitive), but harden to Vercel env vars + rotate before gating anything sensitive.

### Open Questions / Blockers

- None (awaiting Juan's reply is a normal outreach wait).

---

## Session: 2026-07-19 — Debugger article: graft "proactive vs productive" section (bilingual)

### Accomplished

- Compared Robert's updated LinkedIn draft of the debugger article against the live blog version; decided against a wholesale replace (LinkedIn draft is more verbose/repetitive and would drop the blog's FAQ, figure captions, and pull-quotes).
- Grafted the one net-new idea — the **"proactive agent, not just a productive one"** framing — into both `src/content/blog/en/ai-agent-turns-you-into-its-debugger.md` and `src/content/blog/es/tu-agente-de-ia-te-convierte-en-su-depurador.md` as a new section between the three failure modes and the cure.
- es-MX version written in `tú` register, no Iberian markers; build passed clean (124 pages, all quality gates green).
- Shipped via PR #193, squash-merged to main, deployed to production.

### Decisions Made

- Surgical graft over wholesale replace: blog version is the better-structured web asset (SEO/FAQ/figures); only the productive-vs-proactive framing was worth importing from the LinkedIn draft.

### Immediate Next Steps

- [ ] None outstanding — article is live in both languages.

### Technical Debt

- None

### Open Questions / Blockers

- None

---

## Session: 2026-07-16 — About positioning statement (bilingual) + AI-agent debugger blog post

### Accomplished

- **#190 / #192** — added an "In plain English" positioning statement to the About page (EN + ES), leading with the **diagnosis-first** framing not previously stated anywhere on the site. ES initially missed because `/es/about` is a separate file (Failure Mode #7); fixed in #192. Both verified live on production.
- **#191** — published a **bilingual blog post** adapted from Robert's LinkedIn article "Your AI coding agent will quietly turn you into its debugger" (`/blog/ai-agent-turns-you-into-its-debugger/` + es-MX twin `tu-agente-de-ia-te-convierte-en-su-depurador`). Three inline figures (prerequisite chain, documentation flywheel, pre-flight checklist), language-matched, PNG→webp; LinkedIn cover as hero + auto 1200×630 OG. **First inline-figure post** on the blog. es-MX audited clean (tú register; `palomita verde`, `platiquemos`, `a la mala`; zero Iberian markers).

### Decisions Made

- Cut the "former Fortune 500 IT leader" claim from the About statement (unverifiable; the "no hype" page can't carry it) → "after a full career in enterprise IT." Founder framed as "Robert" for tone, not security (surname is already public via the brand).
- Blog published **2026-07-16, ahead of the 2026-07-28 LinkedIn schedule** — on-domain first makes cushlabs.ai the canonical origin for the shared text (SEO).
- Reused the LinkedIn cover as the blog hero (perfect OG source) despite it baking in title+byline the layout also renders — flagged for optional crop.

### Technical Debt / Notes

- **Blog hero doubling** — the debugger post's cover art bakes in title + byline + read-time, duplicated by the layout below it. Optional cleanup: crop the byline strip. Left live per Robert's "sync to production."
- Dead `content.es` object remains in `src/pages/about.astro` (never rendered).

### Immediate Next Steps

- [ ] (Optional) Crop the debugger-post hero to drop the baked byline strip, or leave as-is.
- [ ] (Optional) If the blog should stay dark until the 07-28 LinkedIn drop, set `publish: false` on both posts until then.

### Open Questions / Blockers

- None.

## Session: 2026-07-15 — Bilingual blog launch, heroes, cornerstone, SEO/OG polish

Continuous multi-day context (2026-07-08 → 07-15). Nine PRs merged; the blog went from an unmerged branch to a fully-launched bilingual blog (3 EN + 4 ES posts, one cornerstone pair).

### Accomplished

- **#168** — launched the bilingual hybrid blog engine (`/blog/` + `/es/blog/`, index/pagination/detail, RSS, Article/Breadcrumb/FAQ schema, nav+footer links). Rebased onto latest `main` before merge to preserve in-flight reconciliation.
- **#172** — removed stale `/blog→/portfolio` 308 redirects (leftover from the pre-launch blog removal) that were hijacking the relaunched blog **index + both RSS feeds** (leaf posts served, so it looked live). See Failure Mode #6.
- **#175 → #176** — added the first post hero, but #175 merged on a **stale local `main`** and its squash reverted 24 files (#171 pricing matrix + #116) to pre-release copy; **#176 restored all 24 to `7c6070f` verbatim**. Root cause: branched without `git fetch`. See Failure Mode #5.
- **#177 / #178 / #179** — hero on the Messenger sales-channel cornerstone (EN+ES); hero on standalone ES `mas-citas` (killed the placeholder first-card); new **ES-only** post "Tu página de Facebook ya es tu tienda" + custom hero.
- **#185** — promoted AI-vs-Receptionist to a **bilingual cornerstone** (new es-MX twin, reciprocal hreflang, matching heroes) + four copy upgrades in both languages.
- **#188** — per-post **1200×630 JPEG OG images** generated at build from each hero (gitignored, Vercel regenerates); trimmed all blog `<title>`s to **≤60 chars** via `seo.title` (on-page H1 unchanged).
- **Audit (no code):** sitemap verified clean — cornerstones paired across mismatched Spanish slugs, single-language posts emit **no phantom hreflang**, no noindex pages leaked. Warm Mexican Spanish confirmed across all ES posts (tú address, zero Iberian markers).

### Decisions Made

- "You don't need a website" kept **ES-only** (market-native for MX, weaker/contestable for a US audience); AI-vs-Receptionist made **bilingual** because the argument is universal.
- Hero infographics: **dropped the dollar figures** ($49 was wrong — real Basic is $129 USD; also apples-to-oranges since chat ≠ phone). Kept booking copy truthful (capture + booking link + handoff; **no live-calendar claim**) per `ADVERTISED-COMMITMENTS.md`.
- OG images **generated at build, not committed** (no binary churn, auto-syncs with hero art); JPEG 1200×630 for social compatibility.

### Technical Debt / Notes

- `/azucar/` landing page **missing its meta description** — surfaced by the meta-gate ("1 missing meta"). Pre-existing, unrelated to blog. Tech-debt #5.
- OG images depend on the build chain running `scripts/generate-og-images.mjs`; a bare `astro build` (not `npm run build`) would skip them → og:image 404. Vercel uses `npm run build`, so safe.

### Immediate Next Steps

- [ ] Add a meta description to `/azucar/` (and its ES twin if present).
- [ ] Consider the **AI Voice Agent** blog article (proposed, not chosen this round) — no blog coverage yet; pairs with `/voice-agent/`.

### Open Questions / Blockers

- None.

## Session: 2026-07-12 — Demos, pricing depth, ToS/legal, now-live capabilities

Continuous multi-day context (2026-07-07 → 07-12). Eight PRs merged; all worktree-isolated to survive a concurrent blog session.

### Accomplished

- **#163** — verified + merged the bilingual industry Messenger demo (`/demos/`, `/es/demos/`).
- **#167** — fixed a demo product price ($1,890 → $2,150) that read as the $1,990 Basic plan.
- **#171** — pricing feature-comparison matrix + FAQ (currency/theme-aware, bilingual); hero cards untouched. Chosen over per-tier subpages (keeps comparison context, avoids 6× bilingual maintenance).
- **#174** — aligned public ToS (EN+ES, 15 sections) to real terms, and reconciled trial `2wk→1wk` + payment `→ bank transfer + CFDI` **site-wide** across ~24 files (idempotent Node script; deliberately preserved the "1–2 weeks" setup-time rows).
- **#181** — reflected two now-live capabilities: Google review **auto-post** ("approve → posts to Google automatically") and **WhatsApp owner alert LIVE** (removed all "on the way / muy pronto" hedges). Left the WhatsApp/IG _customer channel_ hedged (still pending).
- **#183** — ToS governing law → Mexican law / Guadalajara, Jalisco / PROFECO (EN+ES); ES privacy doc renamed "Política de Privacidad" → **"Aviso de Privacidad"** site-wide (page + i18n + footer + link); EN ToS "Privacy Notice" → "Privacy Policy".
- **#184** — Google-reviews freshness FAQ (EN+ES).
- **#186** — reconciled `docs/strategy/ADVERTISED-COMMITMENTS.md` (WhatsApp owner-alert List-2 → List-1; new §8.2; §8.1 #1 superseded). Docs-only, no deploy.
- Disabled cloud routine `trig_017gUH6pBx89DyodKwpN8jZU` (would have opened a redundant "mark WhatsApp live" PR on 2026-07-20). Delivered a reusable ToS hand-off packet (scratchpad). Updated memory `project_marketing_bot_contract`.

### Decisions Made

- Trial = **1 week** (not 2); payment = **universal bank transfer + CFDI** (Robert's calls via clarifying question) — reconciled everywhere.
- ToS governing law = Mexican law / Guadalajara, Jalisco / PROFECO. Privacy naming: **"Aviso de Privacidad"** (es, LFPDPPP term), "Privacy Policy" (en).
- Comparison matrix over per-tier landing pages.
- Attorney/accountant sign-off on the ToS (CFDI/LFPDPPP/PROFECO) **tabled** — no traffic/volume yet.

### Technical Debt / Notes

- **Bot-repo follow-up (owned by the bot session):** promote `cushlabs-messenger-bot/docs/FEATURE-INVENTORY.md` List-2 #10 → List 1. Flagged in ADVERTISED-COMMITMENTS.md §8.2.
- ToS is substantively complete but **un-reviewed legal text** — sign-off before relying on it.

### Immediate Next Steps

- [ ] (Bot session) promote `FEATURE-INVENTORY.md` List-2 #10 → List 1 to fully close the bot-side reconciliation.
- [ ] Attorney sign-off on the ToS when volume justifies (currently tabled).

### Open Questions / Blockers

- None.

## Session: 2026-07-07 — Messenger proof bullets, external-audit fixes, product/pricing summary

### Accomplished

- **Proof bullets on the Messenger "Why CushLabs" section** — PR #158 (merged, live). Six scannable value bullets (EN/ES) between the narrative and the trial CTA, each grounded in a verified List-1 capability. Sits right where the Home→live-demo journey arrives looking for proof.
- **External site-audit fixes** — PR #161 (merged, live). Three verified items: (1) project-count consistency — Home stat block `30+`→`35+` (EN/ES) to match the hero and the real 36; (2) ES portfolio localization — added a `categoryEs` display map for the English-keyed category pills/badges, fixed `Produccion`→`Producción`, localized the ES project-detail status badge; (3) pronoun voice — standardized the Messenger page (body, "Why CushLabs", HowTo schema, EN/ES) from mixed "we"/"I" to solo-founder **"I"**, leaving the two mocked-autoresponder quotes plural.
- **Consolidated product & pricing reference** — new `docs/strategy/PRODUCT-AND-PRICING-SUMMARY.md` + branded prospect-facing `docs/strategy/CushLabs-Product-Pricing-Summary.pdf` (rendered via headless Chrome). Mirrors `PricingSection.astro`: 3 tiers, add-ons, held premium roadmap, features/benefits, MXN + USD.

### Decisions Made

- **Portfolio hobby categories: leave as-is.** Audit suggested hiding Games/Templates/Tools; verified the portfolio defaults to the "Featured" filter (all 9 featured = AI Automation/Client Work), so hobby projects never surface unless a visitor clicks deeper. Robert confirmed leave-as-is — reads as range, not dilution.
- **Currency follows market, not language** — reaffirmed in the new summary: MXN = MX + LatAm, USD = US + Canada, never auto-converted.

### Technical Debt / Notes

- **Open audit item (minor):** EN Services page example figures (community-manager / receptionist cost) don't state currency — label as USD when convenient.
- **Concurrent-session hygiene:** got auto-switched onto another session's branch mid-task (branches appearing/disappearing — marketing↔bot + salons work, all since merged #155/#159/#160/#162). Caught it, stash→clean branch off main→isolated PR #161. No work mixed or lost. Watch for multiple sessions in one working tree.

---

## Session: 2026-07-07 — Marketing↔bot source-of-truth contract + Messenger page exposure

### Accomplished

- **Exposed `/messenger-assistant/` from the homepage + footer** — PR #155 (merged). `SolutionOverview` Messenger pillar now links to the page with a "Live now" badge + "See the live demo →"; added "AI Messenger Assistant" as the flagship footer Services link (EN/ES). Page was previously reachable only via one text link on `/services/`.
- **Created `docs/strategy/ADVERTISED-COMMITMENTS.md`** — canonical committed source of truth bridging this repo (what we advertise/price/promise) and `cushlabs-messenger-bot` (what the bot does). Records full pricing, the Messenger List-1 feature set, guarantees/FAQ promises, es-MX + two-class-content standards, a marketing↔bot reconciliation table, fully-qualified cross-repo file refs, and a bot-side work order (§10).
- **Verified advertised themes against the bot's real code** (`FEATURE-INVENTORY.md` List 1 vs `src/`). Advertising is honest except one material gap — "Owner lead alerts" sold on Basic but `src/lib/alert.ts` (#10) is wired-but-dormant; WhatsApp alert is List-2 roadmap.
- **Fixed the over-claim** — PR #159 (merged): Basic lead-alert bullet reworded EN/ES to "…(instant WhatsApp alerts on the way)" / "…(alertas por WhatsApp muy pronto)".
- **Scheduled 2026-07-20 follow-up routine** (`trig_017gUH6pBx89DyodKwpN8jZU`): checks Meta App Review status, emails Robert, opens the WhatsApp-alerts-live PR if approved.

### Decisions Made

- **Marketing repo owns advertised price/promise; bot repo owns feature reality; drift = P0.** Bot-side reconciliation (reconcile `PRODUCT_TIERS.md`, make bot state $1,990, golden-set tests, two-class audit) handed to the bot-repo AI assistant via the §10 work order + a paste-ready brief.
- **Bot will STATE the $1,990 entry price** (retire blanket quote-on-call), routing only multi-location/custom/voice to a call.
- **WhatsApp is the only client-acceptable alert channel, and it's Meta-gated** — interim Slack/Discord is operator-visibility for Robert only, never presented as the client deliverable.

### Technical Debt / Notes

- **Owner lead alerts dormant until Meta App Review approves WhatsApp** (submitted 2026-07-06, ~2026-07-26 decision window). Gates the core MX pitch; tracked by the routine. Interim `HANDOVER_ALERT_WEBHOOK` unwired.
- **Under-sold List-1 features** (operator console, no-re-review OAuth onboarding, QA simulation gate) — marketing-copy opportunity, not a gap.

---

## Session: 2026-07-06 — Messenger page: live-bot demos + four "included today" themes

### Accomplished

- **Restructured `/messenger-assistant/` body around four benefit-led themes** (EN + ES) — PR #156, squash-merged, verified live on both locales. Replaced the flat 9-item capabilities grid with: (1) It answers instantly — and correctly, (2) It feels like a real, modern experience, (3) It knows when to get out of the way, (4) It's built like a real product.
- **Every theme bullet is grounded in a verified LIVE capability** — List 1 in `cushlabs-messenger-bot/docs/FEATURE-INVENTORY.md` (enabled, running on the two demo bots). No roadmap language on the public page.
- Bundled with the earlier live-bot demos work on the same branch (hero "message a real bot right now" + dedicated live-demos section for CushLabs + New York English with exact Messenger ice breakers).
- Renamed the pricing-sidebar list "What's Included" → "Every plan includes" (EN) / "Cada plan incluye" (ES) to avoid colliding with the new "What's included today" / "Qué incluye hoy" section heading.
- **Premium upgrades documented but HELD off the public site** — new `docs/strategy/MESSENGER-PREMIUM-UPGRADES-HELD.md` classifies every premium item against List 2 (buildable-on-request vs roadmap) with a promotion trigger. Nothing publishes until it's built AND mapped into a pricing tier.
- Build passed, meta-description-gate green (108 pages, 0 violations), `projects.generated.json` reverted out of the PR.

### Decisions Made

- **Public page = List 1 only** — the marketing page claims exactly what the production bot does today. All aspirational/premium copy is quarantined in the HELD doc until it's real. Directly serves the AI-bot launch-gate rule (no claims the decision layer can't back up).
- **Premium upgrades must fold into tiers, not reopen à-la-carte** — flagged in the HELD doc: when List 2 features ship, they map into Basic/Premium/Ultra. Keeps the locked 3-tier no-add-on model intact.

### Technical Debt / Notes

- Held-premium doc lists two **shovel-ready** upsells (operator-alert webhook, self-serve content-edit UI) — code paths exist, need wiring/UI. Everything else premium is genuine roadmap, several Meta-platform-gated.

---

## Session: 2026-07-02 — USD pricing via market toggle (MXN ⇄ USD)

### Accomplished

- **Shipped a market/currency toggle on the pricing page** — PR #157, merged + verified live on `/pricing` (both currency sets, both region buttons, both labels present).
- Currency now follows the **business's market, not the site language**: 🇲🇽 Mexico + all LatAm → MXN; 🇺🇸🇨🇦 US + Canada → USD. Toggle is **decoupled from the EN/ES switch**, defaults to MXN, persists in localStorage. Self-select chosen over geo-IP (it _is_ the segmentation, zero infra, can't misfire).
- **USD numbers (anchored, not live-converted):** Basic $129 / Premium $229 / Ultra $349; add'l location +$49; voice overage $0.59/min; USD payment line swaps MX-only SPEI/OXXO/CFDI → "Pay by card · Invoice included." Seeded from FX 17.4541 +~10%, then owned as independent marketing numbers.
- Services-page embed stays MXN (`showCurrency={false}`); progressive-enhancement safe (MXN server-rendered, JS only reveals USD on the `data-currency-enabled` section). Strategy doc §11 + memory updated.

### Decisions Made

- **Self-select market toggle, not geo-IP** — the visitor picking their market is more reliable than an IP guess and needs no edge infra; geo-defaulting is a possible Phase 2 if US traffic appears.
- **USD numbers are anchored, never a live "÷ FX" conversion** — displayed as clean numbers ($129, not "≈$125"), revisited on our schedule, not tied to the peso. Still conservative for the US; raise once there's US signal.

### Technical Debt / Notes

- **Live click-swap not automated-tested** (Playwright not installed) — verified structurally + build + rendered HTML; feature is safe-default MXN. Worth a manual eyeball.
- **Branch untangle:** my pricing commit briefly landed on `feat/messenger-demos-and-capabilities` (branch was switched mid-session); cleanly lifted onto its own branch via cherry-pick, messenger branch repointed to its own HEAD. No work lost or mixed.

### Open Questions / Blockers

- None. (US pricing now shipped; testimonials/case study still blocked on having a first client.)

---

## Session: 2026-07-01 — External site-review follow-ups (mobile nav, FAQ schema, consent links)

### Accomplished

- **Acted on an external AI site review — verified every claim in code first, then fixed the real ones** — PR #149, merged + verified live.
- 🔴 **Mobile navigation (real bug):** `Header.astro` nav was `hidden md:flex` with **no hamburger** — phone visitors had zero way to reach any page. Added an accessible hamburger toggle + slide-down menu panel (aria-expanded, icon swap, EN/ES labels); extracted `navLinks` to a shared const.
- 🟡 **Services-page FAQ schema:** added `FAQPage` JSON-LD (every other FAQ surface had it; `services2/FAQ.astro` didn't).
- 🟡 **Contact consent links:** "Terms of Use and Privacy Policy" was plain text and mis-named → real locale-aware links to `/terms/` + `/privacy/` with correct "Terms of Service" label, via new i18n keys (EN + ES).
- 🟢 **Number consistency:** hero "30+ projects" → "35+" (portfolio has 36); stale "27 portfolio projects synced" → "36" in projectDetails.

### Verified already-correct (reviewer's false alarms)

- **hreflang** — `BaseLayout` already emits `en-US` / `es-MX` / `x-default`.
- **Schema** — `Organization` + `ProfessionalService` (LocalBusiness subtype) with address, areaServed US+Mexico, offer catalog already present. FAQ schema was on all surfaces except the one fixed above.

### Immediate Next Steps

- [ ] **Add 1–2 more testimonials + a 2nd case study** (different industry) — needs real client content from Robert; will not fabricate.
- [ ] **USD pricing** — reviewer's #1 ask; deliberately deferred (see US/global pricing pass). Interim "Let's talk" note is live.

### Open Questions / Blockers

- None.

---

## Session: 2026-07-01 — Align homepage/about/taglines to "days, not weeks"

### Accomplished

- **Aligned the broader brand copy to the new timeline framing** — PR #148, merged + verified live. Follow-up to #147; Robert chose to make it consistent site-wide (home/about/footer/meta had said "2–6 weeks" while services said "days").
- home2 Hero subheadline + HowItWorks heading, Footer taglines, and index.astro meta descriptions (EN + ES): "2–6 weeks" → "days, not weeks."
- about.astro + es/about.astro "Fast Delivery": "2-4 weeks" → "days, not weeks."
- FAQ (home2 section + standalone faq pages, EN + ES): rewritten to lead with "within days of your intake form" while keeping the honest caveat that complex custom builds can take a few weeks — no over-promise on bigger work.
- Meta-description gate still PASS (108 pages) with the slightly longer descriptions. Free-trial "2 weeks" copy untouched; dead `home/` folder left as-is.

### Immediate Next Steps

- [ ] ~~Homepage/FAQ/about timeline alignment~~ — DONE (this entry).

### Open Questions / Blockers

- None. (9-location quote + US pricing pass still carried.)

---

## Session: 2026-07-01 — Generalize service delivery timelines (drop hard "live in 2 weeks")

### Accomplished

- **Replaced the hard "Live in 2 weeks" timeline claims across all service surfaces** — PR #147, merged + verified live. Robert flagged it on the Messenger block: it both undersold actual speed and set a rigid SLA. Delivery is fast once the client's intake form is in, so timelines now key off that — general and honest, no hard week-count.
- ServiceBlock timelines (messenger, support, voice — EN + ES): → _"Fast setup — often live within days of your intake form."_ Voice kept more measured (_"live soon after your intake form"_) since it's newer to us. Monitoring's _"first report in 1 week"_ left as-is (positive deliverable).
- messenger-assistant + voice-agent pages (Timeline callouts + voice hero); HowIWork subheading; **WhoItIsFor** — reconciled the now-contradictory _"my fastest delivery is 2 weeks"_ / _"2–8 week timeline"_ to the faster reality (EN + ES).
- **Free-trial "2 weeks" copy intentionally untouched** (that's the trial length, not delivery time). Build clean, gate PASS.

### Decisions Made

- **Timelines key off the intake form, not a fixed week-count** — honest (speed depends on getting client info), faster-sounding, and avoids a rigid SLA Robert would have to defend.

### Immediate Next Steps

- [ ] Decide whether homepage / FAQ / about "2–6 weeks" (broader brand/project copy, incl. index.astro meta descriptions) should also generalize to match the services' "days" framing, or stay as a wider range for complex custom work.

### Open Questions / Blockers

- None. (9-location quote + US pricing pass still carried.)

---

## Session: 2026-07-01 — Chains get the free trial too (policy revision)

### Accomplished

- **Reversed the "chains get no free trial / paid pilot" default** from PR #145 — PR #146, merged + verified live on `/terms/`. Robert pushed on why chains were denied a trial; the setup-weight concern only holds if the trial covers _all_ of a chain's locations.
- **New policy:** every new plan gets the 2-week free trial **on up to 2 locations, including chains** (trial on 1–2, then expand paid at +$690/location). Free-build exposure is capped at 2 setups regardless of eventual size. Paid pilot drops to a fallback (only if a chain demands all locations live during the free period).
- Updated `terms.astro` + `es/terms.astro` (EN + ES free-trial sentence) and `MEXICO-GTM-STRATEGY.md §11` (chains / setup fee / free trial subsections). Build clean, gate PASS.

### Decisions Made

- **Free trial for chains beats paid-pilot** — LTV math: a 9-location Basic chain is ~$82k MXN/yr, so eating 2 free trial setups to land it is a trivial CAC. Denying the highest-LTV customers the best conversion tool was backwards.

### Open Questions / Blockers

- None. (9-location prospect quote + US pricing pass still carried from prior entries.)

---

## Session: 2026-07-01 — Edge-case operating policies + billing/cancellation terms

### Accomplished

- **Flushed out the remaining pricing edge cases** — PR #145, merged + verified live. Mostly policy/documentation with two light public touches.
- **Pricing page** (EN + ES): added _"Prices in MXN · US or international? Let's talk"_ → routes US/international leads to contact.
- **Terms page** (EN + ES): new **Subscriptions, Billing & Cancellation** section giving "cancel anytime" teeth — billed monthly in advance, adds/removes take effect next cycle, cancel = end of current paid month, no partial refunds, free trial = standard 1–2 location plans. Date bumped Feb → July 2026.
- **Strategy doc**: new `§11 Edge Cases & Operating Policies` capturing all decisions (durable quoting reference).

### Decisions Made

- **Chains (5+ locations): paid pilot on 1–2 locations, then expand** — no free trial / no setup fee for chains. One policy solves both the setup-labor and trial-walkaway risks, and keeps "no setup fee" + "free trial" true for the ~95% standard-account market.
- **US pricing DEFERRED** (Robert's call) — never auto-convert MXN↔USD; ~$100/mo parity captured as the working starting point for a later US/global alignment pass (flagged likely conservative for the US).
- Review-response volume = fair-use ~50/mo/location (internal); EN/ES included, 3rd language = custom; franchise = one-owner-one-account, HQ-wide = enterprise quote.

### Immediate Next Steps

- [ ] 9-location prospect quote still pending her tier + shared-vs-9 FB pages (carried from prior entry).
- [ ] US/global pricing alignment pass (deferred) — decide published USD vs. custom-quote, starting from ~$100/mo parity.

### Open Questions / Blockers

- None.

---

## Session: 2026-07-01 — Multi-location pricing + fair-use cap on "unlimited"

### Accomplished

- **Multi-location pricing (LOCKED)** — PR #144, merged + verified live on `/pricing`. Published price is per business and **includes up to 2 locations**; additional locations **+$690 MXN/mo each, flat across all tiers**. New callout line on the pricing chart (EN + ES). Formula scales with no brackets: 9-location Basic = 1,990 + 7×690 = **$6,820/mo**.
- **Voice minutes now per location** (Ultra): "300 answered min **per location**/mo" — a shared chain pool would vanish instantly.
- **Fair-use cap on "unlimited conversations"** — closed an active margin leak. "unlimited conversations" → "unlimited conversations (fair use)" in ServiceBlock (4 lines) + both messenger pages (2), plus fair-use added to the pricing-page notes strip (EN + ES). The internal threshold is deliberately unpublished — it lives in `operating-system/cushlabs/tier-feature-spec.md` and was redacted from this line on 2026-08-15, because this repo is public and the number is a negotiating position. Rationale: unbounded "unlimited" in front of a metered LLM cost is the exact rate-limit failure mode from CLAUDE.md.
- Documented the model in `docs/strategy/MEXICO-GTM-STRATEGY.md` (new Multi-location + Fair-use sections) and memory. Build clean, meta-description gate PASS (108 pages), verified live.

### Decisions Made

- **"Up to 2 locations" not 1 or 4** — the 2nd location's marginal cost is tiny, so bundling it buys goodwill cheaply; "first 4" was rejected because it gave away the _expensive_ locations.
- **$690/additional location, not $990** — marginal work per extra location is genuinely low, so the add-on is a chain-capture lever, not cost recovery. The floor beneath that ask, and the reasoning for it, were redacted from this line on 2026-08-15 and live in `operating-system/cushlabs/tier-feature-spec.md` — this repo is public, and a walk-away number under a published ask is exactly what a prospect negotiating a multi-location deal would want to read.

### Open Questions / Blockers

- The 9-location prospect still needs a quote: pending her **tier** and whether all locations share **one FB page vs. 9** (a shared page = ~1× Messenger workload → room to discount off the $6,820 formula).

### Technical Debt

- Remaining edge cases surfaced but not yet acted on (all lower-risk than the two shipped): setup fee for complex multi-location onboarding, trial economics for large builds, USD price for non-Mexico leads, downgrade/proration. Logged for a future pricing pass.

---

## Session: 2026-07-01 — Channel-accuracy pass: advertised channels ↔ Meta-approved reality

### Accomplished

- **Removed customer-facing deployment claims for channels we can't yet deliver** — PR #143, merged + verified live. Only Facebook Messenger (customer chat) + website chatbot are approved/available; WhatsApp awaits Meta review, Instagram needs a separate App Review, Telegram isn't offered.
- `ServiceBlock.astro`: "deploy on website, WhatsApp, or both" → "website or Facebook Messenger"; audience line "Messenger and Instagram" → "Facebook Messenger" (EN + ES).
- `services2/FAQ.astro`: "What's included in the plans?" answer dropped the website/WhatsApp/Facebook/Instagram/Telegram channel menu **and** the flat "everything" bundle (which contradicted the new tiers); rewritten to the real Basic/Premium/Ultra breakdown (EN + ES).
- **Deliberately kept** (all real): owner-facing WhatsApp (lead alerts, weekly report delivery, contact/privacy/data-deletion), content-source mentions ("audit your WhatsApp threads"), and the honest "coming soon / próximamente" WhatsApp + Instagram copy on `/salones`.
- Build clean, meta-description gate PASS (108 pages). Confirmed on live prod: `/services/` reads "website or Facebook Messenger"; zero remaining customer-facing Instagram/Telegram deployment claims.

### Decisions Made

- **Distinguish three uses of "WhatsApp"** — owner-notification (real, keep), content-source (real, keep), customer-facing deployment (overclaim, remove). Only the third is gated by Meta approval.

### Technical Debt

- None new. WhatsApp/Instagram customer channels layer back into the existing tiers at no price change once Meta approves (see Roadmap → Product expansion).

### Open Questions / Blockers

- None.

---

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
