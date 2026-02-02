# Free Assets System - Dynamic Routing Architecture

## 🎯 Overview

The Free Assets system uses **dynamic routing** (like blog posts) to automatically generate pages for any JSON content file you create. No need to create Astro pages for each asset!

---

## 📁 Architecture

```
src/
├── pages/
│   ├── en/free/[slug].astro        ← ONE template for ALL English assets
│   └── es/gratis/[slug].astro      ← ONE template for ALL Spanish assets
├── components/
│   └── free/
│       └── GenericFreeAsset.tsx    ← Reusable component (all content types)
├── data/
│   └── free/
│       ├── 5-questions.json        ← Just add JSON files here!
│       ├── [your-asset].json
│       └── [another-asset].json
└── scripts/
    └── generate-free-asset-pdf.py  ← Generic PDF generator
```

---

## ✅ How to Create a New Free Asset

### **Step 1: Create JSON Content File**

**Location:** `src/data/free/[asset-name].json`

**Template:**

```json
{
  "type": "questions",
  "slugEn": "your-asset-slug",
  "slugEs": "tu-recurso-slug",
  "en": {
    "title": "Your Asset Title",
    "subtitle": "Subtitle here",
    "intro": {
      "line1": "Hook line 1",
      "line2": "Hook line 2",
      "paragraph": "Context paragraph"
    },
    "questions": [
      {
        "number": 1,
        "question": "Your question?",
        "why": "Why it works",
        "when": "When to use",
        "doNotSay": "Avoid saying...",
        "howToSay": "Say it like this",
        "variations": "Optional variations"
      }
    ],
    "pattern": {
      "title": "The Pattern",
      "intro": "Pattern intro",
      "items": [
        { "bold": "Key Point", "text": " — Explanation" }
      ]
    },
    "quickRef": {
      "title": "Quick Reference",
      "rows": [
        { "situation": "Situation", "question": "Question" }
      ]
    },
    "labels": {
      "why": "Why it works",
      "when": "When to use",
      "doNotSay": "Avoid saying",
      "howToSay": "Say it like this",
      "variations": "Variations",
      "situation": "Situation",
      "seniorQuestion": "Senior Question"
    }
  },
  "es": {
    "title": "Título del Recurso",
    "subtitle": "Subtítulo aquí",
    ...
  }
}
```

### **Step 2: Add i18n Routes (if needed)**

**Location:** `src/lib/i18n.ts`

Add your asset to the TKey type and routes:

```typescript
export type TKey = "free" | "free/5-questions" | "free/[your-asset]"; // ← Add this
// ...

export const routes = {
  en: {
    "free/[your-asset]": "/en/free/your-slug/",
  },
  es: {
    "free/[your-asset]": "/es/gratis/tu-slug/",
  },
};
```

### **Step 3: Run Build**

```bash
npm run build
```

**That's it!** The dynamic routing system will:

- ✅ Automatically detect your JSON file
- ✅ Generate EN page at `/en/free/your-slug/`
- ✅ Generate ES page at `/es/gratis/tu-slug/`
- ✅ Auto-generate PDF (if prebuild configured)

---

## 🎨 Content Types

The system supports different content types via the `type` field:

### **Current Types:**

1. **`"questions"`** - Q&A format with strategy/script sections (like 5-questions)
2. **`"video"`** - Video content (coming soon)
3. **`"audio"`** - Audio content (coming soon)
4. **`"checklist"`** - Checklist format (coming soon)

### **Adding New Content Types:**

Edit `src/components/free/GenericFreeAsset.tsx`:

```tsx
// Add your content type renderer
{
  contentType === "video" && (
    <VideoContent content={content} lang={activeTab} />
  );
}
{
  contentType === "checklist" && (
    <ChecklistContent content={content} lang={activeTab} />
  );
}
```

---

## 📄 PDF Generation

### **Manual Generation:**

```bash
python scripts/generate-free-asset-pdf.py [asset-name]
```

### **Automatic Generation:**

PDFs auto-generate during `npm run build` via `scripts/prebuild.js`

---

## 🔧 How It Works

### **Dynamic Routing:**

1. **`[slug].astro`** uses `getStaticPaths()` to scan `src/data/free/*.json`
2. For each JSON file, it creates a route with the filename as the slug
3. The `GenericFreeAsset` component renders the content based on the `type` field

### **Example:**

**File:** `src/data/free/negotiation-phrases.json`

**Generated URLs:**

- English: `/en/free/negotiation-phrases/`
- Spanish: `/es/gratis/frases-negociacion/` (if `slugEs` provided)

---

## 📝 JSON Structure Reference

### **Required Fields:**

- `type` - Content type ("questions", "video", etc.)
- `slugEn` - English URL slug
- `slugEs` - Spanish URL slug
- `en.title` - English title
- `en.subtitle` - English subtitle
- `es.title` - Spanish title
- `es.subtitle` - Spanish subtitle

### **Optional Fields:**

- `en.intro` - Intro section with hook lines
- `en.questions` - Array of questions (for "questions" type)
- `en.pattern` - Pattern section
- `en.quickRef` - Quick reference table
- `en.labels` - UI labels for the page

---

## 🚀 Benefits

✅ **Scalable** - Add unlimited assets without creating Astro pages  
✅ **DRY** - One template for all assets  
✅ **Consistent** - Same layout/styling across all assets  
✅ **Bilingual** - Built-in EN/ES support  
✅ **SEO** - Automatic schema markup  
✅ **Flexible** - Support multiple content types

---

## 📋 Checklist for New Assets

- [ ] Create JSON file in `src/data/free/`
- [ ] Add `type`, `slugEn`, `slugEs` fields
- [ ] Add bilingual content (EN + ES)
- [ ] (Optional) Add i18n routes if custom slugs needed
- [ ] Run `npm run build` to test
- [ ] Verify pages at `/en/free/[slug]/` and `/es/gratis/[slug]/`
- [ ] Check PDF generation

---

## 🔍 Troubleshooting

**Q: Page not generating?**

- Check JSON syntax (use JSON validator)
- Ensure file is in `src/data/free/` directory
- Check `slugEn` and `slugEs` match your expectations

**Q: TypeScript errors about TKey?**

- This is expected for dynamic slugs
- The routes will still work at runtime
- Add explicit routes to `i18n.ts` if you want type safety

**Q: PDF not generating?**

- Check `scripts/prebuild.js` configuration
- Run PDF generator manually to test
- Ensure Python and ReportLab are installed

---

## 📚 Examples

See `src/data/free/5-questions.json` for a complete working example.

---

**Last Updated:** December 9, 2025
