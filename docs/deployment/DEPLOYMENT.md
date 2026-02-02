# Pre-Deployment Checklist & Audit System

## Overview

This project uses a comprehensive pre-deployment audit system that validates project health, technical SEO, sitemap integrity, and full site scans before deployment. All checks must pass to ensure production-ready code.

## Running Pre-Deployment Checks

```bash
npm run pre-deploy
```

This command:

1. Builds the Astro site (`npm run build`)
2. Runs Project Health Check
3. Runs Technical SEO Audit
4. Validates Sitemap
5. Performs Full Site Scan
6. Generates final audit report

**Exit code 0 = All checks passed ✅**
**Exit code 1 = Issues found, fix before deploying ❌**

---

## Audit Components

### 1. Project Health Check

**File:** `scripts/pre-deploy/project-health-checker.js`

Validates project-wide health and configuration:

#### Core Files

- ✅ `package.json` - Required fields (name, version, scripts)
- ✅ `LICENSE` - File presence and content
- ✅ `README.md` - Completeness (title, description)
- ✅ `.gitignore` - Security patterns (node_modules, .env, build output)

#### Configuration

- ✅ `tsconfig.json` - TypeScript strict mode
- ✅ `astro.config.mjs` - Astro configuration
- ✅ `.env.example` - No real secrets exposed

#### Dependencies

- ✅ Lockfile presence (pnpm-lock.yaml, package-lock.json, or yarn.lock)

#### Astro + i18n Specific

- ✅ Free assets JSON schema compliance (all 12 assets)
- ✅ Bilingual parity (en/es content present)
- ✅ i18n routes configuration (`src/lib/i18n.ts`)

**Status:** Must pass (0 errors allowed)

---

### 2. Technical SEO Audit

**File:** `scripts/pre-deploy/audits/seo-validator.js`

Validates SEO best practices:

- Canonical URLs (present and valid)
- Hreflang tags (reciprocal and valid)
- Meta descriptions (120-160 characters)
- Page titles (30-60 characters)
- H1 tags (present, not duplicated)
- OG meta tags (for social sharing)
- Schema.org structured data

**Status:** Must pass (0 errors allowed)

---

### 3. Sitemap Validation

**File:** `scripts/pre-deploy/audits/sitemap-validator.js`

Validates XML sitemap integrity:

- All URLs are canonical (no redirects)
- Hreflang tags are present and valid
- All critical URLs included
- No duplicate entries
- Proper locale alternates

**Status:** Must pass (0 errors allowed)

---

### 4. Full Site Scan

**File:** `scripts/pre-deploy/audits/full-site-scan.js`

Comprehensive scan of all generated HTML files:

- Scans all 264+ HTML files in `dist/`
- Checks every page for SEO issues
- Validates meta descriptions length
- Validates title length
- Checks for missing H1 tags
- Detects duplicate H1 tags

**Status:** Must pass (0 errors allowed)

---

## Free Assets Architecture

### Dynamic Route System

Free assets use a **fully dynamic system** powered by JSON files, similar to how blog posts use Markdown.

#### File Structure

```
src/data/free/
├── 5-questions.json
├── 5-minute-negotiation-script.json
├── 5-principles-executive-english.json
├── 5-quick-wins-executive-english.json
├── 7-sentences-leadership-english.json
├── 10-common-mistakes-executive-english.json
├── 60-second-self-introduction-template.json
├── client-call-opening-closing-framework.json
├── email-templates-difficult-situations.json
├── pushback-playbook.json
├── questions-that-close-deals.json
├── status-update-script.json
└── schema.json (JSON schema definition)
```

#### Dynamic Routes

- **English:** `src/pages/en/free/[slug].astro`
- **Spanish:** `src/pages/es/gratis/[slug].astro`

These routes automatically generate pages for each JSON file using the `slugEn` and `slugEs` values.

### JSON Schema

Each free asset must follow this structure:

