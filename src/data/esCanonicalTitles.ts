// Canonical Spanish (es-MX) portfolio titles — single source of truth.
//
// English titles single-source from `projects.generated.json` `title` (built from
// each repo's PORTFOLIO.md). There is no generated ES title, so the canonical ES
// string for a project lives HERE and is referenced by every ES render path:
//   - the ES card title       (projectCardsEs.ts)
//   - the ES detail headline  (projectDetails.ts)
//   - the ES SEO <title>       (src/pages/es/projects/[slug].astro)
//
// Edit the value in this file and all three ES surfaces update together — they
// cannot drift. Add new entries here as ES titles need to be pinned across surfaces.

export const ES_TITLE_BIOJALISCO_PITCH =
  "BioJalisco — Sitio de Presentación Cinematográfico";
