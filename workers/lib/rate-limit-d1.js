/**
 * Rate limiting for the booking Worker — D1-backed, shared across isolates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS ALONGSIDE lib/rate-limit.js (KV)
 *
 * The demo Workers (camila-demo, demo-chat) use the KV limiter in this same
 * directory. Two reasons the booking Worker does not:
 *
 *   Write budget. KV's free tier allows roughly 1,000 writes/day account-wide
 *   and that limiter spends 2 per allowed request. GET /slots is called on page
 *   load by the booking widget, so a few hundred visitors would exhaust it — and
 *   the KV limiter FAILS CLOSED, so running out of writes would take bookings
 *   offline entirely. That is a self-inflicted outage on the site's conversion
 *   path. D1's free tier is 100k row writes/day, which this cannot approach.
 *
 *   Failure direction. Failing closed is right for the demos, where the
 *   protected resource is a paid API key and a broken demo is recoverable. It is
 *   wrong here: refusing every booking because the datastore blipped costs real
 *   business, while a brief unmetered window costs some junk calendar events
 *   that can be deleted. See checkRateLimit below — the degraded case is
 *   returned explicitly and logged, never silent.
 *
 * WHY NOT THE IN-MEMORY MAP THIS REPLACED
 *
 * The previous limiter was a module-level Map. Each isolate keeps its own copy
 * and isolates are recycled freely, so "5 bookings per hour" was really 5 per
 * isolate. A client opening a few parallel connections got a multiple of the
 * limit and the count reset on every cold start.
 *
 * WHY NOT CLOUDFLARE'S NATIVE [[ratelimits]] BINDING
 *
 * Measured on cushlabs-whatsapp, 2026-07-30: 420 sequential requests over one
 * keep-alive socket were refused at exactly the limit, but 1,500 requests over
 * 25 parallel connections were not refused at all. Its counter is isolate-local
 * too. That is a fine cheap first line in front of a surface that authenticates
 * before it spends — but POST /book creates a real calendar event with no
 * authentication and GET /slots burns Google Calendar quota, so both act before
 * they authenticate and need a genuinely shared counter.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Collapse a client address to the unit a limit should actually apply to.
 *
 * IPv4 whole; IPv6 truncated to its /64.
 *
 * A full IPv6 /128 is close to useless as a limiter key. Hosts rotate temporary
 * addresses under RFC 4941, every device on a LAN has its own, and a residential
 * subscriber is handed an entire /64 — so an abuser has 18 quintillion keys and
 * each request lands in a fresh bucket. Not theoretical: on cushlabs-whatsapp,
 * keying on the raw address let 1,500 requests from one machine through with
 * zero refusals. /64 is the smallest block routed to a single subscriber.
 */
export function clientKey(ip) {
  if (!ip) return "unknown";
  if (!ip.includes(":")) return ip;
  const hextets = ip.split(":");
  // Guard against "::"-compressed forms that expand to fewer than 4 groups.
  if (hextets.length < 4 || ip.includes("::")) return ip;
  return `${hextets.slice(0, 4).join(":")}::/64`;
}

/**
 * Create the counter table if absent.
 *
 * Cheap to call per request — D1 no-ops an existing CREATE ... IF NOT EXISTS —
 * and it means a fresh or restored database cannot leave the limiter silently
 * broken because a migration step was missed.
 */
async function ensureSchema(db) {
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS rate_limit (
         bucket TEXT NOT NULL,
         ts     INTEGER NOT NULL
       )`,
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket_ts
         ON rate_limit (bucket, ts)`,
    ),
  ]);
}

