# Booking confirmations — email, WhatsApp, and the morning summary

Shipped 2026-09-29/30 after a consultation no-show with no warning. Covers every free consultation
booked on **cushlabs.ai** (`/consultation/`, `/es/reservar/`) and **nyenglishteacher.com**
(`/en/book`, `/es/reservar`).

## What the booker experiences

| When | What happens |
| --- | --- |
| Books | Google Calendar invite with a Meet link (unchanged). Optional checkbox: "Send me a reminder on WhatsApp the day before." |
| 2–26 h before | **Email** "Please confirm your consultation", in the language they booked in. If they ticked the checkbox and gave a phone: **WhatsApp** reminder too. |
| Taps **Confirm** (email or WhatsApp) | A page with one button; pressing it confirms. Robert's calendar entry gets a ✅ at the start of its title. |
| Taps **Cancel or reschedule** | A page with one button; pressing it deletes the calendar event (the slot reopens, Google emails the booker the cancellation) and shows a link to book another time. |

Robert gets **one WhatsApp at 08:00 (Mexico City)** listing the day's consultations on both sites:
`10:00 AM Diego (NYE) ⏳ · 1:30 PM Ana (CushLabs) ✅` — ✅ confirmed, ⏳ not confirmed yet, ❌ cancelled.
Nothing is sent on a day with no consultations.

## How it fits together

```
booking form ──POST /book──▶ booking Worker ──▶ Google Calendar event
                                  │
                                  └─▶ D1 `bookings` row (random 32-hex token, phone, opt-in)

cron every 30 min (each booking Worker)
  ├─ email:    Brevo API ─────────────────────────────▶ booker
  ├─ WhatsApp: WA_GATEWAY service binding ─▶ cushlabs-whatsapp ─▶ Meta ─▶ booker
  └─ 08:00:    cushlabs-booking reads its rows + ny-eng's (PEER_BOOKING binding,
               /internal/todays-bookings) ─▶ cushlabs-whatsapp ─▶ Robert

/confirm?t=TOKEN  /cancel?t=TOKEN   (served by the booking Worker that owns the booking)
```

| Piece | Where |
| --- | --- |
| Shared logic (identical copy in both repos — keep them the same) | `cushlabs/workers/lib/booking-confirm.js` · `ny-eng/lib/booking-confirm.js` |
| cushlabs.ai booking Worker (`cushlabs-booking`) | `cushlabs/workers/booking-worker.js`, `cushlabs/wrangler.toml` |
| nyenglishteacher.com booking Worker (`plain-mode-42c4`) | `ny-eng/cloudflare-worker.js`; config in `ny-eng/wrangler.toml` (gitignored — see `wrangler.toml.example`) |
| Booking forms (checkbox + phone) | `src/components/booking/BookingFormSteps.astro` in each site; cushlabs strings in `src/i18n/translations/{en,es}.ts` |
| WhatsApp gateway | `cushlabs-whatsapp` — `POST /api/test-send-template` with `buttonParams` |
| Meta templates | `cushlabs-whatsapp/scripts/create-consultation-templates.mjs` |
| Tests | `cushlabs/tests/booking-confirm.test.ts` (17), `cushlabs-whatsapp/src/__tests__/url-buttons.test.ts` |

## Design decisions (and why)

- **Two-step confirm/cancel (GET shows a button, POST acts).** Mail providers and corporate link
  scanners open every link in an email. A link that acted on GET would confirm or cancel meetings
  nobody clicked.
- **WhatsApp buttons are URL buttons, not quick replies.** They open the same `/confirm` and `/cancel`
  pages as the email, so there is one code path. Quick replies would need inbound handling, which the
  CushLabs WhatsApp number deliberately does not have, and a booker is not a row in cushlabs-whatsapp's
  `students` table, so a tap would have nothing to match.
- **Explicit WhatsApp opt-in, unchecked by default.** Meta requires opt-in before a business-initiated
  message. No phone → no WhatsApp, whatever the checkbox says.
- **Email through Brevo**, the service both domains are authenticated with (SPF + DKIM).
- **Nothing here can break a booking.** Recording the row is best-effort; a failed email or WhatsApp
  send is retried on the next cron tick until the meeting is inside the 2-hour floor.

## Configuration

Per Worker. **Vars** live in `wrangler.toml`; **secrets** are set with `npx wrangler secret put NAME`
from the repo folder and are never committed.

