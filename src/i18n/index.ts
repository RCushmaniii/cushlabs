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


export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/es') ? 'es' : 'en';
}

export function getLocalizedPath(pathname: string, to: Locale): string {
  // Strip trailing slash for matching, but preserve root
  const clean = pathname.replace(/\/$/, '') || '/';
  const isEs = clean.startsWith('/es');

  // Get the locale-less path
  const bare = isEs ? (clean.replace(/^\/es(\/|$)/, '/') || '/') : clean;

  let result: string;

  // Check explicit route pairs
  if (to === 'es') {
    if (routePairs[bare]) { result = `/es${routePairs[bare]}`; }
  } else {
    // Going to EN — check if bare path is an ES-specific slug
    const esPath = isEs ? bare : clean;
    if (reverseRoutePairs[esPath]) { result = reverseRoutePairs[esPath]; }
  }

  // Default: just swap the /es prefix
  if (!result!) {
    if (to === 'en') result = bare === '' ? '/' : bare;
    else result = bare === '/' ? '/es' : `/es${bare}`;
  }

  // Ensure trailing slash for canonical URL consistency
  return result === '/' ? '/' : result.endsWith('/') ? result : `${result}/`;
}

/** All route pairs exported for sitemap serialization */
export { routePairs };

export function t<L extends Locale>(locale: L) {
  return dictionaries[locale];
}
