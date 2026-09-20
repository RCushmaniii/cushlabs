/**
 * Fail the build when a page prices a feature at the wrong tier.
 *
 * WHY THIS EXISTS. On 2026-09-19, four separate pages were found claiming a
 * feature at a tier it does not belong to. All four had the same shape: a
 * section grew to cover a new channel, and the price box beside it silently
 * kept the tier it had before.
 *
 *   - /services/ said WhatsApp reminders were "priced separately from the
 *     Basic/Premium/Ultra plans", while /pricing/ showed them included in
 *     Premium.
 *   - A scenario hook priced the Website AI Assistant "from $1,990" — the Basic
 *     price — when the website chatbot is a Premium feature.
 *   - Two INVESTMENT boxes read "included in every plan — from $1,990" after
 *     Instagram had been added to the feature list beside them. Instagram is
 *     Premium.
 *
 * Every one was found by a human noticing a screenshot. `validate-terms.mjs`
 * did not catch them because none of them contradicts a TERM — the prices and
 * the trial and the cancellation policy were all correct. What was wrong was
 * which feature sits in which tier, and nothing was checking that.
 *
 * WHAT IT CHECKS. For every feature named on a page, the nearest price must be
 * that feature's tier price. A page is allowed to mention several tiers — the
 * investment boxes legitimately say "every plan, from $1,990 … Instagram comes
 * in at Premium, $3,490" — so a wrong price only fails when the RIGHT price is
 * absent from the same window. That is the difference between copy that
 * explains the ladder and copy that misprices a feature.
 *
 * It reads dist/, like validate-terms.mjs, so it sees what a visitor sees:
 * after locale selection, after conditionals, after the build.
 *
 * WHAT IT DOES NOT CHECK. It says nothing about whether the tier mapping itself
 * is right. /pricing/ is the source of truth for that, and this file's TIERS
 * map has to be updated when a feature genuinely moves. That is deliberate: a
 * feature changing tier is a commercial decision someone should have to write
 * down, not something a script infers.
 *
 * Usage: npm run validate:feature-tiers   (wired into `npm run build`)
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const TERMS = JSON.parse(readFileSync("src/data/commercialTerms.json", "utf8"));

if (!existsSync("dist")) {
  console.error("validate-feature-tiers: no dist/ — run the build first.");
  process.exit(1);
}

/**
 * Which tier each feature belongs to, and how that feature is named in the wild.
 *
 * The patterns have to be generous, because the same capability is called
 * different things on different pages ("website chatbot", "Website AI
 * Assistant", "chatbot para tu sitio web"). They also have to be narrow enough
 * not to fire on a passing mention — "your website" alone is not a claim about
 * the website chatbot.
 */
const TIERS = {
  basic: {
    label: "Basic",
    features: [
      {
        name: "Facebook Messenger assistant",
        pattern:
          /\b(?:assistant on )?facebook messenger\b|asistente (?:con ia )?en facebook messenger/,
      },
      {
        name: "Google review replies",
        pattern: /google review (?:replies|management)|rese[nñ]as de google/,
      },
    ],
  },
  premium: {
    label: "Premium",
    features: [
      {
        name: "Instagram assistant",
        pattern:
          /instagram(?:\s+(?:assistant|comments|—|-))|asistente de instagram/,
      },
      {
        name: "Website chatbot",
        pattern:
          /website (?:chatbot|ai assistant)|chatbot (?:para tu sitio|web)|asistente de ia para (?:tu )?sitio/,
      },
      {
        name: "WhatsApp reminders",
        pattern:
          /whatsapp (?:reminders|appointment reminders)|recordatorios (?:y confirmaciones )?por whatsapp/,
      },
      {
        name: "Local SEO & competitor report",
        pattern:
          /(?:weekly )?local seo|competitor report|seo local|reporte semanal de seo/,
      },
    ],
  },
  ultra: {
    label: "Ultra",
    features: [
      {
        name: "AI Voice Agent",
        pattern: /ai voice agent|agente de voz/,
      },
    ],
  },
};

/** The three tier prices, in both currencies, taken from the canonical terms. */
const PRICES = {};
for (const tier of ["basic", "premium", "ultra"]) {
  PRICES[tier] = [
    TERMS.pricing.mxn.display[tier].replace(/[$,]/g, ""),
    TERMS.pricing.usd.display[tier].replace(/[$,]/g, ""),
  ];
}
const ALL_PRICES = Object.entries(PRICES).flatMap(([tier, values]) =>
  values.map((v) => ({ tier, value: v })),
);

