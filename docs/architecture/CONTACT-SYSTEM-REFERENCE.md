# Contact & Booking System — Architecture Reference

> **Purpose:** Complete inventory and lessons learned from the CushLabs.ai contact/booking system.
> Designed as a blueprint for AI developer assistants building similar systems in new repos.

---

## File Inventory

### Pages

| File | Route (EN / ES) | Purpose |
|------|-----------------|---------|
| `src/pages/contact.astro` | `/contact` | Contact page — hero, Formspree form, email/WhatsApp sidebar |
| `src/pages/es/contact.astro` | `/es/contact` | ES contact — imports and re-renders the EN page (locale auto-detected) |
| `src/pages/consultation.astro` | `/consultation` | Consultation booking page — multi-step wizard with calendar embed |
| `src/pages/es/reservar.astro` | `/es/reservar` | ES consultation — imports and re-renders the EN page |

### Components

| File | Purpose |
|------|---------|
| `src/components/ConsultationBookingFlow.astro` | 4-step booking wizard (duration → info → notes → calendar embed) |
| `src/components/booking/BookingFormSteps.astro` | Alternative booking flow with custom date picker, time slots, details form, and success confirmation |
| `src/components/booking/DatePicker.astro` | Calendar date picker used by BookingFormSteps |

### Client-Side Scripts

| File | Purpose |
|------|---------|
| `src/scripts/bookingFlow.ts` | JS logic for ConsultationBookingFlow — step navigation, duration selection, Calendly/Cal.com iframe rendering, intake POST |

### API / Server

| File | Purpose |
|------|---------|
| `api/consultation-intake.ts` | Vercel Edge Function — receives consultation intake form data (designed to forward to email/Slack/CRM) |
| `src/config/api.ts` | Centralized `API_BASE` config for booking system (reads `PUBLIC_BOOKING_API_URL` env var) |

### Translations (i18n)

| File | Sections | Purpose |
|------|----------|---------|
| `src/i18n/translations/en.ts` | `contact`, `consultation`, `booking` | All EN strings for forms, wizards, and booking flows |
| `src/i18n/translations/es.ts` | `contact`, `consultation`, `booking` | All ES strings — mirrors EN structure exactly |

### Navigation References

| File | Links To |
|------|----------|
| `src/components/Header.astro` | `/contact` (EN), `/es/contact` (ES) in main nav |
| `src/components/Footer.astro` | `/contact`, `/consultation` (EN) and `/es/contact`, `/es/reservar` (ES) |

### Static Assets

| File | Purpose |
|------|---------|
| `public/images/hero/contact-hero.jpg` | Background hero image for the contact page |

### Documentation

| File | Purpose |
|------|---------|
| `docs/features/BOOKING-SYSTEM.md` | Full booking system architecture, API schema, database design, deployment guide |

### Environment Variables

| Variable | Where Used | Purpose |
|----------|-----------|---------|
| `PUBLIC_CONSULTATION_URL` | ConsultationBookingFlow | Default Calendly/Cal.com embed URL |
| `PUBLIC_CONSULTATION_URL_30` | ConsultationBookingFlow | 30-min slot calendar URL |
| `PUBLIC_CONSULTATION_URL_60` | ConsultationBookingFlow | 60-min slot calendar URL |
| `PUBLIC_WHATSAPP_NUMBER` | ConsultationBookingFlow | WhatsApp link in booking fallback |
| `PUBLIC_BOOKING_API_URL` | `src/config/api.ts` → BookingFormSteps | Cloudflare Worker base URL for slot fetching and booking |

---

## Lessons Learned & Best Practices

### 1. Bilingual Page Reuse Pattern

Spanish pages import and re-render the English source page. The locale is auto-detected via `Astro.currentLocale`. This is the correct pattern:

```astro
---
// src/pages/es/contact.astro
import ContactPage from "../contact.astro";
---
<ContactPage />
```

**Why:** One source of truth for UI logic. Translation mismatches become impossible. All text comes from `t(locale)` dictionary lookups.

**Rule: "There is no such thing as fixing just the English side."** Every page, form, error message, and success state must exist in both languages.

### 2. Translation Architecture

All user-facing strings live in `src/i18n/translations/{en,es}.ts` with matching key structures. The contact system uses three translation sections: `contact`, `consultation`, and `booking`.

When building a new repo:
- Define the translation structure in EN first
- Mirror it identically in ES
- Use the `t(locale)` helper in every component
- Include form labels, placeholders, validation errors, success messages, and hint text — anything a user reads

### 3. Anti-Scraper Email Obfuscation

The contact page splits the email address into `data-u` and `data-d` attributes and assembles them client-side with JavaScript:

```astro
<a id="email-btn" href="mailto:" data-u={emailUser} data-d={emailDomain} data-s={encodedSubject}>
```

```javascript
const addr = btn.dataset.u + '@' + btn.dataset.d;
btn.href = 'mailto:' + addr + '?subject=' + btn.dataset.s;
```

