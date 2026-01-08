import { en } from './translations/en';
import { es } from './translations/es';

export type Locale = 'en' | 'es';

const dictionaries = {
  en,
  es,
} as const;

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/es') ? 'es' : 'en';
}

export function getLocalizedPath(pathname: string, to: Locale): string {
  const normalized = pathname.startsWith('/es') ? pathname.replace(/^\/es(\/|$)/, '/') : pathname;
  if (to === 'en') return normalized === '' ? '/' : normalized;
  return normalized === '/' ? '/es' : `/es${normalized}`;
}

export function t<L extends Locale>(locale: L) {
  return dictionaries[locale];
}
