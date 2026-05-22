#!/usr/bin/env node
/**
 * Diagnose GSC indexing issues — CushLabs
 *
 * 1. Live HTTP check of every sitemap URL (catches current 5xx/404)
 * 2. GSC URL Inspection API to surface what Google last saw
 *
 * Usage:
 *   node scripts/seo/check-indexing-issues.mjs              # live check only
 *   node scripts/seo/check-indexing-issues.mjs --inspect    # + GSC URL inspection
 *   node scripts/seo/check-indexing-issues.mjs --inspect --only-problems  # only inspect URLs that aren't 200 live
 */

import { google } from "googleapis";
import { getAuthClient, SITE_URL, SITE_PROPERTY } from "./gsc-client.mjs";

const args = process.argv.slice(2);
const doInspect = args.includes("--inspect");
const onlyProblems = args.includes("--only-problems");

async function getAllSitemapUrls() {
  const indexUrl = `${SITE_URL}/sitemap-index.xml`;
  const urls = [];
  const indexXml = await (await fetch(indexUrl)).text();
  const sitemapUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
  for (const smUrl of sitemapUrls) {
    const smXml = await (await fetch(smUrl)).text();
    const pageUrls = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1],
    );
    urls.push(...pageUrls);
  }
  return urls;
}

async function liveCheck(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return { url, status: res.status, location: res.headers.get("location") };
  } catch (err) {
    return { url, status: 0, error: err.message };
  }
}

async function inspectUrl(searchconsole, url) {
  try {
    const res = await searchconsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: SITE_PROPERTY },
    });
    const r = res.data.inspectionResult || {};
    const idx = r.indexStatusResult || {};
    return {
      url,
      verdict: idx.verdict,
      coverageState: idx.coverageState,
      crawledAs: idx.crawledAs,
      pageFetchState: idx.pageFetchState,
      lastCrawlTime: idx.lastCrawlTime,
      indexingState: idx.indexingState,
      robotsTxtState: idx.robotsTxtState,
    };
  } catch (err) {
    return { url, error: err.message };
  }
}

async function main() {
  console.log("Fetching sitemap URLs…");
  const urls = await getAllSitemapUrls();
  console.log(`Found ${urls.length} URLs.\n`);

  console.log("Live HTTP check (parallel batches of 10)…");
  const results = [];
  for (let i = 0; i < urls.length; i += 10) {
    const batch = urls.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(liveCheck));
    results.push(...batchResults);
  }

  const problems = results.filter((r) => r.status !== 200);
  const ok = results.filter((r) => r.status === 200);
  console.log(`  ${ok.length} OK (200)`);
  console.log(`  ${problems.length} non-200`);

  if (problems.length) {
    console.log("\nNon-200 responses:");
    for (const p of problems) {
      const tag =
        p.status >= 500
          ? "5xx"
          : p.status >= 400
            ? "4xx"
            : p.status >= 300
              ? "3xx"
              : "???";
      console.log(
        `  [${tag}] ${p.status} ${p.url}${p.location ? ` → ${p.location}` : ""}${p.error ? ` ERR: ${p.error}` : ""}`,
      );
    }
  }

  if (doInspect) {
    console.log("\nRunning GSC URL Inspection…");
    const auth = await getAuthClient();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    const targets = onlyProblems ? problems.map((p) => p.url) : urls;
    console.log(
      `Inspecting ${targets.length} URLs (this is rate-limited, will pace)…\n`,
    );

    const flagged = [];
    for (const url of targets) {
      const inspection = await inspectUrl(searchconsole, url);
      const bad = inspection.verdict && inspection.verdict !== "PASS";
      if (bad || inspection.error) {
        flagged.push(inspection);
        console.log(`  [${inspection.verdict || "ERR"}] ${url}`);
        if (inspection.coverageState)
          console.log(`    coverage: ${inspection.coverageState}`);
        if (inspection.pageFetchState)
          console.log(`    fetch: ${inspection.pageFetchState}`);
        if (inspection.lastCrawlTime)
          console.log(`    lastCrawl: ${inspection.lastCrawlTime}`);
        if (inspection.error) console.log(`    error: ${inspection.error}`);
      }
      await new Promise((r) => setTimeout(r, 600)); // pacing for inspection API
    }

    console.log(`\n${flagged.length} URL(s) flagged by GSC.`);
  } else {
    console.log("\n(Pass --inspect to also query GSC URL Inspection API.)");
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
