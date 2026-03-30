#!/usr/bin/env node
/**
 * Submit URLs to Bing via Webmaster Tools API — CushLabs
 *
 * Usage:
 *   node scripts/seo/bing-submit.mjs                             # Submit all sitemap URLs
 *   node scripts/seo/bing-submit.mjs --url https://...           # Submit single URL
 *   node scripts/seo/bing-submit.mjs --sitemap https://...xml    # Submit URLs from a specific sitemap
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..", "..");
const SUBMISSIONS_DIR = join(PROJECT_ROOT, "scripts", "seo", ".submissions");
const BING_LOG_PATH = join(SUBMISSIONS_DIR, "bing-webmaster.jsonl");

const SITE_URL = "https://www.cushlabs.ai";
const DEFAULT_SITEMAP_URL = `${SITE_URL}/sitemap-index.xml`;

dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const BING_API_KEY = process.env.BING_WEBMASTER_TOOLS_API_KEY;
if (!BING_API_KEY) {
  console.error("Missing BING_WEBMASTER_TOOLS_API_KEY in .env");
  console.error("Get your API key from: https://www.bing.com/webmasters/apikey");
  process.exit(1);
}
const BING_SUBMIT_URL = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`;

function ensureSubmissionLogDir() {
  if (!existsSync(SUBMISSIONS_DIR)) mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

function writeSubmissionLogEntry(entry) {
  ensureSubmissionLogDir();
  appendFileSync(BING_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

const args = process.argv.slice(2);
const singleUrl = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;
const sitemapUrl = args.includes("--sitemap") ? args[args.indexOf("--sitemap") + 1] : DEFAULT_SITEMAP_URL;

function extractLocValues(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gsi)].map(m => m[1].trim());
}

async function fetchXml(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url} (HTTP ${response.status})`);
  return response.text();
}

async function getSitemapUrls(url) {
  const xml = await fetchXml(url);
  const locs = extractLocValues(xml);

  if (xml.includes("<sitemapindex")) {
    const nestedXmlList = await Promise.all(locs.map(loc => fetchXml(loc)));
    return [...new Set(nestedXmlList.flatMap(nestedXml => extractLocValues(nestedXml)))];
  }
  return [...new Set(locs)];
}

async function submitBatch(urls) {
  const batchSize = 500;
  let totalSuccess = 0, totalFailed = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    try {
      const response = await fetch(BING_SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: SITE_URL, urlList: batch }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        writeSubmissionLogEntry({ timestamp: new Date().toISOString(), provider: "bing-webmaster", siteUrl: SITE_URL, status: response.status, ok: true, urls: batch, response: data });
        console.log(`✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} URLs submitted`);
        totalSuccess += batch.length;
      } else {
        const errText = await response.text().catch(() => "");
        writeSubmissionLogEntry({ timestamp: new Date().toISOString(), provider: "bing-webmaster", siteUrl: SITE_URL, status: response.status, ok: false, urls: batch, error: errText });
        console.log(`✗ Batch ${Math.floor(i / batchSize) + 1}: HTTP ${response.status} — ${errText}`);
        totalFailed += batch.length;
      }
    } catch (err) {
      writeSubmissionLogEntry({ timestamp: new Date().toISOString(), provider: "bing-webmaster", siteUrl: SITE_URL, status: null, ok: false, urls: batch, error: err.message });
      console.error(`✗ Batch ${Math.floor(i / batchSize) + 1}: ${err.message}`);
      totalFailed += batch.length;
    }
  }
  return { totalSuccess, totalFailed };
}

async function main() {
  let urls = singleUrl ? [singleUrl] : await getSitemapUrls(sitemapUrl);
  urls = [...new Set(urls)];

  console.log(`Bing Webmaster Tools — CushLabs\n`);
  console.log(`URLs to submit: ${urls.length}\n`);

  const { totalSuccess, totalFailed } = await submitBatch(urls);
  console.log(`\nDone: ${totalSuccess} submitted, ${totalFailed} failed`);
}

main();
