#!/usr/bin/env node
/**
 * Submit URLs / sitemap to Google for indexing — CushLabs
 *
 * Usage:
 *   node scripts/seo/gsc-submit-urls.mjs --sitemap             # Submit sitemap
 *   node scripts/seo/gsc-submit-urls.mjs --url https://...     # Submit single URL
 *   node scripts/seo/gsc-submit-urls.mjs --url https://... --removed  # Notify URL removed
 *   node scripts/seo/gsc-submit-urls.mjs --all                 # Submit all pages from sitemap XML
 */

import { google } from 'googleapis';
import { getAuthClient, getWebmasters, detectSiteProperty, SITE_URL } from './gsc-client.mjs';

const args = process.argv.slice(2);
const singleUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
const submitSitemap = args.includes('--sitemap');
const submitAll = args.includes('--all');
const isRemoved = args.includes('--removed');

async function submitToIndexingAPI(url, type = 'URL_UPDATED') {
  const auth = await getAuthClient();
  const indexing = google.indexing({ version: 'v3', auth });

  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });
    console.log(`  ✓ ${url} → ${res.data.urlNotificationMetadata?.latestUpdate?.type || 'submitted'}`);
    return true;
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.log(`  ✗ ${url} → ${msg}`);
    return false;
  }
}

async function submitSitemapToGSC() {
  const siteUrl = await detectSiteProperty();
  if (!siteUrl) return;

  const webmasters = await getWebmasters();
  const sitemapUrl = `${SITE_URL}/sitemap-index.xml`;

  try {
    await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
    console.log(`✓ Sitemap submitted: ${sitemapUrl}`);
  } catch (err) {
    console.error(`✗ Sitemap submission failed: ${err.message}`);
  }

  try {
    const res = await webmasters.sitemaps.list({ siteUrl });
    const sitemaps = res.data.sitemap || [];
    if (sitemaps.length) {
      console.log('\nRegistered sitemaps:');
      for (const sm of sitemaps) {
        console.log(`  - ${sm.path} (${sm.lastSubmitted || 'never'}) errors: ${sm.errors || 0}`);
      }
    }
  } catch (err) {
    console.error('Could not list sitemaps:', err.message);
  }
}

async function getAllSitemapUrls() {
  // Fetch sitemap index, then each child sitemap
  const indexUrl = `${SITE_URL}/sitemap-index.xml`;
  const urls = [];

  try {
    const indexRes = await fetch(indexUrl);
    const indexXml = await indexRes.text();

    // Extract sitemap URLs from index
    const sitemapUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

    for (const smUrl of sitemapUrls) {
      const smRes = await fetch(smUrl);
      const smXml = await smRes.text();
      const pageUrls = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      urls.push(...pageUrls);
    }
  } catch (err) {
    console.error(`Failed to fetch sitemap: ${err.message}`);
  }

  return urls;
}

async function main() {
  console.log('Google URL Submission Tool — CushLabs\n');

  if (submitSitemap) {
    await submitSitemapToGSC();
    return;
  }

  if (singleUrl) {
    const type = isRemoved ? 'URL_DELETED' : 'URL_UPDATED';
    console.log(`Submitting ${singleUrl} (${type})...`);
    await submitToIndexingAPI(singleUrl, type);
    return;
  }

  if (submitAll) {
    const urls = await getAllSitemapUrls();
    console.log(`Found ${urls.length} URLs in sitemap.\n`);

    let success = 0, failed = 0;
    for (const url of urls) {
      const ok = await submitToIndexingAPI(url);
      if (ok) success++;
      else failed++;
      await new Promise(r => setTimeout(r, 100));
    }
    console.log(`\nDone: ${success} submitted, ${failed} failed`);
    return;
  }

  console.log('Usage:');
  console.log('  --sitemap        Submit sitemap to GSC');
  console.log('  --url <url>      Submit single URL');
  console.log('  --all            Submit all URLs from sitemap');
  console.log('  --removed        (with --url) Notify URL removed');
}

main();
