# Free Assets Content Guide

## Overview

Free assets are downloadable resources (PDFs, guides, templates, scripts) that serve as lead magnets and provide value to your audience. They're managed through a **fully dynamic JSON-based system** that automatically generates bilingual landing pages.

## Asset Types

### 1. Questions

Strategic questions designed to help professionals communicate better.

- **Examples:** 5 Questions That Make You Sound Senior, 8 Questions That Close Deals
- **Use Case:** Lead magnets for coaching/strategy calls

### 2. Scripts

Ready-to-use scripts and templates for common business situations.

- **Examples:** 60-Second Status Update Script, 5-Minute Negotiation Script
- **Use Case:** Practical tools that demonstrate expertise

### 3. Templates

Fill-in-the-blank templates for emails, introductions, and frameworks.

- **Examples:** 60-Second Self-Introduction Template, Email Templates for Difficult Situations
- **Use Case:** Immediate value, low friction downloads

### 4. Frameworks

Structured approaches to common business challenges.

- **Examples:** Client Call Opening & Closing Framework
- **Use Case:** Comprehensive guides that build authority

### 5. Principles/Foundations

Educational content about core concepts.

- **Examples:** 5 Principles of Executive English, 7 Sentences That Define Leadership English
- **Use Case:** Authority building, thought leadership

## Creating a New Free Asset

### 1. Plan Your Asset

Before creating the JSON, define:

- **Title** (30-60 characters)
  - ✅ "5 Questions That Make You Sound Senior"
  - ❌ "Questions" (too short)
  - ❌ "5 Strategic Questions That Make You Sound Senior in Executive Meetings" (too long)

- **Slug** (lowercase, hyphens, no spaces)
  - ✅ "5-questions-that-sound-senior"
  - ❌ "5 questions that sound senior"
  - ❌ "FiveQuestionsThatSoundSenior"

- **Meta Description** (120-160 characters)
  - ✅ "Learn 5 strategic questions that signal leadership and executive thinking in meetings—even if you're not yet in a senior role."
  - ❌ "Questions" (too short)
  - ❌ "Learn 5 strategic questions that signal leadership and executive thinking in meetings—even if you're not yet in a senior role. This guide includes examples and when to use each question." (too long)

- **Target Persona** (who benefits most)
  - Examples: executive, manager, founder, consultant, sales professional

- **Pain Points** (what problems does it solve)
  - Examples: "Sounds reactive instead of strategic", "Lacks executive presence"

- **Funnel Stage** (awareness, consideration, decision)
  - awareness: Top of funnel, educational
  - consideration: Evaluating solutions
  - decision: Ready to buy/book

### 2. Create the JSON File

Create `src/data/free/your-asset-slug.json`:

