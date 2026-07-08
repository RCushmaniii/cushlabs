// Bilingual blog category registry. Post frontmatter uses the canonical `key`;
// the UI renders the locale-appropriate label. Keep keys stable — they drive
// filtering and related-post matching.
export interface BlogCategory {
  key: string;
  en: string;
  es: string;
}

export const blogCategories: BlogCategory[] = [
  {
    key: "facebook-messenger",
    en: "Facebook & Messenger",
    es: "Facebook y Messenger",
  },
  { key: "ai-chatbots", en: "AI Chatbots", es: "Chatbots con IA" },
  { key: "local-seo", en: "Local SEO", es: "SEO Local" },
  { key: "lead-generation", en: "Lead Generation", es: "Generación de Leads" },
  { key: "small-business", en: "Small Business", es: "Negocios Pequeños" },
  { key: "automation", en: "Automation", es: "Automatización" },
];

const byKey = new Map(blogCategories.map((c) => [c.key, c]));

/** Localized label for a category key, falling back to the raw key. */
export function categoryLabel(key: string, locale: "en" | "es"): string {
  return byKey.get(key)?.[locale] ?? key;
}
