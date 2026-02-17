export const config = {
  runtime: "edge",
};

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale?: string;
}

function isValidPayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.message === "string" &&
    b.message.trim().length > 0
  );
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  if (!isValidPayload(body)) {
    return json(400, {
      ok: false,
      error: "Missing required fields: name, email, message",
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "info@cushlabs.ai";

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return json(500, { ok: false, error: "Server configuration error" });
  }

  const { name, email, phone, message, locale } = body;
  const isSpanish = locale === "es";

  // Send notification to Robert
  const notificationRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CushLabs Contact <noreply@cushlabs.ai>",
      to: [NOTIFICATION_EMAIL],
      reply_to: email,
      subject: `New contact from ${name} — CushLabs.ai`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone ? escapeHtml(phone) : "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Locale</td><td style="padding:8px;border-bottom:1px solid #eee;">${locale || "en"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;" colspan="2">Message</td></tr>
          <tr><td style="padding:8px;white-space:pre-wrap;" colspan="2">${escapeHtml(message)}</td></tr>
        </table>
      `,
    }),
  });

  if (!notificationRes.ok) {
    const err = await notificationRes.text();
    console.error("Resend error:", err);
    return json(500, { ok: false, error: "Failed to send message" });
  }

  // Send auto-reply to the visitor
  const autoReplySubject = isSpanish
    ? "Recibí tu mensaje — CushLabs.ai"
    : "Got your message — CushLabs.ai";

  const autoReplyHtml = isSpanish
    ? `<p>Hola ${escapeHtml(name)},</p>
       <p>Recibí tu mensaje y te responderé dentro de 24 horas — usualmente más rápido.</p>
       <p>Mientras tanto, puedes agendar una llamada gratis si prefieres hablar en vivo:</p>
       <p><a href="https://cushlabs.ai/es/reservar" style="color:#FF6A3D;">Agendar llamada gratis</a></p>
       <p>— Robert<br/>CushLabs.ai</p>`
    : `<p>Hey ${escapeHtml(name)},</p>
       <p>Got your message — I'll get back to you within 24 hours. Usually faster.</p>
       <p>In the meantime, you can book a free call if you'd rather talk live:</p>
       <p><a href="https://cushlabs.ai/consultation" style="color:#FF6A3D;">Book a free call</a></p>
       <p>— Robert<br/>CushLabs.ai</p>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Robert at CushLabs <noreply@cushlabs.ai>",
      to: [email],
      subject: autoReplySubject,
      html: autoReplyHtml,
    }),
  }).catch((err) => {
    console.error("Auto-reply failed (non-blocking):", err);
  });

  return json(200, { ok: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
