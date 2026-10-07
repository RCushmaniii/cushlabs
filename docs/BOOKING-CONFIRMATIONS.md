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
`10:00 AM CDMX / 12:00 PM EDT Diego (NYE) ⏳ · 1:30 PM CDMX / 3:30 PM EDT Ana (CushLabs) ✅` — ✅
confirmed, ⏳ not confirmed yet, ❌ cancelled. Nothing is sent on a day with no consultations.

### Time zones (added 2026-10-02)

Robert splits his time between Mexico City and the US East Coast, and a booking once looked like the
wrong time. Every time he or a booker reads is now on the right clock:

| Who reads it | What they see |
| --- | --- |
| Robert, 08:00 WhatsApp | Each consultation on **both** clocks: `CDMX / EDT` (or `EST` in US winter). Second clock = `OPERATOR_SECOND_TZ`, default `America/New_York`. |
| Robert, calendar event | First line of the description: `When: 10:00 AM CDMX · 12:00 PM EDT · booker: 9:00 AM PDT (America/Los_Angeles)`. |
| Booker, form + reminders | Their own clock first, Mexico City alongside: "Monday, October 5 at 12:00 PM (your time; 10:00 AM Mexico City time)". The form sends the browser's zone as `timeZone`; it is stored in `bookings.booker_tz`. |

Daylight saving is never hardcoded: every conversion asks `Intl` for the offset at that instant.
Mexico City itself has had no DST since 2022, so the slot grid stays a fixed UTC−6.

**The one thing code cannot fix:** Google Calendar shows events in the zone set on Robert's
calendar, which is `America/Mexico_City`. When he is in the US, the app keeps showing Mexico City
times unless *Settings → General → Time zone* has "Ask to update my primary time zone to current
location" turned on (or he switches it by hand). The `When:` line exists so the event is right
either way.

## Booking on WhatsApp (added 2026-10-06)

Both businesses can also be booked without the web form. A message like "Quiero agendar una
consulta" to the CushLabs number (+1 307 284 2785) or the NY English number (+1 585 565 6180) gets a
WhatsApp Flow (day → time → details) from cushlabs-whatsapp, which books through **this same
booking Worker** over a service binding (`CUSHLABS_BOOKING` / `NYE_BOOKING`, hostname `booking`,
`channel: "whatsapp"`: email optional, rate-limited per phone, event marked "Reservado por
WhatsApp"). The booking then gets the same reminders, confirm/cancel links and 08:00 summary as a
web booking. The cushlabs.ai and nyenglishteacher.com booking pages link to it ("Agendar por
WhatsApp"). Design and setup: `cushlabs-whatsapp/docs/BOOKING-FLOW.md`.

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
  pages as the email, so there is one code path. Quick replies would need inbound matching, and a
  booker is not a row in cushlabs-whatsapp's `students` table, so a tap would have nothing to match.
  (Since 2026-10-06 the CushLabs number DOES deliver inbound to cushlabs-whatsapp — only to answer
  booking requests with the WhatsApp booking Flow; see "Booking on WhatsApp" below.)
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
| `OPERATOR_SECOND_TZ` | var, optional | default `America/New_York` (second clock in the summary + event) | not used |
| `MIN_NOTICE_HOURS` / `BUFFER_MINUTES` | var, optional | defaults `12` / `15` (cushlabs-booking slot rules) | not used |
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
