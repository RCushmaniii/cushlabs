/**
 * Meta description composition for project detail pages.
 *
 * WHY THIS EXISTS
 * ---------------
 * The two [slug].astro pages each built their description inline, and both chains
 * reached for `project.description` — the GitHub repo blurb, written for developers —
 * before `project.tagline`, which is the marketing line from PORTFOLIO.md. Measured on
 * a real build of the 72 project pages:
 *
 *   - 50 of 72 descriptions were cut off mid-sentence with an ellipsis. That string is
 *     what Google prints in the result, and "…lps operations leaders evaluate whether"
 *     reads as broken.
 *   - 18 of 36 SPANISH pages served an ENGLISH description, because the ES chain never
 *     consulted `esCard.tagline` even though Spanish copy existed for 30 of 36 projects.
 *     The ES page deliberately prefixed the English blurb with the project title to dodge
 *     a duplicate-description warning — trading a reporting flag for English snippets in
 *     front of Spanish searchers.
 *
 * Project pages are 72 of the site's 126 URLs, so this is the majority of the crawlable
 * surface, not an edge case.
 */

/** Sentence-ish terminators we are willing to end a snippet on. */
const SENTENCE_END = /[.!?…]["')\]]?\s/g;

/**
 * Trim to `max` characters without ever cutting mid-word.
 *
 * Prefers ending on a complete sentence. Falls back to a clean word boundary with NO
 * ellipsis: an ellipsis advertises that the text was chopped, which is exactly the
 * "broken snippet" impression we are removing. A description that simply ends reads as
 * deliberate.
 */
export function trimToLength(text: string, max: number, min = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max + 1);
  let lastSentence = -1;
  for (const m of window.matchAll(SENTENCE_END)) {
    lastSentence = m.index + m[0].trimEnd().length;
  }
  // Accept a sentence break only if what remains still clears `min`. A percentage-of-max
  // threshold was not enough: a 170-char description whose first sentence ended at 100
  // was cut to that sentence and became "too short" — trading one gate failure for
  // another. The floor has to be the same number the gate enforces.
  if (lastSentence >= min) return window.slice(0, lastSentence).trim();

  const cut = window.slice(0, max);
  return cut
    .slice(0, cut.lastIndexOf(" "))
    .replace(/[,;:–—-]$/, "")
    .trim();
}

/**
 * Build a description from candidate fragments, best first.
 *
 * All distinct fragments are joined in order, then trimmed to `max` on a sentence
 * boundary. The FIRST fragment decides what the snippet leads with — that is the whole
 * point of the ordering at the call sites — while later ones top it up so that a short
 * tagline still reaches a usable length.
 *
 * Stopping early once a minimum was reached seemed tidier, but it starved 14 pages whose
 * tagline is under 120 characters on its own. Falsy fragments, exact duplicates, and
 * fragments already contained in the text so far are dropped, so callers can pass
 * optional fields directly without guarding them.
 */
export function composeMetaDescription(
  fragments: (string | null | undefined)[],
  { max = 158, min = 120 }: { max?: number; min?: number } = {},
): string {
  const parts: string[] = [];
  const seen = new Set<string>();

  for (const raw of fragments) {
    if (!raw) continue;
    const frag = raw
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!frag) continue;

    const key = frag.toLowerCase();
    if (seen.has(key)) continue;
    // Skip a fragment already contained in what we have (common when a tagline is
    // reused verbatim as the opening of a longer summary).
    if (parts.some((p) => p.toLowerCase().includes(key))) continue;
    seen.add(key);

    parts.push(frag);
  }

  return trimToLength(joinParts(parts), max, min);
}

function joinParts(parts: string[]): string {
  return parts
    .map((p, i) => (i === 0 || /[.!?]$/.test(parts[i - 1]) ? p : p))
    .reduce((acc, p) => (acc ? `${acc.replace(/[.\s]+$/, "")}. ${p}` : p), "");
}
