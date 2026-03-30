/**
 * Google Search Console API Client — CushLabs
 *
 * Provides authenticated access to GSC for:
 * - Submitting sitemaps
 * - Inspecting URL index status
 * - Pulling search performance data
 *
 * Service account: seo-api-access@seo-automation-489217.iam.gserviceaccount.com
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = join(__dirname, 'gsc-credentials.json');
export const SITE_URL = 'https://www.cushlabs.ai';
export const SITE_PROPERTY = `sc-domain:cushlabs.ai`;
export const SITE_PROPERTY_URL = `https://www.cushlabs.ai/`;

let _authClient = null;

export async function getAuthClient() {
  if (_authClient) return _authClient;

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/indexing',
    ],
  });
  _authClient = await auth.getClient();
  return _authClient;
}

export async function getSearchConsole() {
  const auth = await getAuthClient();
  return google.searchconsole({ version: 'v1', auth });
}

export async function getWebmasters() {
  const auth = await getAuthClient();
  return google.webmasters({ version: 'v3', auth });
}

export async function detectSiteProperty() {
  const webmasters = await getWebmasters();
  try {
    const res = await webmasters.sites.list();
    const sites = res.data.siteEntry || [];
    console.log('Available GSC properties:');
    sites.forEach(s => console.log(`  - ${s.siteUrl} (${s.permissionLevel})`));

    const match = sites.find(s => s.siteUrl === SITE_PROPERTY || s.siteUrl === SITE_PROPERTY_URL);
    if (match) {
      console.log(`\nUsing property: ${match.siteUrl}`);
      return match.siteUrl;
    }
    console.log('\nSite not found in available properties.');
    return null;
  } catch (err) {
    console.error('Error listing sites:', err.message);
    return null;
  }
}
