/**
 * Gated demo/proposal server.
 *
 * Serves per-client pages from `/demos/<company>/<page>.html` (which are NOT in
 * `public/`, so there is no un-gated route to them) behind a capability-token
 * check. Mirrors the MarketSignal pitch-token flow:
 *
 *   1. Client opens  /demo/<company>/<page>.html?token=<secret>
 *      → vercel.json rewrites it to /api/demo?path=<company>/<page>.html&token=...
 *   2. Valid token  → set httpOnly cookie `demo_<company>`, 302 to the clean URL
 *      (token leaves the address bar).
 *   3. Clean URL (no token) → cookie is validated → the HTML is streamed with
 *      X-Robots-Tag: noindex.
 *   4. Missing / wrong / expired token and no cookie → 404 (page "doesn't exist").
 *
 * Node runtime (not edge): needs `fs` to read the bundled HTML, and the pages
 * are too large for the edge bundle cap. `demos/**` ships with this function via
 * the `functions` → `includeFiles` config in vercel.json.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getDemoAccessStatus,
  isAllowedPage,
} from "../src/lib/demo-access/config";

const COMPANY_RE = /^[a-z0-9-]+$/;
const PAGE_RE = /^[a-z0-9._-]+\.html$/;

function notFound(): Response {
  // Deliberately terse — a wrong/expired link should look like the page simply
  // doesn't exist, not hint that a valid token would reveal something.
  return new Response("Not found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "no-store",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const rel = (url.searchParams.get("path") || "").replace(/^\/+/, "");
  const parts = rel.split("/");
  if (parts.length !== 2) return notFound();

  const [company, page] = parts;
  if (!COMPANY_RE.test(company) || !PAGE_RE.test(page)) return notFound();

  const status = getDemoAccessStatus(company);
  if (!status || status.expired) return notFound();
  if (!isAllowedPage(company, page)) return notFound();

  const { config } = status;
  const cookieName = `demo_${company}`;
  const cookieHeader = req.headers.get("cookie") || "";
  const hasCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${cookieName}=${config.accessToken}`);

  const queryToken = url.searchParams.get("token");
  const cleanPath = `/demo/${company}/${page}`;

  // First click with a valid token → set the cookie and bounce to the clean URL.
  if (!hasCookie && queryToken === config.accessToken) {
    const remainingDays = Math.max(1, status.daysRemaining);
    const cookie = [
      `${cookieName}=${config.accessToken}`,
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Path=/",
      `Max-Age=${60 * 60 * 24 * remainingDays}`,
    ].join("; ");
    return new Response(null, {
      status: 302,
      headers: {
        location: cleanPath,
        "set-cookie": cookie,
        "cache-control": "no-store",
      },
    });
  }

  // No valid token and no valid cookie → 404.
  if (!hasCookie) return notFound();

  // Authenticated → serve the bundled HTML.
  let html: string;
  try {
    const file = path.join(process.cwd(), "demos", company, page);
    html = await readFile(file, "utf-8");
  } catch {
    return notFound();
  }

  // The demo files are artifact-source fragments (they start with <title> and
  // carry no <!doctype>/charset/viewport — the Claude Artifact runtime used to
  // add those). Serve them wrapped in a real document skeleton so standards mode
  // is on and, critically, the viewport meta is present — without it phones
  // render at desktop width, which is the whole problem we're solving.
  const isFullDoc = /^\s*<!doctype/i.test(html) || /^\s*<html[\s>]/i.test(html);
  const doc = isFullDoc
    ? html
    : `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<style>html,body{margin:0;padding:0}img{max-width:100%}</style>` +
      `</head><body>${html}</body></html>`;

  return new Response(doc, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "private, no-store",
    },
  });
}
