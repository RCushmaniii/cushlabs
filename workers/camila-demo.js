/**
 * Camila — Lumière Medspa Demo Chat Worker (CushLabs)
 *
 * A bilingual (EN default / es-MX) web chat assistant for the FICTITIOUS
 * "Lumière Medspa" demo, with REAL in-chat booking via Claude tool-use.
 *
 * Based on workers/demo-chat.js (structure/plumbing) but adds a Claude
 * tool-execution loop that calls the existing cushlabs-booking Worker.
 *
 * Endpoints:
 *   GET  /       → serves the self-contained chat UI
 *   POST /chat   → { messages, lang } → { response }
 *   OPTIONS *    → CORS preflight
 *
 * Required secret (set via `wrangler secret put`):
 *   ANTHROPIC_API_KEY
 *
 * Vars (set in wrangler-camila-demo.toml or the Cloudflare dashboard):
 *   BOOKING_API_URL   base URL of the cushlabs-booking Worker
 *   ALLOWED_ORIGINS   comma-separated allow list (supports *.suffix and
 *                     http://localhost:* wildcard port)
 *   SENTRY_DSN        (optional) publishable Sentry DSN for error capture
 *
 * Model: claude-haiku-4-5-20251001 (supports tool use).
 */

/* ─── Rate limiting ─── */

// Distributed, edge-enforced. The previous in-memory Map limiter did not work:
// it lived in a single V8 isolate, so it never bounded traffic across
// Cloudflare's isolates and left ANTHROPIC_API_KEY effectively unprotected.
// See workers/lib/rate-limit.js.
import { enforceRateLimit, rateLimitMessage } from "./lib/rate-limit.js";

/* ─── CORS ─── */

function getAllowedOrigins(env) {
  const raw =
    env.ALLOWED_ORIGINS ||
    "https://www.cushlabs.ai,https://cushlabs.ai,*.vercel.app,http://localhost:*";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowed) {
  if (!origin) return false;
  for (const pattern of allowed) {
    if (pattern === origin) return true;
    // Suffix wildcard: "*.vercel.app" → any https subdomain of vercel.app
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1); // ".vercel.app"
      if (origin.startsWith("https://") && origin.endsWith(suffix)) return true;
    }
    // localhost wildcard port: "http://localhost:*" → any port
    if (pattern.endsWith(":*")) {
      const prefix = pattern.slice(0, -1); // "http://localhost:"
      if (origin.startsWith(prefix)) return true;
    }
  }
  return false;
}

function getCORSHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = getAllowedOrigins(env);
  const ok = isOriginAllowed(origin, allowed);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/* ─── Date helper (America/Mexico_City) ─── */

