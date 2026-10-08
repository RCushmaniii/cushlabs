/**
 * Attendance confirmation for booked consultations.
 *
 * Why this exists: a booking created a Google Calendar invite and nothing else,
 * so the first sign someone was not coming was an empty Meet room (2026-09-29,
 * a NY English consultation no-show). This asks every booker, the day before,
 * to confirm or free the slot.
 *
 * Flow:
 *   POST /book succeeds     -> recordBooking() stores a row with a random token
 *   cron (every 30 min)     -> sendDueConfirmations() emails (via Brevo) anyone whose
 *                              meeting starts in 2-26h and has not been asked
 *   GET  /confirm?t=TOKEN   -> page with a "Yes, I'll be there" button
 *   POST /confirm           -> marks confirmed, prefixes the calendar title ✅
 *   GET  /cancel?t=TOKEN    -> page with a "Cancel this meeting" button
 *   POST /cancel            -> deletes the calendar event (frees the slot,
 *                              Google emails the attendee the cancellation)
 *
 * WhatsApp (optional, per booking): if the booker ticked the WhatsApp opt-in
 * and gave a phone, the same cron also sends the approved template
 * `consultation_reminder` through the cushlabs-whatsapp gateway. Its two URL
 * buttons open these same /confirm and /cancel pages (the token is the URL
 * suffix), so confirming works identically from email or WhatsApp.
 *
 * Morning summary: at 08:00 local, sendDailySummary() sends Robert one WhatsApp
 * (`consultation_daily_summary`) listing today's consultations with ✅/⏳/❌.
 *
 * Confirm and cancel are two-step (GET shows a button, POST acts) on purpose:
 * mail providers and corporate link scanners open every link in an email, and
 * a GET that acted would confirm — or cancel — meetings nobody clicked.
 *
 * Shared verbatim by cushlabs/workers/lib/ and ny-eng/lib/. Site differences
 * live in env vars only (see REQUIRED_VARS), so the two copies must not drift.
 */

const WINDOW_MIN_HOURS = 2; // too close to the meeting to be useful
const WINDOW_MAX_HOURS = 26; // "the day before", with slack for the 30-min cron

/** Env vars this module reads. Missing ones disable sending, loudly. */
export const REQUIRED_VARS = [
  "BREVO_API_KEY", // secret — a Brevo v3 API key (xkeysib-), NOT the SMTP key
  "CONFIRM_FROM_EMAIL", // e.g. NY English Teacher <robert@nyenglishteacher.com>
  "CONFIRM_BRAND", // e.g. NY English Teacher
  "PUBLIC_WORKER_URL", // this Worker's public base URL, for links in the email
  "REBOOK_URL", // booking page, for people who cancel (REBOOK_URL_ES optional)
];

/** WhatsApp is optional; these enable it (reminders and the morning summary). */
export const WHATSAPP_VARS = [
  "WA_GATEWAY_URL", // cushlabs-whatsapp base URL
  "WA_GATEWAY_SECRET", // secret — cushlabs-whatsapp TEST_SEND_SECRET
  "WA_SENDER", // "nye" or "cushlabs" — which WhatsApp number sends reminders
];

export function missingVars(env) {
  return REQUIRED_VARS.filter((k) => !env[k]);
}