```json
{
  "metadata": {
    "id": "unique-identifier",
    "version": "1.0",
    "datePublished": "2025-01-15",
    "author": "Robert Cushman",
    "language": ["en", "es"]
  },
  "classification": {
    "contentType": "questions|scripts|templates|frameworks",
    "format": "pdf-guide",
    "funnelStage": "awareness|consideration|decision",
    "difficultyLevel": "beginner|intermediate|advanced",
    "timeToComplete": "5 minutes",
    "estimatedMinutes": 5,
    "pageCount": 5,
    "tags": ["tag1", "tag2"]
  },
  "targeting": {
    "primaryPersona": ["executive", "manager", "founder"],
    "industries": ["technology", "professional-services"],
    "scenarios": ["meetings", "negotiations"],
    "painPoints": ["Pain point 1", "Pain point 2"]
  },
  "conversion": {
    "ctaType": "strategy-call|download|contact",
    "nextStep": "Call to action text",
    "relatedAssets": ["asset-slug-1", "asset-slug-2"]
  },
  "seo": {
    "metaDescription": "120-160 character description for search results",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "ogImage": "/images/og/asset-name.jpg"
  },
  "analytics": {
    "downloadCount": 0,
    "viewCount": 0,
    "lastAccessed": null
  },
  "slugEn": "asset-slug",
  "slugEs": "slug-en-espanol",
  "en": {
    "title": "Asset Title (30-60 chars)",
    "subtitle": "Subtitle or tagline",
    "description": "Longer description",
    "headline": "Main headline",
    "valueProposition": "What user gets",
    "leadCapture": {
      "formHeadline": "Form headline",
      "formSubheadline": "Form subheadline",
      "buttonText": "Button text",
      "successMessage": "Success message"
    },
    "sections": [
      {
        "id": "section-id",
        "title": "Section title",
        "content": "Section content",
        "items": []
      }
    ]
  },
  "es": {
    "title": "Título del Recurso",
    "subtitle": "Subtítulo",
    "description": "Descripción",
    "headline": "Titular principal",
    "valueProposition": "Lo que obtiene el usuario",
    "leadCapture": {
      "formHeadline": "Titular del formulario",
      "formSubheadline": "Subtítulo del formulario",
      "buttonText": "Texto del botón",
      "successMessage": "Mensaje de éxito"
    },
    "sections": []
  }
}
```

### SEO Requirements

All free assets must meet these SEO standards:

- **Title:** 30-60 characters (used as page `<title>`)
- **Meta Description:** 120-160 characters (from `seo.metaDescription`)
- **Keywords:** 3-5 relevant keywords
- **OG Image:** Social sharing image (optional, defaults to logo)
- **Bilingual:** Both `en` and `es` sections required

### i18n Route Integration

All free assets are automatically registered in `src/lib/i18n.ts`:

```typescript
export const routeFor: Record<Locale, Record<TKey, string>> = {
  en: {
    "free/asset-slug": "/en/free/asset-slug/",
    // ...
  },
  es: {
    "free/asset-slug": "/es/gratis/slug-en-espanol/",
    // ...
  },
};
```

**Important:** The `slugEn` value in the JSON must match the TKey in `i18n.ts` for proper hreflang generation.

---

## Adding New Free Assets

### Step 1: Create JSON File

Create a new file in `src/data/free/` with the name matching your `slugEn`:

```bash
src/data/free/your-asset-slug.json
```

### Step 2: Fill JSON Schema

Use the schema above, ensuring:

- Unique `metadata.id`
- Proper `slugEn` and `slugEs`
- SEO metadata (120-160 char description)
- Bilingual content (en + es)

### Step 3: Add i18n Routes

Update `src/lib/i18n.ts`:

```typescript
// In TKey type
| "free/your-asset-slug"

// In en routes
"free/your-asset-slug": "/en/free/your-asset-slug/",

// In es routes
"free/your-asset-slug": "/es/gratis/slug-en-espanol/",
```

### Step 4: Run Pre-Deploy

```bash
npm run pre-deploy
```

The asset will automatically appear on:

- `/en/free/` (English landing page)
- `/es/gratis/` (Spanish landing page)

---

## Common Issues & Solutions

### Issue: "routeFor missing for lang=en tkey=free/..."

**Cause:** Asset slug not added to `src/lib/i18n.ts`
**Solution:** Add the TKey and routes to i18n.ts

### Issue: "Cannot read properties of undefined (reading 'title')"

**Cause:** JSON file is being picked up but doesn't have proper structure
**Solution:** Ensure JSON follows schema, check `en.title` and `es.title` exist

### Issue: Meta description too short/long

**Cause:** `seo.metaDescription` not 120-160 characters
**Solution:** Update the description in the JSON file

### Issue: Title too short/long

**Cause:** `en.title` or `es.title` not 30-60 characters
**Solution:** Adjust the title in the JSON file

---

## Deployment Workflow

1. **Make changes** to code, content, or assets
2. **Run pre-deploy:** `npm run pre-deploy`
3. **Fix any issues** reported by audits
4. **Commit to git:** `git add . && git commit -m "message"`
5. **Push to GitHub:** `git push origin main`
6. **Deploy:** Netlify auto-deploys on push to main

---

## Performance Metrics

Current audit results (as of latest run):

- **Project Health:** 21/23 checks passed
- **Technical SEO:** 62/62 URLs valid
- **Sitemap:** 141 URLs, all canonical
- **Full Site Scan:** 264 HTML files, 0 issues
- **Build Time:** ~5 seconds
- **Audit Time:** ~2 seconds

---

## Support

For issues with the pre-deploy system:

1. Check the error message in the audit report
2. Review the relevant audit file in `scripts/pre-deploy/`
3. Consult the "Common Issues" section above
4. Verify JSON schema compliance for free assets
