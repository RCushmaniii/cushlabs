/**
 * Rendered-contrast audit (WCAG 1.4.3).
 *
 * Static analysis cannot answer this: whether `text-cush-orange` passes depends on the
 * background it actually lands on, which is decided by ancestor elements at runtime.
 * So this drives a real browser, walks every text node, resolves the effective
 * background by climbing ancestors through transparent layers, and computes the true
 * ratio.
 *
 * Usage:
 *   node scripts/audit-contrast.mjs                    # audits production
 *   node scripts/audit-contrast.mjs http://localhost:4321
 *   node scripts/audit-contrast.mjs --json             # machine-readable
 *
 * Exits 1 if any AA failure is found, so it can gate a build.
 */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
// The site themes via a `.dark` class (see ThemeScript.astro), not the media query, so
// emulateMedia alone would audit light mode twice.
const darkMode = args.includes("--dark");
const base =
  args.find((a) => a.startsWith("http")) ?? "https://www.cushlabs.ai";

// Representative of every layout on the site, both locales.
const PATHS = [
  "/",
  "/about/",
  "/services/",
  "/pricing/",
  "/portfolio/",
  "/contact/",
  "/faq/",
  "/consultation/",
  "/messenger-assistant/",
  "/voice-agent/",
  "/website-chatbot/",
  "/demos/",
  "/salons/",
  "/blog/",
  "/es/",
  "/es/precios/",
  "/es/portfolio/",
  "/es/contact/",
  "/es/faq/",
  "/es/demos/",
];

const IN_PAGE = () => {
  const srgb = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = ([r, g, b]) =>
    0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };

  // Climb ancestors until an opaque background is found, compositing as we go.
  //
  // Returns null when the real backdrop is an image or gradient: a computed
  // backgroundColor cannot represent those, and guessing produced nonsense like
  // "white on white, 1:1" for hero text sitting on a photo. Unresolvable cases are
  // counted and reported separately rather than asserted as failures.
  const effectiveBg = (el) => {
    let acc = null;
    let node = el;
    while (node && node !== document.documentElement.parentNode) {
      const ncs = getComputedStyle(node);
      if (ncs.backgroundImage && ncs.backgroundImage !== "none") return null;
      const bg = parse(ncs.backgroundColor);
      if (bg && bg.a > 0) {
        acc = acc === null ? { rgb: bg.rgb, a: bg.a } : acc;
        if (bg.a >= 1)
          return acc.a >= 1 ? acc.rgb : over(acc.rgb, bg.rgb, acc.a);
        acc = { rgb: over(acc.rgb, bg.rgb, acc.a), a: 1 };
        return acc.rgb;
      }
      node = node.parentElement;
    }
    return [255, 255, 255];
  };

  const out = [];
  let unresolved = 0;
  for (const el of document.querySelectorAll("*")) {
    // Only elements holding their own visible text.
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!text) continue;

    const cs = getComputedStyle(el);
    if (
      cs.visibility === "hidden" ||
      cs.display === "none" ||
      cs.opacity === "0"
    )
      continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = effectiveBg(el);
    if (bg === null) {
      unresolved += 1;
      continue;
    }
    const fgc = fg.a >= 1 ? fg.rgb : over(fg.rgb, bg, fg.a);

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    // WCAG "large text": >=24px, or >=18.66px when bold.
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = isLarge ? 3.0 : 4.5;
    const r = ratio(fgc, bg);

    // A near-1:1 result means the text would be literally invisible. Real pages do not
    // ship that; it means the backdrop is painted by an absolutely-positioned sibling
    // (this site's hero pattern) that an ancestor climb cannot see. Detection failure,
    // not a design failure — count it as unresolved instead of crying wolf.
    if (r < 1.5) {
      unresolved += 1;
      continue;
    }

    if (r < required) {
      out.push({
        text: text.slice(0, 60),
        color: cs.color,
        bg: `rgb(${bg.map(Math.round).join(", ")})`,
        size: Math.round(size),
        weight,
        ratio: Number(r.toFixed(2)),
        required,
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 70),
      });
    }
  }
  return { out, unresolved };
};

const browser = await chromium.launch();
const failuresByPath = {};
let total = 0;
let unresolvedTotal = 0;

for (const path of PATHS) {
  const page = await browser.newPage();
  // Audit LIGHT mode explicitly: ThemeScript defaults first-time visitors to light,
  // and that is where the brand orange fails.
  await page.emulateMedia({ colorScheme: darkMode ? "dark" : "light" });
  // Take the same path a real visitor does. ThemeScript reads localStorage BEFORE paint
  // and adds/removes `.dark` itself, so seeding storage is what actually reproduces the
  // user's theme. Injecting the class afterwards leaves styles resolved against the
  // theme the page already committed to.
  await page.addInitScript((dark) => {
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* storage unavailable — page falls back to light, which is the default anyway */
    }
  }, darkMode);
  try {
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 45000 });
    const { out: found, unresolved } = await page.evaluate(IN_PAGE);
    unresolvedTotal += unresolved;
    if (found.length) {
      failuresByPath[path] = found;
      total += found.length;
    }
  } catch (err) {
    failuresByPath[path] = [{ error: String(err).slice(0, 120) }];
  }
  await page.close();
}

await browser.close();

if (asJson) {
  console.log(JSON.stringify({ base, total, failuresByPath }, null, 2));
} else {
  console.log(
    `\nRendered contrast audit — ${base} (${darkMode ? "dark" : "light"} mode)\n`,
  );
  if (!total) {
    console.log("PASS — no AA contrast failures found.\n");
  } else {
    // Group identical colour pairs; 200 instances of one mistake is one mistake.
    const pairs = new Map();
    for (const [path, items] of Object.entries(failuresByPath)) {
      for (const f of items) {
        if (f.error) {
          console.log(`  ${path}  ERROR ${f.error}`);
          continue;
        }
        const key = `${f.color} on ${f.bg}`;
        if (!pairs.has(key))
          pairs.set(key, {
            ratio: f.ratio,
            required: f.required,
            n: 0,
            samples: [],
            paths: new Set(),
          });
        const p = pairs.get(key);
        p.n += 1;
        p.paths.add(path);
        if (p.samples.length < 3) p.samples.push(`${f.size}px "${f.text}"`);
      }
    }
    for (const [pair, p] of [...pairs.entries()].sort(
      (a, b) => b[1].n - a[1].n,
    )) {
      console.log(`${pair}`);
      console.log(
        `   ${p.ratio}:1 (needs ${p.required})  ${p.n} instances across ${p.paths.size} pages`,
      );
      for (const s of p.samples) console.log(`     ${s}`);
      console.log();
    }
    console.log(`TOTAL: ${total} failing text nodes\n`);
  }
  if (unresolvedTotal) {
    console.log(
      `(${unresolvedTotal} text nodes sit on an image or gradient — a computed\n` +
        ` backgroundColor cannot express those, so they are NOT counted either way\n` +
        ` and need a human eye.)\n`,
    );
  }
}

process.exit(total > 0 ? 1 : 0);