export async function ensureBookingsTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS bookings (
        token TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        lang TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        meet_link TEXT,
        status TEXT NOT NULL DEFAULT 'booked',
        asked_at TEXT,
        confirmed_at TEXT,
        cancelled_at TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS bookings_due ON bookings (status, asked_at, starts_at)`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS daily_summaries (day TEXT PRIMARY KEY, count INTEGER NOT NULL, sent_at TEXT NOT NULL)`,
    )
    .run();
  // Columns added after the table first shipped (2026-09-29). ALTER has no
  // IF NOT EXISTS in SQLite, so read the column list and add what is missing.
  const { results: cols = [] } = await db.prepare(`PRAGMA table_info(bookings)`).all();
  const have = new Set(cols.map((c) => c.name));
  for (const [name, type] of [
    ["phone", "TEXT"],
    ["wa_opt_in", "INTEGER NOT NULL DEFAULT 0"],
    ["wa_sent_at", "TEXT"],
    // The booker's IANA time zone (from their browser), so their reminders show
    // their own clock. Null for rows from before 2026-10-02 and from forms that
    // don't send it — those fall back to the business time zone.
    ["booker_tz", "TEXT"],
    // What the booker said the call is about, as Robert reads it ("Premium
    // plan"), shown in the 08:00 summary. Added 2026-10-08; null when not given.
    ["topic", "TEXT"],
  ]) {
    if (!have.has(name)) await db.prepare(`ALTER TABLE bookings ADD COLUMN ${name} ${type}`).run();
  }
}

function newToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Store a booking so it can be confirmed later. Never throws: a failure here
 * must not turn a successful booking into an error for the person booking.
 */
