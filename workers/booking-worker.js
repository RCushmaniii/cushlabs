/**
 * CushLabs.ai – Booking Cloudflare Worker v1.0
 *
 * Ported from NY English Teacher API v3.1, adapted for CushLabs AI consulting.
 *
 * Endpoints:
 *   GET  /slots/:date?lang=en|es
 *   POST /book           { name, email, date: 'YYYY-MM-DD', time: 'HH:MM', lang? }
 *
 * Environment Variables:
 *   Required:
 *     GOOGLE_CLIENT_ID
 *     GOOGLE_CLIENT_SECRET
 *     GOOGLE_REFRESH_TOKEN
 *     CALENDAR_ID                  (work calendar — bookings are created here)
 *     PERSONAL_CALENDAR_ID         (personal calendar — checked for busy times to prevent conflicts)
 *
 *   Optional:
 *     WEEKDAY_MORNING_HOURS     (default: 09:00-14:00)
 *     WEEKDAY_AFTERNOON_HOURS   (default: 16:00-20:00)
 *     SATURDAY_HOURS            (default: 09:00-13:00)
 *     ALLOWED_ORIGINS           (comma-separated, supports *.suffix patterns, e.g. "https://cushlabs.ai,https://www.cushlabs.ai,*.vercel.app")
 *     TIMEZONE                  (default: America/Mexico_City)
 *     DEBUG_ENABLED             (set to "true" to enable /debug endpoint)
 *     DEBUG_KEY                 (optional auth key for /debug)
 *     RATE_LIMIT_MAX            (default: 5 bookings per window)
 *     RATE_LIMIT_WINDOW_MS      (default: 3600000 = 1 hour)
 */

/* ------------------------ Rate Limiting ------------------------ */

// D1-backed and shared across isolates. The Map that used to live here counted
// per-isolate, so "5 bookings per hour" was really 5 per isolate with the count
// resetting on every cold start. See workers/lib/rate-limit-d1.js for why this
// Worker uses D1 while the demo Workers use KV.
import {
  checkRateLimit,
  checkRateLimitEnforcement,
  clientKey,
} from "./lib/rate-limit-d1.js";

/* ------------------------ Bot Protection ------------------------ */

/**
 * A service-binding call arrives with the hostname the CALLER wrote, and the
 * only caller is cushlabs-camila-demo, which fetches `https://booking/...`
 * (see workers/camila-demo.js — a Worker cannot reach another same-account
 * Worker over its public URL, Cloudflare error 1042).
 *
 * "booking" is not a routable hostname, so nothing arriving from the public
 * internet can carry it: Cloudflare routes by hostname and would never hand
 * this Worker such a request. That makes it a safe internal marker, and it
 * matters — the demo bot has no browser, no Origin header and no Turnstile
 * token, so without this exemption the live Lumière demo's in-chat booking
 * would start failing the moment this deploys.
 */
function isInternalCall(url) {
  return url.hostname === "booking";
}

function matchOrigin(origin, allowed) {
  if (!origin) return false;
  if (allowed.includes("*") || allowed.includes(origin)) return true;
  return allowed.some(
    (pattern) =>
      pattern.startsWith("*.") &&
      origin.startsWith("https://") &&
      origin.endsWith(pattern.slice(1)),
  );
}

/**
 * CORS is enforced by browsers, not by servers — it has never stopped a direct
 * POST, and on 2026-08-15 one landed: a booking from a disposable address that
 * created a real calendar event, a real Meet link, and held a 09:00 slot for a
 * meeting nobody attended.
 *
 * This is the cheap half of the fix. Origin is trivially forged by anything
 * deliberate, so it only removes the zero-effort case; Turnstile below is what
 * actually has to hold.
 */
function originAllowed(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes("*")) return true;

  const origin = request.headers.get("origin");
  if (origin) return matchOrigin(origin, allowed);

  // No Origin at all. Fall back to Referer so a privacy extension that strips
  // Origin does not lock a real visitor out of booking.
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return matchOrigin(new URL(referer).origin, allowed);
  } catch {
    return false;
  }
}

/**
 * Verifies a Cloudflare Turnstile token. Fails CLOSED: a siteverify outage
 * blocks bookings rather than reopening the endpoint. That trade is deliberate
 * — a blocked booking is a visible, recoverable annoyance with a WhatsApp
 * fallback on the page; a silently reopened one puts strangers on the calendar
 * again and nobody finds out for twelve days.
 */