```json
{
  "metadata": {
    "id": "unique-id-for-tracking",
    "version": "1.0",
    "datePublished": "2025-01-15",
    "author": "Robert Cushman",
    "language": ["en", "es"]
  },
  "classification": {
    "contentType": "questions",
    "format": "pdf-guide",
    "funnelStage": "consideration",
    "difficultyLevel": "intermediate",
    "timeToComplete": "5 minutes",
    "estimatedMinutes": 5,
    "pageCount": 3,
    "tags": ["leadership", "executive-english", "communication"]
  },
  "targeting": {
    "primaryPersona": ["executive", "manager", "founder"],
    "industries": ["technology", "professional-services", "all"],
    "scenarios": ["meetings", "presentations", "leadership"],
    "painPoints": [
      "Sounds reactive instead of strategic",
      "Lacks executive presence in meetings",
      "Doesn't know how to guide conversations"
    ]
  },
  "conversion": {
    "ctaType": "strategy-call",
    "nextStep": "Book a free strategy call to practice these questions live",
    "relatedAssets": [
      "7-sentences-leadership-english",
      "client-call-opening-closing-framework"
    ]
  },
  "seo": {
    "metaDescription": "Learn 5 strategic questions that signal leadership and executive thinking in meetings—even if you're not yet in a senior role.",
    "keywords": [
      "executive presence",
      "leadership questions",
      "strategic thinking",
      "business english"
    ],
    "ogImage": "/images/og/5-questions-senior.jpg"
  },
  "analytics": {
    "downloadCount": 0,
    "viewCount": 0,
    "lastAccessed": null
  },
  "slugEn": "5-questions",
  "slugEs": "5-preguntas",
  "en": {
    "title": "5 Questions That Make You Sound Senior",
    "subtitle": "Strategic questions for executive meetings",
    "description": "These 5 questions come from real executive meetings between Latin American tech teams and North American clients.",
    "headline": "Stop Answering. Start Leading.",
    "valueProposition": "Get 5 proven questions that demonstrate strategic thinking and executive presence—even if you don't have a senior title yet.",
    "leadCapture": {
      "formHeadline": "Get the 5 Questions",
      "formSubheadline": "Strategic questions for executive meetings",
      "buttonText": "Send Me the Questions",
      "successMessage": "Check your inbox! Your questions are on their way."
    },
    "sections": [
      {
        "id": "intro",
        "title": "Why Questions Beat Answers",
        "content": "Junior professionals answer questions. Senior professionals ask them.\n\nThe right question at the right time demonstrates strategic thinking and leadership—even if you don't have a senior title yet."
      },
      {
        "id": "questions",
        "title": "The 5 Questions",
        "items": [
          {
            "number": 1,
            "question": "What does success look like for you on this project?",
            "why": "You're focusing on outcomes, not tasks.",
            "when": "Project kickoffs, scope discussions",
            "doNotSay": "\"What do you need me to do?\"",
            "howToSay": "Emphasize 'for you.' This makes the question personal.",
            "variations": "\"...for your team\" / \"...from your perspective\""
          }
        ]
      }
    ]
  },
  "es": {
    "title": "5 Preguntas Que Te Hacen Sonar Como Ejecutivo",
    "subtitle": "Preguntas estratégicas para reuniones ejecutivas",
    "description": "Estas 5 preguntas provienen de reuniones ejecutivas reales entre equipos de tecnología latinoamericanos y clientes norteamericanos.",
    "headline": "Deja de Responder. Empieza a Liderar.",
    "valueProposition": "Obtén 5 preguntas probadas que demuestran pensamiento estratégico y presencia ejecutiva—incluso si aún no tienes un título senior.",
    "leadCapture": {
      "formHeadline": "Obtén las 5 Preguntas",
      "formSubheadline": "Preguntas estratégicas para reuniones ejecutivas",
      "buttonText": "Envíame las Preguntas",
      "successMessage": "¡Revisa tu bandeja! Tus preguntas están en camino."
    },
    "sections": [
      {
        "id": "intro",
        "title": "Por Qué las Preguntas Ganan a las Respuestas",
        "content": "Los profesionales junior responden preguntas. Los profesionales senior las hacen.\n\nLa pregunta correcta en el momento correcto demuestra pensamiento estratégico y liderazgo—incluso si aún no tienes un título senior."
      },
      {
        "id": "questions",
        "title": "Las 5 Preguntas",
        "items": [
          {
            "number": 1,
            "question": "¿Qué se ve como éxito para ti en este proyecto?",
            "why": "Te estás enfocando en resultados, no en tareas.",
            "when": "Lanzamientos de proyectos, discusiones de alcance",
            "doNotSay": "\"¿Qué necesitas que haga?\"",
            "howToSay": "Enfatiza 'para ti.' Esto hace la pregunta personal.",
            "variations": "\"...para tu equipo\" / \"...desde tu perspectiva\""
          }
        ]
      }
    ]
  }
}
```

### 3. Add i18n Routes

Update `src/lib/i18n.ts`:

**In the TKey type definition (around line 30-65):**

```typescript
| "free/5-questions"
```

**In the en routes object (around line 80-95):**

```typescript
"free/5-questions": "/en/free/5-questions/",
```

**In the es routes object (around line 137-150):**

```typescript
"free/5-questions": "/es/gratis/5-preguntas/",
```

### 4. Verify SEO Standards

Before running pre-deploy, check:

