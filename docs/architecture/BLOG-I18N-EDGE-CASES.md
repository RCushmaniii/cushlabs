# Blog i18n Edge Cases & Solutions

## Critical Issues Identified

### 1. Blog Post Hreflang Problem 🔴 CRITICAL

**Current Issue:**

```astro
// In [slug].astro
const tkey = 'blog' as const; // ❌ All posts use same TKey
```

**Problem:** All blog posts generate hreflang pointing to `/en/blog/` and `/es/blog/` instead of actual post URLs.

**Solution Options:**

#### Option A: Dynamic Hreflang (Recommended)

```astro
---
// Don't use centralized i18n for individual posts
// Generate hreflang manually based on post translations
const currentUrl = `/en/blog/${Astro.params.slug}/`;
const spanishTranslation = post.data.translations?.es;
const hreflangs = [
  { lang: 'en', href: currentUrl },
  ...(spanishTranslation ? [{ lang: 'es', href: `/es/blog/${spanishTranslation}/` }] : [])
];
---

<Base
  lang={lang}
  title={seoTitle}
  description={seoDescription}
  customHreflangs={hreflangs}  // New prop needed
>
```

#### Option B: Individual TKeys (Complex)

```astro
// Would require registering every blog post as a TKey
const tkey = `blog/${Astro.params.slug}` as const;
// But this breaks TypeScript and requires massive i18n.ts updates
```

### 2. Category Pages Not Using i18n System 🔴 CRITICAL

**Current Issue:**

```astro
<PaginatedBlogLayout
  lang="en"
  translationSlugEn="/en/category/executive-english/"
  translationSlugEs="/es/categoria/ingles-ejecutivo/"
/>
```

**Problems:**

- Uses legacy Layout component
- Manual hreflang management
- Not integrated with centralized i18n
- Missing Spanish category pages entirely

**Solution:**

1. Create Spanish category pages
2. Add category TKeys to i18n.ts
3. Update PaginatedBlogLayout to use Base layout
4. Use centralized i18n for categories

### 3. Blog Pagination Inconsistency 🟡 MEDIUM

**Current Issue:**

- Blog index (`/blog/`) uses one system
- Blog pagination (`/blog/2/`) uses another system
- Individual posts (`/blog/post-slug/`) use Base layout

**Solution:**

- Standardize all blog-related pages on Base layout
- Create consistent pagination hreflang handling

### 4. Missing Spanish Blog Infrastructure 🔴 CRITICAL

**Missing Files:**

- `/es/category/[category].astro`
- `/es/blog/[page].astro`
- Proper Spanish blog pagination

## Recommended Implementation Plan

### Phase 1: Fix Blog Post Hreflang

1. Modify Base.astro to accept custom hreflang prop
2. Update blog [slug].astro to generate dynamic hreflang
3. Remove generic 'blog' tkey usage for individual posts

### Phase 2: Integrate Categories with i18n

1. Add category TKeys to i18n.ts:
   ```typescript
   | "category/executive-english"
   | "category/business-english"
   // etc.
   ```
2. Create Spanish category pages
3. Update PaginatedBlogLayout to use Base layout

### Phase 3: Fix Blog Pagination

1. Add blog pagination TKeys to i18n.ts
2. Update pagination components to use Base layout
3. Ensure consistent SEO across all blog pages

### Phase 4: Validation & Testing

1. Run hreflang validation
2. Test category/pagination SEO
3. Verify Spanish blog functionality

## Code Examples

### Enhanced Base Layout (Support Custom Hreflang)

```astro
---
interface Props {
  tkey?: TKey;
  customHreflangs?: Array<{ lang: string; href: string }>;
  // ... other props
}

const { tkey, customHreflangs, ... } = Astro.props;

// Use custom hreflangs if provided, otherwise generate from tkey
const alts = customHreflangs || (tkey ? alternates(tkey) : []);
---
```

### Fixed Blog Post Hreflang

```astro
---
// In [slug].astro
const currentUrl = `/en/blog/${Astro.params.slug}/`;
const spanishTranslation = post.data.translations?.es;

const customHreflangs = [
  { lang: 'en', href: currentUrl },
  ...(spanishTranslation ? [{
    lang: 'es',
    href: `/es/blog/${spanishTranslation}/`
  }] : [])
];
---

<Base
  lang="en"
  customHreflangs={customHreflangs}
  title={seoTitle}
  description={seoDescription}
>
```

### Category Page with i18n

```astro
---
// Add to i18n.ts first
const tkey = `category/${categoryData.slug}` as const;
---

<Base
  lang="en"
  tkey={tkey}
  title={seoTitle}
  description={seoDescription}
>
```

## SEO Impact Assessment

### High Risk Issues:

- ❌ Incorrect hreflang on all blog posts
- ❌ Missing Spanish category pages
- ❌ Inconsistent canonical URLs

### Medium Risk Issues:

- ⚠️ Mixed layout systems
- ⚠️ Manual translation management

### Low Risk Issues:

- 💡 Pagination URL structure
- 💡 Category slug consistency

## Testing Checklist

- [ ] Blog post hreflang points to correct URLs
- [ ] Spanish category pages exist and function
- [ ] Pagination works in both languages
- [ ] SEO metadata consistent across all blog pages
- [ ] No duplicate content issues
- [ ] Canonical URLs point to correct pages
