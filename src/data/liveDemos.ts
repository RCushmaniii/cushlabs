/**
 * The demos a prospect can actually REACH — single source of truth.
 *
 * Created 2026-08-14. This copy previously lived inline in
 * `src/pages/messenger-assistant.astro` and its `es/` twin and existed nowhere
 * else, which is why `/demos/` — the page literally named "demos" — linked to
 * none of them. A prospect landing on `/demos/` saw a simulated phone thread
 * and had no route to the live assistants. Both pages now import from here, so
 * the two surfaces cannot drift the way price and trial copy has four times.
 *
 * CLAIMS BOUNDARY (docs/strategy/ADVERTISED-COMMITMENTS.md §4):
 *   - Everything here is List 1 — live in production, reachable right now.
 *   - The `questions` are the EXACT tappable ice breakers each bot shows in
 *     Messenger (English set; Facebook serves the Spanish set automatically to
 *     visitors whose Facebook is in Spanish). Keep in sync with
 *     cushlabs-messenger-bot/scripts/set-messenger-profile.ts.
 *   - WhatsApp and Instagram as CUSTOMER channels are List 2 and must never be
 *     added here. The WhatsApp owner ALERT is live but is not a demo you can
 *     click, so it belongs on the feature pages, not in this file.
 *
 * NOT IN THIS FILE, ON PURPOSE — the per-prospect demo microsites under
 * `demos/<company>/` (Azúcar, Lumière, La Tiendita). Those are token-gated by
 * `api/demo.ts` and return 404 without a valid secret or cookie. They are
 * private sales assets containing client-specific pricing, and linking them
 * from a public page would defeat the gate. Verified 2026-08-14: a gated URL
 * with no token returns HTTP 404.
 */

export type Locale = "en" | "es";

export interface LiveDemo {
  /** Which product surface this demo proves. */
  channel: "messenger" | "voice";
  badge: string;
  name: string;
  tagline: string;
  copy: string;
  /** Messenger ice breakers. Voice demos have none — you just call. */
  questions?: string[];
  href: string;
  cta: string;
}

/** The two production Facebook Messenger assistants. The demo IS production. */
export const messengerDemos: Record<Locale, LiveDemo[]> = {
  en: [
    {
      channel: "messenger",
      badge: "The product, selling itself",
      name: "CushLabs",
      tagline: "Software company — the page you're reading right now",
      copy: "The exact assistant this page describes, running on CushLabs' own Facebook page. It knows the services, handles pricing questions the honest way, and hands off to Robert when it should. Ask what it looks like in action and it replies with a visual.",
      questions: [
        "What services do you offer?",
        "What does it look like in action?",
        "How much does it cost?",
        "I have a salon — how can you help me?",
      ],
      href: "https://m.me/cushlabs",
      cta: "Message CushLabs",
    },
    {
      channel: "messenger",
      badge: "Live client deployment",
      name: "New York English",
      tagline: "Executive English coaching — my first production client",
      copy: "Answering real customers in English and Spanish since April. Ask about pricing, hours, or booking and watch it answer from the business's own data — the confidence question even comes back with a mini-lesson image.",
      questions: [
        "How do you help with confidence when speaking English?",
        "How much does a session cost?",
        "What are your hours?",
        "How do I book a free consultation?",
      ],
      href: "https://m.me/nyenglishteacher",
      cta: "Message New York English",
    },
  ],
  es: [
    {
      channel: "messenger",
      badge: "El producto, vendiéndose solo",
      name: "CushLabs",
      tagline: "Empresa de software — la página de la que estás leyendo",
      copy: "El mismo asistente que describe esta página, trabajando en la propia página de Facebook de CushLabs. Conoce los servicios, maneja las preguntas de precio con honestidad y pasa la conversación a Robert cuando debe hacerlo. Pregunta cómo se ve en acción y responde con un visual.",
      questions: [
        "¿Qué servicios ofrecen?",
        "¿Cómo se ve en acción?",
        "¿Cuánto cuesta?",
        "Tengo un salón — ¿cómo me pueden ayudar?",
      ],
      href: "https://m.me/cushlabs",
      cta: "Escribir a CushLabs",
    },
    {
      channel: "messenger",
      badge: "Cliente real en producción",
      name: "New York English",
      tagline: "Coaching de inglés ejecutivo — mi primer cliente en producción",
      copy: "Atiende clientes reales en español e inglés desde abril. Pregunta precios, horarios o cómo reservar y mira cómo responde con los datos del propio negocio — la pregunta de confianza incluso llega con una mini-lección en imagen.",
      questions: [
        "¿Cómo me ayudan con la confianza al hablar inglés?",
        "¿Cuánto cuesta una sesión?",
        "¿Cuál es el horario?",
        "¿Cómo agendo una consulta gratis?",
      ],
      href: "https://m.me/nyenglishteacher",
      cta: "Escribir a New York English",
    },
  ],
};

/**
 * The voice agent demo line. Copy mirrors the approved framing already live on
 * `/voice-agent/` ("Live demo agents you can talk to right now") — not rewritten.
 */
export const voiceDemo: Record<Locale, LiveDemo> = {
  en: {
    channel: "voice",
    badge: "Pick up the phone",
    name: "AI Voice Agent",
    tagline: "Inbound calls — answered, qualified, booked",
    copy: "Live demo agents you can talk to right now. Call one and ask it what you would ask a receptionist — hours, price, whether it can book you in.",
    href: "https://voice.cushlabs.ai",
    cta: "Try the demos at voice.cushlabs.ai",
  },
  es: {
    channel: "voice",
    badge: "Levanta el teléfono",
    name: "Agente de Voz con IA",
    tagline: "Llamadas entrantes — contestadas, calificadas y agendadas",
    copy: "Agentes demo en vivo que puedes llamar ahora mismo. Márcale y pregúntale lo que le preguntarías a una recepcionista — horarios, precio, si te puede agendar.",
    href: "https://voice.cushlabs.ai",
    cta: "Prueba los demos en voice.cushlabs.ai",
  },
};

/** Everything reachable, in the order a prospect should meet it. */
export const allLiveDemos = (locale: Locale): LiveDemo[] => [
  ...messengerDemos[locale],
  voiceDemo[locale],
];
