## 🧠 Project Context: First Principles SEO Integrity (Titan + Astro)

This project (`nyenglishteacher.com`) is built with the **Astro Titan template** and designed to be a clean, fast, SEO-optimized static site. However, as the site grows—with multilingual pages, category archives, service descriptions, and blog pagination—it’s easy for routing mismatches and content gaps to silently create SEO problems.

The **recent external SEO audit** revealed a rise in **404 errors, broken redirects, missing hreflang tags, and schema validation issues**, despite intentional work to improve things. That means:
➡️ Errors are creeping in from the **template logic, routing layer, or build process**—not just content.
➡️ The sitemap and internal links do **not accurately reflect real output** in `/dist`.
➡️ These technical gaps are **hurting crawlability, discoverability, and ultimately ranking.**

---

## 🛠 Goal of This Windsurf AI Rule Set

We want Windsurf AI to:

1. **Auto-heal known issues** — based on the last audit’s 13 critical 404s.
2. **Prevent regressions** — by enforcing checks against new broken internal links.
3. **Avoid manual patching** — through programmatic fixes like:
   - Intelligent route generation (`[slug].astro` category archives)
   - URL rewriting in pagination utilities
   - Redirect injection
   - Dynamic sitemap pruning
4. **Enforce clean architecture** — ensure sitemap, internal links, and final build outputs are all in sync.

---

## 🧱 First Principles Approach to SEO and Routing

| Principle                                 | Implementation Insight                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **No link should 404**                    | Every internal link in content or templates must resolve to an actual file in `/dist` or have a redirect    |
| **Sitemap = Reality**                     | Sitemaps must represent only those URLs that are actually built—not theoretical dynamic routes              |
| **Each language is a namespace**          | All pages must live under `/en/` or `/es/` consistently, including blog, categories, and services           |
| **One canonical per route**               | Even if multiple URLs point to similar content, redirects should push traffic to a single canonical path    |
| **Dynamic routes need guards**            | Category pages, paginated blog pages, etc. should only be linkable if the route exists and has data to show |
| **Broken internal links = build failure** | No deployment should proceed with broken links; use CI checks to abort if necessary                         |

---

## 🗂️ Supporting Systems in This Project

| Area                      | Technology                                                        |
| ------------------------- | ----------------------------------------------------------------- |
| **Routing**               | Astro file-based + `getStaticPaths()`                             |
| **Content**               | Markdown files in `/src/content` (services, blog)                 |
| **Language Support**      | Static prefixes (`/en/`, `/es/`) + manual hreflang tags           |
| **Sitemap**               | `@astrojs/sitemap` plugin                                         |
| **Pagination**            | Custom utility in `src/utils/pagination.ts`                       |
| **SEO Rules Enforcement** | Windsurf AI + external SEO crawler (Ahrefs, Screaming Frog, etc.) |

---

By encoding these assumptions and guiding principles in Windsurf AI, the site will **build clean**, **crawl clean**, and **scale without surprises**. The rules below reflect this mindset, and are designed to evolve as the site grows.

---

## 📝 Project Goal: Multilingual Sitemap & Build Integrity (for AI & Reviewers)

> **Goal:**
> Ensure the website generates a multilingual, SEO-optimized sitemap that accurately links English and Spanish pages (including correct `hreflang` alternates), using Astro’s content and our folder structure.
>
> _All scripts must maintain Google/Bing best practices, avoid duplicate URLs, and reflect the true set of published content._

### ⚙️ How We Accomplish This

- **Sitemap Generation:**
  - Iterate through all Markdown/content files in both `/en/` and `/es/` directories.
  - For each page:
    - Output a canonical `<url>` entry.
    - Add `<xhtml:link rel="alternate" hreflang="en" ...>` and `<xhtml:link rel="alternate" hreflang="es" ...>` for available translations.
    - Always include `<xhtml:link rel="alternate" hreflang="x-default" ...>` for the primary version.
    - If a translation is missing, do not output a broken/empty alternate.
- **No Hardcoding:**
  - Derive alternates from folder structure or frontmatter, not a hardcoded map (except rare exceptions).
- **Meta & SEO:**
  - All sitemap URLs must have matching `<head>` alternate links and canonical tags.
  - Titles, descriptions, and canonical URLs must match between meta and sitemap.
- **Build Script:**
  - Run the sitemap generator at the end of the build.
  - Validate that all published routes are reflected in the sitemap.
  - Log warnings for missing alternates or duplicate URLs.
- **Testing:**
  - Validate `sitemap.xml` after build (e.g., with Google Search Console).
  - Spot-check URLs for correct `hreflang` alternates.

#### 🏷️ Example Rule for AI

```
# Multilingual Sitemap Generation
- Always output <xhtml:link rel="alternate"> blocks for each available translation.
- Derive translation slugs from directory structure, not a hardcoded map.
- If a translation does not exist, omit the alternate for that language.
- Ensure all canonical and alternate links are valid, published URLs.

# SEO Consistency
- All URLs in the sitemap must match the actual deployed URLs.
- Every language version should have matching <head> alternate links.
- Do not include draft, test, or unpublished content.
```

---

# Windsurf Project Coding Rules

## Component Imports

- Always use **absolute imports** for shared components, data, and assets:
  - `@components/`, `@layouts/`, `@data/`, `@assets/`
- Keep local imports (unique to a page/component) relative.

## Translation & Localization

- Reference the translation map in `/data` for slugs; keep language alternates in sync between EN and ES.
- For every bilingual page, update translation maps in both directions (EN→ES and ES→EN).
- Language switchers and `hreflang` links must be present and correct for all top-level and blog/category pages.

