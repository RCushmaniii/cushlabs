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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  // Placeholder intake endpoint.
  // In production you can forward this to:
  // - Email (Resend/Postmark)
  // - Slack
  // - Notion
  // - Google Calendar / CRM
  // Keep secrets server-side (Vercel env vars).

  return json(200, { ok: true, received: body });
}