function todayInMexicoCity() {
  // en-CA renders YYYY-MM-DD, matching the booking API's date format.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/* ─── System prompts (Camila persona) ─── */

function buildSystem(lang, today) {
  if (lang === "es") {
    return `Eres Camila, la cálida recepcionista y concierge de IA de Lumière Medspa, un spa médico de DEMOSTRACIÓN (negocio ficticio creado por CushLabs para mostrar lo que puede hacer un asistente de IA). Hoy es ${today} (zona horaria de Ciudad de México).

TU IDIOMA: Responde en español mexicano profesional. NUNCA uses marcadores ibéricos (nada de "vosotros", "vale", "coger", "móvil" como teléfono, "ordenador", "aparcar", "coche"). Usa "ustedes", "celular", "computadora", "carro", "agendar", "revisar", "correo electrónico". Si el usuario escribe en inglés, cambia al inglés.

TONO Y LONGITUD: Cálida, amable y profesional. Máximo ~80 palabras por respuesta. Texto plano, sin markdown ni emojis excesivos.

MENÚ DE SERVICIOS (de muestra): Botox/neuromodulador, depilación láser, peelings químicos, facial HydraGlow y microdermoabrasión. Puedes describirlos en términos generales.

CUMPLIMIENTO MÉDICO (CRÍTICO): Nunca des consejo médico, nunca diagnostiques y nunca prometas resultados. Para cualquier tema clínico (idoneidad, dosis, riesgos, resultados), di con calidez que un proveedor médico con licencia evaluará a la persona en persona durante la consulta.

¿ERES REAL?: Si preguntan si eres real o si el negocio existe, responde con alegría que es una demostración de CushLabs.

FLUJO DE RESERVA (agendar una consulta EN EL CHAT):
1. Cuando la persona quiera agendar, pregunta qué fecha prefiere.
2. Llama a la herramienta get_available_slots con esa fecha (formato YYYY-MM-DD).
3. Presenta los horarios devueltos de forma conversacional. NUNCA inventes un horario: solo ofrece los que devolvió la herramienta. Si no hay horarios, ofrece el día siguiente.
4. Pide su nombre completo y su correo electrónico.
5. Llama a create_booking con name, email, date, time (y notes si aplica).
6. Confirma con honestidad: en camino va un correo de confirmación real con un enlace de videollamada.`;
  }

  return `You are Camila, the warm AI front-desk concierge for Lumière Medspa — a DEMONSTRATION medical spa (a fictitious business created by CushLabs to show what an AI assistant can do). Today is ${today} (America/Mexico_City time zone).

YOUR LANGUAGE: Respond in English by default. If the user writes in Spanish, switch to Mexican Professional Spanish (never Iberian Spanish).

TONE & LENGTH: Warm, friendly, professional. Keep replies under ~80 words. Plain text — no markdown, no excessive emoji.

SAMPLE SERVICE MENU: Botox/neuromodulator, laser hair removal, chemical peels, the HydraGlow facial, and microdermabrasion. You may describe these in general terms.

MEDICAL COMPLIANCE (CRITICAL): Never give medical advice, never diagnose, and never promise results. For anything clinical (candidacy, dosing, risks, outcomes), warmly say that a licensed medical provider will assess the person in person at the consultation.

ARE YOU REAL?: If asked whether you're real or whether the business exists, cheerfully say it's a CushLabs demo.

BOOKING FLOW (book a consultation IN-CHAT):
1. When the person wants to book, ask which date they prefer.
2. Call the get_available_slots tool for that date (YYYY-MM-DD format).
3. Present the returned times conversationally. NEVER invent a time — only offer slots the tool returned. If there are no slots, offer the next day.
4. Collect their full name and email address.
5. Call create_booking with name, email, date, time (and notes if relevant).
6. Confirm honestly: a real confirmation email with a video-call link is on the way.`;
}

/* ─── Tool definitions ─── */

const TOOLS = [
  {
    name: "get_available_slots",
    description:
      "Get the available consultation time slots for a given date at Lumière Medspa. Returns a list of times as 'HH:MM' strings (America/Mexico_City). Sundays are closed and same-day slots require a lead buffer, so some dates may return no slots.",
    input_schema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date to check, in YYYY-MM-DD format.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "create_booking",
    description:
      "Book a consultation at Lumière Medspa. Only call this after the user has chosen one of the times returned by get_available_slots and has provided their name and email. Creates a real calendar event and triggers a confirmation email with a video-call link.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The customer's full name." },
        email: { type: "string", description: "The customer's email address." },
        date: { type: "string", description: "Chosen date, YYYY-MM-DD." },
        time: { type: "string", description: "Chosen time, HH:MM." },
        notes: {
          type: "string",
          description:
            "Optional notes about what the customer is interested in.",
        },
      },
      required: ["name", "email", "date", "time"],
    },
  },
];

/* ─── Tool execution (calls the cushlabs-booking Worker) ─── */

// Call the cushlabs-booking Worker. MUST prefer the Service Binding (env.BOOKING):
// a Worker cannot fetch another same-account Worker via its public workers.dev
// URL — Cloudflare returns error 1042. The binding routes worker-to-worker
// directly. Falls back to a plain fetch only for local dev without the binding.
function bookingFetch(env, pathAndQuery, init) {
  if (env.BOOKING && typeof env.BOOKING.fetch === "function") {
    return env.BOOKING.fetch(`https://booking${pathAndQuery}`, init);
  }
  return fetch(`${env.BOOKING_API_URL}${pathAndQuery}`, init);
}

