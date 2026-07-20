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
 *   3. Clean URL (no secret) → cookie is validated → HTML streamed with noindex.
 *   4. Missing / wrong / expired secret and no cookie → 404 ("doesn't exist").
 *
 * SELF-CONTAINED ON PURPOSE. Vercel's Node builder for this (Astro) project does
 * not bundle cross-folder imports — a `../src/lib/...` import ships only api/ and
 * dies at runtime with ERR_MODULE_NOT_FOUND. So the access registry lives right
 * here; this is the single source of truth for demo links. Node runtime (needs
 * `fs`); pages ship via `functions` → `includeFiles: demos/**` in vercel.json.
 *
 * To add a client:
 *   1. Drop their page(s) in demos/<company>/<page>.html.
 *   2. Add an entry to DEMOS below with a fresh secret:
 *        node -e "console.log(require('crypto').randomBytes(15).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,20))"
 *   3. List the allowed filenames in `pages`.
 *   4. Send: https://www.cushlabs.ai/demo/<company>/<page>.html?token=<secret>
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

interface DemoConfig {
  clientName: string;
  /** Shared secret carried in the URL on first click. Rotate by editing this. */
  accessToken: string;
  /** ISO date issued. Expiry = createdAt + DEFAULT_LIFESPAN_DAYS unless overridden. */
  createdAt: string;
  expiresAt?: string;
  /** Allowed filenames under demos/<company>/. Anything not listed → 404. */
  pages: string[];
}

/** 90 days covers a B2B sales cycle without a stale link (out-of-date pricing) living forever. */
const DEFAULT_LIFESPAN_DAYS = 90;

const DEMOS: Record<string, DemoConfig> = {
  latiendita: {
    clientName: "La Tiendita de Guadalajara (Juan Vélez)",
    accessToken: "latiendita-kMK1IfouWqGH9eM3oF",
    createdAt: "2026-07-19",
    // Both live: the proposal (rebuilt on the real Facebook offer) and the
    // convenience-store website. Robert builds websites (25-yr web dev); for
    // this neighbor it's included in the deal, on the client's own hosting.
    pages: ["proposal.html", "websiteexample.html"],
  },
  azucar: {
    clientName: "Azúcar Trajes de Baño (Susy)",
    accessToken: "azucar-4u8W9ivs8fhjPRXENlIq",
    createdAt: "2026-07-19",
    pages: ["proposal.html"],
  },
};

function expiryOf(c: DemoConfig): Date {
  if (c.expiresAt) return new Date(`${c.expiresAt}T23:59:59Z`);
  return new Date(
    new Date(c.createdAt).getTime() +
      DEFAULT_LIFESPAN_DAYS * 24 * 60 * 60 * 1000,
  );
}

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

    const config = DEMOS[company];
    if (!config) return notFound(res);
    if (new Date() > expiryOf(config)) return notFound(res);
    if (!config.pages.includes(page)) return notFound(res);

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
      const remainingMs = expiryOf(config).getTime() - Date.now();
      const remainingDays = Math.max(1, Math.ceil(remainingMs / 86400000));
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
    console.error("demo function error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end("Internal error");
  }
}