export async function recordBooking(env, booking) {
  try {
    if (!env.DB || !booking?.eventId || !booking?.startsAt) return null;
    await ensureBookingsTable(env.DB);
    const token = newToken();
    await env.DB.prepare(
      `INSERT INTO bookings (token, event_id, name, email, lang, starts_at, meet_link, created_at, phone, wa_opt_in, booker_tz, topic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        token,
        booking.eventId,
        booking.name,
        booking.email,
        booking.lang === "es" ? "es" : "en",
        new Date(booking.startsAt).toISOString(),
        booking.meetLink || null,
        new Date().toISOString(),
        booking.phone || null,
        booking.phone && booking.whatsappOptIn ? 1 : 0,
        validTimeZone(booking.bookerTz),
        booking.topic || null,
      )
      .run();
    return token;
  } catch (err) {
    console.error(`recordBooking failed: ${err?.message || err}`);
    return null;
  }
}

/* ------------------------------ time and text ------------------------------ */

/** An IANA zone name the runtime recognises, or null. Never trust the browser's string blindly. */
export function validTimeZone(tz) {
  if (typeof tz !== "string" || !tz || tz.length > 64) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return null;
  }
}

/** Minutes from UTC of `timeZone` at instant `d` (DST-aware: it asks Intl, never a fixed table). */
function offsetAt(d, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(d.getTime() / 60000) * 60000) / 60000;
}

/**
 * The meeting time as the booker should read it. When the booker gave us a
 * time zone that differs from the business's at that moment, lead with their
 * clock and keep Mexico City alongside — a US booker reading only "Mexico City
 * time" has to do the arithmetic, and getting it wrong is a no-show.
 *
 * @param {string} iso
 * @param {string} lang
 * @param {string} timeZone
 * @param {string | null} [bookerTz]
 */
export function formatWhen(iso, lang, timeZone, bookerTz = null) {
  const d = new Date(iso);
  const locale = lang === "es" ? "es-MX" : "en-US";
  const zone = lang === "es" ? "hora del centro de México" : "Mexico City time";
  const full = (tz) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  const theirs = validTimeZone(bookerTz);
  if (!theirs || offsetAt(d, theirs) === offsetAt(d, timeZone)) return `${full(timeZone)} (${zone})`;
  const bizTime = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" }).format(d);
  return lang === "es"
    ? `${full(theirs)} (tu hora; ${bizTime} ${zone})`
    : `${full(theirs)} (your time; ${bizTime} ${zone})`;
}

const TEXT = {
  subject: {
    es: (brand) => `¿Confirmas tu consulta? – ${brand}`,
    en: (brand) => `Please confirm your consultation – ${brand}`,
  },
  hello: { es: (n) => `Hola ${n},`, en: (n) => `Hi ${n},` },
  reminder: {
    es: (when) =>
      `Te escribo para recordarte tu consulta gratuita: <strong>${when}</strong>.`,
    en: (when) =>
      `A quick reminder of your free consultation: <strong>${when}</strong>.`,
  },
  ask: {
    es: "¿Me confirmas que vas a asistir? Solo toma un clic.",
    en: "Can you confirm you'll be there? It takes one click.",
  },
  yes: { es: "Sí, ahí estaré", en: "Yes, I'll be there" },
  no: { es: "No puedo — cancelar o cambiar", en: "I can't make it — cancel or reschedule" },
  meet: { es: "Enlace de Google Meet:", en: "Google Meet link:" },
  sign: { es: "Saludos,", en: "Best," },
  confirmTitle: { es: "Confirma tu consulta", en: "Confirm your consultation" },
  confirmedTitle: { es: "¡Confirmado!", en: "Confirmed!" },
  confirmedBody: {
    es: "Gracias. Tu asistencia quedó confirmada. Nos vemos pronto.",
    en: "Thank you. Your attendance is confirmed. See you soon.",
  },
  cancelTitle: { es: "Cancelar tu consulta", en: "Cancel your consultation" },
  cancelButton: { es: "Sí, cancelar esta consulta", en: "Yes, cancel this meeting" },
  cancelledTitle: { es: "Consulta cancelada", en: "Meeting cancelled" },
  cancelledBody: {
    es: "Listo, tu consulta quedó cancelada. Si quieres elegir otro horario, puedes hacerlo aquí:",
    en: "Done — your meeting is cancelled. If you'd like to pick another time, you can book here:",
  },
  rebook: { es: "Elegir otro horario", en: "Pick another time" },
  alreadyCancelled: {
    es: "Esta consulta ya estaba cancelada.",
    en: "This meeting was already cancelled.",
  },
  past: {
    es: "Esta consulta ya pasó.",
    en: "This meeting has already taken place.",
  },
  notFound: {
    es: "No encontramos esta consulta. Revisa que el enlace esté completo.",
    en: "We couldn't find this meeting. Please check the link is complete.",
  },
};

const tx = (key, lang) => TEXT[key][lang === "es" ? "es" : "en"];

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function button(href, label, primary) {
  const bg = primary ? "#1d4ed8" : "#ffffff";
  const fg = primary ? "#ffffff" : "#1f2937";
  const border = primary ? "#1d4ed8" : "#d1d5db";
  return `<a href="${esc(href)}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 20px;background:${bg};color:${fg};border:1px solid ${border};border-radius:8px;text-decoration:none;font-weight:600">${esc(label)}</a>`;
}

export function buildConfirmationEmail(row, env) {
  const lang = row.lang;
  const tz = env.TIMEZONE || "America/Mexico_City";
  const when = esc(formatWhen(row.starts_at, lang, tz, row.booker_tz));
  const base = env.PUBLIC_WORKER_URL.replace(/\/+$/, "");
  const confirmUrl = `${base}/confirm?t=${row.token}`;
  const cancelUrl = `${base}/cancel?t=${row.token}`;
  const brand = env.CONFIRM_BRAND;
  const firstName = esc(String(row.name).trim().split(/\s+/)[0]);

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1f2937;max-width:560px">
<p>${tx("hello", lang)(firstName)}</p>
<p>${tx("reminder", lang)(when)}</p>
<p>${tx("ask", lang)}</p>
<p>${button(confirmUrl, tx("yes", lang), true)}${button(cancelUrl, tx("no", lang), false)}</p>
${row.meet_link ? `<p>${tx("meet", lang)} <a href="${esc(row.meet_link)}">${esc(row.meet_link)}</a></p>` : ""}
<p>${tx("sign", lang)}<br>Robert Cushman<br>${esc(brand)}</p>
</div>`;

  const text = [
    tx("hello", lang)(firstName),
    "",
    tx("reminder", lang)(when).replace(/<\/?strong>/g, ""),
    tx("ask", lang),
    "",
    `${tx("yes", lang)}: ${confirmUrl}`,
    `${tx("no", lang)}: ${cancelUrl}`,
    row.meet_link ? `\n${tx("meet", lang)} ${row.meet_link}` : "",
    "",
    tx("sign", lang),
    "Robert Cushman",
    brand,
  ].join("\n");

  return { subject: tx("subject", lang)(brand), html, text };
}

/* ---------------------------------- cron ---------------------------------- */

/** "Name <addr@x>" -> { name, email }; a bare address -> { email }. */
export function parseSender(from) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from || "");
  return m ? { name: m[1].replace(/^"|"$/g, ""), email: m[2] } : { email: String(from).trim() };
}