This defeats email-harvesting bots while keeping the address functional for real users. Replicate this pattern on any public-facing contact page.

### 4. Multi-Channel Contact Strategy

The system provides four contact channels, each with locale-aware pre-filled text:

| Channel | Where | Why |
|---------|-------|-----|
| **Form** | Contact page | Async, low friction, works for everyone |
| **WhatsApp** | Contact + consultation pages | Preferred in Mexico/Latin America, instant |
| **Email** | Contact + consultation pages | Professional fallback |
| **Calendar embed** | Consultation page | For prospects ready to talk now |

Each channel has locale-specific defaults (WhatsApp message text, email subject line). Always offer at least two channels.

### 5. Form Submission: Formspree for Simple, Edge Functions for Complex

The contact form POSTs to Formspree (`https://formspree.io/f/...`) — no backend needed. The consultation intake uses a Vercel Edge Function (`api/consultation-intake.ts`).

When building a new repo:
- Use Formspree/Formspark for simple contact forms (zero backend)
- Use edge functions only when you need to process/forward data server-side
- Always include `_replyto`, `_subject`, and `_language` fields for proper email routing

### 6. Technical Debt: Two Booking Systems

This repo contains two parallel booking flows:

| System | Files | Approach |
|--------|-------|----------|
| Calendar embed | `ConsultationBookingFlow.astro` + `bookingFlow.ts` | 4-step wizard that embeds Calendly/Cal.com iframe |
| Custom booking | `BookingFormSteps.astro` + `DatePicker.astro` | Custom date/time picker calling a Cloudflare Worker API |

**In a new repo, pick one approach and commit to it.** The custom system is more flexible but requires a backend. The calendar embed is zero-maintenance but less integrated.

### 7. Progressive Enhancement and Fallbacks

Both booking flows have fallback paths:
- If no calendar URL is configured → users see "Open in new tab" / WhatsApp / Email options
- If the booking API fails → error message directs users to WhatsApp as backup

**Always design forms with a fallback contact method visible.**

### 8. Form UX Patterns Worth Replicating

- **Loading spinner on submit button** with `disabled` state prevents double-submission
- **Success state replaces the form** entirely (not just a toast) — makes completion unambiguous
- **Consent checkbox required** before submission (privacy compliance, links to Terms/Privacy)
- **Error messages are locale-aware** and displayed inline, not in browser alert boxes
- **Phone field is optional** with a hint about country codes — respects user preference
- **Auto-advance on selection** — time slot click auto-advances to next step after 300ms delay

### 9. Consultation Page Layout Structure

Proven layout for a booking/consultation page:

```
┌─────────────────────────────────────────┐
│  HERO: kicker badge, headline,          │
│        subheadline, dual CTAs,          │
│        3 detail cards (length,          │
│        format, timezone)                │
├────────────────────┬────────────────────┤
│  BOOKING FLOW      │  SIDEBAR (sticky)  │
│  (main column)     │  "What to expect"  │
│  Multi-step wizard │  + detail cards    │
│                    │  + privacy note    │
├────────────────────┴────────────────────┤
│  INFO CARDS: "What we'll cover"         │
│              "After the call"           │
└─────────────────────────────────────────┘
```

The "What we'll cover" and "After the call" cards set expectations and reduce no-shows.

### 10. URL Strategy for Bilingual Routes

| Rule | Example |
|------|---------|
| Default locale has no prefix | `/contact`, `/consultation` |
| Non-default locale gets a prefix folder | `/es/contact`, `/es/reservar` |
| Localized route names are acceptable for key pages | `reservar` instead of `consultation` |
| Cross-link between contact and consultation in both directions | Contact sidebar → "Book a free call" → Consultation page |

### 11. Edge Function Design Pattern

`api/consultation-intake.ts` demonstrates the correct pattern:

```typescript
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { ok: false, error: "Method Not Allowed" });

  let body: unknown;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: "Invalid JSON" }); }

  // Forward to email/Slack/CRM — secrets stay server-side via env vars
  return json(200, { ok: true, received: body });
}
```

Key principles:
- Validate HTTP method (405 for non-POST)
- Parse JSON with try/catch (400 for invalid)
- Return structured `{ ok: boolean }` responses
- Keep secrets server-side via platform env vars (Vercel, Cloudflare)

### 12. Component Prop Pattern

All locale-aware components accept a typed `locale` prop:

```astro
---
interface Props {
  locale: 'en' | 'es';
}
const { locale } = Astro.props;
const dict = t(locale);
---
```

Never have a component internally detect locale. Always pass it as a prop for portability and testability.

---

## Quick Reference: What to Build First in a New Repo

1. **Translation files** with `contact` and `consultation` sections (EN + ES)
2. **Contact page** with form (Formspree), email (obfuscated), and WhatsApp
3. **Consultation page** with booking flow (pick one system, not two)
4. **Edge function** for form intake if you need server-side processing
5. **Header/Footer nav links** in both languages
6. **Hero image** for the contact page
7. **Fallback paths** for every form and booking flow
