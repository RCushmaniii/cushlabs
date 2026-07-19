/**
 * Gated demo/proposal server.
 *
 * Serves per-client pages from `/demos/<company>/<page>.html` (which are NOT in
 * `public/`, so there is no un-gated route to them) behind a capability-secret
 * check. Mirrors the MarketSignal pitch flow:
 *
 *   1. Client opens  /demo/<company>/<page>.html?token=<secret>
 *      → vercel.json rewrites it to /api/demo?path=<company>/<page>.html&token=...
 *   2. Valid secret → set httpOnly cookie `demo_<company>`, 302 to the clean URL
 *      (secret leaves the address bar).
 *   3. Clean URL (no secret) → cookie is validated → the HTML is streamed with
 *      X-Robots-Tag: noindex.
 *   4. Missing / wrong / expired secret and no cookie → 404 ("doesn't exist").
 *
 * Node runtime with the classic (req, res) signature — NOT the Fetch `Request`
 * handler, which only works on this project's edge functions and fails on Node
 * with FUNCTION_INVOCATION_FAILED. Node is required anyway: it needs `fs` to
 * read the bundled HTML, and the pages are too large for the edge bundle cap.
 * `demos/**` ships with this function via `functions` → `includeFiles` in
 * vercel.json.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getDemoAccessStatus,
  isAllowedPage,
} from "../src/lib/demo-access/config";

const COMPANY_RE = /^[a-z0-9-]+$/;
const PAGE_RE = /^[a-z0-9._-]+\.html$/;

function notFound(res: ServerResponse): void {
  // Terse on purpose — a wrong/expired link should look like the page simply
  // doesn't exist, not hint that a valid secret would reveal something.
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  res.end("Not found");
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    // req.url is a relative path on the Node runtime (e.g. "/api/demo?path=..."),
    // so give URL a base to parse against.
    const url = new URL(req.url || "/", "http://localhost");
    const rel = (url.searchParams.get("path") || "").replace(/^\/+/, "");
    const parts = rel.split("/");
    if (parts.length !== 2) return notFound(res);

    const [company, page] = parts;
    if (!COMPANY_RE.test(company) || !PAGE_RE.test(page)) return notFound(res);

    const status = getDemoAccessStatus(company);
    if (!status || status.expired) return notFound(res);
    if (!isAllowedPage(company, page)) return notFound(res);

    const { config } = status;
    const cookieName = `demo_${company}`;
    const cookieHeader = req.headers.cookie || "";
    const hasCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .some((c) => c === `${cookieName}=${config.accessToken}`);

    const queryToken = url.searchParams.get("token");
    const cleanPath = `/demo/${company}/${page}`;

    // First click with a valid secret → set the cookie and bounce to the clean URL.
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
      res.statusCode = 302;
      res.setHeader("Location", cleanPath);
      res.setHeader("Set-Cookie", cookie);
      res.setHeader("Cache-Control", "no-store");
      res.end();
      return;
    }

    // No valid secret and no valid cookie → 404.
    if (!hasCookie) return notFound(res);

    // Authenticated → read and serve the bundled HTML.
    const file = path.join(process.cwd(), "demos", company, page);
    const html = await readFile(file, "utf-8");

    // The demo files are artifact-source fragments (they start with <title> and
    // carry no <!doctype>/charset/viewport). Wrap them in a real document so
    // standards mode is on and — critically — the viewport meta is present;
    // without it phones render at desktop width, the exact bug we're fixing.
    const isFullDoc =
      /^\s*<!doctype/i.test(html) || /^\s*<html[\s>]/i.test(html);
    const doc = isFullDoc
      ? html
      : `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<style>html,body{margin:0;padding:0}img{max-width:100%}</style>` +
        `</head><body>${html}</body></html>`;

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "private, no-store");
    res.end(doc);
  } catch (err) {
    // Surface the real cause in runtime logs instead of an opaque 500.
    console.error("demo function error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end("Internal error");
  }
}
