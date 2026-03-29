# CushLabs Outreach Workflow — Chrome Extension Prospecting System

## Overview

This documents the repeatable workflow for using the Claude Chrome Extension to find prospects, store them, and convert them into outreach actions.

---

## The Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│  PROSPECT   │ →  │   VERIFY     │ →  │   SEND       │ →  │  FOLLOW UP  │ →  │  CLOSE   │
│  (Chrome)   │    │  (LinkedIn)  │    │  (Email)     │    │  (Day 3-5)  │    │  (Call)  │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘    └──────────┘
```

### Step 1: Prospect (Chrome Extension)
- Open Google/LinkedIn/directory in Chrome
- Paste the relevant brief from `docs/dispatch/` into the extension
- Let it search, visit sites, compile prospects
- Results appear in the chat — copy them out

### Step 2: Store (This Repo)
- Save prospect batches to `docs/dispatch/prospects/YYYY-MM-DD-source.md`
- Each prospect gets: company, contact, service fit, priority, draft email, action items
- Batch files are the single source of truth — don't scatter leads across tools until you have a CRM

### Step 3: Verify Contacts
- Search LinkedIn for each named contact — confirm they're still at the company
- Use Hunter.io, Apollo.io, or Google to verify/find email addresses
- Update the prospect file with verified emails
- Check the boxes in the action items

### Step 4: Send Outreach
- Send from your personal email (robert@cushlabs.ai or equivalent)
- **Stagger sends** — one per day max from a new domain to build sender reputation
- Personalize each email before sending (the drafts are starting points)
- Log send date in the prospect file

### Step 5: Follow Up
- If no response after 3-4 business days, send a brief follow-up
- Follow-up should add new value (not just "checking in")
- Max 2 follow-ups per prospect — then move on

### Step 6: Track Results
- Update prospect status in the batch file: `[ ] To verify` → `[x] Sent 3/30` → `[x] Replied` or `[x] No response`
- When a prospect replies, move the conversation to email/calendar

---

## Cadence Rules

| Day | Action |
|-----|--------|
| Monday | Send highest-priority email from latest batch |
| Tuesday | Send second-priority email |
| Wednesday | Send third email + follow up on Monday's if no reply |
| Thursday | Follow up on Tuesday's if no reply |
| Friday | Review week's results, queue next batch |

---

## Chrome Extension Session Checklist

Before each prospecting session:
- [ ] Open target site (Google, LinkedIn, Clutch, etc.)
- [ ] Paste the relevant brief from `docs/dispatch/`
- [ ] Define the search criteria (industry, geography, size)
- [ ] Let the extension run — solve CAPTCHAs if needed
- [ ] Copy results into a new batch file in `docs/dispatch/prospects/`

---

## Vertical Strategy

Start with one vertical, build case studies, then expand:

**Phase 1 (Now):** Insurance / InsurTech — first batch already generated
**Phase 2 (April):** Professional Services (law firms, accounting, consulting)
**Phase 3 (May):** SaaS / Tech companies (50-300 employees)
**Phase 4 (June):** Healthcare, Logistics, E-commerce

---

## Tool Recommendations (When You're Ready for a CRM)

For now, the markdown files in this repo are fine. When volume grows:
- **Apollo.io** — free tier, email finding + sequencing + CRM
- **Instantly.ai** — cold email sending with warmup
- **HubSpot Free** — CRM with email tracking
- **Airtable** — if you want spreadsheet flexibility with structure

Don't set up a CRM until you have 20+ prospects and a proven email template. Premature tooling is a distraction.

---

## Legal Reminders

- All cold emails must include: unsubscribe link, physical address, accurate headers
- CAN-SPAM penalties: $50,120 per violating email
- Only contact business emails at business domains — never personal Gmail/Yahoo
- GDPR: do not email EU/EEA personal addresses without consent
- Keep it personalized — mass blasts destroy sender reputation