async function verifyTurnstile(token, secret, remoteip) {
  if (!token) return { ok: false, reason: "missing-token" };

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteip && remoteip !== "unknown") body.append("remoteip", remoteip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = await res.json();
    return data?.success
      ? { ok: true }
      : {
          ok: false,
          reason: (data?.["error-codes"] || []).join(",") || "rejected",
        };
  } catch (err) {
    console.error("Turnstile siteverify failed:", err?.message || err);
    return { ok: false, reason: "siteverify-unreachable" };
  }
}

/* ------------------------ Token Cache ------------------------ */

let cachedToken = null;
let tokenExpiresAt = 0;

/* ------------------------ Slots Cache ------------------------ */

const slotsCache = new Map();
const SLOTS_CACHE_TTL = 5 * 60 * 1000;

function getCachedSlots(dateStr) {
  const cached = slotsCache.get(dateStr);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  if (cached) slotsCache.delete(dateStr);
  return null;
}

function setCachedSlots(dateStr, data) {
  if (slotsCache.size > 30) {
    const oldest = Array.from(slotsCache.entries())
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
      .slice(0, 10);
    oldest.forEach(([key]) => slotsCache.delete(key));
  }
  slotsCache.set(dateStr, { data, expiresAt: Date.now() + SLOTS_CACHE_TTL });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const lang = getLang(url, request);
    const tz = env.TIMEZONE || "America/Mexico_City";

    if (request.method === "OPTIONS") return corsPreflight(request, env);

    try {
      // Health check
      if (request.method === "GET" && path === "/") {
        // Reports whether the limiter is ENFORCING, not merely reachable. The
        // limiter this replaced failed silently — a counter that counts nothing
        // looks identical from outside to one that works — so /health returns
        // 503 when it cannot prove enforcement.
        const rateLimit = await checkRateLimitEnforcement(env.DB);
        return json(
          {
            ok: rateLimit.ok,
            service: "CushLabs Booking API v1",
            endpoints: ["/slots/:date", "/book"],
            rateLimit,
          },
          rateLimit.ok ? 200 : 503,
          request,
          env,
        );
      }

      // Debug endpoint
      if (request.method === "GET" && path === "/debug") {
        if (env.DEBUG_ENABLED !== "true") {
          return json(
            { ok: false, error: "Debug endpoint is disabled" },
            404,
            request,
            env,
          );
        }

        if (env.DEBUG_KEY) {
          const providedKey = request.headers.get("X-Debug-Key");
          if (providedKey !== env.DEBUG_KEY) {
            return json(
              { ok: false, error: "Unauthorized" },
              401,
              request,
              env,
            );
          }
        }

        return json(
          {
            ok: true,
            env_check: {
              has_google_client_id: !!env.GOOGLE_CLIENT_ID,
              has_google_client_secret: !!env.GOOGLE_CLIENT_SECRET,
              has_google_refresh_token: !!env.GOOGLE_REFRESH_TOKEN,
              has_calendar_id: !!(env.CALENDAR_ID || env.GOOGLE_CALENDAR_ID),
              has_personal_calendar_id: !!env.PERSONAL_CALENDAR_ID,
              timezone: env.TIMEZONE || "America/Mexico_City (default)",
              weekday_morning:
                env.WEEKDAY_MORNING_HOURS || "09:00-14:00 (default)",
              weekday_afternoon:
                env.WEEKDAY_AFTERNOON_HOURS || "16:00-20:00 (default)",
              saturday_hours: env.SATURDAY_HOURS || "09:00-13:00 (default)",
              allowed_origins: env.ALLOWED_ORIGINS
                ? "(configured)"
                : "* (default)",
            },
          },
          200,
          request,
          env,
        );
      }

      // Slots: GET /slots/2025-10-15
      if (request.method === "GET" && path.startsWith("/slots/")) {
        const dateStr = path.split("/slots/")[1];
        const skipCache = url.searchParams.get("nocache") === "1";

        if (!skipCache) {
          const cachedResult = getCachedSlots(dateStr);
          if (cachedResult) {
            return json(
              { ok: true, slots: cachedResult.slots, cached: true },
              200,
              request,
              env,
            );
          }
        }

        // Only a cache MISS reaches Google, so only a miss is rate limited. A
        // cached response costs nothing and must not consume anyone's budget —
        // limiting it would punish the ordinary case of a visitor clicking
        // through several dates on the booking widget.
        //
        // 60/hour per /64 is generous for a human browsing dates and still caps
        // what a scraper can pull from the Calendar API quota. Note ?nocache=1
        // bypasses the cache, so this is also what stops that being a free
        // passthrough to Google.
        const slotsCheck = await checkRateLimit(
          env.DB,
          `slots:${clientKey(
            request.headers.get("CF-Connecting-IP") ||
              request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim(),
          )}`,
          parseInt(env.SLOTS_RATE_LIMIT_MAX || "60"),
          3600000,
        );
        if (!slotsCheck.allowed) {
          return json(
            {
              ok: false,
              error: t(lang, "rate_limited"),
              retryAfter: slotsCheck.resetIn,
            },
            429,
            request,
            env,
          );
        }

        const showDebug = url.searchParams.get("debug") === "1";
        const result = await getAvailableSlots(dateStr, env, tz);
        setCachedSlots(dateStr, result);
        const response = { ok: true, slots: result.slots, cached: false };
        if (showDebug) response.debug = result.debug;
        return json(response, 200, request, env);
      }

      // Book: POST /book
      if (request.method === "POST" && path === "/book") {
        const maxRequests = parseInt(env.RATE_LIMIT_MAX || "5");
        const windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS || "3600000");

        const clientIP =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
          "unknown";

        const rateCheck = await checkRateLimit(
          env.DB,
          `book:${clientKey(clientIP)}`,
          maxRequests,
          windowMs,
        );
        if (!rateCheck.allowed) {
          return json(
            {
              ok: false,
              error: t(lang, "rate_limited"),
              retryAfter: rateCheck.resetIn,
            },
            429,
            request,
            env,
          );
        }

        const payload = await safeJson(request);

        // Bot gate. Ordered cheapest first: no I/O, then a header read, then a
        // network round trip. Skipped entirely for the demo Worker's service
        // binding, which has no browser to challenge.
        if (!isInternalCall(url)) {
          // 1. Honeypot. `company` is rendered off-screen and removed from the
          //    tab order and the accessibility tree, so no human — screen
          //    reader included — can put anything in it.
          if (sanitizeInput(payload?.company || "")) {
            console.warn("Booking rejected: honeypot filled");
            return json(
              { ok: false, error: t(lang, "bot_rejected") },
              403,
              request,
              env,
            );
          }

          // 2. Origin / Referer.
          if (!originAllowed(request, env)) {
            console.warn(
              `Booking rejected: origin not allowed (${request.headers.get("origin") || "none"})`,
            );
            return json(
              { ok: false, error: t(lang, "bot_rejected") },
              403,
              request,
              env,
            );
          }

          // 3. Turnstile. Enforced whenever the secret is configured. It is
          //    configured in production, so this is the real gate; the guard
          //    exists so a fresh/local deploy without the secret still boots
          //    instead of refusing every booking silently — and it says so.
          if (env.TURNSTILE_SECRET_KEY) {
            const verdict = await verifyTurnstile(
              payload?.turnstileToken,
              env.TURNSTILE_SECRET_KEY,
              clientIP,
            );
            if (!verdict.ok) {
              console.warn(`Booking rejected: turnstile ${verdict.reason}`);
              return json(
                { ok: false, error: t(lang, "bot_rejected") },
                403,
                request,
                env,
              );
            }
          } else {
            console.warn(
              "TURNSTILE_SECRET_KEY is not set — POST /book is accepting unverified traffic.",
            );
          }
        }

        const result = await createBooking(payload, env, tz, lang);
        return json(
          { ok: true, ...result, message: t(lang, "book_success") },
          200,
          request,
          env,
        );
      }

      return json({ ok: false, error: "Not found" }, 404, request, env);
    } catch (err) {
      console.error("Worker error:", err);
      return json(
        { ok: false, error: err?.message || String(err) },
        500,
        request,
        env,
      );
    }
  },
};

