import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type BlogLocale = "en" | "es";

/** Language of a post, from its id folder prefix ("en/..." | "es/..."). */
export function postLang(post: BlogPost): BlogLocale {
  return post.id.startsWith("es/") ? "es" : "en";
}

/** Bare slug of a post (id without the language folder prefix). */
export function postSlug(post: BlogPost): string {
  return post.id.replace(/^(en|es)\//, "");
}

/** Public URL for a post. EN is unprefixed (`/blog/…`), ES is `/es/blog/…`. */
export function postUrl(locale: BlogLocale, slug: string): string {
  return locale === "es" ? `/es/blog/${slug}/` : `/blog/${slug}/`;
}

/** Blog index URL for a locale. */
export function blogIndexUrl(locale: BlogLocale): string {
  return locale === "es" ? "/es/blog/" : "/blog/";
}

/** Normalize a `translations` value (may be a full path or a bare slug) to a bare slug. */
export function extractSlug(pathOrSlug?: string): string | null {
  if (!pathOrSlug) return null;
  if (pathOrSlug.startsWith("/")) {
    return pathOrSlug.split("/").filter(Boolean).pop() || null;
  }
  return pathOrSlug;
}

/** Published posts for one locale, newest first. */
export function postsForLocale(
  all: BlogPost[],
  locale: BlogLocale,
): BlogPost[] {
  return all
    .filter((p) => postLang(p) === locale && p.data.publish !== false)
    .sort(
      (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
    );
}

/**
 * Per-post hreflang alternates. Single-language posts emit ONLY themselves
 * (no pointer to a non-existent twin — this is the hybrid model's core rule).
 * Cornerstones (with a reciprocal `translations` entry) emit the full EN↔ES pair.
 * Returns absolute URLs. `xDefault` is the EN href for a pair, else self.
 */
export function postHreflangs(
  post: BlogPost,
  site: string,
): { alternates: { lang: string; href: string }[]; xDefault: string } {
  const siteBase = site.replace(/\/$/, "");
  const lang = postLang(post);
  const selfHref = `${siteBase}${postUrl(lang, postSlug(post))}`;
  const selfLang = lang === "es" ? "es-MX" : "en-US";

  const twinSlug =
    lang === "en"
      ? extractSlug(post.data.translations?.es)
      : extractSlug(post.data.translations?.en);

  if (!twinSlug) {
    // Single-language: self only, x-default = self.
    return {
      alternates: [{ lang: selfLang, href: selfHref }],
      xDefault: selfHref,
    };
  }

  const twinLang: BlogLocale = lang === "en" ? "es" : "en";
  const twinHref = `${siteBase}${postUrl(twinLang, twinSlug)}`;
  const enHref = lang === "en" ? selfHref : twinHref;

  return {
    alternates: [
      { lang: "en-US", href: lang === "en" ? selfHref : twinHref },
      { lang: "es-MX", href: lang === "es" ? selfHref : twinHref },
    ],
    xDefault: enHref,
  };
}

/** Top-N related posts in the SAME language, scored by shared categories. */
export function relatedPosts(
  all: BlogPost[],
  post: BlogPost,
  n = 3,
): BlogPost[] {
  const lang = postLang(post);
  const cats = new Set(post.data.categories);
  return postsForLocale(all, lang)
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      score: p.data.categories.filter((c) => cats.has(c)).length,
    }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.publishDate.valueOf() - a.post.data.publishDate.valueOf(),
    )
    .slice(0, n)
    .map((x) => x.post);
}

/** Previous (older) / next (newer) post in the same language's date order. */
export function prevNext(sortedSameLang: BlogPost[], post: BlogPost) {
  const i = sortedSameLang.findIndex((p) => p.id === post.id);
  return {
    newer: i > 0 ? sortedSameLang[i - 1] : null,
    older:
      i >= 0 && i < sortedSameLang.length - 1 ? sortedSameLang[i + 1] : null,
  };
}
