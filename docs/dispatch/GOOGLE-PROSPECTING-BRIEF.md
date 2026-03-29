# Google & Directory Prospecting Brief — Claude Chrome Extension

> Paste this into the Claude Chrome extension for cold outreach prospecting via Google Search, Google Maps, and business directories.

---

## CushLabs.ai — Business Context

**Owner:** Robert Cushman — 20+ years in IT, 2.5 years intensive AI work. Based in Guadalajara, Mexico. Fully bilingual EN/ES.

**Business:** CushLabs.ai — AI Integration & Software Development Consulting. Serving US and Mexico.

**Core Services:**
- AI Chatbots & Conversational Agents
- Automation & Integration Services (workflow automation, API integrations)
- Custom Development (full-stack apps, dashboards — Next.js, React, TypeScript, Node.js)
- AI Strategy & Consulting

**Productized Offerings:**
- Onboarding Assistant Bot — RAG chatbot for new employee onboarding
- Customer Service Voice Agent — Voicebots for tier-1 support
- Internal Knowledge Base Bot — Company documentation Q&A
- Sales Enablement Assistant — Product/competitive intel for sales reps
- Document Q&A System — Upload docs and ask questions

**Ideal Client Profile:**
- SMBs and mid-market companies (50-500 employees)
- Industries: Professional services, SaaS, e-commerce, logistics, manufacturing, healthcare
- Decision makers: CTO, VP of Engineering, VP of Operations, Head of IT, COO, founders
- Pain points: Manual processes, overwhelmed support teams, knowledge silos, onboarding friction

---

## What Works for Google/Directory Prospecting

### Google Search — YES, works well
Claude can search Google for companies matching criteria, visit their websites, and extract contact info from public pages (About, Contact, Team, footer). Best for targeted searches, not mass scraping.

### Google Maps — YES, partially
Claude can search Maps by location + industry, extract business listings, visit websites linked from listings. Works best when searching by ZIP code rather than broad city searches. Expect 60-75% success rate on finding owner/contact names.

### Business Directories — YES, with caveats
| Directory | Good For |
|-----------|----------|
| **Clutch.co** | Finding agencies that could partner or refer work |
| **G2/Capterra** | Companies actively paying for software (buyer signals) |
| **Yelp** | Local businesses needing automation |
| **Industry directories** | Vertical-specific prospect lists |

### Limitations to Know
- **CAPTCHAs** — Claude will pause and ask you to solve them manually
- **Rate limiting** — Heavy searching triggers blocks; space requests out
- **Anti-bot detection** — Some sites will block after 10-50 rapid requests
- **Cloudflare/WAF** — Some sites block automation entirely

---

## Recommended Workflows

### Phase 1: Research & Target (30 min)
```
Search Google for "[industry] companies in [city]" with 50-300 employees.
Visit their websites, extract company name, founder/CEO name, website URL,
and contact email from their Contact or About page.
Create a list with these columns.
```

### Phase 2: Enrichment (20 min)
```
For each company in my list, visit their website and find:
- What services they currently offer
- Any recent blog posts or news
- Whether they mention AI, automation, or chatbots anywhere
- A personalization hook I can reference in outreach
```

### Phase 3: Email Drafting (15 min)
```
Based on what you found about each company, draft a personalized cold email
for the decision maker. Each email should:
- Reference something specific about their business
- Identify a pain point CushLabs can solve
- Propose a specific productized offering that fits
- Be 3-4 sentences max, professional but warm
- Include a soft CTA (15-min call, not a hard sell)
```

### Phase 4: Review & Send (you do this manually)
- Review Claude's drafts
- Send via your email client (maintain sender reputation)
- Never have Claude send emails directly

---

## Google Maps Specific Prompts

### Find Local Businesses by Category
```
Search Google Maps for "marketing agencies" in Austin, TX.
For each of the top 20 results, extract:
- Business name
- Website URL
- Phone number
- Rating and review count
- Any services listed
Then visit each website and find the owner/founder name and email.
```

### Find Companies With Pain Points
```
Search Google for "companies struggling with customer service" OR
"hiring customer support" in [target city]. These are companies
that might benefit from CushLabs' Customer Service Voice Agent.
Extract company info and draft a personalized outreach message for each.
```

---

## Legal Compliance Checklist

- [ ] Only scrape publicly available business contact info
- [ ] Include unsubscribe mechanism in all cold emails
- [ ] Include physical business address in emails (CAN-SPAM)
- [ ] Use accurate sender headers — no spoofing
- [ ] Respect robots.txt and terms of service
- [ ] Do NOT scrape personal data of EU/EEA residents (GDPR)
- [ ] Do NOT mass-blast — personalize every message
- [ ] Keep records of consent and opt-outs