/* ------------------------ Core Handlers ------------------------ */

async function getAvailableSlots(dateStr, env, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
    throw new Error("Invalid date format. Use YYYY-MM-DD");

  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getUTCDay();

  // Sunday blocked
  if (dow === 0) return { slots: [], debug: { reason: "Sunday is blocked" } };

  let timeBlocks = [];

  if (dow === 6) {
    const satHours = env.SATURDAY_HOURS || "09:00-13:00";
    timeBlocks = [satHours];
  } else {
    const morningHours = env.WEEKDAY_MORNING_HOURS || "09:00-14:00";
    const afternoonHours = env.WEEKDAY_AFTERNOON_HOURS || "16:00-20:00";
    timeBlocks = [morningHours, afternoonHours];
  }

  const accessToken = await getAccessToken(env);

  const allTimes = timeBlocks.flatMap((block) => block.split("-"));
  const earliestStart = allTimes[0];
  const latestEnd = allTimes[allTimes.length - 1];

  const timeMin = toISO(dateStr, earliestStart, timeZone);
  const timeMax = toISO(dateStr, latestEnd, timeZone);

  // Fetch busy times from BOTH calendars to avoid double-bookings:
  //   GOOGLE_CALENDAR_ID = rcushmaniii@gmail.com (bookings created here)
  //   PERSONAL_CALENDAR_ID = shared work calendar (checked for conflicts only)
  const personalCalendar =
    env.PERSONAL_CALENDAR_ID || env.GOOGLE_CALENDAR_ID || env.CALENDAR_ID;
  const workCalendar = env.GOOGLE_CALENDAR_ID || env.CALENDAR_ID;

  const freeBusy = await fetchJSON(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: personalCalendar }, { id: workCalendar }],
      }),
    },
  );

  // Combine busy times from both calendars
  const personalBusy = freeBusy?.calendars?.[personalCalendar]?.busy || [];
  const workBusy = freeBusy?.calendars?.[workCalendar]?.busy || [];
  const allBusy = [...personalBusy, ...workBusy];

  const busy = allBusy.map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));

  const allSlots = [];
  for (const block of timeBlocks) {
    const [startTime, endTime] = block.split("-");
    const blockSlots = generateSlots(startTime, endTime, 30);
    allSlots.push(...blockSlots);
  }

  const nowUTC = new Date();
  const minBookingTime = new Date(nowUTC.getTime() + 210 * 60 * 1000);

  const availableSlots = allSlots.filter((time) => {
    const [h, m] = time.split(":").map(Number);
    const slotStart = new Date(`${dateStr}T${pad(h)}:${pad(m)}:00-06:00`);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

    if (slotStart < minBookingTime) return false;

    return !busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
  });

  return {
    slots: availableSlots,
    debug: {
      personalBusy,
      workBusy,
      allBusy,
      busyParsed: busy.map((b) => ({
        start: b.start.toISOString(),
        end: b.end.toISOString(),
      })),
    },
  };
}

