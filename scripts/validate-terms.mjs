/**
 * Fail the build when a rendered page contradicts the commercial terms.
 *
 * The sync script stops the DATA drifting. This stops the PROSE drifting — because most
 * of these claims live in sentences, not in fields, and a sentence cannot import a value.
 *
 * It reads dist/ rather than src/, so it sees what a visitor sees: after locale
 * selection, after conditionals, after the build. Every failure this catches was a real
 * incident in the week of 2026-08-18.
 *
 * Usage: npm run validate:terms   (wired into `npm run build`)
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const TERMS = JSON.parse(readFileSync("src/data/commercialTerms.json", "utf8"));

if (!existsSync("dist")) {
  console.error("validate-terms: no dist/ — run the build first.");
  process.exit(1);
}

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
};

/** Strip tags so a phrase split across markup still matches. */
const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#8217;/g, "'")
    .replace(/\s+/g, " ");

/**
 * Each rule is a phrase that must not appear, plus why. Kept as data so adding a newly
 * settled term is a one-line change rather than new logic.
 */
const RULES = [
  ...TERMS.cancellation.never_say.map((phrase) => ({
    phrase,
    rule: "cancellation",
    why: `Cancellation requires no notice period. Contract: "${TERMS.cancellation.effective}".`,
  })),
  ...TERMS.delivery_timing.never_say.map((phrase) => ({
    phrase,
    rule: "delivery_timing",
    why: `Promises a timeline some projects cannot hit. Use: "${TERMS.delivery_timing.combined_en}"`,
  })),
  ...TERMS.trial.never_say.map((phrase) => ({
    phrase,
    rule: "trial",
    why: `Trial wording must match /pricing/ verbatim: "${TERMS.trial.label_en}" / "${TERMS.trial.label_es}".`,
  })),
  {
    phrase: "pay by card",
    rule: "billing",
    why: TERMS.billing.card_note,
  },
];

const pages = walk("dist");
const hits = [];

for (const file of pages) {
  const rel = path.relative("dist", file).replace(/\\/g, "/");
  const text = textOf(readFileSync(file, "utf8")).toLowerCase();

  for (const r of RULES) {
    if (text.includes(r.phrase.toLowerCase())) hits.push({ rel, ...r });
  }

  // A CFDI must never be promised to a USD buyer — it is a Mexican SAT receipt a US
  // client does not receive.
  //
  // This has to be CURRENCY-scoped, not page-scoped. /pricing/ renders both price lists
  // and toggles them client-side, so CFDI (correct, inside the MXN variant) and USD
  // prices both sit in the HTML while never being visible together. A page-level check
  // flagged that as a contradiction and would have pushed a CORRECT page to change.
  //
  // So: inspect only the USD-marked regions, and fall back to the whole page for
  // single-currency pages like /salons/ that carry no toggle at all.
  const raw = readFileSync(file, "utf8");
  const hasToggle = /data-cur="(usd|mxn)"/i.test(raw);
  const usdRegions = [
    ...raw.matchAll(/data-cur="usd"[^>]*>([\s\S]*?)<\/(?:span|div|p|li)>/gi),
  ]
    .map((m) => textOf(m[1]).toLowerCase())
    .join(" ");
  const quotesUsd = /usd\s*\/\s*mo|usd\/mes|\$\d+\s*usd/i.test(text);
  const usdScope = hasToggle ? usdRegions : quotesUsd ? text : "";
  const exempt =
    usdScope.includes("outside mexico") || usdScope.includes("fuera de méxico");

  if (usdScope.includes("cfdi") && !exempt) {
    hits.push({
      rel,
      rule: "invoicing",
      phrase: "CFDI promised to a USD buyer",
      why: TERMS.invoicing.outside_mexico.note,
    });
  }
}

console.log(
  `validate-terms: ${pages.length} pages checked against commercial-terms.json (${TERMS._meta.last_updated})`,
);

if (!hits.length) {
  console.log("\n✅ PASS — no page contradicts the commercial terms.\n");
  process.exit(0);
}

console.error(`\n❌ FAIL — ${hits.length} contradiction(s):\n`);
const byRule = new Map();
for (const h of hits) {
  if (!byRule.has(h.rule)) byRule.set(h.rule, []);
  byRule.get(h.rule).push(h);
}
for (const [rule, list] of byRule) {
  console.error(`  [${rule}] "${list[0].phrase}"`);
  console.error(`     ${list[0].why}`);
  for (const h of list.slice(0, 6)) console.error(`     → /${h.rel}`);
  if (list.length > 6) console.error(`     → …and ${list.length - 6} more`);
  console.error("");
}
console.error(
  "Fix the page, or if the TERM itself changed, update\n" +
    "operating-system/cushlabs/commercial-terms.json and run `npm run sync:terms`.\n",
);
process.exit(1);