| Name | Kind | cushlabs-booking | plain-mode-42c4 (ny-eng) |
| --- | --- | --- | --- |
| `BREVO_API_KEY` | secret | Brevo v3 API key (`xkeysib-…`) | same |
| `CONFIRM_FROM_EMAIL` | var | `info@cushlabs.ai` | `robert@nyenglishteacher.com` |
| `CONFIRM_BRAND` | var | `CushLabs.ai` | `NY English Teacher` |
| `PUBLIC_WORKER_URL` | var | its workers.dev URL (links in emails) | same |
| `REBOOK_URL` / `REBOOK_URL_ES` | var | booking pages | booking pages |
| `WA_GATEWAY` | service binding | → `cushlabs-whatsapp` | → `cushlabs-whatsapp` |
| `WA_GATEWAY_URL` | var | cushlabs-whatsapp URL (fallback / tests) | same |
| `WA_GATEWAY_SECRET` | secret | = cushlabs-whatsapp `TEST_SEND_SECRET` | same |
| `WA_SENDER` | var | `cushlabs` (CushLabs number) | `nye` (NY English number) |
| `OPERATOR_WA` | secret | Robert's WhatsApp number | same (unused while summary is off) |
| `SUMMARY_SECRET` | secret | same random value on both Workers | same |
| `PEER_BOOKING` | service binding | → `plain-mode-42c4` | — |
| `SUMMARY_LABEL` / `PEER_LABEL` / `SUMMARY_SITES` | var | `CushLabs` / `NYE` / site names | — |
| `DAILY_SUMMARY` | var | — (sends the summary) | `off` |

A missing email var disables sending and the cron log says which one. Missing WhatsApp vars skip
WhatsApp only.

## Meta templates

All `UTILITY`, all approved 2026-09-30.

| Template | WABA / sender | Languages | Notes |
| --- | --- | --- | --- |
| `consultation_reminder` | NY English (`nye`) | es_MX, en_US | URL buttons → `plain-mode-42c4` `/confirm`, `/cancel` |
| `consultation_reminder` | CushLabs (`cushlabs`) | es_MX, en_US | URL buttons → `cushlabs-booking` `/confirm`, `/cancel` |
| `consultation_daily_summary` | CushLabs | en_US | Robert's 08:00 list |

A URL button's base address is fixed inside the approved template. **If a booking Worker's URL
changes, the template must be re-submitted** (new name) and approved again.

Check status: `node --env-file=.dev.vars scripts/create-consultation-templates.mjs --status` (in
`cushlabs-whatsapp`).

## Operating it

- **Deploy** (manual, from each repo): `npx wrangler deploy`. Both Worker deploys also re-register the
  cron. Deploy `plain-mode-42c4` before `cushlabs-booking` when the internal endpoint changes.
- **See what's stored:**
  `npx wrangler d1 execute ny-eng-booking --remote --command "SELECT substr(token,1,6), name, starts_at, status, asked_at, wa_sent_at FROM bookings ORDER BY starts_at DESC LIMIT 20"`
  (use `cushlabs-booking` for the other site).
- **Watch a cron run live:** `npx wrangler tail <worker-name> --format pretty` and wait for `:00` / `:30`.
  Lines to look for: `confirmations: {...}` and `daily summary: {...}`.
- **Test end to end:** book a slot 2–26 h ahead with a `+test` Gmail address and your phone, ticking
  the WhatsApp box. Wait one cron tick, then delete the test via its Cancel link.

## Gotchas learned the hard way

1. **Brevo "Authorised IPs" must stay OFF.** Workers have no fixed IP; with the block on, every send
   returns `401 unrecognised IP address`. (Brevo → Security → Authorised IPs.)
2. **The Brevo key in `.env` named `BREVO_SMTP_KEY` is SMTP-only** (`xsmtpsib-…`) and is rejected by
   the API. The Workers need a v3 API key (`xkeysib-…`).
3. **A Worker cannot `fetch()` another `*.workers.dev` Worker on the same account** — Cloudflare
   returns error 1042. That is why the gateway and peer calls use service bindings.
4. **`ny-eng/wrangler.toml` is gitignored.** It was rebuilt on 2026-09-29 from the live Worker's
   settings. Deploying from a stale copy would overwrite live vars.
5. **Meta rejects newlines in template parameters**, so the morning summary is one line separated by
   `·`.
6. **Rotating `TEST_SEND_SECRET`** in cushlabs-whatsapp breaks WhatsApp here until `WA_GATEWAY_SECRET` is
   updated on both booking Workers.

## Cost

Brevo free plan: 300 emails/day. WhatsApp utility templates are billed per message by Meta from
2026-10-01 (a few US cents each); one reminder per opted-in booker plus one summary per day.