function sanitizeInput(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .slice(0, 200)
    .replace(/[<>]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "");
}

async function createBooking(data, env, timeZone, lang) {
  const { name: rawName, email: rawEmail, date, time } = data || {};
  if (!rawName || !rawEmail || !date || !time)
    throw new Error(t(lang, "missing_fields"));

  const name = sanitizeInput(rawName);
  const email = sanitizeInput(rawEmail).toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error(lang === "es" ? "Email inválido" : "Invalid email");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(lang === "es" ? "Fecha inválida" : "Invalid date");
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(lang === "es" ? "Hora inválida" : "Invalid time");
  }

  const accessToken = await getAccessToken(env);

  const startDateTime = `${date}T${time}:00`;
  const [h, m] = time.split(":").map(Number);
  const endMinutes = h * 60 + m + 30;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  const endDateTime = `${date}T${endTime}:00`;

  // Optional label naming which front door produced the booking, e.g. the
  // Lumière Medspa demo bot. The meeting is a CushLabs AI strategy consultation
  // either way — this only records how the prospect arrived, so bookings from a
  // demo persona are distinguishable at a glance from cushlabs.ai/consultation
  // on a calendar that several booking systems write to. Omitted by default, so
  // the cushlabs.ai form's title is unchanged.
  const source = sanitizeInput(data.source || "");
  const sourceTag = source ? ` (${source})` : "";
  const summary =
    lang === "es"
      ? `Consulta de Estrategia de IA - CushLabs${sourceTag}: ${name}`
      : `AI Strategy Consultation - CushLabs${sourceTag}: ${name}`;

  const notes = sanitizeInput(data.notes || "");

  // The booking form has collected a phone number since it was written and
  // never sent it, and this Worker never read one — so every event on the
  // calendar carries an email address and no way to call the person back.
  // Both halves are fixed together; a field the front end sends and the Worker
  // drops looks identical from the outside to one that was never collected.
  const phone = sanitizeInput(data.phone || "");

  const description =
    lang === "es"
      ? `Consulta gratuita de estrategia de IA — CushLabs.ai\nNombre: ${name}\nEmail: ${email}${phone ? `\nTeléfono: ${phone}` : ""}${notes ? `\nNotas: ${notes}` : ""}`
      : `Free AI strategy consultation — CushLabs.ai\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}${notes ? `\nNotes: ${notes}` : ""}`;

  const calendarId = env.GOOGLE_CALENDAR_ID || env.CALENDAR_ID;
  const resp = await fetchJSON(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startDateTime, timeZone },
        end: { dateTime: endDateTime, timeZone },
        attendees: [{ email }],
        conferenceData: {
          createRequest: {
            requestId: `cushlabs-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "email", minutes: 60 },
          ],
        },
      }),
    },
  );

  const meetLink =
    resp.hangoutLink ||
    resp?.conferenceData?.entryPoints?.find((p) => p?.uri)?.uri ||
    null;

  return { eventId: resp.id, meetLink };
}

/* ------------------------ Google OAuth (with caching) ------------------------ */

async function getAccessToken(env) {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 300000) {
    return cachedToken;
  }

  const body = `client_id=${encodeURIComponent(env.GOOGLE_CLIENT_ID)}&client_secret=${encodeURIComponent(env.GOOGLE_CLIENT_SECRET)}&refresh_token=${encodeURIComponent(env.GOOGLE_REFRESH_TOKEN)}&grant_type=refresh_token`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error(`OAuth error: ${await res.text()}`);
  const tokenData = await res.json();
  if (!tokenData?.access_token)
    throw new Error("No access_token returned by Google");

  cachedToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600;
  tokenExpiresAt = now + expiresIn * 1000;

  return cachedToken;
}

/* ------------------------ Helpers ------------------------ */

function getLang(url, request) {
  const forced = url.searchParams.get("lang");
  if (forced) return forced.toLowerCase() === "es" ? "es" : "en";
  const header = request.headers.get("accept-language") || "";
  return header.toLowerCase().startsWith("es") ? "es" : "en";
}

function t(lang, key) {
  const dict = {
    book_success: {
      en: "Your consultation is confirmed.",
      es: "Tu consulta ha sido confirmada.",
    },
    missing_fields: {
      en: "Missing required fields: name, email, date, time",
      es: "Faltan campos obligatorios: nombre, email, fecha, hora",
    },
    rate_limited: {
      en: "Too many booking requests. Please try again later.",
      es: "Demasiadas solicitudes de reserva. Por favor, inténtalo más tarde.",
    },
    // Deliberately does not say WHICH check failed. A real visitor whose token
    // expired needs an action, not a diagnosis, and naming the failing gate
    // hands a probe a free oracle for tuning its next attempt.
    bot_rejected: {
      en: "We couldn't verify this request. Please reload the page and try again.",
      es: "No pudimos verificar esta solicitud. Recarga la página e inténtalo de nuevo.",
    },
  };
  return dict[key]?.[lang] || dict[key]?.en || key;
}

function toISO(dateStr, hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const date = new Date(`${dateStr}T${pad(h)}:${pad(m)}:00-06:00`);
  return date.toISOString();
}

function generateSlots(startHHMM, endHHMM, stepMin = 30) {
  const out = [];
  let [h, m] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    if (h === eh && m > em - stepMin) break;
    out.push(`${pad(h)}:${pad(m)}`);
    m += stepMin;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return out;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} → ${res.status} ${await res.text()}`);
  return await res.json();
}

async function safeJson(request) {
  const text = await request.text();
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/* ------------------------ CORS ------------------------ */

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";

  if (!env.ALLOWED_ORIGINS) {
    console.warn(
      "CORS WARNING: ALLOWED_ORIGINS not configured. Using wildcard (*). Set ALLOWED_ORIGINS env var for production.",
    );
  }

  const allowed = (env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Suffix patterns like *.vercel.app cover preview deploys. Same matcher the
  // POST /book origin gate uses, so the two can never drift into disagreeing
  // about which origins are ours.
  let allowOrigin = "";
  if (allowed.includes("*")) {
    allowOrigin = "*";
  } else if (matchOrigin(origin, allowed)) {
    allowOrigin = origin;
  }

  const base = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  return allowOrigin
    ? { ...base, "Access-Control-Allow-Origin": allowOrigin }
    : base;
}

function corsPreflight(request, env) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  });
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(request, env),
  });
}
