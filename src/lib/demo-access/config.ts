/**
 * Demo / proposal access tokens — per-client capability links.
 *
 * Mirrors the MarketSignal pitch-token pattern (src/lib/pitch/config.ts in
 * cushlabs-marketsignal): a client is sent ONE unguessable link containing a
 * shared secret. On first click the api/demo.ts function swaps the token for an
 * httpOnly cookie and redirects to the clean URL, so the token leaves the
 * address bar. After that, the cookie carries access until it expires.
 *
 * These pages are NOT in `public/` — they live in `/demos` and are served only
 * through the gated function. There is no un-gated route to them, and they are
 * `noindex` + robots-disallowed, so they never reach bots or search engines.
 *
 * Phase 1: hardcoded registry, one entry per client. Phase 2 (once there are
 * more than ~5 clients): move to a database table so links can be issued and
 * revoked without a code deploy, and hash the tokens at rest.
 *
 * To add a client:
 *   1. Drop their page(s) in `demos/<company>/<page>.html`.
 *   2. Add an entry below with a fresh token (generate: `node -e
 *      "console.log(require('crypto').randomBytes(15).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,20))"`).
 *   3. List the allowed filenames in `pages`.
 *   4. Send them: https://www.cushlabs.ai/demo/<company>/<page>.html?token=<token>
 */

export interface DemoConfig {
  /** URL segment for this client, e.g. "latiendita" → /demo/latiendita/... */
  company: string;
  /** Display name (logging only). */
  clientName: string;
  /** Shared secret carried in the URL on first click. Rotate by editing this. */
  accessToken: string;
  /** ISO date the link was issued. Expiry is computed from this. */
  createdAt: string;
  /** Optional expiry override (ISO date). Omit to use createdAt + DEFAULT_LIFESPAN_DAYS. */
  expiresAt?: string;
  /** Allowed filenames under demos/<company>/. Anything not listed → 404. */
  pages: string[];
}

export interface DemoAccessStatus {
  config: DemoConfig;
  expiresAt: Date;
  expired: boolean;
  daysRemaining: number;
}

/**
 * Default demo-link lifespan. 90 days covers a full B2B sales cycle
 * (send → follow-up → close) without a stale link — with out-of-date pricing —
 * living forever in a prospect's WhatsApp. Extend a specific link via
 * `expiresAt` on its entry.
 */
export const DEFAULT_LIFESPAN_DAYS = 90;

export const demoRegistry: Record<string, DemoConfig> = {
  latiendita: {
    company: "latiendita",
    clientName: "La Tiendita de Guadalajara (Juan Vélez)",
    accessToken: "latiendita-kMK1IfouWqGH9eM3oF",
    createdAt: "2026-07-19",
    pages: ["proposal.html", "websiteexample.html"],
  },
  azucar: {
    company: "azucar",
    clientName: "Azúcar Trajes de Baño (Susy)",
    accessToken: "azucar-4u8W9ivs8fhjPRXENlIq",
    createdAt: "2026-07-19",
    pages: ["proposal.html"],
  },
};

export function getDemo(company: string): DemoConfig | undefined {
  return demoRegistry[company];
}

export function validateDemoToken(company: string, token: string): boolean {
  const config = demoRegistry[company];
  if (!config) return false;
  return config.accessToken === token;
}

export function isAllowedPage(company: string, page: string): boolean {
  const config = demoRegistry[company];
  if (!config) return false;
  return config.pages.includes(page);
}

function computeExpiry(config: DemoConfig): Date {
  if (config.expiresAt) {
    return new Date(`${config.expiresAt}T23:59:59Z`);
  }
  const created = new Date(config.createdAt);
  return new Date(
    created.getTime() + DEFAULT_LIFESPAN_DAYS * 24 * 60 * 60 * 1000,
  );
}

export function getDemoAccessStatus(
  company: string,
  now: Date = new Date(),
): DemoAccessStatus | null {
  const config = demoRegistry[company];
  if (!config) return null;
  const expiresAt = computeExpiry(config);
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return {
    config,
    expiresAt,
    expired: now > expiresAt,
    daysRemaining,
  };
}
