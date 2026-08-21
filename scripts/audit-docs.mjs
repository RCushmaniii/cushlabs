/**
 * Doc drift audit.
 *
 * A batch of documentation was imported from the nyenglishteacher.com repo and never
 * re-scoped. It described Next.js, Netlify, Supabase, Hostinger, a quiz system and an
 * /en/ URL prefix — none of which exist here — while sitting in docs/architecture/ and
 * docs/seo/ where it reads as authoritative. 16 files were deleted and 9 bannered on
 * 2026-08-20 (technical debt #18).
 *
 * This flags two things so it cannot silently regrow:
 *   1. foreign-stack markers in a doc with no NOT-THIS-REPO banner
 *   2. "npm run <name>" references pointing at a script that package.json does not define
 *
 * Advisory, not a build gate: a legitimate mention of another project is not a defect,
 * so this needs a human read rather than a red build.
 *
 * Usage: npm run audit:docs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".md")) out.push(p);
  }
  return out;
};

const FOREIGN = [
  ["nyenglishteacher", /nyenglishteacher/gi],
  ["Netlify", /\bnetlify\b/gi],
  ["Supabase", /\bsupabase\b/gi],
  ["Next.js", /\bnext\.js\b/gi],
  ["Hostinger", /\bhostinger\b/gi],
  ["/en/ route", /["'`(\s]\/en\//g],
  ["src/lib/i18n", /src\/lib\/i18n/g],
  ["quiz system", /\bquiz\b/gi],
  ["pnpm", /\bpnpm\b/gi],
  ["shadcn", /\bshadcn\b/gi],
];

// Scripts referenced in docs that do not exist in package.json.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const realScripts = new Set(Object.keys(pkg.scripts));

const rows = [];
for (const f of walk("docs")) {
  const text = readFileSync(f, "utf8");
  const hits = FOREIGN.map(([label, re]) => {
    const n = (text.match(re) || []).length;
    return n ? `${label}×${n}` : null;
  }).filter(Boolean);

  const deadScripts = [
    ...new Set(
      [...text.matchAll(/npm run ([a-z0-9:_-]+)/g)]
        .map((m) => m[1])
        .filter((s) => !realScripts.has(s)),
    ),
  ];

  const banner = /NOT THIS REPO/i.test(text);
  if (hits.length || deadScripts.length) {
    rows.push({ f: f.replace(/\\/g, "/"), hits, deadScripts, banner });
  }
}

rows.sort((a, b) => b.hits.length - a.hits.length);
console.log(
  `docs with foreign-stack markers or dead scripts: ${rows.length}\n`,
);
for (const r of rows) {
  console.log(r.f + (r.banner ? "   [already bannered]" : ""));
  if (r.hits.length) console.log("    foreign: " + r.hits.join(", "));
  if (r.deadScripts.length)
    console.log("    dead npm scripts: " + r.deadScripts.join(", "));
}