/**
 * Email everyone whose meeting starts in 2-26 hours and has not been asked.
 * `asked_at` is set only after Brevo accepts the message, so a failed send
 * retries on the next tick until the meeting is inside the 2-hour floor.
 */
export async function sendDueConfirmations(env, now = new Date()) {
  const missing = missingVars(env);
  if (missing.length) {
    console.warn(`Confirmation emails disabled — missing: ${missing.join(", ")}`);
    return { sent: 0, failed: 0, disabled: missing };
  }
  await ensureBookingsTable(env.DB);
  const from = new Date(now.getTime() + WINDOW_MIN_HOURS * 3600e3).toISOString();
  const to = new Date(now.getTime() + WINDOW_MAX_HOURS * 3600e3).toISOString();
  const { results = [] } = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE status = 'booked' AND asked_at IS NULL
       AND starts_at >= ? AND starts_at <= ?
     ORDER BY starts_at LIMIT 50`,
  )
    .bind(from, to)
    .all();

  let sent = 0;
  let failed = 0;
  for (const row of results) {
    // WhatsApp bookings may have no email (2026-10-05). Mark the email step done
    // instead of retrying a send Brevo will reject on every cron tick; the
    // WhatsApp reminder below is tracked separately (wa_sent_at).
    if (!row.email) {
      await env.DB.prepare(`UPDATE bookings SET asked_at = ? WHERE token = ?`)
        .bind(new Date().toISOString(), row.token)
        .run();
      continue;
    }
    const email = buildConfirmationEmail(row, env);
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: parseSender(env.CONFIRM_FROM_EMAIL),
        to: [{ email: row.email, name: row.name }],
        subject: email.subject,
        htmlContent: email.html,
        textContent: email.text,
        tags: ["booking-confirmation"],
      }),
    });
    if (resp.ok) {
      await env.DB.prepare(`UPDATE bookings SET asked_at = ? WHERE token = ?`)
        .bind(new Date().toISOString(), row.token)
        .run();
      sent++;
    } else {
      failed++;
      console.error(
        `Confirmation email failed for booking ${row.token.slice(0, 6)}: ${resp.status} ${await resp.text()}`,
      );
    }
  }
  const whatsapp = await sendDueWhatsApp(env, from, to);
  return { sent, failed, due: results.length, whatsapp };
}

/* -------------------------------- WhatsApp -------------------------------- */

function whatsappReady(env) {
  return WHATSAPP_VARS.every((k) => env[k]);
}

async function sendWhatsAppTemplate(env, body) {
  const url = `${env.WA_GATEWAY_URL.replace(/\/+$/, "")}/api/test-send-template`;
  const init = {
    method: "POST",
    headers: { "x-test-secret": env.WA_GATEWAY_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  // In production the call MUST go through the WA_GATEWAY service binding:
  // Cloudflare refuses a Worker's fetch() to another *.workers.dev Worker on
  // the same account (error 1042, first seen live 2026-09-29). The plain
  // fetch is only the fallback for tests and local runs.
  const resp = env.WA_GATEWAY ? await env.WA_GATEWAY.fetch(url, init) : await fetch(url, init);
  if (!resp.ok) {
    console.error(`WhatsApp send ${body.template} failed: ${resp.status} ${(await resp.text()).slice(0, 300)}`);
  }
  return resp.ok;
}

async function sendDueWhatsApp(env, fromIso, toIso) {
  if (!whatsappReady(env)) return { skipped: "not configured" };
  const { results = [] } = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE status = 'booked' AND wa_opt_in = 1 AND phone IS NOT NULL AND wa_sent_at IS NULL
       AND starts_at >= ? AND starts_at <= ?
     ORDER BY starts_at LIMIT 50`,
  )
    .bind(fromIso, toIso)
    .all();
  let sent = 0;
  let failed = 0;
  const tz = env.TIMEZONE || "America/Mexico_City";
  for (const row of results) {
    const ok = await sendWhatsAppTemplate(env, {
      to: row.phone,
      template: "consultation_reminder",
      lang: row.lang === "es" ? "es_MX" : "en_US",
      params: [String(row.name).trim().split(/\s+/)[0], formatWhen(row.starts_at, row.lang, tz, row.booker_tz)],
      buttonParams: [row.token, row.token],
      sender: env.WA_SENDER,
    });
    if (ok) {
      await env.DB.prepare(`UPDATE bookings SET wa_sent_at = ? WHERE token = ?`)
        .bind(new Date().toISOString(), row.token)
        .run();
      sent++;
    } else failed++;
  }
  return { sent, failed, due: results.length };
}

