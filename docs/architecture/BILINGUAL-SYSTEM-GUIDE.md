# Bilingual System Guide

## Overview

The bilingual system uses a centralized i18n helper (`src/lib/i18n.ts`) to manage routes, SEO metadata, and hreflang alternates for English and Spanish pages.

## Adding New Pages

### Step 1: Add TKey to i18n.ts

1. **Add to TKey union type** (lines 6-25):

```typescript
export type TKey =
  | "home"
  | "about"
  // ... existing keys
  | "your-new-page" // Add here
  | "category/your-category"; // For nested pages
```

2. **Add route mappings** (lines 27-68):

```typescript
export const routeFor: Record<Locale, Record<TKey, string>> = {
  en: {
    // ... existing routes
    "your-new-page": "/en/your-new-page/",
    "category/your-category": "/en/category/your-category/",
  },
  es: {
    // ... existing routes
    "your-new-page": "/es/tu-nueva-pagina/",
    "category/your-category": "/es/categoria/tu-categoria/",
  },
};
```

3. **Add to getAllTKeys()** (lines 88-109):

```typescript
export function getAllTKeys(): TKey[] {
  return [
    // ... existing keys
    "your-new-page",
    "category/your-category",
  ];
}
```

### Step 2: Create Page Files

**English Page** (`src/pages/en/your-new-page.astro`):

```astro
---
import Base from "@layouts/Base.astro";

// Define language and tkey for i18n
const lang = 'en';
const tkey = 'your-new-page'; // Must match TKey exactly

const title = "Your Page Title";
const description = "Your page description for SEO";
---

<Base
  lang={lang}
  tkey={tkey}
  title={title}
  description={description}
>
  <!-- Your page content -->
</Base>
```

**Spanish Page** (`src/pages/es/tu-nueva-pagina.astro`):

```astro
---
import Base from "@layouts/Base.astro";

// Define language and tkey for i18n
const lang = 'es';
const tkey = 'your-new-page'; // Same TKey as English

const title = "Título de Tu Página";
const description = "Descripción de tu página para SEO";
---

<Base
  lang={lang}
  tkey={tkey}
  title={title}
  description={description}
>
  <!-- Tu contenido de página -->
</Base>
```

## What You Get Automatically

When using the Base layout with proper `tkey` and `lang`:

✅ **SEO Meta Tags**: Title, description, Open Graph, Twitter Cards
✅ **Hreflang Alternates**: Automatic reciprocal language links
✅ **Canonical URLs**: Proper canonical URL generation
✅ **Sitemap Integration**: Pages automatically included in sitemap
✅ **Consistent Structure**: Standardized layout and SEO handling

## TKey Naming Conventions

- **Root pages**: `"home"`, `"about"`, `"contact"`
- **Nested pages**: `"category/subcategory"`, `"services/service-name"`
- **Legal pages**: `"legal/privacy-policy"`, `"legal/terms-of-service"`
- **Use kebab-case**: `"my-new-page"` not `"myNewPage"`
- **Match file structure**: TKey should reflect the logical page hierarchy

## Common Mistakes to Avoid

❌ **Wrong TKey format**: `"privacy-policy"` → ✅ `"legal/privacy-policy"`
❌ **Mismatched TKeys**: English and Spanish pages must use the same TKey
❌ **Missing route mappings**: All TKeys must have routes in both languages
❌ **Forgetting getAllTKeys()**: New TKeys must be added to the function
❌ **Using translations prop**: Use `tkey` prop, not legacy `translations`

## Validation

After adding new pages, verify:

1. **TypeScript compilation**: `npm run build`
2. **Hreflang reciprocity**: Check both language versions link to each other
3. **Canonical URLs**: Ensure proper canonical URLs are generated
4. **Sitemap inclusion**: New pages appear in generated sitemap

## Dynamic Content (Blog Posts)

For dynamic content like blog posts, use the generic `"blog"` TKey:

```astro
const lang = 'en'; // or 'es'
const tkey = 'blog' as const;
```

The Base layout will handle hreflang using the blog route mappings.

## Future Improvements

Consider these enhancements for better automation:

1. **Auto-TKey Generation**: Script to scan pages and generate TKeys
2. **Validation Script**: Check for missing route mappings
3. **Page Templates**: Astro templates for new bilingual pages
4. **Build-time Validation**: Fail build if TKey/route mismatches found
