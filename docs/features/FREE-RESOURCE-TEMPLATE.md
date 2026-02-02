# Adding a New Free Resource

This guide shows you how to add a new free resource using the established pattern.

## Step 1: Create Content JSON

**Location:** `src/data/free/[resource-name]-content.json`

**Template:**

```json
{
  "en": {
    "title": "Your Resource Title",
    "subtitle": "Brief description",
    "intro": "Introduction paragraph",
    "sections": [
      {
        "heading": "Section 1",
        "content": "Your content here"
      }
    ],
    "labels": {
      "download": "Download PDF",
      "print": "Print"
    }
  },
  "es": {
    "title": "Título del Recurso",
    "subtitle": "Descripción breve",
    "intro": "Párrafo de introducción",
    "sections": [
      {
        "heading": "Sección 1",
        "content": "Tu contenido aquí"
      }
    ],
    "labels": {
      "download": "Descargar PDF",
      "print": "Imprimir"
    }
  }
}
```

**Note:** Structure can be completely different based on your needs!

---

## Step 2: Create Python PDF Generator

**Location:** `scripts/generate-[resource-name]-pdf.py`

**Template:**

```python
"""
Generate [Resource Name] PDF
Reads content from: src/data/free/[resource-name]-content.json
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import os
import json

# Paths
SCRIPT_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.join(SCRIPT_DIR, '..')
CONTENT_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'free', '[resource-name]-content.json')
OUTPUT_PATH = os.path.join(ROOT_DIR, 'public', 'assets', 'documents', '[resource-name]-guide.pdf')

# Ensure directory exists
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Load content from JSON
with open(CONTENT_PATH, 'r', encoding='utf-8') as f:
    content_data = json.load(f)

content_en = content_data['en']
content_es = content_data['es']

def create_pdf():
    """Generate the PDF"""

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    # English Section
    elements.append(Paragraph(content_en['title'], title_style))
    elements.append(Spacer(1, 0.3*inch))

    # Add your content here based on JSON structure
    # ...

    # Page break before Spanish
    elements.append(PageBreak())

    # Spanish Section
    elements.append(Paragraph(content_es['title'], title_style))
    elements.append(Spacer(1, 0.3*inch))

    # Add Spanish content
    # ...

    # Build PDF
    doc.build(elements)
    print(f"✅ PDF created successfully: {OUTPUT_PATH}")

if __name__ == "__main__":
    create_pdf()
```

---

## Step 3: Add to Prebuild Script

**Location:** `scripts/prebuild.js`

**Add to the `pdfResources` array:**

```javascript
const pdfResources = [
  {
    name: "5 Questions Senior Guide",
    jsonPath: "src/data/free/5-questions-content.json",
    pdfPath: "public/assets/documents/5-questions-senior-guide.pdf",
    script: "python scripts/generate-5-questions-pdf.py",
  },
  // Add your new resource here:
  {
    name: "[Resource Name]",
    jsonPath: "src/data/free/[resource-name]-content.json",
    pdfPath: "public/assets/documents/[resource-name]-guide.pdf",
    script: "python scripts/generate-[resource-name]-pdf.py",
  },
];

// Smart Caching:
// The prebuild script automatically checks if the JSON content is newer than the PDF.
// - If JSON changed → Regenerates PDF
// - If PDF is up to date → Skips regeneration
// - With 100 resources, only changed ones rebuild!
```

---

## Step 4: Create React Component

**Location:** `src/components/free/[ResourceName]Content.tsx`

**Template:**