/* ----------------------------- morning summary ----------------------------- */

const SUMMARY_HOUR = 8;

function localParts(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

const STATUS_ICON = { confirmed: "✅", booked: "⏳", cancelled: "❌" };

/**
 * Once a day, at or after 08:00 local, send Robert today's consultations.
 * Nothing is sent on a day with no consultations; the day is still recorded so
 * the check does not repeat. Needs OPERATOR_WA plus the WhatsApp vars.
 */
/** This Worker's consultations on the local calendar day that `now` falls in. */
export async function todaysBookings(env, now = new Date()) {
  const tz = env.TIMEZONE || "America/Mexico_City";
  const { day } = localParts(now, tz);
  await ensureBookingsTable(env.DB);
  const lo = new Date(now.getTime() - 36 * 3600e3).toISOString();
  const hi = new Date(now.getTime() + 36 * 3600e3).toISOString();
  const { results = [] } = await env.DB.prepare(
    `SELECT name, starts_at, status, topic FROM bookings WHERE starts_at >= ? AND starts_at <= ? ORDER BY starts_at`,
  )
    .bind(lo, hi)
    .all();
  return results.filter((r) => localParts(new Date(r.starts_at), tz).day === day);
}

/**
 * The peer booking Worker's rows for today, over the PEER_BOOKING service
 * binding. Returns null when there is no peer, or it could not be read — the
 * summary then says so rather than silently leaving that site out.
 */
async function peerBookings(env, now) {
  if (!env.PEER_BOOKING || !env.SUMMARY_SECRET) return null;
  try {
    const at = encodeURIComponent(now.toISOString());
    const resp = await env.PEER_BOOKING.fetch(`https://peer/internal/todays-bookings?at=${at}`, {
      headers: { "x-summary-secret": env.SUMMARY_SECRET },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const { bookings } = await resp.json();
    return Array.isArray(bookings) ? bookings : null;
  } catch (err) {
    console.error(`Peer summary rows unavailable: ${err?.message || err}`);
    return null;
  }
}

/**
 * One WhatsApp to Robert at 08:00 covering BOTH sites. The Worker that owns the
 * summary (cushlabs-booking: DAILY_SUMMARY unset) reads its own rows plus the
 * peer's (ny-eng: DAILY_SUMMARY = "off", serves /internal/todays-bookings) and
 * labels each line with its site (SUMMARY_LABEL / PEER_LABEL).
 */
export async function sendDailySummary(env, now = new Date()) {
  if (env.DAILY_SUMMARY === "off") return { skipped: "sent by peer" };
  if (!whatsappReady(env) || !env.OPERATOR_WA) return { skipped: "not configured" };
  const tz = env.TIMEZONE || "America/Mexico_City";
  const { day, hour } = localParts(now, tz);
  if (hour < SUMMARY_HOUR) return { skipped: "too early" };
  await ensureBookingsTable(env.DB);
  const done = await env.DB.prepare(`SELECT day FROM daily_summaries WHERE day = ?`).bind(day).first();
  if (done) return { skipped: "already sent" };

  const own = (await todaysBookings(env, now)).map((r) => ({ ...r, label: env.SUMMARY_LABEL }));
  const peerRows = env.PEER_BOOKING ? await peerBookings(env, now) : [];
  const peer = (peerRows || []).map((r) => ({ ...r, label: env.PEER_LABEL }));
  const today = [...own, ...peer].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const peerMissing = env.PEER_BOOKING && peerRows === null;

  if (today.length || peerMissing) {
    // Robert splits his time between Mexico City and the US East Coast, so every
    // time is given on both clocks. OPERATOR_SECOND_TZ overrides the second one;
    // Intl handles US daylight saving, so the gap is 2 h in summer and 1 h in winter.
    const time = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
    const secondTz = validTimeZone(env.OPERATOR_SECOND_TZ || "America/New_York");
    const second = secondTz
      ? new Intl.DateTimeFormat("en-US", { timeZone: secondTz, hour: "numeric", minute: "2-digit", timeZoneName: "short" })
      : null;
    let list = today
      .map((r) => {
        const name = String(r.name).replace(/\s+/g, " ").trim();
        const about = [r.label, r.topic].filter(Boolean).join(" · ");
        const tag = about ? ` (${about})` : "";
        const at = new Date(r.starts_at);
        const clock = second ? `${time.format(at)} CDMX / ${second.format(at)}` : time.format(at);
        return `${clock} ${name}${tag} ${STATUS_ICON[r.status] || "⏳"}`;
      })
      .join(" · ");
    if (peerMissing) list = `${list ? list + " · " : ""}(${env.PEER_LABEL || "other site"} list unavailable)`;
    const sites = env.SUMMARY_SITES || env.CONFIRM_BRAND || "your site";
    const ok = await sendWhatsAppTemplate(env, {
      to: env.OPERATOR_WA,
      template: "consultation_daily_summary",
      lang: "en_US",
      params: [String(today.length), sites, list.slice(0, 900)],
      sender: "cushlabs",
    });
    if (!ok) return { sent: 0, failed: 1 };
  }
  await env.DB.prepare(`INSERT OR IGNORE INTO daily_summaries (day, count, sent_at) VALUES (?, ?, ?)`)
    .bind(day, today.length, new Date().toISOString())
    .run();
  return { sent: today.length ? 1 : 0, count: today.length };
}

/* --------------------------------- routes --------------------------------- */

function page(lang, title, bodyHtml) {
  return new Response(
    `<!doctype html><html lang="${lang === "es" ? "es" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<main style="max-width:480px;margin:48px auto;padding:32px 24px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);text-align:center">
<h1 style="font-size:22px;margin:0 0 16px">${esc(title)}</h1>${bodyHtml}</main></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

function formButton(action, token, label, primary) {
  const bg = primary ? "#1d4ed8" : "#b91c1c";
  return `<form method="POST" action="${action}"><input type="hidden" name="t" value="${esc(token)}"><button type="submit" style="padding:12px 24px;font-size:16px;font-weight:600;color:#fff;background:${bg};border:0;border-radius:8px;cursor:pointer">${esc(label)}</button></form>`;
}

async function readToken(request, url) {
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    return String(form?.get("t") || "");
  }
  return url.searchParams.get("t") || "";
}

/**
 * Handles /confirm and /cancel. Returns null for any other path so the host
 * Worker's own router carries on. `deps.getAccessToken(env)` and
 * `deps.calendarId` come from the host Worker, which already owns Google auth.
 */
export async function handleConfirmationRoutes(request, env, url, path, deps) {
  // Peer read for the combined morning summary. Secret-gated: it lists names.
  if (path === "/internal/todays-bookings" && request.method === "GET") {
    const provided = request.headers.get("x-summary-secret") || "";
    if (!env.SUMMARY_SECRET || provided !== env.SUMMARY_SECRET) {
      return new Response("Not found", { status: 404 });
    }
    // `at` lets the summary sender define "today", so both Workers agree on it.
    const at = new Date(url.searchParams.get("at") || Date.now());
    const bookings = await todaysBookings(env, isNaN(at.getTime()) ? new Date() : at);
    return new Response(JSON.stringify({ bookings }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  if (path !== "/confirm" && path !== "/cancel") return null;
  if (request.method !== "GET" && request.method !== "POST") return null;

  const token = await readToken(request, url);
  const fallbackLang = url.searchParams.get("lang") === "en" ? "en" : "es";
  if (!/^[0-9a-f]{32}$/.test(token)) {
    return page(fallbackLang, "—", `<p>${tx("notFound", fallbackLang)}</p>`);
  }

  await ensureBookingsTable(env.DB);
  const row = await env.DB.prepare(`SELECT * FROM bookings WHERE token = ?`)
    .bind(token)
    .first();
  if (!row) return page(fallbackLang, "—", `<p>${tx("notFound", fallbackLang)}</p>`);

  const lang = row.lang;
  const tz = env.TIMEZONE || "America/Mexico_City";
  const when = esc(formatWhen(row.starts_at, lang, tz, row.booker_tz));
  const rebookUrl = (lang === "es" && env.REBOOK_URL_ES) || env.REBOOK_URL;
  const rebook = rebookUrl
    ? `<p><a href="${esc(rebookUrl)}" style="color:#1d4ed8;font-weight:600">${tx("rebook", lang)}</a></p>`
    : "";

  if (row.status === "cancelled") {
    return page(lang, tx("cancelledTitle", lang), `<p>${tx("alreadyCancelled", lang)}</p>${rebook}`);
  }
  if (new Date(row.starts_at) < new Date()) {
    return page(lang, "—", `<p>${tx("past", lang)}</p>`);
  }

  const calBase = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(deps.calendarId)}/events/${encodeURIComponent(row.event_id)}`;

  if (path === "/confirm") {
    if (request.method === "GET" && row.status !== "confirmed") {
      return page(
        lang,
        tx("confirmTitle", lang),
        `<p>${when}</p>${formButton("/confirm", token, tx("yes", lang), true)}`,
      );
    }
    if (row.status !== "confirmed") {
      await env.DB.prepare(
        `UPDATE bookings SET status = 'confirmed', confirmed_at = ? WHERE token = ?`,
      )
        .bind(new Date().toISOString(), token)
        .run();
      // Mark the calendar entry so the confirmation is visible at a glance.
      // Best effort: the confirmation is already recorded above.
      try {
        const accessToken = await deps.getAccessToken(env);
        const ev = await fetch(calBase, { headers: { Authorization: `Bearer ${accessToken}` } }).then((r) => r.json());
        if (ev?.summary && !ev.summary.startsWith("✅")) {
          await fetch(`${calBase}?sendUpdates=none`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ summary: `✅ ${ev.summary}` }),
          });
        }
      } catch (err) {
        console.error(`Calendar title update failed: ${err?.message || err}`);
      }
    }
    return page(lang, tx("confirmedTitle", lang), `<p>${tx("confirmedBody", lang)}</p><p>${when}</p>`);
  }

  // /cancel
  if (request.method === "GET") {
    return page(
      lang,
      tx("cancelTitle", lang),
      `<p>${when}</p>${formButton("/cancel", token, tx("cancelButton", lang), false)}${rebook}`,
    );
  }
  const accessToken = await deps.getAccessToken(env);
  const del = await fetch(`${calBase}?sendUpdates=all`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // 410 Gone = already deleted on the calendar; treat as cancelled.
  if (!del.ok && del.status !== 410 && del.status !== 404) {
    console.error(`Calendar delete failed: ${del.status} ${await del.text()}`);
    return page(lang, tx("cancelTitle", lang), `<p>${tx("notFound", lang)}</p>`);
  }
  await env.DB.prepare(
    `UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE token = ?`,
  )
    .bind(new Date().toISOString(), token)
    .run();
  return page(lang, tx("cancelledTitle", lang), `<p>${tx("cancelledBody", lang)}</p>${rebook}`);
}
