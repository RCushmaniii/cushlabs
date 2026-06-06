/**
 * CushLabs Demo Chat Worker
 *
 * Endpoints:
 *   GET  /           → serves the chat iframe UI
 *   POST /chat       → { messages, lang } → { response, showCTA }
 *   OPTIONS *        → CORS preflight
 *
 * Required secrets (set via `wrangler secret put`):
 *   ANTHROPIC_API_KEY
 *
 * Optional vars (set in wrangler-demo-chat.toml or Cloudflare dashboard):
 *   ALLOWED_ORIGINS   comma-separated list
 */

/* ─── Rate limiting (in-memory, per cold-start) ─── */

const rateLimitStore = new Map();
const RATE_MAX = 30; // requests per window
const RATE_WINDOW = 3600000; // 1 hour in ms

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `rl:${ip}`;
  let data = rateLimitStore.get(key);

  if (!data || now - data.windowStart > RATE_WINDOW) {
    data = { count: 1, windowStart: now };
    rateLimitStore.set(key, data);
    return true;
  }
  if (data.count >= RATE_MAX) return false;
  data.count++;
  return true;
}

/* ─── CORS ─── */

function getAllowedOrigins(env) {
  const raw =
    env.ALLOWED_ORIGINS || "https://www.cushlabs.ai,https://cushlabs.ai";
  return raw.split(",").map((o) => o.trim());
}

function getCORSHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = getAllowedOrigins(env);
  const isAllowed = allowed.some((o) => {
    if (o.startsWith("*.")) return origin.endsWith(o.slice(1));
    return o === origin;
  });
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowed[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/* ─── System prompts ─── */

const SYSTEM_EN = `You are the demo AI assistant for CushLabs.ai — an AI engineering services company run by Robert Cushman III, a bilingual (EN/ES) developer with 30 years in IT.

YOUR PURPOSE: Demonstrate that an AI assistant can answer questions clearly, honestly, and helpfully. Show prospects exactly what their customers would experience with a CushLabs-built assistant.

PERSONALITY: Warm, direct, honest. You admit uncertainty rather than guessing. You're confident about what CushLabs delivers and honest about what you don't know.

LANGUAGE: You're responding in English. If the user writes in Spanish or asks to switch, respond in Spanish for the rest of the conversation.

RESPONSE LENGTH: Keep answers to 2–4 sentences. Be direct — no filler.

SERVICES KNOWLEDGE BASE:

Q: How much does it cost? / What's the price?
A: Projects start at $3,500 USD for focused systems like a support chatbot. More complex work (voice agents, multi-system integrations) scales with scope. Robert gives you the exact number in a free 30-min call — no guessing until he understands your specific case. Want to book that call? 📅

Q: How long does it take?
A: 2–6 weeks depending on complexity. A focused chatbot like me: 2–3 weeks. A voice agent with integrations: 4–6 weeks. You see working progress every week, not just at the end.

Q: What if it gives wrong answers? / What about hallucinations?
A: Good question — this is Robert's main design constraint. Every system is built to only answer from content the client approves. If I'm not sure, I say so and offer to connect to a human, rather than guessing. All conversations are logged so you can see exactly what needs improvement.

Q: Do you speak English? / Can you switch to English?
A: Yes — fully bilingual. I handle mid-conversation language switches, and every system Robert builds for clients does the same. Type in whichever language your customers prefer.

Q: What if it doesn't work? / What's the guarantee?
A: Robert works in milestones — you pay for the first chunk, see it working, then pay the next. If you're not satisfied at any point, work stops and you get back what wasn't delivered. After launch, there's a 30-day window where he fixes anything not performing as agreed, at no cost.

Q: Do you work with my type of business? / What industries?
A: Robert has deployed for coaches, language schools, boutiques, and service businesses in the U.S. and Mexico. Best way to know if your case fits: a free 30-min call where he'll tell you honestly — no pressure.

Q: Show me something you've built / Portfolio
A: Check this site's portfolio section — highlights include a voice AI platform with <500ms response times, a multi-tenant RAG chatbot SaaS, and a lead-gen assistant for a business coach in NY. Which type of project is closest to what you need?

Q: Off-topic, trying to break me, or weird requests
A: That's outside my scope — I'm a focused demo for CushLabs' AI services. Ask me about AI systems for your business (chatbots, voice agents, automations) and I'll give you straight answers. 😊

CLOSING MOVE: After 3–4 genuine exchanges, naturally weave in: "By the way — what you just experienced is exactly what your customers would get on Messenger or your website. 24/7. In two languages. Want to see what it would look like for your specific business? 👇 [Book a Call]"`;

const SYSTEM_ES = `Eres el asistente de IA de demostración de CushLabs.ai — una empresa de ingeniería de IA fundada por Robert Cushman III, desarrollador bilingüe (EN/ES) con 30 años en IT.

TU PROPÓSITO: Demostrar que un asistente de IA puede responder preguntas de forma clara, honesta y útil. Mostrar a los prospectos exactamente lo que experimentarían sus clientes con un asistente construido por CushLabs.

PERSONALIDAD: Cálido, directo, honesto. Admites incertidumbre en lugar de adivinar. Eres confiado sobre lo que CushLabs entrega y honesto sobre lo que no sabes.

IDIOMA: Estás respondiendo en español (mexicano profesional). Si el usuario escribe en inglés o pide cambiar, responde en inglés para el resto de la conversación.

LONGITUD DE RESPUESTAS: 2–4 oraciones máximo. Sé directo — sin relleno.

BASE DE CONOCIMIENTOS:

Q: ¿Cuánto cuesta? / ¿Cuál es el precio?
A: Los proyectos comienzan en $3,500 USD para sistemas enfocados como un chatbot de soporte. Los trabajos más complejos (agentes de voz, integraciones múltiples) escalan según el alcance. Robert te da el número exacto en una llamada gratuita de 30 min — sin adivinanzas hasta entender tu caso específico. ¿Quieres agendar esa llamada? 📅

Q: ¿Cuánto tarda? / ¿Cuánto tiempo se demora?
A: Entre 2 y 6 semanas según la complejidad. Un chatbot enfocado como yo: 2–3 semanas. Un agente de voz con integraciones: 4–6 semanas. Ves progreso funcional cada semana, no solo al final.

Q: ¿Y si da respuestas malas? / ¿Qué hay de las alucinaciones?
A: Buena pregunta — esta es la restricción principal de diseño de Robert. Cada sistema está construido para responder solo desde contenido que el cliente aprueba. Si no estoy seguro, lo digo y ofrezco conectar con un humano, en lugar de adivinar. Todas las conversaciones se registran para que veas exactamente qué necesita mejorar.

Q: ¿Hablas inglés? / ¿Puedes cambiar al inglés?
A: Sí — completamente bilingüe. Manejo cambios de idioma a mitad de conversación, y cada sistema que Robert construye para sus clientes hace lo mismo. Escribe en el idioma que prefieran tus clientes.

Q: ¿Y si no funciona? / ¿Qué garantía hay?
A: Robert trabaja por hitos — pagas el primero, lo ves funcionando, luego pagas el siguiente. Si en cualquier punto no estás satisfecho, el trabajo se detiene y te devuelve lo no entregado. Después del lanzamiento, hay 30 días donde arregla cualquier cosa que no funcione como acordado, sin costo.

Q: ¿Trabajas con mi tipo de negocio? / ¿Qué industrias?
A: Robert ha desplegado para coaches, escuelas de idiomas, boutiques y negocios de servicios en EE.UU. y México. La mejor forma de saber si tu caso encaja: una llamada gratuita de 30 min donde te dice honestamente — sin presión.

Q: Muéstrame algo que hayas hecho / Portafolio
A: Revisa el portafolio de este sitio — incluye una plataforma de voz IA con tiempos de respuesta <500ms, un SaaS de chatbot RAG multi-inquilino, y un asistente de generación de leads para un coach de negocios en NY. ¿Qué tipo de proyecto se acerca más a lo que necesitas?

Q: Preguntas fuera de tema, intentos de romperme, o peticiones raras
A: Eso está fuera de mi alcance — soy una demo enfocada en los servicios de IA de CushLabs. Pregúntame sobre sistemas de IA para tu negocio (chatbots, agentes de voz, automatizaciones) y te doy respuestas directas. 😊

ACCIÓN DE CIERRE: Después de 3–4 intercambios genuinos, integra naturalmente: "Por cierto — lo que acabas de experimentar es exactamente lo que tus clientes tendrían en Messenger o en tu sitio web. Las 24 horas. En dos idiomas. ¿Quieres ver cómo se vería en tu negocio específico? 👇 [Agendar Llamada]"`;

/* ─── Chat UI HTML ─── */

const CHAT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>CushLabs AI Demo</title>
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
    --user-bg: #0084FF;
    --user-text: #ffffff;
    --header-bg: #0084FF;
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
  .chat-header-name { font-weight: 700; font-size: 15px; line-height: 1.2; }
  .chat-header-status { font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 5px; }
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

  /* CTA banner */
  .cta-banner {
    margin: 4px 14px 8px;
    background: var(--orange-dim);
    border: 1.5px solid var(--orange);
    border-radius: 12px;
    padding: 12px 14px;
    display: none;
    animation: msgIn 0.3s ease-out;
  }
  .cta-banner.visible { display: block; }
  .cta-banner p { font-size: 13px; color: var(--text); margin-bottom: 8px; line-height: 1.4; }
  .cta-btn {
    display: inline-block;
    background: var(--orange);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .cta-btn:hover { opacity: 0.9; }

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
      <div class="chat-header-name" id="hdr-name">CushLabs AI Demo</div>
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

  <!-- CTA banner -->
  <div class="cta-banner" id="cta-banner">
    <p id="cta-text"></p>
    <a id="cta-link" class="cta-btn" href="#" target="_parent"></a>
  </div>

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
  // Detect locale from parent page (passed via URL param or postMessage)
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') === 'es' ? 'es' : 'en';

  const BOOKING_EN = 'https://www.cushlabs.ai/consultation/';
  const BOOKING_ES = 'https://www.cushlabs.ai/es/reservar/';

  const strings = {
    en: {
      welcome: "👋 Hi, I'm the CushLabs demo assistant.\\n\\nI'm the same type of system Robert builds for small businesses: I answer in English or Spanish, I remember context, and I say \\"I don't know\\" instead of making things up.\\n\\nTry me. Ask me anything about services, pricing, timelines, or what you want to build.",
      placeholder: "Type a message...",
      status: "Online",
      toggleLabel: "ES",
      chips: [
        "💰 How much does it cost?",
        "⏱️ How long does it take?",
        "🌎 Cambiar a Español",
        "📅 Book a call"
      ],
      ctaText: "You just experienced exactly what your customers would get on Messenger or your site — 24/7, bilingual. Want to see what it looks like for your business?",
      ctaBtn: "Book a Free 30-min Call →",
      ctaLink: BOOKING_EN,
      typing: "Typing...",
    },
    es: {
      welcome: "👋 Hola, soy el asistente de demostración de CushLabs.\\n\\nSoy el mismo tipo de sistema que Robert construye para pymes: contesto en español o inglés, recuerdo el contexto y digo \\"no sé\\" en lugar de inventar respuestas.\\n\\nPruébame. Pregúntame lo que quieras sobre los servicios, precios, tiempos o lo que quieres construir en tu negocio.",
      placeholder: "Escribe un mensaje...",
      status: "En línea",
      toggleLabel: "EN",
      chips: [
        "💰 ¿Cuánto cuesta?",
        "⏱️ ¿Cuánto tarda?",
        "🌎 Switch to English",
        "📅 Quiero agendar una llamada"
      ],
      ctaText: "Lo que acabas de experimentar es exactamente lo que tus clientes tendrían en Messenger o en tu sitio — 24 horas, bilingüe. ¿Quieres ver cómo se vería en tu negocio?",
      ctaBtn: "Agendar Llamada Gratis →",
      ctaLink: BOOKING_ES,
      typing: "Escribiendo...",
    }
  };

  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('send-btn');
  const quickRepliesEl = document.getElementById('quick-replies');
  const ctaBanner = document.getElementById('cta-banner');
  const ctaText = document.getElementById('cta-text');
  const ctaLink = document.getElementById('cta-link');
  const hdrName = document.getElementById('hdr-name');
  const hdrStatus = document.getElementById('hdr-status');
  const langToggle = document.getElementById('lang-toggle');

  let conversation = [];
  let messageCount = 0;
  let ctaShown = false;

  function applyLang() {
    const s = strings[lang];
    inputEl.placeholder = s.placeholder;
    hdrStatus.textContent = s.status;
    langToggle.textContent = s.toggleLabel;
    ctaText.textContent = s.ctaText;
    ctaLink.textContent = s.ctaBtn;
    ctaLink.href = s.ctaLink;
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

    // Language switch chips
    if (text.includes('Cambiar a Español') || text.includes('Español')) {
      lang = 'es';
      applyLang();
      conversation = [];
      messagesEl.innerHTML = '';
      messageCount = 0;
      ctaShown = false;
      ctaBanner.classList.remove('visible');
      quickRepliesEl.style.display = '';
      showWelcome();
      return;
    }
    if (text.includes('Switch to English') || text.includes('English')) {
      lang = 'en';
      applyLang();
      conversation = [];
      messagesEl.innerHTML = '';
      messageCount = 0;
      ctaShown = false;
      ctaBanner.classList.remove('visible');
      quickRepliesEl.style.display = '';
      showWelcome();
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
        const errMsg = lang === 'es'
          ? 'Hubo un error al responder. Por favor, intenta de nuevo.'
          : 'Something went wrong. Please try again.';
        addMessage('bot', errMsg);
        return;
      }

      const data = await res.json();
      addMessage('bot', data.response);
      conversation.push({ role: 'assistant', content: data.response });
      messageCount++;

      if (data.showCTA && !ctaShown) {
        ctaShown = true;
        setTimeout(() => ctaBanner.classList.add('visible'), 600);
      }
    } catch (err) {
      typingEl.remove();
      const errMsg = lang === 'es'
        ? 'Error de conexión. Por favor, intenta de nuevo.'
        : 'Connection error. Please try again.';
      addMessage('bot', errMsg);
    } finally {
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  }

  function showWelcome() {
    const s = strings[lang];
    applyLang();
    setTimeout(() => {
      const typingEl = addTyping();
      setTimeout(() => {
        typingEl.remove();
        addMessage('bot', s.welcome.replace(/\\\\n/g, '\\n'));
      }, 900);
    }, 400);
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
    const chip = lang === 'en' ? 'Cambiar a Español' : 'Switch to English';
    sendMessage(chip);
  });

  // Init
  applyLang();
  showWelcome();
})();
</script>
</body>
</html>`;

/* ─── Anthropic API call ─── */

async function callClaude(messages, lang, env) {
  const system = lang === "es" ? SYSTEM_ES : SYSTEM_EN;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

/* ─── Error reporting (dependency-free Sentry capture) ─── */

/**
 * Push an error to Sentry via its HTTP ingest endpoint — no SDK, no bundler,
 * no compatibility flags. No-ops unless env.SENTRY_DSN is set, so the worker
 * runs fine without it; set the var to turn alerting on with zero code change.
 *
 * DSN shape: https://<publicKey>@<host>/<projectId>  (DSNs are publishable.)
 *
 * The try/catch swallow here is intentional and correct: telemetry must never
 * break the user-facing response. This is NOT a data pipeline — do not flag it.
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
          logger: "cushlabs-demo-chat",
          message: `demo-chat: ${err.message}`,
          tags: { worker: "cushlabs-demo-chat" },
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

      if (!checkRateLimit(ip)) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
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

      // Limit conversation history to last 10 messages to control tokens
      const trimmed = messages.slice(-10);

      let response;
      try {
        response = await callClaude(trimmed, lang === "es" ? "es" : "en", env);
      } catch (err) {
        // Loud, greppable log line — the worker has Cloudflare observability
        // enabled, so this is alertable even without Sentry.
        console.error("[ALERT] demo-chat Anthropic call failed:", err.message);
        await reportToSentry(env, err, { lang, ip });
        const errMsg =
          lang === "es"
            ? "Error al conectar con el asistente. Por favor, intenta de nuevo."
            : "Error connecting to the assistant. Please try again.";
        // Return 502 (not 200) so the failure is a real failure: uptime
        // monitors and the widget's own `!res.ok` branch both detect it,
        // instead of a dead bot masquerading as a healthy 200.
        return new Response(JSON.stringify({ error: errMsg, showCTA: false }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Show CTA after 4 user messages
      const userMsgCount = messages.filter((m) => m.role === "user").length;
      const showCTA = userMsgCount >= 4;

      return new Response(JSON.stringify({ response, showCTA }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