## SEO Meta

- Titles and descriptions must follow project length/content requirements (see `/seo` docs or project README).
- All images must include descriptive `alt` text, localized per language.

## General

- All code should be DRY and maintainable. Avoid duplicate logic between EN and ES; use shared props and config objects.
- Remove any debug code or `console.log` statements before merge/release.

---

## Example Patterns

**Structured Data:**

```astro
<script type="application/ld+json">
  {JSON.stringify(organizationJsonLd)}
</script>
```

**Component Imports:**

```js
import Hero from "@components/sections/Hero.astro";
import { featureLists } from "@data/features";
```

**SEO Meta:**

```astro
---
import { seoTitle, seoDescription } from "@data/seo";
---
<Layout title={seoTitle} description={seoDescription} ... />
```

**Bilingual Translation Map:**

```js
// /data/translationMap.js
export const translationMap = {
  en: { home: "/en/", about: "/en/about" },
  es: { home: "/es/", about: "/es/about" },
};
```

---

## Modifying These Rules

- Update `WindsurfRules.md` for project-specific conventions.
- Submit a PR for rule changes—explain rationale and give examples of new/changed rules.
- After updating rules, notify the team to avoid code drift.

---

## 🛡️ Auto-Heal YAML: 404s, Pagination, and Sitemap Integrity

```yaml
#######################################################################
#  NY English Teacher  – Windsurf AI Project-specific Rules
#  Purpose: Auto-fix 404s reported on 10-Jul-2025 and prevent repeats
#######################################################################

# --------------------------------------------------------------------
# 1. PAGINATION BUG  –  “/2” returns 404
# --------------------------------------------------------------------
- id: pagination-root-2
  description: >
    Redirect stray root-level page "/2" ⇒ canonical blog page
    and patch pagination util so future links generate
    "/{lang}/blog/page/2/" not "/2".
  detect:
    url_equals: "/2"
  fix:
    - action: create_redirect
      status: 301
      to: "/en/blog/page/2/" # default lang = EN
    - action: patch_file
      path: "src/utils/pagination.ts"
      find: "`${page}`" # root-level pattern
      replace: "`blog/page/${page}/`"

# --------------------------------------------------------------------
# 2. ORPHAN BLOG ROOT  –  “/blog” 404s (missing lang prefix & slash)
# --------------------------------------------------------------------
- id: orphan-blog-root
  detect: { url_equals: "/blog" }
  fix:
    - create_redirect: { status: 301, to: "/en/blog/" }
    - update_sitemap: { remove: "/blog", add: "/en/blog/" }

# --------------------------------------------------------------------
# 3–8. ENGLISH CATEGORY PAGES  –  “/category/<slug>”
# --------------------------------------------------------------------
- id: build-category-pages-en
  description: Build static archive pages for every EN category slug.
  detect: { url_pattern: "^/category/[a-z0-9-]+$" }
  fix:
    - generate_dynamic_route:
        template: |
          ---astro
          import { getCollection } from 'astro:content';
          const { slug } = Astro.params;
          const posts = (await getCollection('blog'))
                        .filter(p => p.data.categories?.includes(slug));
          ---
          <Layout title={slug.replace(/-/g,' ').toUpperCase()}>
            <ArticleList posts={posts} />
          </Layout>
        path: "src/pages/en/category/[slug].astro"
    - create_redirect:
        status: 301
        from: "/category/{slug}"
        to: "/en/category/{slug}/"

# --------------------------------------------------------------------
# 9–12. SPANISH CATEGORY PAGES  –  “/category/<spanish-slug>”
# --------------------------------------------------------------------
- id: build-category-pages-es
  detect: { url_pattern: "^/category/(ingles|carrera|comunicacion|coaching).*" }
  fix:
    - generate_dynamic_route:
        path: "src/pages/es/category/[slug].astro"
        template: "@@copy(id=build-category-pages-en.template)" # reuse EN template
    - create_redirect:
        status: 301
        to: "/es/category/{slug}/"

# --------------------------------------------------------------------
# 13. MISSING ES SERVICE PAGE
# --------------------------------------------------------------------
- id: es-service-missing
  detect:
    { url_equals: "/es/servicios/ingles-para-comunicacion-de-alto-impacto" }
  fix:
    - if_content_exists:
        path: "src/content/services/es/ingles-para-comunicacion-de-alto-impacto.md"
        then: skip # page is now present → done
        else:
          - remove_internal_links:
              pointing_to: "/es/servicios/ingles-para-comunicacion-de-alto-impacto"
          - log_warning: "Link removed – ES service copy not ready"

# --------------------------------------------------------------------
# 4XX REGRESSION GUARD  –  BREAK BUILD IF NEW INTERNAL 4xx APPEAR
# --------------------------------------------------------------------
- id: abort-on-new-4xx
  description: Hard-stop the pipeline if any internal 4xx/5xx remain after fixes.
  detect: { build_stage: "post" }
  assert:
    condition: internal_4xx_count == 0
    on_fail: abort_build
    message: |
      "❌ New broken links detected. Run `npm run crawl:internal` to list them."

# --------------------------------------------------------------------
# SITEMAP SANITY  –  include only real pages in /dist
# --------------------------------------------------------------------
- id: sitemap-prune
  description: Remove any path that wasn’t generated to /dist.
  detect: { build_stage: "pre-sitemap" }
  fix: { prune_sitemap_to_dist: true }
#######################################################################
#  END  –  Windsurf will interpret each rule top-to-bottom
#######################################################################
```

---

_Last updated: 2025-07-10_
