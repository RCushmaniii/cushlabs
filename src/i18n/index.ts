import { en } from './translations/en';
import { es } from './translations/es';

export type Locale = 'en' | 'es';

const dictionaries = {
  en,
  es,
} as const;

/**
 * Explicit route pairs for pages where EN and ES slugs differ.
 * Key = EN path (no locale prefix), Value = ES slug (no /es prefix).
 */
const routePairs: Record<string, string> = {
  '/consultation': '/reservar',
};

// Build reverse map: ES path → EN path
const reverseRoutePairs: Record<string, string> = {};
for (const [enPath, esSlug] of Object.entries(routePairs)) {
  reverseRoutePairs[esSlug] = enPath;
}

/**
 * Blog slug pairs — EN slug ↔ ES slug.
 * Add new entries here when publishing bilingual blog posts.
 */
const blogPairs: Record<string, string> = {
  'automating-your-business-workflows': 'automatizando-los-flujos-de-tu-negocio',
  'building-custom-ai-chatbots-for-smbs': 'chatbots-de-ia-personalizados-para-pymes',
  'getting-started-with-rag-a-practical-guide': 'empezando-con-rag-una-gu-a-pr-ctica',
};

const reverseBlogPairs: Record<string, string> = {};
for (const [enSlug, esSlug] of Object.entries(blogPairs)) {
  reverseBlogPairs[esSlug] = enSlug;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/es') ? 'es' : 'en';
}

export function getLocalizedPath(pathname: string, to: Locale): string {
  // Strip trailing slash for matching, but preserve root
  const clean = pathname.replace(/\/$/, '') || '/';
  const isEs = clean.startsWith('/es');

  // Get the locale-less path
  const bare = isEs ? (clean.replace(/^\/es(\/|$)/, '/') || '/') : clean;

  // Check explicit route pairs
  if (to === 'es') {
    if (routePairs[bare]) return `/es${routePairs[bare]}`;
  } else {
    // Going to EN — check if bare path is an ES-specific slug
    const esPath = isEs ? bare : clean;
    if (reverseRoutePairs[esPath]) return reverseRoutePairs[esPath];
  }

  // Check blog slug pairs
  const blogMatch = bare.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    if (to === 'es' && blogPairs[slug]) return `/es/blog/${blogPairs[slug]}`;
    if (to === 'en' && reverseBlogPairs[slug]) return `/blog/${reverseBlogPairs[slug]}`;
  }

  // Default: just swap the /es prefix
  if (to === 'en') return bare === '' ? '/' : bare;
  return bare === '/' ? '/es' : `/es${bare}`;
}

/** All route pairs exported for sitemap serialization */
export { routePairs, blogPairs };

export function t<L extends Locale>(locale: L) {
  return dictionaries[locale];
}
