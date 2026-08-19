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
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GATE PROTECTS THE URL, NOT THE FILE. THIS REPO IS PUBLIC.
 *
 * Everything below — the capability secret, the httpOnly cookie, the 404-on-miss,
 * the 90-day expiry, the noindex — controls who can reach the *route*. None of it
 * does anything about the *file*, which anyone can read on GitHub the moment it is
 * committed. On 2026-08-19 a converted client's proposal, including her negotiated
 * monthly rate, was found readable at
 * raw.githubusercontent.com/RCushmaniii/cushlabs/main/demos/azucar/proposal.html
 * with no authentication, 31 days after it was committed.
 *
 * So: `demos/*​/proposal.html` is gitignored — proposals are the pages that carry
 * commercial terms. Demo hubs (preview.html, services.html) carry no pricing and are
 * fine to commit. Lumière is exempt because it is a fictitious showcase.
 *
 * A real client's proposal is delivered out-of-band, NOT through this repo.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * To add a client:
 *   1. Drop their page(s) in demos/<company>/<page>.html. If the page contains
 *      pricing, it does NOT get committed — see the block above.
 *   2. Add an entry to DEMOS below (no secret in this file — see tokenFor).
 *   3. Mint a secret:
 *        node -e "console.log(require('crypto').randomBytes(15).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,20))"
 *   4. Store it as DEMO_TOKEN_<COMPANY> in Vercel (all environments) and in
 *      the gitignored .env.local for local dev. Never in this file: the repo
 *      is public, so a committed token is a published secret.
 *   5. List the allowed filenames in `pages`.
 *   6. Send: https://www.cushlabs.ai/demo/<company>/<page>.html?token=<secret>
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

interface DemoConfig {
  clientName: string;
  /** ISO date issued. Expiry = createdAt + DEFAULT_LIFESPAN_DAYS unless overridden. */
  createdAt: string;
  expiresAt?: string;
  /** Allowed filenames under demos/<company>/. Anything not listed → 404. */
  pages: string[];
}

/**
 * Resolve a demo's capability secret from the environment.
 *
 * THIS REPOSITORY IS PUBLIC. An access token written in source is a published
 * secret: anyone reading GitHub can open the gated client proposal, pricing
 * included. Tokens therefore live only in the environment
 * (`DEMO_TOKEN_<COMPANY>`, set in Vercel and in a gitignored .env.local for
 * local dev) and never in this file.
 *
 * Returns undefined when unset, which disables that demo entirely — failing
 * closed, because a gate that silently opens is worse than a broken link.
 */
function tokenFor(company: string): string | undefined {
  const value = process.env[`DEMO_TOKEN_${company.toUpperCase()}`];
  return value && value.trim() ? value.trim() : undefined;
}

/** 90 days covers a B2B sales cycle without a stale link (out-of-date pricing) living forever. */
const DEFAULT_LIFESPAN_DAYS = 90;

// Value type is `DemoConfig | undefined` on purpose. A plain Record<string, DemoConfig>
// tells the compiler that ANY key returns a config, so the `if (!config)` guard below —
// the check that rejects an unknown company — reads as dead code and gets flagged as an
// unnecessary condition. The lookup really can miss; the type should say so.
const DEMOS: Record<string, DemoConfig | undefined> = {
  // La Tiendita removed 2026-08-19 — the prospect never responded, and their
  // proposal + website mockup were sitting in this PUBLIC repo. See the warning
  // above `tokenFor`.
  azucar: {
    clientName: "Azúcar Trajes de Baño (Susy)",
    createdAt: "2026-07-19",
    // preview.html = the live demo hub (what the assistant already knows, what
    // to ask it, what is real vs demonstration, and the 3 open questions).
    // proposal.html was DELETED 2026-08-19: Susy converted, so the sales page had
    // served its purpose, and it carried her negotiated monthly rate in a public repo.
    pages: ["preview.html"],
  },
  // Fictitious US bilingual medspa showcase (Estéticas niche, US bilingual-wedge).
  // preview.html = live "chat with Camila" hub; proposal.html = medspa sales page.
  // Shareable to many US medspa prospects — the demo store lives in
  // cushlabs-messenger-bot (page + bot); this is its gated client-facing wrapper.
  lumiere: {
    clientName: "Lumière Medspa (Demo) — US medspa showcase",
    createdAt: "2026-07-25",
    // services.html = public offerings-only composite (only what we deliver today,
    // incl. live in-chat booking). No roadmap/"coming soon" items are referenced.
    pages: ["preview.html", "proposal.html", "services.html"],
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

    // Fail closed. If the token is not configured the demo is unreachable
    // rather than open: a gate that silently stops gating is the worst
    // outcome, since it looks like it is still working.
    const secret = tokenFor(company);
    if (!secret) {
      console.error(
        `demo: DEMO_TOKEN_${company.toUpperCase()} is not set — "${company}" is disabled`,
      );
      return notFound(res);
    }

    const cookieName = `demo_${company}`;
    const cookieHeader = req.headers.cookie || "";
    const hasCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .some((c) => c === `${cookieName}=${secret}`);

    const queryToken = url.searchParams.get("token");
    const cleanPath = `/demo/${company}/${page}`;

    // First click with a valid secret → set the cookie and bounce to the clean URL.
    if (!hasCookie && queryToken === secret) {
      const remainingMs = expiryOf(config).getTime() - Date.now();
      const remainingDays = Math.max(1, Math.ceil(remainingMs / 86400000));
      const cookie = [
        `${cookieName}=${secret}`,
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
