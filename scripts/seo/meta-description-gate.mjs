#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../../dist");
const MIN = 120;
const MAX = 160;

// Function words only — they are what actually differ between the two languages.
const EN_WORDS =
  /\b(the|and|with|for|your|from|that|into|this|built|which|when|their|are|is|of|to|you|it)\b/gi;
const ES_WORDS =
  /\b(el|la|los|las|de|del|con|para|tu|tus|que|una|un|por|sobre|como|desde|más|y|en|su)\b/gi;
const wrongLanguage = [];

const EXCLUDE_PREFIXES = ["dev/docs/", "admin/"];
const EXCLUDE_FILES = new Set(["index.html", "404.html"]);

const META_RE =
  /<meta\s+[^>]*name=["']description["'][^>]*content=(?:"([^"]*)"|'([^']*)')[^>]*>/i;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.isFile() && e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error(`meta-description-gate: dist/ not found at ${DIST}`);
  process.exit(1);
}

const files = walk(DIST);
const tooLong = [];
const tooShort = [];
let checked = 0;
let missing = 0;
let excluded = 0;

for (const file of files) {
  const rel = path.relative(DIST, file).replace(/\\/g, "/");
  if (
    EXCLUDE_FILES.has(rel) ||
    EXCLUDE_PREFIXES.some((p) => rel.startsWith(p))
  ) {
    excluded++;
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const m = html.match(META_RE);
  if (!m) {
    missing++;
    continue;
  }
  const desc = (m[1] ?? m[2] ?? "").trim();
  const len = desc.length;
  checked++;
  if (len > MAX) tooLong.push({ rel, len, desc });
  else if (len < MIN) tooShort.push({ rel, len, desc });

  // A length check cannot see the worst failure mode: an English description on a
  // Spanish page. On 2026-08-20 that was true of 18 of 36 /es/projects/ pages — the
  // description chain fell through to the GitHub repo blurb — and every length-based
  // check reported them as fine. Function words are the signal; topic nouns and product
  // names are shared between the languages and prove nothing.
  if (rel.startsWith("es/")) {
    const en = (desc.match(EN_WORDS) || []).length;
    const es = (desc.match(ES_WORDS) || []).length;
    if (en > es) wrongLanguage.push({ rel, en, es, desc });
  }
}

console.log(
  `meta-description-gate: ${checked} pages checked, ${tooShort.length} too short (FAIL), ${tooLong.length} too long (FAIL), ${wrongLanguage.length} wrong language (FAIL), ${missing} missing meta, ${excluded} excluded`,
);

const failed = tooShort.length + tooLong.length + wrongLanguage.length;

if (wrongLanguage.length > 0) {
  console.error(
    `\n❌ FAIL — ${wrongLanguage.length} Spanish page(s) serving an ENGLISH meta description:`,
  );
  for (const v of wrongLanguage) {
    console.error(`  /${v.rel}  (en:${v.en} es:${v.es})`);
    console.error(`    "${v.desc}"`);
  }
  console.error(
    `  Add Spanish copy for these projects in src/data/projectCardsEs.ts, or an entry in`,
  );
  console.error(
    `  the metaDescriptions map in src/pages/es/projects/[slug].astro.`,
  );
}

if (tooShort.length > 0) {
  console.error(
    `\n❌ FAIL — ${tooShort.length} pages with description < ${MIN} chars:`,
  );
  for (const v of tooShort) {
    console.error(`  /${v.rel} (${v.len} chars)`);
    console.error(`    "${v.desc}"`);
  }
}

if (tooLong.length > 0) {
  console.error(
    `\n❌ FAIL — ${tooLong.length} pages with description > ${MAX} chars:`,
  );
  for (const v of tooLong) {
    console.error(`  /${v.rel} (${v.len} chars)`);
    console.error(`    "${v.desc}"`);
  }
}

if (failed === 0) {
  console.log(
    `\n✅ PASS — all ${checked} pages have descriptions between ${MIN}-${MAX} chars`,
  );
  process.exit(0);
}

console.error(
  `\n🚫 FIX REQUIRED — adjust ${failed} meta description(s) to be ${MIN}-${MAX} characters before deploying.`,
);
process.exit(1);