- [ ] Title is 30-60 characters
- [ ] Meta description is 120-160 characters
- [ ] Both `en` and `es` sections exist
- [ ] `slugEn` and `slugEs` are lowercase with hyphens
- [ ] i18n routes match the slugs
- [ ] Keywords are relevant (3-5)
- [ ] Related assets exist

### 5. Run Pre-Deploy

```bash
npm run pre-deploy
```

The asset will automatically appear on:

- `/en/free/` (English landing page)
- `/es/gratis/` (Spanish landing page)

---

## SEO Best Practices

### Title Optimization

- **Length:** 30-60 characters (including spaces)
- **Format:** Lead with the benefit or number
- **Examples:**
  - "5 Questions That Make You Sound Senior" ✅
  - "The 60-Second Status Update Script" ✅
  - "8 Powerful Questions That Close Deals" ✅

### Meta Description Optimization

- **Length:** 120-160 characters (exactly)
- **Format:** Lead with the benefit, include keywords
- **Examples:**
  - "Learn 5 strategic questions that signal leadership and executive thinking in meetings—even if you're not yet in a senior role." ✅
  - "Get the 60-second status update formula that executives love. Stop rambling in meetings and start communicating like a senior leader." ✅

### Keyword Strategy

- **Primary keyword:** Main topic (e.g., "leadership questions")
- **Secondary keywords:** Related concepts (e.g., "executive presence", "strategic thinking")
- **Long-tail keywords:** Specific use cases (e.g., "how to sound senior in meetings")

### Bilingual Content

- **Maintain parity:** Both versions should have similar value
- **Translate accurately:** Use professional translations, not machine translation
- **Localize:** Adapt examples and references for each market
- **Test both:** Verify both `/en/` and `/es/` versions work correctly

---

## Content Structure Best Practices

### Introduction Section

- Hook with the problem
- State the benefit
- Explain why this matters
- Keep it 2-3 paragraphs

### Main Content Section

- Use numbered lists for questions/steps
- Provide context for each item
- Include examples (right way vs. wrong way)
- Add actionable guidance

### Call-to-Action

- Lead capture form (email)
- Strategy call booking
- Related asset recommendations
- Clear next step

---

## Tracking & Analytics

Each asset tracks:

- **downloadCount:** Number of downloads
- **viewCount:** Number of page views
- **lastAccessed:** When last downloaded

Update these manually or integrate with analytics platform.

---

## Common Content Patterns

### Questions Format

```json
{
  "number": 1,
  "question": "The actual question",
  "why": "Why this question matters",
  "when": "When to use it",
  "doNotSay": "What NOT to say",
  "howToSay": "How to phrase it better",
  "variations": "Alternative phrasings"
}
```

### Script Format

```json
{
  "situation": "When to use this script",
  "wrong": "What NOT to say",
  "right": "The better way to say it",
  "why": "Why this works better",
  "tips": "Additional guidance"
}
```

### Template Format

```json
{
  "section": "Part of the template",
  "placeholder": "[Your text here]",
  "example": "Example of what to put here",
  "tips": "Guidance for filling it in"
}
```

---

## File Naming Conventions

- **Filenames:** lowercase, hyphens, no spaces
  - ✅ `5-questions-that-sound-senior.json`
  - ❌ `5 Questions That Sound Senior.json`
  - ❌ `5_questions_that_sound_senior.json`

- **Slugs:** Match filename (without .json)
  - ✅ `"slugEn": "5-questions-that-sound-senior"`
  - ❌ `"slugEn": "5-questions"`

- **IDs:** Unique, descriptive, lowercase
  - ✅ `"id": "5-questions-sound-senior"`
  - ❌ `"id": "asset-1"`

---

## Maintenance

### Regular Updates

- Review download counts quarterly
- Update content based on feedback
- Refresh examples annually
- Check for outdated references

### Version Control

- Increment `version` when making changes
- Update `datePublished` for major revisions
- Keep `lastAccessed` current
- Document changes in commit messages

### Quality Assurance

- Run pre-deploy after any changes
- Test both English and Spanish versions
- Verify PDF downloads work
- Check mobile responsiveness
