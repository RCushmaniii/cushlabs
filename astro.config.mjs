import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";

// ── Slug-mismatched route pairs for sitemap hreflang ────────────────
// EN path (no prefix) → ES slug (no /es prefix)
const routePairs = {
  "/consultation": "/reservar",
  "/pricing": "/precios",
};

// Build full bidirectional URL map: absolute EN URL ↔ absolute ES URL
const SITE = "https://www.cushlabs.ai";
const hreflangMap = new Map();

// Static route pairs
for (const [enPath, esSlug] of Object.entries(routePairs)) {
  const enUrl = `${SITE}${enPath}/`;
  const esUrl = `${SITE}/es${esSlug}/`;
  hreflangMap.set(enUrl, esUrl);
  hreflangMap.set(esUrl, enUrl);
}

// Blog cornerstone (bilingual) pairs — derived from EN post frontmatter, the
// single source of truth (ES posts link back via translations.en). Only posts
// with a reciprocal translations.es become a pair; single-language posts are
// intentionally absent, so the sitemap emits self-referencing hreflang for them
// (the hybrid model — docs/strategy/BLOG-HYBRID-ARCHITECTURE-PROPOSAL.md).
const blogEnDir = path.resolve("./src/content/blog/en");
if (fs.existsSync(blogEnDir)) {
  for (const file of fs.readdirSync(blogEnDir)) {
    if (!file.endsWith(".md")) continue;
    const { data } = matter(
      fs.readFileSync(path.join(blogEnDir, file), "utf-8"),
    );
    const esTwin = data?.translations?.es;
    if (!esTwin) continue;
    const esSlug = esTwin.startsWith("/")
      ? esTwin.split("/").filter(Boolean).pop()
      : esTwin;
    const enUrl = `${SITE}/blog/${file.replace(/\.md$/, "")}/`;
    const esUrl = `${SITE}/es/blog/${esSlug}/`;
    hreflangMap.set(enUrl, esUrl);
    hreflangMap.set(esUrl, enUrl);
  }
}

// ── Priority rules by URL pattern ───────────────────────────────────
function getPriority(url) {
  const path = url.replace(SITE, "");
  if (path === "/" || path === "/es/" || path === "/es") return 1.0;
  if (/^\/(es\/)?blog\/?$/.test(path)) return 0.7;
  if (/^\/(es\/)?blog\//.test(path)) return 0.6;
  if (/^\/(es\/)?services/.test(path)) return 0.9;
  if (/^\/(es\/)?portfolio/.test(path)) return 0.8;
  if (/^\/(es\/)?projects\//.test(path)) return 0.7;
  if (/^\/(es\/)?about/.test(path)) return 0.7;
  if (/^\/(es\/)?consultation/.test(path) || /^\/(es\/)?reservar/.test(path))
    return 0.8;
  if (/^\/(es\/)?contact/.test(path)) return 0.7;
  if (/^\/(es\/)?faq/.test(path)) return 0.6;
  if (/^\/(es\/)?(terms|privacy)/.test(path)) return 0.3;
  return 0.5;
}

function getChangefreq(url) {
  const path = url.replace(SITE, "");
  if (path === "/" || path === "/es/" || path === "/es") return "weekly";
  if (/^\/(es\/)?blog/.test(path)) return "weekly";
  if (/^\/(es\/)?(terms|privacy)/.test(path)) return "yearly";
  return "monthly";
}

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sentry({
      sourceMapsUploadOptions: {
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      },
    }),
    sitemap({
      filter: (page) => {
        const path = page.replace(SITE, "");
        if (path.includes("404")) return false;
        if (path.includes("_")) return false;
        // Internal flow pages with noindex meta — must NOT appear in sitemap
        // (Ahrefs flags "noindex page in sitemap" as a hard error).
        if (/\/messenger-assistant\/connect(ed)?\/?$/.test(path)) return false;
        if (/\/es\/messenger-assistant\/connect(ed)?\/?$/.test(path))
          return false;
        // Cold-outreach landing pages (noindex, DM-driven, not organic SEO) —
        // deliberately kept out of the sitemap. es-MX: /salones/, /clinicas-dentales/;
        // en-US: /salons/. See docs/strategy/MEXICO-GTM-STRATEGY.md.
        if (/\/(salones|salons|clinicas-dentales)\/?$/.test(path)) return false;
        return true;
      },
      serialize: (item) => {
        const url = item.url;

        // Set priority and changefreq
        item.priority = getPriority(url);
        item.changefreq = getChangefreq(url);

        // ── Hreflang pairing ──
        // Tier 1: Check explicit mismatched-slug map
        const partner = hreflangMap.get(url);
        if (partner) {
          const isEs = url.includes("/es/") || url.endsWith("/es");
          item.links = [
            { lang: "en-US", url: isEs ? partner : url },
            { lang: "es-MX", url: isEs ? url : partner },
          ];
          return item;
        }

        // Tier 2: Auto-pair matching-path pages (default @astrojs/sitemap behavior)
        // The i18n config handles this automatically for matching slugs.
        // Pages that don't match either tier get self-referencing hreflang
        // from the i18n config.

        return item;
      },
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          es: "es-MX",
        },
      },
    }),
  ],
  output: "static",
  trailingSlash: "always",
  site: "https://www.cushlabs.ai",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
