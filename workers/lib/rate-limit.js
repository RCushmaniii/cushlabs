/**
 * Distributed rate limiting for CushLabs Workers (Workers KV backed).
 *
 * WHY NOT AN IN-MEMORY MAP (what this replaced):
 * Workers run in short-lived V8 isolates spread across 300+ locations. A Map
 * lives in ONE isolate's memory, is never shared between them, and dies on
 * cold start. The old "30 requests/hour" limit was really "30 per isolate,
 * unlimited isolates" — effectively no limit on a public endpoint holding a
 * paid ANTHROPIC_API_KEY.
 *
 * WHY NOT CLOUDFLARE'S NATIVE RATE LIMITING BINDING:
 * Tried first and empirically rejected on 2026-07-26. With
 * `simple = { limit = 10, period = 60 }` the binding returned
 * `{"success":true}` on every call including request 14. Shipping it would
 * have been worse than the Map: false confidence.
 *
 * CORRECTION, 2026-07-30 — the observation above was right, the diagnosis was
 * not, and the difference matters if anyone reconsiders this later. The binding
 * is NOT a no-op on this account. Measured on cushlabs-whatsapp with
 * `simple = { limit = 300, period = 60 }`:
 *
 *   420 sequential requests over ONE keep-alive socket → first 429 at #302
 *   1,500 requests over 25 parallel connections        → zero 429s
 *
 * The counter is ISOLATE-LOCAL. Fourteen ordinary HTTP requests land on enough
 * different isolates that none of them individually reaches the limit, which is
 * exactly what was seen here. The binding works; it just cannot see traffic
 * spread across connections.
 *
 * The practical conclusion for THIS file is unchanged — a public endpoint
 * holding a paid API key needs a counter that is genuinely shared, and the
 * binding is not one. But it is a reasonable cheap first line in front of a
 * surface that authenticates before it spends, which is how cushlabs-whatsapp
 * and cushlabs-connect now use it.
 *
 * WHY NOT DURABLE OBJECTS: they require a paid Workers plan.
 *
 * TRADE-OFFS OF KV, stated honestly:
 *   - KV is eventually consistent, so concurrent requests can undercount.
 *     Adequate for a spending CEILING, not for exact quota accounting.
 *   - KV free tier allows ~1,000 writes/day account-wide. This limiter uses
 *     2 writes per allowed request, so roughly 500 requests/day. For a
 *     portfolio demo that is ample; exceeding it means either real traction
 *     (upgrade) or an attack (correctly stopped).
 *
 * FAIL CLOSED, deliberately. Elsewhere at CushLabs a limiter outage fails
 * open, because blocking a legitimate stock alert is worse than a missed
 * count. Here the protected resource is money: if we cannot count, we do not
 * spend. A broken demo is recoverable; a drained API budget is not.
 */

/** Per-IP requests allowed per hour. */
const IP_LIMIT_PER_HOUR = 30;
/** Total requests allowed per hour across all callers. */
const GLOBAL_LIMIT_PER_HOUR = 300;
/** KV entry lifetime. Must exceed the window so a bucket survives it. */
const TTL_SECONDS = 7200;

/**
 * @typedef {Object} RateLimitResult
 * @property {boolean} allowed
 * @property {"ip"|"global"|"unavailable"|null} scope Which limit rejected it.
 */

/** Current hour bucket, e.g. "2026-07-26T14". */
function hourBucket(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 13);
}

/**
 * Read a counter, returning 0 when absent and null when KV itself failed.
 * The distinction matters: absent means "no traffic yet", failed means
 * "cannot enforce" and must deny.
 */
async function readCount(kv, key) {
  try {
    const raw = await kv.get(key);
    if (raw === null) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.error(`rate-limit: KV read failed for ${key}: ${error.message}`);
    return null;
  }
}

/**
 * Apply per-IP and global hourly limits.
 *
 * @param {Object} env Worker env, expects env.RATE_LIMIT (KV namespace).
 * @param {string} ip Client IP from CF-Connecting-IP.
 * @returns {Promise<RateLimitResult>}
 */
export async function enforceRateLimit(env, ip) {
  const kv = env.RATE_LIMIT;

  if (!kv || typeof kv.get !== "function") {
    // Configuration error, not a transient fault. Deny: an unmetered public
    // endpoint spending on an API key is the exact failure being prevented.
    console.error(
      "rate-limit: RATE_LIMIT KV binding missing — denying request",
    );
    return { allowed: false, scope: "unavailable" };
  }

  const bucket = hourBucket();
  const ipKey = `rl:ip:${ip || "unknown"}:${bucket}`;
  const globalKey = `rl:global:${bucket}`;

  const [ipCount, globalCount] = await Promise.all([
    readCount(kv, ipKey),
    readCount(kv, globalKey),
  ]);

  if (ipCount === null || globalCount === null) {
    return { allowed: false, scope: "unavailable" };
  }

  if (globalCount >= GLOBAL_LIMIT_PER_HOUR) {
    return { allowed: false, scope: "global" };
  }
  if (ipCount >= IP_LIMIT_PER_HOUR) {
    return { allowed: false, scope: "ip" };
  }

  // Increment only for allowed requests: a blocked flood must not burn the
  // KV write budget, which would be a second denial-of-service surface.
  try {
    await Promise.all([
      kv.put(ipKey, String(ipCount + 1), { expirationTtl: TTL_SECONDS }),
      kv.put(globalKey, String(globalCount + 1), {
        expirationTtl: TTL_SECONDS,
      }),
    ]);
  } catch (error) {
    console.error(`rate-limit: KV write failed: ${error.message}`);
    return { allowed: false, scope: "unavailable" };
  }

  return { allowed: true, scope: null };
}

/**
 * User-facing 429 copy. es-MX per the CushLabs Spanish standard.
 *
 * @param {"ip"|"global"|"unavailable"|null} scope
 * @param {string} [lang] "es" for Spanish.
 */
export function rateLimitMessage(scope, lang) {
  const spanish = String(lang || "")
    .toLowerCase()
    .startsWith("es");

  if (scope === "global") {
    return spanish
      ? "La demostración está recibiendo mucho tráfico ahora mismo. Vuelve a intentarlo en unos minutos."
      : "The demo is receiving heavy traffic right now. Please try again in a few minutes.";
  }
  if (scope === "unavailable") {
    return spanish
      ? "La demostración no está disponible en este momento. Vuelve a intentarlo más tarde."
      : "The demo is temporarily unavailable. Please try again later.";
  }
  return spanish
    ? "Demasiadas solicitudes. Espera un momento antes de continuar."
    : "Too many requests. Please wait a moment before continuing.";
}
