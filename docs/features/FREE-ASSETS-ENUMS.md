# Free Assets - Enum Reference Guide

Quick reference for all valid enum values in the Free Assets schema.

---

## Content Types

```typescript
"contentType": "questions" | "sentences" | "checklist" | "script" | "framework" | "case-study" | "template" | "guide" | "video" | "audio"
```

**Examples:**

- `questions` - "5 Questions That Make You Sound Senior"
- `sentences` - "7 Sentences That Define Leadership English"
- `checklist` - "Pre-Meeting Preparation Checklist"
- `script` - "Salary Negotiation Script"
- `framework` - "The STAR Method for Interviews"

---

## Formats

```typescript
"format": "pdf-guide" | "pdf-checklist" | "pdf-script" | "interactive-web" | "video" | "audio" | "email-series"
```

**Examples:**

- `pdf-guide` - Downloadable PDF with detailed content
- `interactive-web` - Web-based interactive tool
- `video` - Video tutorial or walkthrough
- `email-series` - Multi-day email course

---

## Funnel Stages

```typescript
"funnelStage": "awareness" | "consideration" | "decision" | "retention"
```

**Mapping:**

- `awareness` - First touch, educational content
- `consideration` - Evaluating solutions, comparing options
- `decision` - Ready to buy, needs final push
- `retention` - Existing clients, upsell opportunities

---

## Difficulty Levels

```typescript
"difficultyLevel": "beginner" | "intermediate" | "advanced" | "all-levels"
```

**Guidelines:**

- `beginner` - Basic English, simple concepts
- `intermediate` - Comfortable with English, learning nuance
- `advanced` - High proficiency, mastering subtlety
- `all-levels` - Universal applicability

---

## Primary Personas

```typescript
"primaryPersona": [
  "executive",        // C-suite, VPs, Directors
  "manager",          // Team leads, department managers
  "founder",          // Startup founders, CEOs
  "entrepreneur",     // Business owners, solopreneurs
  "consultant",       // Independent consultants, advisors
  "project-manager",  // PMs, scrum masters, coordinators
  "engineer",         // Software engineers, developers
  "sales",            // Sales reps, BDRs, account executives
  "hr-professional",  // HR managers, recruiters, talent acquisition
  "doctor",           // Physicians, medical professionals
  "lawyer",           // Attorneys, legal professionals
  "accountant",       // CPAs, financial professionals
  "logistics",        // Supply chain, operations
  "real-estate",      // Real estate agents, brokers
  "job-seeker",       // Interviewing, career transition
  "all"               // Universal content
]
```

---

## Industries

```typescript
"industries": [
  "technology",           // Software, SaaS, IT services
  "healthcare",           // Medical, pharmaceutical, biotech
  "legal",                // Law firms, legal services
  "finance",              // Banking, fintech, accounting
  "logistics",            // Supply chain, shipping, warehousing
  "real-estate",          // Property, construction, development
  "professional-services", // Consulting, agencies, B2B services
  "manufacturing",        // Production, industrial
  "retail",               // E-commerce, consumer goods
  "all"                   // Cross-industry content
]
```

---

## Scenarios

```typescript
"scenarios": [
  "interviews",              // Job interviews, hiring conversations
  "negotiations",            // Salary, contracts, pricing
  "presentations",           // Public speaking, pitches, demos
  "client-meetings",         // Discovery calls, check-ins, reviews
  "leadership",              // Team management, decision-making
  "email-writing",           // Professional correspondence
  "networking",              // Conferences, LinkedIn, relationship building
  "difficult-conversations", // Conflict, feedback, bad news
  "decision-making",         // Strategy, prioritization, recommendations
  "meetings",                // General meeting participation
  "technical-explanation",   // Explaining complex concepts simply
  "crisis-management",       // Urgent situations, damage control
  "performance-feedback",    // Reviews, coaching, development
  "sales-calls",             // Discovery, demos, closing
  "status-updates",          // Progress reports, stakeholder updates
  "all"                      // Universal scenarios
]
```

---

## CTA Types

```typescript
"ctaType": "strategy-call" | "email-signup" | "quiz" | "contact" | "service-page" | "related-asset"
```

**Mapping:**

- `strategy-call` → `/en/book/`
- `email-signup` → Newsletter/email list
- `quiz` → Assessment or quiz page
- `contact` → `/en/contact/`
- `service-page` → Specific service page
- `related-asset` → Another free resource

---

## Usage Examples

### Executive Leadership Content

```json
{
  "targeting": {
    "primaryPersona": ["executive", "manager", "founder"],
    "industries": ["technology", "professional-services"],
    "scenarios": ["leadership", "decision-making", "presentations"]
  }
}
```

### Job Seeker Content

```json
{
  "targeting": {
    "primaryPersona": ["job-seeker", "engineer"],
    "industries": ["technology", "all"],
    "scenarios": ["interviews", "negotiations", "networking"]
  }
}
```

### Sales Professional Content

```json
{
  "targeting": {
    "primaryPersona": ["sales", "consultant", "entrepreneur"],
    "industries": ["professional-services", "technology"],
    "scenarios": ["sales-calls", "negotiations", "client-meetings"]
  }
}
```

---

## Best Practices

### Persona Selection

- **Primary = 1-3 personas** - Who benefits most?
- Use `"all"` sparingly - only for truly universal content
- Combine related personas (e.g., `["executive", "manager"]`)

### Scenario Selection

- **2-5 scenarios** - Where is this used?
- Be specific - `"sales-calls"` > `"meetings"`
- Think about user intent - what problem are they solving?

### Industry Selection

- **Start specific** - Target your core audience first
- Use `"all"` for cross-industry skills (e.g., email writing)
- Consider industry-specific pain points

### Tags

- **3-5 tags max** - Keep it focused
- Use plain language - `"leadership"`, not `"ldshp"`
- Think about search terms users might use

---

## Schema Validation

To validate your JSON against the schema:

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate a file
ajv validate -s src/data/free/schema.json -d src/data/free/your-asset.json
```

---

## Questions?

See `docs/FREE-ASSETS-SYSTEM.md` for the full system documentation.
