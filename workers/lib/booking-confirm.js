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
      `INSERT INTO bookings (token, event_id, name, email, lang, starts_at, meet_link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      )
      .run();
    return token;
  } catch (err) {
    console.error(`recordBooking failed: ${err?.message || err}`);
    return null;
  }
}

/* ------------------------------ time and text ------------------------------ */

export function formatWhen(iso, lang, timeZone) {
  const d = new Date(iso);
  const locale = lang === "es" ? "es-MX" : "en-US";
  const when = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  const zone = lang === "es" ? "hora del centro de México" : "Mexico City time";
  return `${when} (${zone})`;
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
  const when = esc(formatWhen(row.starts_at, lang, tz));
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
  return { sent, failed, due: results.length };
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
  const when = esc(formatWhen(row.starts_at, lang, tz));
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