/**
 * /pricing/ and its Spanish twin are the source of truth and render every tier
 * and every feature in one document, so the "nearest price" idea is meaningless
 * there. Excluded on purpose, not by oversight.
 */
const EXCLUDE = [/^pricing\//, /^es\/precios\//, /^404/];

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
};

/**
 * Remove the pricing-cards component before scanning.
 *
 * That component IS the source of truth, and it renders every tier's features
 * directly above the NEXT tier's price. Flattened to text, Premium's last
 * bullet sits a few words from Ultra's price — which reads to this check as
 * Premium's SEO report being priced at Ultra. It is not a mispricing, it is an
 * artifact of two cards being adjacent in the DOM.
 *
 * /pricing/ is excluded by path; this strips the same component wherever else
 * it is embedded, such as /services/.
 */
const stripPricingCards = (html) => {
  let out = html;
  for (;;) {
    const marker = out.indexOf('data-pricing-section');
    if (marker === -1) return out;
    const open = out.lastIndexOf('<section', marker);
    if (open === -1) return out;
    // Walk forward counting nested <section> so we close the right one.
    let depth = 0;
    const re = new RegExp("<section[ >]|</section>", "gi");
    re.lastIndex = open;
    let m;
    let end = -1;
    while ((m = re.exec(out)) !== null) {
      depth += m[0][1] === '/' ? -1 : 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    }
    if (end === -1) return out;
    out = out.slice(0, open) + ' ' + out.slice(end);
  }
};

/** Strip tags so a phrase split across markup still matches. */
const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#8217;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

/**
 * How far either side of a feature mention counts as "beside" it.
 *
 * 140 characters is roughly one line of body copy plus the clause after it —
 * wide enough to catch "Website AI Assistant — from $1,990", narrow enough that
 * an unrelated price two sentences away does not implicate a feature.
 */
const WINDOW = 140;

const pages = walk("dist");
const hits = [];

for (const file of pages) {
  const rel = path.relative("dist", file).replace(/\\/g, "/");
  if (EXCLUDE.some((re) => re.test(rel))) continue;

  const text = textOf(stripPricingCards(readFileSync(file, "utf8")));

  for (const [tier, { label, features }] of Object.entries(TIERS)) {
    for (const feature of features) {
      const re = new RegExp(feature.pattern.source, "g");
      let m;
      while ((m = re.exec(text)) !== null) {
        const from = Math.max(0, m.index - WINDOW);
        const window = text.slice(from, m.index + m[0].length + WINDOW);

        // Which tier prices appear beside this feature?
        const nearby = ALL_PRICES.filter(({ value }) =>
          new RegExp(
            `\\$\\s?${value.replace(/(\d)(?=(\d{3})+$)/g, "$1,?")}\\b`,
          ).test(window),
        );
        if (!nearby.length) continue; // no price beside it — nothing claimed

        const correct = nearby.some((p) => p.tier === tier);
        if (correct) continue; // the right price is here; other tiers may be too

        const wrong = [...new Set(nearby.map((p) => TIERS[p.tier].label))];
        hits.push({
          rel,
          feature: feature.name,
          belongs: label,
          claimed: wrong.join(" / "),
          excerpt: window
            .slice(Math.max(0, m.index - from - 60), m.index - from + 110)
            .trim(),
        });
        break; // one report per feature per page is enough to act on
      }
    }
  }
}

console.log(
  `validate-feature-tiers: ${pages.length} pages checked against the tier map (prices from commercial-terms.json ${TERMS._meta.last_updated})`,
);

if (!hits.length) {
  console.log("\n✅ PASS — no page prices a feature at the wrong tier.\n");
  process.exit(0);
}

console.error(
  `\n❌ FAIL — ${hits.length} feature(s) priced at the wrong tier:\n`,
);
for (const h of hits) {
  console.error(`  /${h.rel}`);
  console.error(
    `     "${h.feature}" is ${h.belongs}, but the only price beside it is ${h.claimed}.`,
  );
  console.error(`     …${h.excerpt}…`);
  console.error("");
}
console.error(
  "Either the copy is wrong, or the feature genuinely moved tier.\n" +
    "If it moved: change /pricing/ FIRST, then update TIERS in this file.\n" +
    "Never the other way round — this file follows the pricing page, it does not\n" +
    "define it.\n",
);
process.exit(1);