async function execGetAvailableSlots(env, input, lang) {
  const date = String(input.date || "").trim();
  const res = await bookingFetch(
    env,
    `/slots/${encodeURIComponent(date)}?lang=${lang}`,
  );
  if (!res.ok) {
    throw new Error(`slots ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return { slots: Array.isArray(data.slots) ? data.slots : [] };
}

async function execCreateBooking(env, input, lang) {
  const res = await bookingFetch(env, `/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      date: input.date,
      time: input.time,
      lang,
      notes: input.notes || "",
    }),
  });
  if (!res.ok) {
    throw new Error(`book ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return { eventId: data.eventId, meetLink: data.meetLink };
}

async function runTool(env, name, input, lang) {
  if (name === "get_available_slots")
    return execGetAvailableSlots(env, input, lang);
  if (name === "create_booking") return execCreateBooking(env, input, lang);
  return { error: `unknown tool: ${name}` };
}

/* ─── Anthropic API call with tool-execution loop ─── */

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOOL_ITERATIONS = 4;

function extractText(data) {
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

async function anthropicRequest(system, messages, env) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system,
      tools: TOOLS,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function callClaude(messages, lang, env) {
  const system = buildSystem(lang, todayInMexicoCity());

  // Seed the working conversation from the client's plain-text history.
  const convo = messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? ""),
  }));

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const data = await anthropicRequest(system, convo, env);

    if (data.stop_reason !== "tool_use") {
      return extractText(data);
    }

    // Preserve the assistant's tool_use turn verbatim.
    convo.push({ role: "assistant", content: data.content });

    const toolResults = [];
    for (const block of data.content) {
      if (block.type !== "tool_use") continue;
      try {
        const result = await runTool(env, block.name, block.input || {}, lang);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        console.error(
          `[ALERT] camila-demo tool "${block.name}" failed:`,
          err.message,
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify({
            error:
              "The scheduler could not be reached just now. Ask the user to try again in a moment.",
          }),
          is_error: true,
        });
      }
    }

    convo.push({ role: "user", content: toolResults });
  }

  // Safety valve: too many tool rounds without a final answer.
  return lang === "es"
    ? "Disculpa, tuve un problema al completar eso. ¿Podrías intentarlo de nuevo en un momento?"
    : "Sorry, I ran into a problem finishing that. Could you try again in a moment?";
}

/* ─── Chat UI HTML ─── */

const CHAT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Camila · Lumière Medspa</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange: #FF6A3D;
    --orange-dim: rgba(255,106,61,0.12);
    --bg: #ffffff;
    --surface: #f5f5f5;
    --border: #e5e7eb;
    --text: #111111;
    --muted: #6b7280;
    --bot-bg: #f3f4f6;
    --user-bg: #FF6A3D;
    --user-text: #ffffff;
    --header-bg: #FF6A3D;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  .chat-wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
  }

  /* Header */
  .chat-header {
    background: var(--header-bg);
    color: #fff;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .chat-header-icon {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .chat-header-icon svg { width: 18px; height: 18px; }
  .chat-header-name { font-weight: 700; font-size: 15px; line-height: 1.2; display: flex; align-items: center; gap: 6px; }
  .demo-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: rgba(255,255,255,0.25);
    padding: 2px 6px;
    border-radius: 6px;
  }
  .chat-header-status { font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 5px; }
  .status-dot { width: 7px; height: 7px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }
  .lang-toggle {
    margin-left: auto;
    font-size: 11px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    padding: 4px 8px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
  }
  .lang-toggle:hover { background: rgba(255,255,255,0.3); }

  /* Messages */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .msg-row { display: flex; align-items: flex-end; gap: 8px; animation: msgIn 0.2s ease-out; }
  .msg-row.user { flex-direction: row-reverse; }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    background: var(--orange-dim);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--orange);
  }
  .msg-avatar svg { width: 14px; height: 14px; }
  .msg-row.user .msg-avatar { display: none; }

  .msg-bubble {
    max-width: 78%;
    padding: 9px 13px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .msg-row.bot .msg-bubble {
    background: var(--bot-bg);
    color: var(--text);
    border-bottom-left-radius: 4px;
  }
  .msg-row.user .msg-bubble {
    background: var(--user-bg);
    color: var(--user-text);
    border-bottom-right-radius: 4px;
  }

  /* Typing indicator */
  .typing-bubble {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 10px 14px;
    background: var(--bot-bg);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    width: fit-content;
  }
  .typing-dot {
    width: 7px;
    height: 7px;
    background: var(--muted);
    border-radius: 50%;
    animation: dotBounce 1.1s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }

  /* Quick replies */
  .quick-replies {
    padding: 0 14px 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .qr-chip {
    background: #fff;
    border: 1.5px solid var(--border);
    color: var(--text);
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    font-family: inherit;
  }
  .qr-chip:hover { border-color: var(--orange); color: var(--orange); }

  /* Input */
  .chat-input-row {
    padding: 10px 14px 14px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    border-top: 1px solid var(--border);
    background: var(--bg);
    flex-shrink: 0;
  }
  .chat-textarea {
    flex: 1;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 22px;
    padding: 10px 16px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    max-height: 120px;
    line-height: 1.5;
    color: var(--text);
    transition: border-color 0.15s;
  }
  .chat-textarea:focus { border-color: var(--orange); }
  .chat-textarea::placeholder { color: var(--muted); }
  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--orange);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }
  .send-btn:hover:not(:disabled) { opacity: 0.85; }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .send-btn svg { width: 16px; height: 16px; }
</style>
</head>
<body>
<div class="chat-wrap">

  <!-- Header -->
  <div class="chat-header">
    <div class="chat-header-icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
    </div>
    <div>
      <div class="chat-header-name">
        <span id="hdr-name">Camila · Lumière Medspa</span>
        <span class="demo-tag">Demo</span>
      </div>
      <div class="chat-header-status">
        <div class="status-dot"></div>
        <span id="hdr-status">Online</span>
      </div>
    </div>
    <button class="lang-toggle" id="lang-toggle" title="Switch language">ES</button>
  </div>

  <!-- Messages -->
  <div class="chat-messages" id="messages"></div>

  <!-- Quick replies (shown only before first user message) -->
  <div class="quick-replies" id="quick-replies"></div>

  <!-- Input -->
  <div class="chat-input-row">
    <textarea
      id="input"
      class="chat-textarea"
      rows="1"
      placeholder="Type a message..."
      autocomplete="off"
      spellcheck="false"
    ></textarea>
    <button class="send-btn" id="send-btn" disabled>
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      </svg>
    </button>
  </div>

</div>

<script>
(function() {
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') === 'es' ? 'es' : 'en';

  const strings = {
    en: {
      welcome: "Hi, I'm Camila, the front-desk concierge for Lumière Medspa — a friendly CushLabs demo.\\n\\nI can tell you about our services or book a consultation for you right here in the chat. What can I do for you?",
      placeholder: "Type a message...",
      status: "Online",
      toggleLabel: "ES",
      chips: [
        "What services do you offer?",
        "I'd like to book a consultation",
        "Cambiar a Español"
      ],
    },
    es: {
      welcome: "Hola, soy Camila, la concierge de recepción de Lumière Medspa — una demostración amable de CushLabs.\\n\\nPuedo contarte sobre nuestros servicios o agendar una consulta para ti aquí mismo en el chat. ¿En qué te puedo ayudar?",
      placeholder: "Escribe un mensaje...",
      status: "En línea",
      toggleLabel: "EN",
      chips: [
        "¿Qué servicios ofrecen?",
        "Quiero agendar una consulta",
        "Switch to English"
      ],
    }
  };

  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('send-btn');
  const quickRepliesEl = document.getElementById('quick-replies');
  const hdrStatus = document.getElementById('hdr-status');
  const langToggle = document.getElementById('lang-toggle');

  let conversation = [];

  function applyLang() {
    const s = strings[lang];
    inputEl.placeholder = s.placeholder;
    hdrStatus.textContent = s.status;
    langToggle.textContent = s.toggleLabel;
    renderChips(s.chips);
  }

  function renderChips(chips) {
    quickRepliesEl.innerHTML = '';
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'qr-chip';
      btn.textContent = chip;
      btn.addEventListener('click', () => {
        hideChips();
        sendMessage(chip);
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  function hideChips() {
    quickRepliesEl.style.display = 'none';
  }

  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = 'msg-row ' + role;

    if (role === 'bot') {
      const av = document.createElement('div');
      av.className = 'msg-avatar';
      av.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>';
      row.appendChild(av);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    scrollToBottom();
    return bubble;
  }

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    const av = document.createElement('div');
    av.className = 'msg-avatar';
    av.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>';
    row.appendChild(av);
    const bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    // Language-switch chips
    if (text.includes('Cambiar a Español')) {
      switchLang('es');
      return;
    }
    if (text.includes('Switch to English')) {
      switchLang('en');
      return;
    }

    hideChips();
    addMessage('user', text);
    conversation.push({ role: 'user', content: text });

    sendBtn.disabled = true;
    inputEl.disabled = true;
    const typingEl = addTyping();

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation, lang }),
      });

      typingEl.remove();

      if (!res.ok) {
        addMessage('bot', lang === 'es'
          ? 'Hubo un error al responder. Por favor, intenta de nuevo.'
          : 'Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();
      addMessage('bot', data.response);
      conversation.push({ role: 'assistant', content: data.response });
    } catch (err) {
      typingEl.remove();
      addMessage('bot', lang === 'es'
        ? 'Error de conexión. Por favor, intenta de nuevo.'
        : 'Connection error. Please try again.');
    } finally {
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  }

  function switchLang(next) {
    lang = next;
    conversation = [];
    messagesEl.innerHTML = '';
    quickRepliesEl.style.display = '';
    applyLang();
    showWelcome();
  }

  function showWelcome() {
    const s = strings[lang];
    applyLang();
    setTimeout(() => {
      const typingEl = addTyping();
      setTimeout(() => {
        typingEl.remove();
        addMessage('bot', s.welcome.replace(/\\\\n/g, '\\n'));
      }, 800);
    }, 300);
  }

  // Input handlers
  inputEl.addEventListener('input', () => {
    sendBtn.disabled = !inputEl.value.trim();
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (text) {
        inputEl.value = '';
        inputEl.style.height = 'auto';
        sendBtn.disabled = true;
        sendMessage(text);
      }
    }
  });
  sendBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (text) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;
      sendMessage(text);
    }
  });
  langToggle.addEventListener('click', () => {
    switchLang(lang === 'en' ? 'es' : 'en');
  });

  // Init
  applyLang();
  showWelcome();
})();
</script>
</body>
</html>`;

/* ─── Error reporting (dependency-free Sentry capture) ─── */

/**
 * Push an error to Sentry via its HTTP ingest endpoint. No-ops unless
 * env.SENTRY_DSN is set. The try/catch swallow is intentional: telemetry
 * must never break the user-facing response. Not a data pipeline — do not flag.
 */
async function reportToSentry(env, err, context) {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const m = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
    if (!m) return;
    const [, publicKey, host, projectId] = m;
    await fetch(
      `https://${host}/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "javascript",
          level: "error",
          logger: "cushlabs-camila-demo",
          message: `camila-demo: ${err.message}`,
          tags: { worker: "cushlabs-camila-demo" },
          extra: context,
        }),
      },
    );
  } catch {
    // Telemetry failure must not affect the response — intentionally ignored.
  }
}

/* ─── Handler ─── */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCORSHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Serve chat UI
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(CHAT_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Frame-Options": "ALLOWALL",
          "Cache-Control": "no-store",
        },
      });
    }

    // Chat API
    if (request.method === "POST" && url.pathname === "/chat") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";

      const rate = await enforceRateLimit(env, ip);
      if (!rate.allowed) {
        return new Response(
          JSON.stringify({ error: rateLimitMessage(rate.scope) }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
              ...corsHeaders,
            },
          },
        );
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { messages = [], lang = "en" } = body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages array required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }

      // Limit conversation history to the last 12 messages to control tokens.
      const trimmed = messages.slice(-12);
      const safeLang = lang === "es" ? "es" : "en";

      let response;
      try {
        response = await callClaude(trimmed, safeLang, env);
      } catch (err) {
        console.error("[ALERT] camila-demo request failed:", err.message);
        await reportToSentry(env, err, { lang: safeLang, ip });
        const errMsg =
          safeLang === "es"
            ? "No pude conectar con el asistente. Por favor, intenta de nuevo en un momento."
            : "I couldn't reach the assistant just now — try again in a moment.";
        return new Response(JSON.stringify({ error: errMsg }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ response }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
