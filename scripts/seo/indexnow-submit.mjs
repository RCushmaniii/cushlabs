#!/usr/bin/env node
// Submits sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver share endpoint).
// Google ignores IndexNow — sitemap is the only active vector for Google now.
//
// Usage: node scripts/seo/indexnow-submit.mjs

const SITE = "https://www.cushlabs.ai";
const KEY = "nckd2h37xfvwsz9pwymrhbcpbjrajjc8";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const SITEMAP_URL = `${SITE}/sitemap-0.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => m[1]);
}

async function verifyKeyFile() {
  const res = await fetch(KEY_LOCATION);
  if (!res.ok) throw new Error(`Key file not reachable at ${KEY_LOCATION} (${res.status})`);
  const body = (await res.text()).trim();
  if (body !== KEY) throw new Error(`Key file content mismatch at ${KEY_LOCATION}`);
}

async function submit(urls) {
  const payload = {
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  return { status: res.status, statusText: res.statusText, body: await res.text() };
}

const urls = await fetchSitemapUrls();
console.log(`Found ${urls.length} URLs in sitemap`);

await verifyKeyFile();
console.log(`Key file verified at ${KEY_LOCATION}`);

const result = await submit(urls);
console.log(`IndexNow response: ${result.status} ${result.statusText}`);
if (result.body) console.log(result.body);

// IndexNow returns 200 (URLs received) or 202 (URLs accepted) on success.
if (result.status !== 200 && result.status !== 202) {
  console.error("Submission failed");
  process.exit(1);
}
console.log("Submitted successfully.");