/**
 * Sliding-window check against the shared counter.
 *
 * @param {D1Database} db
 * @param {string} bucket      surface + client key, e.g. "book:203.0.113.7"
 * @param {number} maxRequests
 * @param {number} windowMs
 * @returns {Promise<{allowed:boolean, remaining:number, resetIn:number, degraded?:boolean}>}
 *
 * FAILS OPEN and reports `degraded: true` when D1 is unreachable. See the header
 * for why that is the right direction on this Worker specifically. The caller
 * logs it; it is never silent.
 *
 * ACCURACY UNDER CONCURRENCY, measured against production 2026-07-30: 100
 * requests over 20-way parallelism against a limit of 60 → 81 allowed, 19
 * refused. The count is read before the insert, so requests arriving together
 * can all see the same pre-insert total and slip through. The overshoot is
 * bounded by how many land in one round trip, roughly 35% at that concurrency.
 *
 * That is fine for what this guards — a ceiling on Google Calendar quota and on
 * junk bookings, where a handful over the line costs nothing. It is NOT exact
 * quota accounting, so do not reuse this where the limit is a hard contractual
 * or billing boundary. Inserting before counting would tighten it, at the cost
 * of letting a refused request consume a slot and keep an attacker locked out
 * past the window — a worse trade here than the overshoot.
 */
export async function checkRateLimit(db, bucket, maxRequests, windowMs) {
  if (!db) {
    console.error(
      "[rate-limit] D1 binding absent — request allowed UNMETERED. Check wrangler.toml.",
    );
    return {
      allowed: true,
      remaining: maxRequests,
      resetIn: 0,
      degraded: true,
    };
  }

  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    await ensureSchema(db);

    const row = await db
      .prepare(
        `SELECT COUNT(*) AS n, MIN(ts) AS oldest
           FROM rate_limit
          WHERE bucket = ? AND ts > ?`,
      )
      .bind(bucket, windowStart)
      .first();

    const count = Number(row?.n ?? 0);

    if (count >= maxRequests) {
      // Time until the oldest request still inside the window ages out.
      const oldest = Number(row?.oldest ?? now);
      const resetIn = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return { allowed: false, remaining: 0, resetIn };
    }

    await db
      .prepare(`INSERT INTO rate_limit (bucket, ts) VALUES (?, ?)`)
      .bind(bucket, now)
      .run();

    // Probabilistic GC: ~2% of allowed requests purge rows older than any window
    // this Worker uses. Keeps the table bounded without a cron job, and leaves
    // the other 98% of responses untouched.
    if (Math.random() < 0.02) {
      await db
        .prepare(`DELETE FROM rate_limit WHERE ts < ?`)
        .bind(now - 24 * 60 * 60 * 1000)
        .run();
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - count - 1),
      resetIn: 0,
    };
  } catch (error) {
    console.error(
      `[rate-limit] D1 unavailable — request allowed UNMETERED: ${error.message}`,
    );
    return {
      allowed: true,
      remaining: maxRequests,
      resetIn: 0,
      degraded: true,
    };
  }
}

/**
 * Prove the limiter is enforcing, not merely reachable.
 *
 * The failure this replaces was silent — a limiter that counts nothing looks
 * identical from outside to one that counts correctly. This drives past a small
 * limit on a throwaway bucket and reports whether anything was actually refused,
 * so /health can fail loudly instead of reporting a green tick over a limiter
 * that stopped working.
 *
 * Uses a unique bucket per call so it can never consume a real client's budget
 * and never depends on state left by a previous check.
 */
export async function checkRateLimitEnforcement(db) {
  if (!db) {
    return {
      ok: false,
      detail: "D1 binding absent — requests are NOT limited",
    };
  }
  const bucket = `selftest:${Date.now()}:${Math.random()}`;
  try {
    let refused = 0;
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit(db, bucket, 3, 60_000);
      if (r.degraded) {
        return {
          ok: false,
          detail: "D1 unreachable — limiter is failing open",
        };
      }
      if (!r.allowed) refused++;
    }
    return refused > 0
      ? { ok: true, detail: `enforcing (${refused}/5 probes refused)` }
      : {
          ok: false,
          detail: "limiter answered but refused nothing over a 3-call limit",
        };
  } catch (error) {
    return { ok: false, detail: error.message };
  }
}
