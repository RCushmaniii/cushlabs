import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';

// ── Slug-mismatched route pairs for sitemap hreflang ────────────────
// EN path (no prefix) → ES slug (no /es prefix)
const routePairs = {
  '/consultation': '/reservar',
};

// EN blog slug → ES blog slug
const blogPairs = {
  'automating-your-business-workflows': 'automatizando-los-flujos-de-tu-negocio',
  'building-custom-ai-chatbots-for-smbs': 'chatbots-de-ia-personalizados-para-pymes',
  'getting-started-with-rag-a-practical-guide': 'empezando-con-rag-una-gu-a-pr-ctica',
};

// Build full bidirectional URL map: absolute EN URL ↔ absolute ES URL
const SITE = 'https://www.cushlabs.ai';
const hreflangMap = new Map();

// Static route pairs
for (const [enPath, esSlug] of Object.entries(routePairs)) {
  const enUrl = `${SITE}${enPath}/`;
  const esUrl = `${SITE}/es${esSlug}/`;
  hreflangMap.set(enUrl, esUrl);
  hreflangMap.set(esUrl, enUrl);
}

// Blog slug pairs
for (const [enSlug, esSlug] of Object.entries(blogPairs)) {
  const enUrl = `${SITE}/blog/${enSlug}/`;
  const esUrl = `${SITE}/es/blog/${esSlug}/`;
  hreflangMap.set(enUrl, esUrl);
  hreflangMap.set(esUrl, enUrl);
}

// ── Priority rules by URL pattern ───────────────────────────────────
function getPriority(url) {
  const path = url.replace(SITE, '');
  if (path === '/' || path === '/es/' || path === '/es') return 1.0;
  if (/^\/(es\/)?services/.test(path)) return 0.9;
  if (/^\/(es\/)?portfolio/.test(path)) return 0.8;
  if (/^\/(es\/)?projects\//.test(path)) return 0.7;
  if (/^\/(es\/)?blog\/[^/]/.test(path)) return 0.7;
  if (/^\/(es\/)?about/.test(path)) return 0.7;
  if (/^\/(es\/)?consultation/.test(path) || /^\/(es\/)?reservar/.test(path)) return 0.8;
  if (/^\/(es\/)?contact/.test(path)) return 0.7;
  if (/^\/(es\/)?faq/.test(path)) return 0.6;
  if (/^\/(es\/)?blog\/?$/.test(path)) return 0.6;
  if (/^\/(es\/)?(terms|privacy)/.test(path)) return 0.3;
  return 0.5;
}

function getChangefreq(url) {
  const path = url.replace(SITE, '');
  if (path === '/' || path === '/es/' || path === '/es') return 'weekly';
  if (/^\/(es\/)?blog/.test(path)) return 'monthly';
  if (/^\/(es\/)?(terms|privacy)/.test(path)) return 'yearly';
  return 'monthly';
}

export default defineConfig({
  integrations: [
    tailwind(),
    sentry({
      sourceMapsUploadOptions: {
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      },
    }),
    sitemap({
      filter: (page) => {
        // Exclude 404, old/backup pages, and internal routes
        const path = page.replace(SITE, '');
        if (path.includes('404')) return false;
        if (path.includes('_')) return false;
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
          const isEs = url.includes('/es/') || url.endsWith('/es');
          item.links = [
            { lang: 'en-US', url: isEs ? partner : url },
            { lang: 'es-MX', url: isEs ? url : partner },
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
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-MX',
        },
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
  site: 'https://www.cushlabs.ai',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