```tsx
import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import contentData from "@data/free/[resource-name]-content.json";

const content = contentData;

interface ResourceContentProps {
  lang: "en" | "es";
  bookingUrl: string;
}

export default function ResourceContent({
  lang,
  bookingUrl,
}: ResourceContentProps) {
  const [activeTab, setActiveTab] = useState<"en" | "es">(lang);
  const currentContent = content[activeTab];

  return (
    <div className="resource-page">
      {/* Hero Section */}
      <section className="bg-white pt-28 pb-16 md:pt-32 md:pb-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header with Logo and Download */}
          <div className="flex items-center justify-between mb-12">
            <img
              src="/images/logos/new-york-english-sq-og.jpg"
              alt="NY English"
              className="w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-sm"
            />
            <a
              href="/assets/documents/[resource-name]-guide.pdf"
              download="[Resource-Name]-Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
          </div>

          {/* Title */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {currentContent.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 font-normal max-w-2xl">
              {currentContent.subtitle}
            </p>
          </div>

          {/* Language Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab("en")}
              className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "en"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab("es")}
              className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "es"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Español
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Add your content rendering here */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Download CTA */}
            <a
              href="/assets/documents/[resource-name]-guide.pdf"
              download="[Resource-Name]-Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-6 md:p-8 text-left hover:shadow-xl transition-all duration-300 block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Download className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Download PDF
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Bilingual • Print-friendly
                  </p>
                </div>
              </div>
            </a>

            {/* Book Call CTA */}
            <a
              href={bookingUrl}
              className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-left hover:shadow-xl hover:shadow-blue-600/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Book a Free Strategy Call
                  </h3>
                  <p className="text-blue-100 text-sm">
                    15 minutes • No obligation
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## Step 5: Create Astro Pages

### **English Page:** `src/pages/en/free/[resource-slug]/index.astro`

```astro
---
import Base from "@layouts/Base.astro";
import ResourceContent from "@components/free/[ResourceName]Content";

const title = "Resource Title | NY English";
const description = "Description here (120-160 chars)";
---

<Base
  title={title}
  description={description}
  lang="en"
  tkey="free/[resource-slug]"
  hideCta={true}
>
  <ResourceContent client:load lang="en" bookingUrl="/en/book/" />
</Base>
```

### **Spanish Page:** `src/pages/es/gratis/[resource-slug-es]/index.astro`

```astro
---
import Base from "@layouts/Base.astro";
import ResourceContent from "@components/free/[ResourceName]Content";

const title = "Título del Recurso | NY English";
const description = "Descripción aquí (120-160 chars)";
---

<Base
  title={title}
  description={description}
  lang="es"
  tkey="free/[resource-slug]"
  hideCta={true}
>
  <ResourceContent client:load lang="es" bookingUrl="/es/reservar/" />
</Base>
```

---

## Step 6: Add TKey to i18n System

**Location:** `src/lib/i18n.ts`

**Add to TKey type:**

```typescript
export type TKey =
  | "home"
  | "free"
  | "free/5-questions"
  | "free/[resource-slug]"; // ← Add this
// ...
```

**Add to route mappings:**

```typescript
const routesEn = {
  // ...
  "free/[resource-slug]": "/en/free/[resource-slug]/",
};

const routesEs = {
  // ...
  "free/[resource-slug]": "/es/gratis/[resource-slug-es]/",
};
```

**Add to getAllTKeys:**

```typescript
export function getAllTKeys(): TKey[] {
  return [
    // ...
    "free/[resource-slug]",
  ];
}
```

---

## Step 7: Update Hub Pages

Add your new resource to the hub pages:

**`src/pages/en/free.astro`** and **`src/pages/es/gratis.astro`**

```astro
const resources = [
  {
    title: "5 Questions That Make You Sound Senior",
    // ...
    href: "/en/free/5-questions/",
  },
  {
    title: "Your New Resource",  // ← Add this
    subtitle: "Brief description",
    description: "Longer description",
    type: "PDF Guide",
    icon: "FileText",
    href: "/en/free/[resource-slug]/",
  },
];
```

---

## Step 8: Test

```bash
# Generate PDF
npm run prebuild

# Build and test
npm run build
npm run preview

# Full pre-deploy check
npm run pre-deploy
```

---

## Checklist

- [ ] Created JSON content file
- [ ] Created Python PDF generator
- [ ] Added to prebuild.js
- [ ] Created React component
- [ ] Created English Astro page
- [ ] Created Spanish Astro page
- [ ] Added TKey to i18n.ts
- [ ] Updated hub pages
- [ ] Tested PDF generation
- [ ] Tested website display
- [ ] Ran pre-deploy audit

---

## Tips

### **Keep It Simple**

- Start with basic structure
- Add complexity only if needed
- Reuse existing components

### **Content First**

- Write content in JSON first
- Test PDF generation
- Then build React component

### **Design Consistency**

- Use Executive Memo aesthetic
- White cards with subtle borders
- Line icons
- Desaturated colors

### **SEO**

- Title: 50-60 chars
- Description: 120-160 chars
- Use descriptive slugs
- Add to sitemap automatically via TKey

---

## Need Help?

Refer to the working example:

- JSON: `src/data/free/5-questions-content.json`
- Python: `scripts/generate-5-questions-pdf.py`
- React: `src/components/free/FiveQuestionsContent.tsx`
- Astro: `src/pages/en/free/5-questions/index.astro`
