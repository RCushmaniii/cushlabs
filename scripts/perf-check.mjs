#!/usr/bin/env node
/**
 * Production performance check — measures the LIVE site, not the build output.
 *
 * Fetches every URL in the production sitemap twice (pass 1 as found, pass 2
 * guaranteed warm at the Vercel edge) and reports time-to-first-byte, total
 * time, HTML weight and the edge cache status of each. Fails when the warm
 * numbers or the page weight are outside budget, or when any URL is not a 200.
 *
 * Why this exists (2026-10-20): the CI harness only ever tested dist/ on the
 * runner, so nothing measured what a visitor or a crawler actually gets. A
 * crawl of the live site reported /pricing/ at 3.8 s while every local check
 * was green. Runs after every production deploy from
 * .github/workflows/production-check.yml, and on demand:
 *
 *   node scripts/perf-check.mjs
 *   node scripts/perf-check.mjs --base https://www.cushlabs.ai --budget-ttfb 1000
 *
 * Node 22 built-ins only — no install step needed on the runner.
 */

const args = parseArgs(process.argv.slice(2));
const BASE = (args.base ?? "https://www.cushlabs.ai").replace(/\/$/, "");
const BUDGET_TTFB_MS = num(args["budget-ttfb"], 1000); // warm p95
const BUDGET_TOTAL_MS = num(args["budget-total"], 1500); // warm p95
const BUDGET_BYTES = num(args["budget-bytes"], 350_000); // raw HTML, any page
const COLD_WARN_MS = num(args["cold-warn"], 2500); // pass-1 p95 total, warning only
const CONCURRENCY = num(args.concurrency, 4);
const TIMEOUT_MS = num(args.timeout, 20_000);
const LIMIT = num(args.limit, 0); // 0 = every sitemap URL

main().catch((err) => {
  console.error(`perf-check: ${err.message}`);
  process.exit(2);
});

async function main() {
  const urls = await sitemapUrls(BASE);
  const targets = LIMIT > 0 ? urls.slice(0, LIMIT) : urls;
  console.log(
    `perf-check: ${targets.length} URLs from ${BASE}/sitemap-index.xml`,
  );

  const pass1 = await runPass(targets, "as found");
  const pass2 = await runPass(targets, "warm");

  const failures = [];

  const bad = pass2.filter((r) => r.status !== 200);
  for (const r of bad)
    failures.push(
      `${r.url} returned ${r.status}${r.error ? ` (${r.error})` : ""}`,
    );

  const heavy = pass2.filter((r) => r.bytes > BUDGET_BYTES);
  for (const r of heavy)
    failures.push(
      `${r.url} is ${kb(r.bytes)} raw HTML (budget ${kb(BUDGET_BYTES)})`,
    );

  const warmTtfbP95 = percentile(
    pass2.map((r) => r.ttfb),
    95,
  );
  const warmTotalP95 = percentile(
    pass2.map((r) => r.total),
    95,
  );
  if (warmTtfbP95 > BUDGET_TTFB_MS)
    failures.push(
      `warm TTFB p95 is ${warmTtfbP95} ms (budget ${BUDGET_TTFB_MS} ms)`,
    );
  if (warmTotalP95 > BUDGET_TOTAL_MS)
    failures.push(
      `warm total p95 is ${warmTotalP95} ms (budget ${BUDGET_TOTAL_MS} ms)`,
    );

  const coldTotalP95 = percentile(
    pass1.map((r) => r.total),
    95,
  );
  const misses = pass1.filter((r) => r.cache === "MISS").length;
  console.log("");
  console.log(
    `edge cache on first contact: ${misses}/${pass1.length} MISS — ` +
      `a MISS is what a crawler or a first visitor in a region gets after a deploy`,
  );
  if (coldTotalP95 > COLD_WARN_MS)
    console.log(
      `WARNING: as-found total p95 is ${coldTotalP95} ms (> ${COLD_WARN_MS} ms)`,
    );

  console.log("");
  if (failures.length) {
    console.log(`FAIL — ${failures.length} budget violation(s):`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log(
    `PASS — warm TTFB p95 ${warmTtfbP95} ms, warm total p95 ${warmTotalP95} ms, ` +
      `heaviest page ${kb(Math.max(...pass2.map((r) => r.bytes)))}, all ${pass2.length} URLs 200`,
  );
}

async function runPass(urls, label) {
  const results = await mapLimit(urls, CONCURRENCY, measure);
  const ttfb = results.map((r) => r.ttfb);
  const total = results.map((r) => r.total);
  console.log("");
  console.log(`pass (${label}): ${results.length} URLs`);
  console.log(
    `  TTFB  p50 ${percentile(ttfb, 50)} ms | p95 ${percentile(ttfb, 95)} ms | max ${Math.max(...ttfb)} ms`,
  );
  console.log(
    `  total p50 ${percentile(total, 50)} ms | p95 ${percentile(total, 95)} ms | max ${Math.max(...total)} ms`,
  );
  const slowest = [...results].sort((a, b) => b.total - a.total).slice(0, 5);
  console.log("  slowest:");
  for (const r of slowest) {
    console.log(
      `    ${pad(r.total + " ms", 9)} ttfb ${pad(r.ttfb + " ms", 8)} ${pad(kb(r.bytes), 7)} ` +
        `${pad(r.cache ?? "-", 5)} ${r.status} ${r.url.replace(BASE, "")}`,
    );
  }
  return results;
}

async function measure(url) {
  const started = performance.now();
  const out = {
    url,
    status: 0,
    ttfb: 0,
    total: 0,
    bytes: 0,
    cache: null,
    error: null,
  };
  try {
    const res = await fetch(url, {
      redirect: "manual", // a redirect here means the sitemap and the canonical disagree
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "user-agent": "cushlabs-perf-check/1.0 (+https://www.cushlabs.ai)",
      },
    });
    out.ttfb = Math.round(performance.now() - started);
    out.status = res.status;
    out.cache = res.headers.get("x-vercel-cache");
    const body = await res.arrayBuffer();
    out.bytes = body.byteLength;
  } catch (err) {
    out.error =
      err.name === "TimeoutError"
        ? `timeout after ${TIMEOUT_MS} ms`
        : err.message;
  }
  out.total = Math.round(performance.now() - started);
  return out;
}

async function sitemapUrls(base) {
  const index = await text(`${base}/sitemap-index.xml`);
  const children = locs(index);
  const urls = new Set();
  for (const child of children.length ? children : [`${base}/sitemap-0.xml`]) {
    for (const loc of locs(await text(child))) {
      // Measure the host under test even when the sitemap is stamped with another one.
      urls.add(loc.replace(/^https?:\/\/[^/]+/, base));
    }
  }
  if (urls.size === 0) throw new Error("sitemap contained no URLs");
  return [...urls];
}

async function text(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((p / 100) * sorted.length) - 1,
  );
  return sorted[Math.max(0, idx)];
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

function pad(s, n) {
  return String(s).padEnd(n);
}

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined ? n : fallback;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val =
      argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key] = val;
  }
  return out;
}
