import { ES_TITLE_BIOJALISCO_PITCH } from "./esCanonicalTitles";

export type ProjectDetailLocale = {
  headline: string;
  subheadline: string;
  overallVerdictTitle: string;
  overallVerdictBody: string;
  whatItDoesWellTitle: string;
  whatItDoesWell: string[];
  goodForTitle: string;
  goodFor: string[];
  notForTitle: string;
  notFor: string[];
  whatYouGetTitle: string;
  whatYouGet: string[];
  problemTitle?: string;
  problemBody?: string;
  resultsTitle?: string;
  results?: string[];
};

export type ProjectDetailOverride = {
  slug: string;
  // string for a single URL across locales, or { en, es } when the demo
  // destination is locale-specific (e.g. an on-site section anchor).
  demoUrl?: string | { en: string; es: string };
  thumbnail?: string;
  videoUrl?: string;
  videoPoster?: string;
  images?: { src: string; alt: { en: string; es: string } }[];
  en: ProjectDetailLocale;
  es: ProjectDetailLocale;
};

const details: Record<string, ProjectDetailOverride> = {
  "cushlabs-messenger": {
    slug: "cushlabs-messenger",
    // "Live demo" → the Messenger AI section of the services page (locale-aware).
    demoUrl: {
      en: "/services/#messenger-ai",
      es: "/es/services/#messenger-ai",
    },
    en: {
      headline:
        "CushLabs Messenger — The 24/7 Bilingual AI Assistant for Facebook Messenger",
      subheadline:
        "A custom AI assistant that answers your customers instantly in English or Spanish, built from your own website, FAQs, and pricing — so every Messenger inquiry gets a real answer, day or night, and no lead goes cold.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "CushLabs Messenger turns a business's Facebook inbox into a 24/7 sales assistant. It ingests the client's real content — website, FAQs, methodology, pricing — into a retrieval index, then answers incoming Messenger questions with Claude, grounded in that content so it never invents details. Language is detected on the first message and locked for the conversation, so Spanish-speaking and English-speaking customers each get a natural, native exchange with no manual switching. Simple pleasantries route to a fast, low-cost model while real questions get the stronger one, keeping responses quick and economical. When a conversation needs a person, the assistant hands the thread to the business and steps aside, then resumes automatically. The whole platform is multi-tenant from day one: a single Cloudflare Worker serves every client by Facebook Page ID, with no per-client deployments to manage.",
      whatItDoesWellTitle: "What it does well",
      whatItDoesWell: [
        "Answers in seconds, 24/7 — a prospect messaging at 11 PM gets a real reply, not a 'we'll get back to you'",
        "Grounded in the client's own content via RAG retrieval — accurate answers, no hallucinated pricing or policies",
        "Truly bilingual EN/ES with automatic language detection locked per conversation — no clunky toggles",
        "Cost-aware model routing — pleasantries to a fast model, real questions to the stronger one",
        "Graceful human handover with automatic resume — the business steps in only when a customer is ready to buy",
        "Multi-tenant by design — one Worker serves every client, routed by Page ID; new clients onboard without new infrastructure",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Local and service businesses whose Facebook page is a real sales and inquiry channel",
        "Bilingual markets — businesses serving customers who write in Spanish or English",
        "Owners losing leads after hours or while busy, who can't staff the inbox around the clock",
        "Businesses that want an assistant trained on their actual content, not a generic template bot",
      ],
      notForTitle: "Not a fit for",
      notFor: [
        "Businesses without an active Facebook Page or Messenger inquiry volume",
        "Use cases needing a fully autonomous bot with zero human-escalation path",
        "Companies that can't provide source content (site, FAQs, pricing) for the assistant to learn from",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "A custom AI Messenger assistant trained on your business's content, live on your Facebook Page",
        "Bilingual English/Spanish handling, with Mexican Professional Spanish for MX audiences",
        "Human handover to your Page inbox whenever you want to take over, with automatic resume",
        "A guided bilingual onboarding survey that captures your voice, boundaries, FAQs, and escalation rules",
        "Production-grade hosting on Cloudflare's edge with error monitoring and signature-verified webhooks",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Businesses on Facebook get a steady stream of Messenger questions — pricing, availability, hours, services — and in bilingual markets like Mexico they arrive in both Spanish and English. No owner can watch the inbox 24/7, generic auto-replies quietly lose the lead while the prospect keeps shopping, and off-the-shelf chatbots sound robotic and invent answers they can't stand behind. The business that replies first wins; the one that's asleep loses the conversation.",
      resultsTitle: "Results",
      results: [
        "Every inquiry gets an instant, on-brand answer — including nights, weekends, and busy hours",
        "Bilingual customers are met in their own language automatically, with no manual switching",
        "Answers stay accurate because they're pulled from the business's real content, not invented",
        "Owners reclaim hours of repetitive replying and step in only when a customer is ready to buy",
        "New clients launch on the same single Worker — the platform scales without new deployments",
      ],
    },
    es: {
      headline:
        "CushLabs Messenger — El asistente con IA bilingüe 24/7 para Facebook Messenger",
      subheadline:
        "Un asistente con IA personalizado que responde a tus clientes al instante en español o inglés, creado a partir de tu propio sitio web, tus preguntas frecuentes y tus precios — para que cada mensaje en Messenger reciba una respuesta real, de día o de noche, y ningún prospecto se enfríe.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "CushLabs Messenger convierte la bandeja de entrada de Facebook de un negocio en un asistente de ventas 24/7. Toma el contenido real del cliente — sitio web, preguntas frecuentes, metodología, precios — y lo indexa para recuperación; luego responde los mensajes de Messenger con Claude, apoyándose en ese contenido para nunca inventar datos. El idioma se detecta en el primer mensaje y se mantiene durante toda la conversación, así cada cliente — en español o en inglés — recibe un intercambio natural y nativo, sin cambios manuales. Los saludos sencillos se atienden con un modelo rápido y económico, mientras que las preguntas reales pasan al modelo más potente, manteniendo las respuestas ágiles y a bajo costo. Cuando una conversación necesita a una persona, el asistente le entrega la conversación al negocio y se hace a un lado, y luego retoma automáticamente. Toda la plataforma es multi-cliente desde el primer día: un solo Cloudflare Worker atiende a cada cliente por su ID de página de Facebook, sin despliegues por cliente que administrar.",
      whatItDoesWellTitle: "Lo que hace bien",
      whatItDoesWell: [
        "Responde en segundos, 24/7 — quien escribe a las 11 de la noche recibe una respuesta real, no un 'luego te contactamos'",
        "Se apoya en el contenido propio del cliente mediante recuperación (RAG) — respuestas precisas, sin precios ni políticas inventadas",
        "Verdaderamente bilingüe EN/ES con detección automática de idioma fija por conversación — sin cambios incómodos",
        "Enrutamiento de modelos según el costo — saludos a un modelo rápido, preguntas reales al más potente",
        "Transferencia a una persona con retorno automático — el negocio interviene solo cuando el cliente está listo para comprar",
        "Multi-cliente por diseño — un Worker atiende a todos los clientes, enrutados por ID de página; los nuevos clientes se integran sin nueva infraestructura",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Negocios locales y de servicios cuya página de Facebook es un canal real de ventas y consultas",
        "Mercados bilingües — negocios que atienden a clientes que escriben en español o en inglés",
        "Negocios que pierden prospectos fuera de horario o cuando hay mucho trabajo y no pueden atender la bandeja todo el tiempo",
        "Negocios que quieren un asistente entrenado con su contenido real, no un bot genérico de plantilla",
      ],
      notForTitle: "No es ideal para",
      notFor: [
        "Negocios sin una página de Facebook activa o sin volumen de consultas en Messenger",
        "Casos que requieren un bot totalmente autónomo, sin opción de escalar a una persona",
        "Empresas que no pueden aportar contenido fuente (sitio, preguntas frecuentes, precios) para que el asistente aprenda",
      ],
      whatYouGetTitle: "Lo que recibes",
      whatYouGet: [
        "Un asistente con IA para Messenger entrenado con el contenido de tu negocio, activo en tu página de Facebook",
        "Atención bilingüe español/inglés, con español profesional de México para el público mexicano",
        "Transferencia a la bandeja de tu página cuando quieras tomar el control, con retorno automático",
        "Una encuesta de incorporación bilingüe y guiada que captura tu voz, tus límites, tus preguntas frecuentes y tus reglas de escalamiento",
        "Hospedaje de nivel producción en la red de Cloudflare, con monitoreo de errores y webhooks verificados por firma",
      ],
      problemTitle: "El Reto",
      problemBody:
        "Los negocios en Facebook reciben un flujo constante de preguntas por Messenger — precios, disponibilidad, horarios, servicios — y en mercados bilingües como México llegan tanto en español como en inglés. Ningún negocio puede vigilar la bandeja 24/7, las respuestas automáticas genéricas pierden al prospecto en silencio mientras sigue buscando, y los chatbots de plantilla suenan robóticos e inventan respuestas que no pueden sostener. El negocio que responde primero gana; el que está dormido pierde la conversación.",
      resultsTitle: "Resultados",
      results: [
        "Cada consulta recibe una respuesta instantánea y acorde a la marca — incluso de noche, en fines de semana y en horas ocupadas",
        "A los clientes bilingües se les atiende en su propio idioma automáticamente, sin cambios manuales",
        "Las respuestas se mantienen precisas porque provienen del contenido real del negocio, no inventadas",
        "Los negocios recuperan horas de respuestas repetitivas e intervienen solo cuando un cliente está listo para comprar",
        "Los nuevos clientes arrancan sobre el mismo Worker — la plataforma escala sin nuevos despliegues",
      ],
    },
  },
  cushlabs: {
    slug: "cushlabs",
    demoUrl: "https://cushlabs.ai",
    thumbnail: "/images/portfolio/cushlabs-thumb.webp",
    videoUrl: "/images/portfolio/cushlabs-brief.mp4",
    videoPoster: "/images/portfolio/cushlabs-brief-poster.webp",
    images: [
      {
        src: "/images/portfolio/cushlabs-01.webp",
        alt: {
          en: "CushLabs AI Services — The Self-Maintaining Bilingual Portfolio",
          es: "CushLabs AI Services — El Portafolio Bilingüe Auto-Mantenido",
        },
      },
      {
        src: "/images/portfolio/cushlabs-02.webp",
        alt: {
          en: "Not Just a Website, But a System — bilingual, automated sync, serverless booking",
          es: "No Solo un Sitio Web, Sino un Sistema — bilingüe, sincronización automatizada, reservas serverless",
        },
      },
      {
        src: "/images/portfolio/cushlabs-03.webp",
        alt: {
          en: "Premium Design is About Behavior — zero-flash theming, time-based dark mode, micro-interactions",
          es: "El Diseño Premium es Sobre Comportamiento — temas sin flash, modo oscuro basado en hora, micro-interacciones",
        },
      },
      {
        src: "/images/portfolio/cushlabs-04.webp",
        alt: {
          en: "Engineering Visibility — the enterprise SEO stack with JSON-LD, hreflang, and lazy loading",
          es: "Visibilidad de Ingeniería — el stack SEO empresarial con JSON-LD, hreflang y carga lazy",
        },
      },
      {
        src: "/images/portfolio/cushlabs-05.webp",
        alt: {
          en: "True Bilingual Architecture — 24-line custom TypeScript i18n vs 40KB+ i18next",
          es: "Arquitectura Bilingüe Real — i18n TypeScript personalizado de 24 líneas vs i18next de 40KB+",
        },
      },
      {
        src: "/images/portfolio/cushlabs-06.webp",
        alt: {
          en: "The Serverless Booking Wizard — Cloudflare Worker to Google Calendar API, 3-step flow",
          es: "El Asistente de Reservas Serverless — Cloudflare Worker a Google Calendar API, flujo de 3 pasos",
        },
      },
      {
        src: "/images/portfolio/cushlabs-07.webp",
        alt: {
          en: "Localization Beyond Language — WhatsApp integration with locale-aware pre-filled messages",
          es: "Localización Más Allá del Idioma — integración WhatsApp con mensajes prellenados según el idioma",
        },
      },
      {
        src: "/images/portfolio/cushlabs-08.webp",
        alt: {
          en: "Security and Anti-Scraping — split-attribute email obfuscation",
          es: "Seguridad y Anti-Scraping — ofuscación de email por atributos divididos",
        },
      },
      {
        src: "/images/portfolio/cushlabs-09.webp",
        alt: {
          en: "Fluid Typography and Responsive Design — clamp()-based scaling across all viewports",
          es: "Tipografía Fluida y Diseño Responsivo — escalado con clamp() en todas las pantallas",
        },
      },
      {
        src: "/images/portfolio/cushlabs-10.webp",
        alt: {
          en: "Modern Services Page — scenario-based navigation with SVG icons and conversion-focused layout",
          es: "Página de Servicios Moderna — navegación por escenarios con íconos SVG y diseño orientado a conversión",
        },
      },
    ],
    en: {
      headline: "CushLabs.ai — The Self-Maintaining Bilingual Portfolio",
      subheadline:
        "A static marketing site that punches above its weight: automated GitHub portfolio sync, custom serverless booking wizard, 24-line i18n system, and enterprise SEO — all shipping as static HTML on Vercel.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "CushLabs.ai is not just a marketing site — it's a self-maintaining portfolio system. A GitHub Actions pipeline syncs all public repos weekly, extracting metadata, demo URLs from READMEs, and language breakdowns. Rich content overrides layer curated marketing copy on top of auto-synced data. A custom Cloudflare Worker queries Google Calendar's FreeBusy API for real-time booking availability. A 24-line TypeScript i18n system replaces i18next with zero runtime overhead. And a pre-deploy audit catches missing translations, leaked secrets, and broken builds before anything reaches production.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Automated GitHub-to-site portfolio pipeline via Actions + Octokit — zero manual data entry",
        "Custom 24-line TypeScript i18n with build-time tree-shaking — no i18next, no runtime bloat",
        "Serverless booking wizard: Cloudflare Worker + Google Calendar FreeBusy API + auto-generated Meet links",
        "Time-based dark mode default (7am–7pm Mexico City) with pre-paint script to prevent FOUC",
        "requestIdleCallback video preloading — zero bytes on initial page load, protects Core Web Vitals",
        "Pre-deploy audit: secret leak detection, i18n parity enforcement, build artifact verification",
        "Anti-scraper email obfuscation via split data attributes assembled only in client-side JS",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Consultancies needing a bilingual marketing site that stays current automatically",
        "Solo founders who want a portfolio that updates itself when they push code to GitHub",
        "Businesses serving LATAM markets that need WhatsApp as a first-class contact channel",
        "Anyone who wants a custom booking flow without embedding Calendly or Cal.com iframes",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Sites needing more than two languages (the i18n system is purpose-built for EN/ES)",
        "E-commerce or transactional sites requiring server-side rendering",
        "Teams needing a CMS for non-technical content editors",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Astro 4 static site with Tailwind CSS and full TypeScript type safety",
        "Automated portfolio sync via GitHub Actions (weekly + on-demand)",
        "Custom booking system: Cloudflare Worker + Google Calendar integration",
        "Enterprise SEO: hreflang, JSON-LD, Open Graph, Twitter Cards, auto-sitemap",
        "Pre-deploy audit script with 6 validation checks",
        "Premium design: SVG noise texture, gradient orbs, staggered animations, micro-interactions",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Building a bilingual marketing site for a consultancy serving the US and Mexico introduces compounding complexity: every page needs full content parity in two languages, the portfolio goes stale the moment you stop manually updating it, booking widgets from third parties break the design consistency, and SEO for bilingual sites is notoriously tricky with hreflang, canonical URLs, and sitemaps that must cover both languages correctly. Most solutions involve heavyweight i18n libraries, CMS platforms, and embedded third-party widgets — adding cost, complexity, and runtime overhead to what should be a fast static site.",
      resultsTitle: "Results",
      results: [
        "36 portfolio projects synced automatically from GitHub with zero manual maintenance",
        "Full bilingual parity enforced by automated pre-deploy audit — no translation drift",
        "Zero-runtime i18n: 24 lines of TypeScript vs ~40KB+ for i18next",
        "Booking flow creates Google Calendar events with Meet links — no third-party embed",
        "Static HTML output with zero server runtime cost on Vercel",
        "Pre-paint theme script eliminates flash-of-wrong-theme on every page load",
      ],
    },
    es: {
      headline: "CushLabs.ai — El Portafolio Bilingüe Auto-Mantenido",
      subheadline:
        "Un sitio de marketing estático que supera sus expectativas: sincronización automática de portafolio desde GitHub, asistente de reservas serverless personalizado, sistema i18n de 24 lineas y SEO empresarial — todo desplegado como HTML estático en Vercel.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "CushLabs.ai no es solo un sitio de marketing — es un sistema de portafolio auto-mantenido. Un pipeline de GitHub Actions sincroniza todos los repos públicos semanalmente, extrayendo metadatos, URLs de demo de los READMEs y desgloses de lenguajes. Las sobrecargas de contenido enriquecido agregan copy de marketing curado sobre los datos auto-sincronizados. Un Cloudflare Worker personalizado consulta la API FreeBusy de Google Calendar para disponibilidad de reservas en tiempo real. Un sistema i18n TypeScript de 24 lineas reemplaza i18next sin overhead en runtime. Y una auditoria pre-deploy detecta traducciones faltantes, secretos filtrados y builds rotos antes de que algo llegue a producción.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Pipeline automatizado GitHub-a-sitio vía Actions + Octokit — cero entrada manual de datos",
        "i18n TypeScript personalizado de 24 lineas con tree-shaking en build — sin i18next, sin bloat en runtime",
        "Asistente de reservas serverless: Cloudflare Worker + API FreeBusy de Google Calendar + links Meet auto-generados",
        "Modo oscuro por defecto basado en hora (7am–7pm Ciudad de México) con script pre-paint para prevenir FOUC",
        "Precarga de video con requestIdleCallback — cero bytes en carga inicial, protege Core Web Vitals",
        "Auditoría pre-deploy: detección de secretos filtrados, verificación de paridad i18n, validación de artefactos de build",
        "Ofuscación anti-scraper de email vía atributos de datos divididos ensamblados solo en JS del cliente",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Consultorías que necesitan un sitio de marketing bilingüe que se mantenga actualizado automáticamente",
        "Fundadores individuales que quieren un portafolio que se actualiza solo al pushear código a GitHub",
        "Negocios que sirven mercados LATAM y necesitan WhatsApp como canal de contacto de primera clase",
        "Cualquiera que quiera un flujo de reservas personalizado sin embeber iframes de Calendly o Cal.com",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Sitios que necesitan más de dos idiomas (el sistema i18n está construido para EN/ES)",
        "E-commerce o sitios transaccionales que requieren renderizado del lado del servidor",
        "Equipos que necesitan un CMS para editores de contenido no técnicos",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Sitio estático Astro 4 con Tailwind CSS y seguridad de tipos TypeScript completa",
        "Sincronización automática de portafolio vía GitHub Actions (semanal + bajo demanda)",
        "Sistema de reservas personalizado: Cloudflare Worker + integración Google Calendar",
        "SEO empresarial: hreflang, JSON-LD, Open Graph, Twitter Cards, sitemap automático",
        "Script de auditoria pre-deploy con 6 verificaciones de validación",
        "Diseño premium: textura SVG de ruido, orbes de gradiente, animaciones escalonadas, micro-interacciones",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Construir un sitio de marketing bilingüe para una consultoría que sirve a EE.UU. y México introduce complejidad acumulada: cada pagina necesita paridad completa de contenido en dos idiomas, el portafolio se vuelve obsoleto en el momento en que dejas de actualizarlo manualmente, los widgets de reservas de terceros rompen la consistencia del diseño, y el SEO para sitios bilingües es notoriamente complicado con hreflang, URLs canónicas y sitemaps que deben cubrir ambos idiomas correctamente. La mayoría de las soluciones involucran bibliotecas i18n pesadas, plataformas CMS y widgets de terceros embebidos — agregando costo, complejidad y overhead en runtime a lo que debería ser un sitio estático rápido.",
      resultsTitle: "Resultados",
      results: [
        "36 proyectos de portafolio sincronizados automáticamente desde GitHub sin mantenimiento manual",
        "Paridad bilingüe completa aplicada por auditoria pre-deploy automatizada — sin drift de traducciones",
        "i18n sin runtime: 24 lineas de TypeScript vs ~40KB+ para i18next",
        "Flujo de reservas crea eventos de Google Calendar con links Meet — sin embed de terceros",
        "Salida HTML estática con cero costo de runtime de servidor en Vercel",
        "Script de tema pre-paint elimina flash de tema incorrecto en cada carga de pagina",
      ],
    },
  },
  "mazebreak-wiki": {
    slug: "mazebreak-wiki",
    demoUrl: "https://mazebreak-wiki.vercel.app",
    en: {
      headline: "MazeBreak GDD Wiki",
      subheadline:
        "Private, searchable game design document wiki for a Roblox development team — 24 chapters, full-text fuzzy search, keyboard navigation, and Clerk authentication.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "The MazeBreak GDD Wiki addresses each friction point with targeted design decisions: Ctrl+K opens a command-palette-style search modal with Fuse.js fuzzy matching. 24 chapters are organized into 7 logical groups with collapsible sidebar, previous/next navigation, and right-sidebar table of contents with scroll tracking. Content updates deploy in 60 seconds via Git push. Clerk authentication restricts access to provisioned users at zero cost. Dark mode UI inspired by Linear, Raycast, and Stripe Docs with JetBrains Mono headings, syntax-highlighted Luau code blocks, and properly styled stat tables.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "React 19 + Vite 7 with hot module replacement and modern React features",
        "Client-side search via Fuse.js — no server required, sub-50ms response, works offline after initial load",
        "Vite glob imports: all .md files imported at build time via import.meta.glob, eliminating runtime file fetching",
        "Custom markdown pipeline: react-markdown with remark-gfm for tables, rehype-highlight for code blocks, and custom component overrides for callout detection",
        "Responsive three-column layout: sidebar + content + table of contents, collapsing gracefully to single-column on mobile",
        "SPA with Vercel rewrites so React Router handles all paths — direct links and browser refresh work correctly",
        "357 KB gzipped bundle — entire application including all 24 chapters ships under 500 KB",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Game development teams needing fast, searchable access to design documentation",
        "Teams that want Git-based content management without a CMS",
        "Projects requiring restricted access with zero-cost authentication",
        "Developer-first documentation with keyboard shortcuts and dark mode",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Public-facing documentation sites (this is private/authenticated)",
        "Collaborative real-time editing (it's read-only, updated via Git)",
        "Non-technical teams who can't use markdown and Git workflows",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "React 19 + Vite 7 single-page application with client-side search",
        "Clerk authentication with Google sign-in (free tier)",
        "Custom markdown rendering pipeline with syntax highlighting and callout detection",
        "Responsive three-column layout: sidebar + content + table of contents",
        "Vercel deployment with automated builds and SPA routing",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Game development teams working from traditional design documents face compounding friction: a 30+ page Word document requires scrolling and Ctrl+F to find anything, breaking flow during active development. Related systems (e.g., enemy damage and loot tables) live in separate sections with no linking. Word's find function matches exact text only — no fuzzy matching, no relevance ranking, no snippet previews. Sharing a Google Doc offers limited access control over sensitive design decisions. And developers working in Roblox Studio need to alt-tab to a separate application and manually locate the relevant section. Without a purpose-built reference tool, design documents become write-once artifacts the team avoids consulting.",
      resultsTitle: "Results",
      results: [
        "Eliminated time spent scrolling through the Word document during development sessions",
        "Design rules and stat tables are accessible in 2-3 keystrokes from any browser",
        "Content stays current with the same Git workflow used for game code",
        "Both team members have authenticated access without sharing credentials or links",
        "Full-stack web application architecture demonstrating auth integration, client-side search, custom rendering pipeline, and production deployment",
        "357 KB gzipped bundle serving the entire GDD as a single-page application",
      ],
    },
    es: {
      headline: "MazeBreak GDD Wiki",
      subheadline:
        "Wiki privado y buscable del documento de diseño de juego para un equipo de desarrollo en Roblox — 24 capítulos, búsqueda fuzzy, navegación por teclado y autenticación con Clerk.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "El MazeBreak GDD Wiki aborda cada punto de fricción con decisiones de diseño específicas: Ctrl+K abre un modal de búsqueda tipo command-palette con coincidencia fuzzy de Fuse.js. 24 capítulos organizados en 7 grupos lógicos con sidebar colapsable, navegación anterior/siguiente, y tabla de contenidos con seguimiento de scroll. Las actualizaciones de contenido se despliegan en 60 segundos vía Git push. La autenticación Clerk restringe el acceso a usuarios aprovisionados sin costo. Interfaz en modo oscuro inspirada en Linear, Raycast y Stripe Docs con tipografía JetBrains Mono, bloques de código Luau con resaltado de sintaxis, y tablas de estadísticas con estilo apropiado.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "React 19 + Vite 7 con reemplazo de módulos en caliente y características modernas de React",
        "Búsqueda del lado del cliente vía Fuse.js — sin servidor, respuesta sub-50ms, funciona offline después de la carga inicial",
        "Importaciones glob de Vite: todos los archivos .md importados en tiempo de build vía import.meta.glob, eliminando fetching de archivos en runtime",
        "Pipeline de markdown personalizado: react-markdown con remark-gfm para tablas, rehype-highlight para bloques de código, y overrides de componentes para detección de callouts",
        "Layout responsivo de tres columnas: sidebar + contenido + tabla de contenidos, colapsando a una sola columna en móvil",
        "SPA con rewrites de Vercel para que React Router maneje todas las rutas — links directos y refresh del navegador funcionan correctamente",
        "Bundle de 357 KB gzipped — toda la aplicación incluyendo los 24 capítulos pesa menos de 500 KB",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Equipos de desarrollo de juegos que necesitan acceso rápido y buscable a documentación de diseño",
        "Equipos que quieren gestión de contenido basada en Git sin un CMS",
        "Proyectos que requieren acceso restringido con autenticación de costo cero",
        "Documentación developer-first con atajos de teclado y modo oscuro",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Sitios de documentación públicos (este es privado/autenticado)",
        "Edición colaborativa en tiempo real (es solo lectura, se actualiza vía Git)",
        "Equipos no técnicos que no manejan markdown ni flujos de Git",
      ],
      whatYouGetTitle: "Qué obtienes",
      whatYouGet: [
        "Aplicación React 19 + Vite 7 de una sola página con búsqueda del lado del cliente",
        "Autenticación Clerk con Google sign-in (plan gratuito)",
        "Pipeline de renderizado markdown personalizado con resaltado de sintaxis y detección de callouts",
        "Layout responsivo de tres columnas: sidebar + contenido + tabla de contenidos",
        "Despliegue en Vercel con builds automatizados y enrutamiento SPA",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los equipos de desarrollo de juegos que trabajan con documentos de diseño tradicionales enfrentan fricción acumulada: un documento Word de más de 30 páginas requiere scroll y Ctrl+F para encontrar cualquier cosa, rompiendo el flujo durante el desarrollo activo. Sistemas relacionados (ej. daño de enemigos y tablas de loot) viven en secciones separadas sin vinculación. La búsqueda de Word solo encuentra texto exacto — sin coincidencia fuzzy, sin ranking de relevancia, sin previews de fragmentos. Los desarrolladores trabajando en Roblox Studio necesitan alt-tab a una aplicación separada y localizar manualmente la sección relevante. Sin una herramienta de referencia construida a propósito, los documentos de diseño se convierten en artefactos que se escriben una vez y el equipo evita consultar.",
      resultsTitle: "Resultados",
      results: [
        "Eliminó el tiempo perdido desplazándose por el documento Word durante sesiones de desarrollo",
        "Reglas de diseño y tablas de estadísticas accesibles en 2-3 teclas desde cualquier navegador",
        "El contenido se mantiene actualizado con el mismo flujo Git usado para el código del juego",
        "Ambos miembros del equipo tienen acceso autenticado sin compartir credenciales ni links",
        "Arquitectura de aplicación web full-stack demostrando integración de auth, búsqueda del lado del cliente, pipeline de renderizado personalizado y despliegue a producción",
        "Bundle de 357 KB gzipped sirviendo todo el GDD como aplicación de una sola página",
      ],
    },
  },
  "mazebreak-trello": {
    slug: "mazebreak-trello",
    demoUrl: "https://mazebreak-trello.vercel.app",
    en: {
      headline: "MazeBreak Trello Board Automation",
      subheadline:
        "Idempotent sprint board provisioning via Trello REST API for Roblox game development — one command creates 8 workflow lists, labeled cards with dependency chains, and instruction cards.",
      overallVerdictTitle: "Overview",
      overallVerdictBody:
        "The MazeBreak Trello Board Automation replaces manual board setup with a single-command provisioning script. It creates fully configured sprint boards with 8 workflow lists, 8 labels, 10 Sprint 0 cards with dependency chains, checklists on every card, and 4 instruction cards — all idempotent so it can be re-run safely without creating duplicates.",
      whatItDoesWellTitle: "Technical highlights",
      whatItDoesWell: [
        "10 Sprint 0 cards created in one command with dependency-encoded titles",
        "Checklists on every card for consistent task breakdown",
        "8 workflow lists from Backlog through Done with clear progression",
        "Idempotent design — safe to re-run without creating duplicates",
        "4 instruction cards that reduce onboarding friction for new team members",
        "Marketing landing page with animated terminal demo, interactive board hotspots, and full SEO",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Game development teams using Trello for sprint management",
        "Teams that need repeatable, consistent board setup across projects",
        "Organizations wanting to encode project management best practices into automation",
        "Demonstrating API integration and idempotent script design",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Teams not using Trello (the automation is Trello-specific)",
        "Complex multi-board or cross-team workflow orchestration",
        "Real-time board monitoring or Power-Up UI extensions",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Node.js provisioning script that creates a complete sprint board via Trello REST API",
        "Marketing landing page with animated terminal demo and interactive board hotspots",
        "Documentation site explaining setup and usage",
        "Vercel deployment with proper routing configuration",
        "Full SEO implementation (JSON-LD, Open Graph, Twitter Cards)",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Setting up a sprint board manually in Trello is slow, error-prone, and not repeatable. Cards lack consistent structure — some have checklists, some don't. Dependencies between cards exist only in people's heads. When a board needs to be rebuilt for a new sprint, all that structure has to be recreated from scratch.",
      resultsTitle: "Results",
      results: [
        "Sprint 0 board goes from zero to fully provisioned in under 30 seconds",
        "Every card has the same quality structure — no card is a second-class citizen",
        "Dependencies are visible and encoded, not tribal knowledge",
        "Developer notes surface architecture pitfalls at the point of work",
        "Board can be torn down and rebuilt identically at any time",
      ],
    },
    es: {
      headline: "MazeBreak Trello Board Automation",
      subheadline:
        "Aprovisionamiento idempotente de tableros sprint vía Trello REST API para desarrollo de juegos en Roblox — un comando crea 8 listas de flujo, tarjetas con cadenas de dependencias y tarjetas de instrucción.",
      overallVerdictTitle: "Resumen",
      overallVerdictBody:
        "MazeBreak Trello Board Automation reemplaza la configuración manual de tableros con un script de un solo comando. Crea tableros sprint completamente configurados con 8 listas de flujo, 8 etiquetas, 10 tarjetas de Sprint 0 con cadenas de dependencias, checklists en cada tarjeta y 4 tarjetas de instrucción — todo idempotente para que pueda ejecutarse de nuevo sin crear duplicados.",
      whatItDoesWellTitle: "Destacados técnicos",
      whatItDoesWell: [
        "10 tarjetas de Sprint 0 creadas en un comando con títulos que codifican dependencias",
        "Checklists en cada tarjeta para desglose consistente de tareas",
        "8 listas de flujo desde Backlog hasta Done con progresión clara",
        "Diseño idempotente — seguro de re-ejecutar sin crear duplicados",
        "4 tarjetas de instrucción que reducen la fricción de onboarding",
        "Landing page de marketing con demo animada de terminal, hotspots interactivos del tablero y SEO completo",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Equipos de desarrollo de juegos usando Trello para gestión de sprints",
        "Equipos que necesitan configuración repetible y consistente de tableros",
        "Organizaciones que quieren codificar mejores prácticas de gestión de proyectos en automatización",
        "Demostrar integración de APIs y diseño de scripts idempotentes",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Equipos que no usan Trello (la automatización es específica para Trello)",
        "Orquestación compleja de flujos multi-tablero o entre equipos",
        "Monitoreo en tiempo real de tableros o extensiones de interfaz Power-Up",
      ],
      whatYouGetTitle: "Qué obtienes",
      whatYouGet: [
        "Script Node.js que crea un tablero sprint completo vía Trello REST API",
        "Landing page de marketing con demo animada de terminal y hotspots interactivos",
        "Sitio de documentación explicando configuración y uso",
        "Despliegue en Vercel con configuración de enrutamiento apropiada",
        "Implementación SEO completa (JSON-LD, Open Graph, Twitter Cards)",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Configurar un tablero sprint manualmente en Trello es lento, propenso a errores y no es repetible. Las tarjetas carecen de estructura consistente — algunas tienen checklists, otras no. Las dependencias entre tarjetas existen solo en la cabeza de las personas. Cuando un tablero necesita reconstruirse para un nuevo sprint, toda esa estructura se tiene que recrear desde cero.",
      resultsTitle: "Resultados",
      results: [
        "El tablero de Sprint 0 pasa de cero a completamente configurado en menos de 30 segundos",
        "Cada tarjeta tiene la misma estructura de calidad — ninguna tarjeta es ciudadana de segunda clase",
        "Las dependencias son visibles y codificadas, no conocimiento tribal",
        "Las notas de desarrollo muestran trampas de arquitectura en el punto de trabajo",
        "El tablero se puede destruir y reconstruir idénticamente en cualquier momento",
      ],
    },
  },
  "ny-eng": {
    slug: "ny-eng",
    demoUrl: "https://www.nyenglishteacher.com",
    en: {
      headline: "NY English Teacher",
      subheadline:
        "A fully automated lead generation platform that replaces four roles — SDR, marketing, executive assistant, and brand manager — on $0/month infrastructure for a premium coaching business.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "NY English Teacher is a production lead generation and client conversion platform built for a solo-operated premium coaching business in Guadalajara, Mexico. The platform replaces four roles that a traditional agency would staff with humans using automated systems that run on free-tier infrastructure. Four diagnostic quizzes pre-qualify leads with mapped communication gaps. A 3-step booking flow via Cloudflare Workers creates confirmed Google Meet sessions in under 60 seconds. A full EN/ES bilingual mirror with localized routing doubles the addressable market from a single codebase. And premium positioning is hard-coded into the UX with named executive testimonials from Driscoll's, CEVA Logistics, and more — no discount codes, no starter tier.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Static-first architecture: Astro 5.5 pre-renders every page to static HTML — zero database queries, zero runtime errors, Lighthouse 100",
        "Edge booking API: Cloudflare Workers handle Google Calendar OAuth with 1-hour token caching, dual-calendar conflict resolution, and IP-based rate limiting",
        "Serverless lead capture: Quiz submissions hit a Vercel serverless function writing to Neon PostgreSQL with raw scores, gap analysis, and UTM params",
        "Type-safe bilingual routing: Central TKey system maps every page to EN/ES paths — hreflang, sitemap, and navigation generate automatically",
        "Build-time meme status detection: 80-meme portfolio uses a detection module scanning image directories at build time",
        "$0 infrastructure: Astro on Hostinger (static), Cloudflare Workers (free tier), Neon PostgreSQL (free tier), Vercel serverless (free tier)",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Solo professional service providers who need to compete with staffed agencies without hiring",
        "Premium coaching and consulting businesses that need to justify 3-5x market pricing through their website",
        "Bilingual businesses serving US-Mexico markets who need full EN/ES content parity",
        "Anyone spending 10-15 hours/week on manual qualification, scheduling, and follow-ups",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Businesses needing e-commerce or transactional capabilities",
        "Teams requiring a CMS for non-technical content editors",
        "Multi-language sites beyond English and Spanish",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Astro 5.5 + React 19 static site with full TypeScript type safety",
        "4 role-specific diagnostic quizzes with Neon PostgreSQL lead capture",
        "Cloudflare Worker booking system with Google Calendar integration and auto-generated Meet links",
        "Full EN/ES bilingual mirror with hreflang SEO and localized routing",
        "80 shareable memes, 15+ downloadable templates, and 13+ blog articles for content marketing",
        "Premium positioning system with named executive testimonials and no commodity pricing signals",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Independent professional service providers face a structural disadvantage against staffed agencies: manual qualification burns 10-15 hours/week of unpaid labor, scheduling friction kills conversion, generic websites can't justify premium pricing, and the Spanish-speaking professional market is underserved. In the Guadalajara market specifically, the local English tutoring market is saturated at commodity pricing ($5-10/hour) with virtually no competition in the premium, industry-specific coaching segment.",
      resultsTitle: "Results",
      results: [
        "Platform serves as the sole sales and marketing operation generating revenue from day one",
        "Automated qualification eliminates 10-15 hours/week of administrative overhead",
        "Premium pricing (500 MXN / $25 USD per session) sustained at 3-5x local market rate",
        "Bilingual system captures both English-language (higher intent) and Spanish-language (higher volume) searches",
        "100 Lighthouse performance score — zero database queries on page load",
        "$0/month infrastructure cost across all services",
      ],
    },
    es: {
      headline: "NY English Teacher",
      subheadline:
        "Una plataforma de generación de leads completamente automatizada que reemplaza cuatro roles — SDR, marketing, asistente ejecutiva y brand manager — con $0/mes de infraestructura para un negocio de coaching premium.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "NY English Teacher es una plataforma de generación de leads y conversión de clientes en producción, construida para un negocio de coaching premium operado por una sola persona en Guadalajara, México. La plataforma reemplaza cuatro roles que una agencia tradicional staffearia con humanos usando sistemas automatizados que corren en infraestructura de tier gratuito. Cuatro quizzes diagnósticos precalifican leads con brechas de comunicación mapeadas. Un flujo de reservas de 3 pasos vía Cloudflare Workers crea sesiones confirmadas de Google Meet en menos de 60 segundos. Un espejo bilingüe completo EN/ES con enrutamiento localizado duplica el mercado alcanzable desde una sola base de código. Y el posicionamiento premium está integrado en la UX con testimonios ejecutivos reales de Driscoll's, CEVA Logistics y más — sin códigos de descuento, sin tier de entrada.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Arquitectura static-first: Astro 5.5 pre-renderiza cada pagina a HTML estático — cero consultas a base de datos, cero errores runtime, Lighthouse 100",
        "API de reservas en el edge: Cloudflare Workers manejan Google Calendar OAuth con cache de tokens de 1 hora, resolución de conflictos dual-calendario y rate limiting por IP",
        "Captura de leads serverless: Los envíos de quizzes llegan a una función serverless de Vercel que escribe en Neon PostgreSQL con scores, análisis de brechas y parámetros UTM",
        "Enrutamiento bilingüe type-safe: Sistema central TKey mapea cada pagina a rutas EN/ES — hreflang, sitemap y navegación se generan automáticamente",
        "Detección de estado de memes en build-time: Portafolio de 80 memes usa un módulo de detección que escanea directorios de imágenes en tiempo de build",
        "$0 de infraestructura: Astro en Hostinger (estático), Cloudflare Workers (tier gratis), Neon PostgreSQL (tier gratis), Vercel serverless (tier gratis)",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Proveedores de servicios profesionales independientes que necesitan competir con agencias staffeadas sin contratar",
        "Negocios de coaching y consultoría premium que necesitan justificar precios 3-5x del mercado a través de su sitio web",
        "Negocios bilingües que sirven mercados EE.UU.-México y necesitan paridad completa de contenido EN/ES",
        "Cualquiera que gaste 10-15 horas/semana en calificación manual, agendamiento y seguimientos",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Negocios que necesitan capacidades de e-commerce o transaccionales",
        "Equipos que requieren un CMS para editores de contenido no técnicos",
        "Sitios multi-idioma más allá de inglés y español",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Sitio estático Astro 5.5 + React 19 con seguridad de tipos TypeScript completa",
        "4 quizzes diagnósticos por rol con captura de leads en Neon PostgreSQL",
        "Sistema de reservas Cloudflare Worker con integración Google Calendar y links Meet auto-generados",
        "Espejo bilingüe completo EN/ES con SEO hreflang y enrutamiento localizado",
        "80 memes compartibles, 15+ plantillas descargables y 13+ artículos de blog para marketing de contenido",
        "Sistema de posicionamiento premium con testimonios ejecutivos reales y sin señales de precios commodity",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los proveedores de servicios profesionales independientes enfrentan una desventaja estructural contra agencias staffeadas: la calificación manual quema 10-15 horas/semana de trabajo no remunerado, la fricción de agendamiento mata la conversión, los sitios web genéricos no pueden justificar precios premium, y el mercado profesional hispanohablante está desatendido. En el mercado de Guadalajara específicamente, el mercado local de tutoría de inglés está saturado a precios commodity ($5-10/hora) con prácticamente cero competencia en el segmento premium de coaching especifico por industria.",
      resultsTitle: "Resultados",
      results: [
        "La plataforma funciona como la única operación de ventas y marketing generando ingresos desde el día uno",
        "La calificación automatizada elimina 10-15 horas/semana de overhead administrativo",
        "Precio premium (500 MXN / $25 USD por sesión) sostenido a 3-5x la tarifa del mercado local",
        "El sistema bilingüe captura búsquedas en inglés (mayor intención) y en español (mayor volumen)",
        "Puntuación Lighthouse 100 — cero consultas a base de datos en carga de pagina",
        "$0/mes de costo de infraestructura en todos los servicios",
      ],
    },
  },
  "react-vite-tailwind-base": {
    slug: "react-vite-tailwind-base",
    en: {
      headline: "React + Vite + Tailwind starter (opinionated)",
      subheadline:
        "A clean, modern frontend baseline: React + TypeScript + Vite with Tailwind, ShadCN UI, and realistic demo screens — ideal for prototypes and marketing dashboards.",
      overallVerdictTitle: "Overall verdict",
      overallVerdictBody:
        "This is a bite-size, opinionated starter template — not a full SaaS scaffold. It gives you a strong UI foundation and teaching-grade examples, but you still need backend, auth, billing, and data-layer decisions for a real multi-tenant SaaS.",
      whatItDoesWellTitle: "What this template does well",
      whatItDoesWell: [
        "Clean Vite + React + TypeScript baseline with modern ergonomics.",
        "ShadCN UI + Tailwind wired correctly for fast, consistent UI building.",
        "Includes demo pages (dashboard, charts, docs, legal) that feel real — not toy examples.",
        "Great as a learning repo and a prototype starter for client work.",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Marketing sites and landing pages",
        "UI prototypes and product demos",
        "Frontend-only dashboards",
        "Teaching React patterns and component composition",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Multi-tenant SaaS out of the box",
        "Authentication/roles/permissions",
        "Billing/subscriptions",
        "Server-side business logic and persistence",
      ],
      whatYouGetTitle: "What you get on day one",
      whatYouGet: [
        "Opinionated UI kit foundation (ShadCN + Tailwind)",
        "Example layouts and navigation patterns",
        "Mockable API patterns suitable for demos",
        "A structure that’s easy to extend into a real product",
      ],
    },
    es: {
      headline: "Starter React + Vite + Tailwind (con opinión)",
      subheadline:
        "Una base limpia y moderna para frontend: React + TypeScript + Vite con Tailwind, ShadCN UI y pantallas de demo realistas — ideal para prototipos y dashboards de marketing.",
      overallVerdictTitle: "Veredicto general",
      overallVerdictBody:
        "Es un starter pequeño y con opinión — no es un scaffold completo de SaaS. Te deja una base de UI muy sólida y ejemplos tipo ‘repo de enseñanza’, pero todavía falta backend, auth, billing y decisiones de datos para un SaaS real multi-tenant.",
      whatItDoesWellTitle: "Lo que hace bien",
      whatItDoesWell: [
        "Base limpia con Vite + React + TypeScript.",
        "ShadCN UI + Tailwind bien integrados para construir UI rápido y consistente.",
        "Incluye pantallas demo (dashboard, gráficas, docs, legal) que se sienten reales.",
        "Excelente como repo de aprendizaje y como base para prototipos.",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Sitios de marketing y landing pages",
        "Prototipos y demos de producto",
        "Dashboards solo-frontend",
        "Enseñar patrones de React y composición de componentes",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "SaaS multi-tenant listo ‘out of the box’",
        "Autenticación/roles/permisos",
        "Pagos y suscripciones",
        "Lógica de negocio server-side y persistencia",
      ],
      whatYouGetTitle: "Lo que obtienes desde el día uno",
      whatYouGet: [
        "Base de UI con opinión (ShadCN + Tailwind)",
        "Layouts y navegación de ejemplo",
        "Patrones de API fáciles de mockear para demos",
        "Estructura clara para evolucionar hacia un producto real",
      ],
    },
  },
  "cushlabs-OS-dashboard": {
    slug: "cushlabs-OS-dashboard",
    demoUrl: "https://dashboard.cushlabs.ai",
    en: {
      headline: "CushLabs OS — The Operational Command Center",
      subheadline:
        "A full-stack Next.js dashboard that replaces tab-juggling and spreadsheet audits with a single authenticated interface — 7 API routes aggregate GitHub repos, business pipeline, goals, tasks, accomplishments, and infrastructure health into 7 specialized views.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "CushLabs OS is a full-stack Next.js 15 application that authenticates via GitHub OAuth and serves as the central nervous system for a multi-project consultancy. Seven server-side API routes handle authentication, data aggregation, caching, and health checks — all secrets stay server-side, all data merges happen at request time. The frontend renders seven purpose-built dashboard views, each designed around a specific operational concern: portfolio health, business development pipeline, goal tracking across four time horizons, task execution, accomplishment logging, infrastructure monitoring, and system documentation. An enrichment overlay architecture keeps live GitHub metrics and curated business context in separate repos, merging them at request time so neither source goes stale.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "7 server-side API routes with 2-hour caching and manual refresh bypass — secrets never reach the browser",
        "Enrichment overlay architecture: live GitHub metrics merged with business metadata at request time, never duplicated",
        "Batched API calls via Promise.allSettled() in groups of 10 — individual failures degrade gracefully, the dashboard always renders",
        "Computed staleness indicators with color-coded thresholds (red >90 days, yellow >30 days) for instant visual triage",
        "Infrastructure health monitoring with real-time HTTP checks, response time charting via Recharts, and SSL certificate tracking",
        "Custom markdown renderer for the Guide view — full markdown support with zero external library dependencies",
        "Pure CSS stacked-bar visualizations for revenue breakdown and language distribution — no charting library overhead",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Solo consultancies managing 15+ repositories who need aggregate visibility without enterprise tooling",
        "Technical founders who want operational metrics alongside code metrics in a single view",
        "Anyone running a multi-project business on GitHub who's tired of tab-switching and manual audits",
        "Teams that need a lightweight alternative to Datadog/Grafana for small-scale infrastructure monitoring",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Large teams needing role-based access control beyond GitHub OAuth",
        "Organizations requiring real-time alerting or PagerDuty-style incident management",
        "Businesses that need collaborative editing of goals and tasks (this is read-from-JSON, not a CRUD app)",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Next.js 15 full-stack application with React 19 and Tailwind CSS v4",
        "GitHub OAuth authentication with configurable user allowlists",
        "7 dashboard views: portfolio, business dev, goals, tasks, accomplishments, infrastructure, guide",
        "7 API routes with server-side caching, batched GitHub calls, and graceful degradation",
        "Infrastructure health monitoring with response time charts and SSL tracking",
        "Dark/light theme system with system preference detection and localStorage persistence",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Running a solo consultancy across 15+ GitHub repositories creates operational blind spots that compound silently. GitHub shows individual repos but not portfolio-level patterns — commit velocity trends, revenue concentration risks, deployment coverage gaps, or which repos are going stale. Strategic goals spanning daily, weekly, quarterly, and annual horizons live in JSON files with no visualization. Business development pipelines — applications, proposals, outreach — have no funnel view for conversion analysis. Accomplishments ship and vanish into commit history with no searchable record. Infrastructure health across multiple domains requires manual checking. The result: context-switching fatigue, hidden risks, accumulated decision debt, and an operator who's always reacting instead of commanding.",
      resultsTitle: "Results",
      results: [
        "Single authenticated interface replaces daily tab-juggling across GitHub, spreadsheets, and manual checks",
        "15+ repositories monitored with real-time commit, star, and staleness metrics — portfolio health visible at a glance",
        "Business development pipeline visible for conversion analysis with win rates and platform breakdowns",
        "Goal progress tracked across 4 time horizons with automated staleness warnings when goals go quiet",
        "Sub-second client-side filtering across all interactive views — search, sort, and filter without page reloads",
        "Infrastructure health across all managed sites visible in one view with response time history and SSL alerts",
        "7 API routes with 2-hour caching reduce GitHub API consumption while supporting instant manual refresh",
      ],
    },
    es: {
      headline: "CushLabs OS — El Centro de Comando Operacional",
      subheadline:
        "Un dashboard full-stack en Next.js que reemplaza el malabarismo de pestañas y auditorias en hojas de cálculo con una sola interfaz autenticada — 7 rutas API agregan repos de GitHub, pipeline de negocios, metas, tareas, logros y salud de infraestructura en 7 vistas especializadas.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "CushLabs OS es una aplicación full-stack Next.js 15 que se autentica vía GitHub OAuth y funciona como el sistema nervioso central de una consultoría multi-proyecto. Siete rutas API del lado del servidor manejan autenticación, agregación de datos, cache y health checks — todos los secretos permanecen en el servidor, toda la fusión de datos ocurre en tiempo de solicitud. El frontend renderiza siete vistas de dashboard especializadas, cada una diseñada para una preocupación operacional especifica: salud del portafolio, pipeline de desarrollo de negocios, seguimiento de metas en cuatro horizontes temporales, ejecución de tareas, registro de logros, monitoreo de infraestructura y documentación del sistema. Una arquitectura de enriquecimiento superpuesto mantiene las métricas en vivo de GitHub y el contexto de negocio curado en repos separados, fusionandolos en tiempo de solicitud para que ninguna fuente quede obsoleta.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "7 rutas API del lado del servidor con cache de 2 horas y bypass manual — los secretos nunca llegan al navegador",
        "Arquitectura de enriquecimiento superpuesto: métricas en vivo de GitHub fusionadas con metadatos de negocio en tiempo de solicitud, sin duplicación",
        "Llamadas API en lotes vía Promise.allSettled() en grupos de 10 — fallos individuales degradan gracilmente, el dashboard siempre renderiza",
        "Indicadores de obsolescencia computados con umbrales codificados por color (rojo >90 días, amarillo >30 días) para triaje visual instantáneo",
        "Monitoreo de salud de infraestructura con checks HTTP en tiempo real, gráficas de tiempo de respuesta vía Recharts y seguimiento de certificados SSL",
        "Renderizador de markdown personalizado para la vista Guía — soporte completo de markdown sin dependencias de bibliotecas externas",
        "Visualizaciones de barras apiladas en CSS puro para desglose de ingresos y distribución de lenguajes — sin overhead de biblioteca de gráficas",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Consultorías independientes que manejan 15+ repositorios y necesitan visibilidad agregada sin herramientas enterprise",
        "Fundadores técnicos que quieren métricas operacionales junto a métricas de código en una sola vista",
        "Cualquiera que maneje un negocio multi-proyecto en GitHub y este cansado de cambiar pestañas y auditorias manuales",
        "Equipos que necesitan una alternativa ligera a Datadog/Grafana para monitoreo de infraestructura a pequeña escala",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Equipos grandes que necesitan control de acceso basado en roles más allá de GitHub OAuth",
        "Organizaciones que requieren alertas en tiempo real o gestión de incidentes tipo PagerDuty",
        "Negocios que necesitan edición colaborativa de metas y tareas (esto es lectura-de-JSON, no una app CRUD)",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Aplicación full-stack Next.js 15 con React 19 y Tailwind CSS v4",
        "Autenticación GitHub OAuth con listas de usuarios configurables",
        "7 vistas de dashboard: portafolio, desarrollo de negocios, metas, tareas, logros, infraestructura, guía",
        "7 rutas API con cache del lado del servidor, llamadas GitHub en lotes y degradación grácil",
        "Monitoreo de salud de infraestructura con gráficas de tiempo de respuesta y seguimiento SSL",
        "Sistema de temas claro/oscuro con detección de preferencia del sistema y persistencia en localStorage",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Operar una consultoría independiente con 15+ repositorios de GitHub crea puntos ciegos operacionales que se acumulan silenciosamente. GitHub muestra repos individuales pero no patrones a nivel de portafolio — tendencias de velocidad de commits, riesgos de concentración de ingresos, brechas de cobertura de despliegues, o que repos se están volviendo obsoletos. Metas estratégicas en cuatro horizontes (diario, semanal, trimestral, anual) viven en archivos JSON sin visualización. Pipelines de desarrollo de negocios — aplicaciones, propuestas, alcance — no tienen vista de embudo para análisis de conversión. Los logros se publican y desaparecen en el historial de commits sin registro buscable. La salud de infraestructura en múltiples dominios requiere verificación manual. El resultado: fatiga por cambio de contexto, riesgos ocultos, deuda de decisiones acumulada, y un operador que siempre reacciona en vez de comandar.",
      resultsTitle: "Resultados",
      results: [
        "Una sola interfaz autenticada reemplaza el malabarismo diario entre GitHub, hojas de cálculo y verificaciones manuales",
        "15+ repositorios monitoreados con métricas de commits, estrellas y obsolescencia en tiempo real — salud del portafolio visible de un vistazo",
        "Pipeline de desarrollo de negocios visible para análisis de conversión con tasas de éxito y desgloses por plataforma",
        "Progreso de metas rastreado en 4 horizontes temporales con advertencias automáticas de obsolescencia cuando las metas se estancan",
        "Filtrado sub-segundo del lado del cliente en todas las vistas interactivas — buscar, ordenar y filtrar sin recargas de pagina",
        "Salud de infraestructura de todos los sitios gestionados visible en una vista con historial de tiempos de respuesta y alertas SSL",
        "7 rutas API con cache de 2 horas reducen el consumo de la API de GitHub mientras soportan refresh manual instantáneo",
      ],
    },
  },
  "biojalisco-pitch": {
    slug: "biojalisco-pitch",
    demoUrl: "https://biojalisco-pitch.vercel.app",
    en: {
      headline: "BioJalisco — Cinematic Scrollytelling Pitch Site",
      subheadline:
        "Cinematic scrollytelling site pitching a citizen-science biodiversity platform for western Mexico",
      overallVerdictTitle: "The Verdict",
      overallVerdictBody:
        "A persuasion artifact built as a single self-contained HTML file with embedded images, bilingual content switching, procedural audio, and scroll-triggered animations. Demonstrates that high-impact storytelling doesn't require React or a build system.",
      whatItDoesWellTitle: "What It Does Well",
      whatItDoesWell: [
        "5-act narrative arc (Hook → Problem → Vision → Evidence → Ask) designed for stakeholder persuasion",
        "Instant ES/EN language switching with zero page reload using CSS visibility toggles",
        "Self-contained deployment — entire site is 1.8MB HTML file with base64-embedded WebP images",
        "Procedural forest soundscape via Web Audio API (no audio files needed)",
        "92% image size reduction through PNG→WebP conversion + base64 encoding",
      ],
      goodForTitle: "Good For",
      goodFor: [
        "Conservation organizations pitching to academic partners and funders",
        "Projects needing offline-capable presentation sites with zero infrastructure",
        "Bilingual storytelling where both languages must be equally polished",
        "Demonstrating technical restraint — vanilla JS for projects that don't need frameworks",
      ],
      notForTitle: "Not For",
      notFor: [
        "Projects requiring dynamic content updates (everything is baked into the HTML)",
        "Sites with frequent content changes (editing requires HTML file modification)",
        "Large image galleries (base64 embedding inflates file size)",
        "SEO-critical landing pages (single-file approach limits optimization)",
      ],
      whatYouGetTitle: "What You Get",
      whatYouGet: [
        "Single 1.8MB HTML file with 9 embedded WebP images",
        "Bilingual ES/EN with instant switching via CSS",
        "Intersection Observer scroll reveal system",
        "Web Audio API procedural soundscape",
        "Deployed on Vercel with zero build step",
      ],
    },
    es: {
      headline: ES_TITLE_BIOJALISCO_PITCH,
      subheadline:
        "Sitio de scrollytelling cinemático presentando una plataforma de biodiversidad de ciencia ciudadana para el occidente de México",
      overallVerdictTitle: "El Veredicto",
      overallVerdictBody:
        "Un artefacto de persuasión construido como un archivo HTML autocontenido con imágenes embebidas, cambio de contenido bilingüe, audio procedural y animaciones activadas por scroll. Demuestra que la narración de alto impacto no requiere React ni un sistema de compilación.",
      whatItDoesWellTitle: "Lo Que Hace Bien",
      whatItDoesWell: [
        "Arco narrativo de 5 actos (Gancho → Problema → Visión → Evidencia → Llamado) diseñado para persuasión de stakeholders",
        "Cambio instantáneo de idioma ES/EN sin recarga de página usando toggles de visibilidad CSS",
        "Despliegue autocontenido — sitio completo es archivo HTML de 1.8MB con imágenes WebP en base64",
        "Paisaje sonoro de bosque procedural vía Web Audio API (no se necesitan archivos de audio)",
        "Reducción del 92% en tamaño de imágenes mediante conversión PNG→WebP + codificación base64",
      ],
      goodForTitle: "Bueno Para",
      goodFor: [
        "Organizaciones de conservación presentando a socios académicos y financiadores",
        "Proyectos que necesitan sitios de presentación capaces de funcionar offline con cero infraestructura",
        "Narración bilingüe donde ambos idiomas deben estar igualmente pulidos",
        "Demostrar restricción técnica — JS vanilla para proyectos que no necesitan frameworks",
      ],
      notForTitle: "No Es Para",
      notFor: [
        "Proyectos que requieren actualizaciones dinámicas de contenido (todo está integrado en el HTML)",
        "Sitios con cambios frecuentes de contenido (editar requiere modificación del archivo HTML)",
        "Galerías de imágenes grandes (la incrustación base64 infla el tamaño del archivo)",
        "Landing pages críticas para SEO (el enfoque de archivo único limita la optimización)",
      ],
      whatYouGetTitle: "Lo Que Obtienes",
      whatYouGet: [
        "Archivo HTML único de 1.8MB con 9 imágenes WebP embebidas",
        "Bilingüe ES/EN con cambio instantáneo vía CSS",
        "Sistema de revelación por scroll con Intersection Observer",
        "Paisaje sonoro procedural con Web Audio API",
        "Desplegado en Vercel sin paso de compilación",
      ],
    },
  },
  "ai-chatbot-saas": {
    slug: "ai-chatbot-saas",
    demoUrl: "https://www.soyconverso.com",
    en: {
      headline: "Converso AI — Bilingual AI Front Desk & Sales Assistant",
      subheadline:
        "A multi-tenant SaaS platform that gives service businesses a 24/7 bilingual AI assistant — knowledge-grounded answers, lead qualification, visual playbook builder, and Stripe billing. One script tag to deploy.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "Converso AI is a production multi-tenant SaaS that solves the core problem facing service businesses in bilingual markets: leads that vanish outside business hours because nobody's there to answer. Each tenant uploads their knowledge base — files, website scrapes, or manual entries — and gets an AI chatbot that answers in English or Spanish from verified facts, never from hallucination. A visual playbook builder lets non-technical owners design conversation flows with conditional branching and lead capture. Stripe handles subscriptions and usage metering. A single script tag drops the widget onto any website. The entire stack runs on Next.js 16 with full tenant isolation, RBAC, and edge security headers.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Multi-tenant data isolation — every query scopes to businessId with RBAC at the API layer",
        "RAG pipeline: ingestion, chunking, embedding via pgvector HNSW indexes for sub-linear similarity search",
        "Streaming chat via Vercel AI SDK — sub-second time-to-first-token from GPT-4o",
        "Visual playbook builder on React Flow with 7 node types for non-technical conversation design",
        "Stripe webhook-driven billing with checkout, lifecycle management, and monthly usage aggregation",
        "Edge security via Next.js 16 proxy.ts — CSP, HSTS, and frame protection at the CDN layer",
        "Native bilingual architecture — language detection on first message, not auto-translate",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Service businesses in bilingual markets losing leads outside business hours",
        "Companies that need AI answers grounded in their actual content, not generic training data",
        "Non-technical business owners who want full chatbot control through a visual dashboard",
        "Anyone evaluating what a production multi-tenant SaaS architecture looks like end-to-end",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Businesses needing voice-based AI (see the Voice Agent Platform for that)",
        "Enterprise organizations requiring SSO/SAML beyond Clerk authentication",
        "High-volume transactional use cases requiring guaranteed sub-100ms responses",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Full SaaS platform: multi-tenancy, RBAC, billing, usage metering, knowledge management",
        "Production RAG pipeline with source citations and hallucination prevention",
        "Self-service admin dashboard — knowledge ingestion, playbook design, lead management, live chat",
        "One-tag embeddable widget deployable on any website with zero host-site code changes",
        "Native EN/ES bilingual support with automatic language detection",
        "Stripe-integrated subscription management with usage tracking per tenant",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Service businesses in bilingual markets lose 30-50% of inquiries that arrive after hours or on weekends. Hiring bilingual receptionists is expensive and doesn't scale. Generic chatbots hallucinate answers — wrong information about pricing or availability is worse than no answer at all. And most chatbot platforms require developer involvement for setup, making them inaccessible to small business owners who don't have dev teams.",
      resultsTitle: "Results",
      results: [
        "24/7 bilingual customer engagement without hiring staff — every inquiry gets an instant, accurate response",
        "Knowledge-grounded answers with source citations eliminate hallucination risk",
        "Lead capture and qualification running automatically while the business is closed",
        "Full chatbot configuration through a self-service dashboard — zero developer dependency",
        "End-to-end SaaS architecture demonstrating tenant isolation, billing, RAG, and real-time streaming",
      ],
    },
    es: {
      headline:
        "Converso AI — Asistente Bilingüe de IA para Recepción y Ventas",
      subheadline:
        "Una plataforma SaaS multi-tenant que da a negocios de servicio un asistente de IA bilingüe 24/7 — respuestas basadas en conocimiento, calificación de leads, constructor visual de flujos y facturación con Stripe. Un script para desplegar.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "Converso AI es un SaaS multi-tenant en producción que resuelve el problema central de negocios de servicio en mercados bilingües: leads que desaparecen fuera de horario porque nadie está para responder. Cada tenant sube su base de conocimiento — archivos, scraping de sitio web o entradas manuales — y obtiene un chatbot de IA que responde en inglés o español desde hechos verificados, nunca desde alucinaciones. Un constructor visual de playbooks permite a dueños no técnicos diseñar flujos de conversación con ramificación condicional y captura de leads. Stripe maneja suscripciones y medición de uso. Un solo script tag despliega el widget en cualquier sitio web. Todo el stack corre en Next.js 16 con aislamiento total por tenant, RBAC y headers de seguridad en el edge.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Aislamiento de datos multi-tenant — cada consulta se limita a businessId con RBAC en la capa API",
        "Pipeline RAG: ingestion, chunking, embedding vía indices HNSW de pgvector para búsqueda de similitud sub-lineal",
        "Chat en streaming vía Vercel AI SDK — tiempo sub-segundo al primer token con GPT-4o",
        "Constructor visual de playbooks en React Flow con 7 tipos de nodo para diseño de conversaciones sin código",
        "Facturación por webhooks de Stripe con checkout, gestión de ciclo de vida y agregación de uso mensual",
        "Seguridad edge vía proxy.ts de Next.js 16 — CSP, HSTS y protección de frames en la capa CDN",
        "Arquitectura bilingüe nativa — detección de idioma en primer mensaje, no auto-traducción",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Negocios de servicio en mercados bilingües que pierden leads fuera de horario",
        "Empresas que necesitan respuestas de IA basadas en su contenido real, no en datos de entrenamiento genéricos",
        "Dueños de negocio no técnicos que quieren control total del chatbot a través de un dashboard visual",
        "Cualquiera evaluando como se ve una arquitectura SaaS multi-tenant en producción de principio a fin",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Negocios que necesitan IA por voz (ver la Plataforma de Agente de Voz para eso)",
        "Organizaciones enterprise que requieren SSO/SAML más allá de autenticación Clerk",
        "Casos de uso transaccionales de alto volumen que requieren respuestas garantizadas sub-100ms",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Plataforma SaaS completa: multi-tenencia, RBAC, facturación, medición de uso, gestión de conocimiento",
        "Pipeline RAG en producción con citación de fuentes y prevención de alucinaciones",
        "Dashboard de administración autoservicio — ingestion de conocimiento, diseño de playbooks, gestión de leads, chat en vivo",
        "Widget embebible con un solo tag desplegable en cualquier sitio web sin cambios en el código del host",
        "Soporte bilingüe nativo EN/ES con detección automática de idioma",
        "Gestión de suscripciones integrada con Stripe con seguimiento de uso por tenant",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los negocios de servicio en mercados bilingües pierden 30-50% de consultas que llegan fuera de horario o en fines de semana. Contratar recepcionistas bilingües es caro y no escala. Los chatbots genéricos alucinan respuestas — información incorrecta sobre precios o disponibilidad es peor que no responder. Y la mayoría de plataformas de chatbot requieren participación de desarrolladores para la configuración, haciéndolas inaccesibles para dueños de pequeños negocios que no tienen equipos de desarrollo.",
      resultsTitle: "Resultados",
      results: [
        "Atención bilingüe al cliente 24/7 sin contratar personal — cada consulta recibe respuesta instantánea y precisa",
        "Respuestas basadas en conocimiento con citación de fuentes eliminan el riesgo de alucinación",
        "Captura y calificación de leads corriendo automáticamente mientras el negocio está cerrado",
        "Configuración completa del chatbot a través de dashboard autoservicio — cero dependencia de desarrolladores",
        "Arquitectura SaaS de principio a fin demostrando aislamiento de tenants, facturación, RAG y streaming en tiempo real",
      ],
    },
  },
  "ny-ai-chatbot": {
    slug: "ny-ai-chatbot",
    demoUrl: "https://ny-ai-chatbot.vercel.app",
    en: {
      headline: "NY AI Chatbot — The Revenue-First Conversational Engine",
      subheadline:
        "An AI chatbot engineered as an automated sales agent, not a support deflector. Every layer — system prompts, RAG citations, error handling, rate limits — is designed to convert anonymous visitors into booked strategy sessions.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "NY AI Chatbot flips the script on what chatbots are for. Most companies deploy chatbots to reduce support tickets — a cost center by design. This system is architected as an automated sales agent. System prompts are hard-coded with CTAs for free strategy sessions. RAG source citations link to high-value service pages, increasing time-on-site. Error messages embed booking links. Rate limits create urgency. A dual-source RAG pipeline merges scraped website content with curated sales messaging, and the top 5 results by cosine similarity are injected into every response with full source URLs. The result: a chatbot that doesn't just answer questions — it books revenue.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Revenue-first prompt architecture — CTAs for strategy sessions hard-coded into the system prompt DNA",
        "Dual-source RAG: scraped website content (0.5 threshold) + curated sales docs (0.6 threshold) merged by cosine similarity",
        "Source citations that double as SEO — every response links to high-value service pages",
        "Zero-auth guest experience via sessionId cookies — no signup friction before conversion",
        "Full EN/ES bilingual support with locale-aware personality and benefit-driven language",
        "Embeddable iframe + script tag widget deployable on any client domain with CORS configuration",
        "Admin dashboard with chat analytics, knowledge management, and bot personality settings",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Service businesses that want their chatbot to generate revenue, not just deflect tickets",
        "Premium coaching and consulting businesses that need to justify high-ticket pricing through AI",
        "Bilingual businesses where both English and Spanish conversations must feel native",
        "Anyone studying how to architect AI systems around business outcomes instead of features",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "E-commerce product recommendation (this is service-business focused)",
        "High-volume enterprise support requiring ticket system integration",
        "Businesses that want a neutral, information-only chatbot without sales intent",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Next.js 15 + React 19 full-stack chatbot with OpenAI GPT-4o streaming",
        "Dual-source RAG pipeline with pgvector embeddings and configurable similarity thresholds",
        "Revenue-focused system prompts with benefit-driven language and social proof",
        "Embeddable widget for any website — one script tag, zero host-site changes",
        "Admin dashboard for knowledge management, analytics, and bot configuration",
        "Full bilingual EN/ES with locale-aware personality adaptation",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Language schools and service businesses treat chatbots as deflection tools — reduce ticket volume, speed up FAQ answers, dead-end the conversation. The result is a cost center that never generates revenue. Meanwhile, anonymous website visitors leave without converting because there's no sales-aware system guiding them toward high-value actions like booking a paid session.",
      resultsTitle: "Results",
      results: [
        "Five-layer revenue engine: system prompts, error CTAs, localization, rate limits as strategy, source citations",
        "Every conversation steers toward booking — the chatbot is an automated closer, not a FAQ bot",
        "Dual RAG sources deliver both public content accuracy and internal sales messaging",
        "Sub-second streaming responses via Vercel AI SDK with zero signup friction",
        "Source citations drive traffic to high-value pages, increasing time-on-site and eliminating hallucination",
      ],
    },
    es: {
      headline: "NY AI Chatbot — El Motor Conversacional Orientado a Ingresos",
      subheadline:
        "Un chatbot de IA diseñado como agente de ventas automatizado, no como deflector de soporte. Cada capa — prompts del sistema, citaciones RAG, manejo de errores, límites de uso — está diseñada para convertir visitantes anónimos en sesiones de estrategia agendadas.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "NY AI Chatbot cambia las reglas de para que sirven los chatbots. La mayoría de empresas despliegan chatbots para reducir tickets de soporte — un centro de costos por diseño. Este sistema está arquitectado como un agente de ventas automatizado. Los prompts del sistema tienen CTAs para sesiones de estrategia gratuitas integrados en el código. Las citaciones RAG enlazan a paginas de servicio de alto valor, aumentando el tiempo en sitio. Los mensajes de error incluyen links de reserva. Los límites de uso crean urgencia. Un pipeline RAG de doble fuente combina contenido scrapeado del sitio web con mensajería de ventas curada, y los 5 mejores resultados por similitud coseno se inyectan en cada respuesta con URLs de fuente completas. El resultado: un chatbot que no solo responde preguntas — agenda ingresos.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Arquitectura de prompts orientada a ingresos — CTAs para sesiones de estrategia integrados en el ADN del prompt del sistema",
        "RAG de doble fuente: contenido web scrapeado (umbral 0.5) + docs de ventas curados (umbral 0.6) combinados por similitud coseno",
        "Citaciones de fuentes que funcionan como SEO — cada respuesta enlaza a paginas de servicio de alto valor",
        "Experiencia de invitado sin autenticación vía cookies sessionId — cero fricción de registro antes de la conversión",
        "Soporte bilingüe completo EN/ES con personalidad adaptada al idioma y lenguaje orientado a beneficios",
        "Widget embebible iframe + script tag desplegable en cualquier dominio del cliente con configuración CORS",
        "Dashboard de admin con analíticas de chat, gestión de conocimiento y configuración de personalidad del bot",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Negocios de servicio que quieren que su chatbot genere ingresos, no solo desvíe tickets",
        "Negocios de coaching y consultoría premium que necesitan justificar precios altos a través de IA",
        "Negocios bilingües donde las conversaciones en inglés y español deben sentirse nativas",
        "Cualquiera estudiando como arquitectar sistemas de IA alrededor de resultados de negocio en vez de funcionalidades",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Recomendación de productos e-commerce (esto está enfocado en negocios de servicio)",
        "Soporte enterprise de alto volumen que requiere integración con sistema de tickets",
        "Negocios que quieren un chatbot neutral, solo informativo, sin intención de venta",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Chatbot full-stack Next.js 15 + React 19 con streaming OpenAI GPT-4o",
        "Pipeline RAG de doble fuente con embeddings pgvector y umbrales de similitud configurables",
        "Prompts de sistema enfocados en ingresos con lenguaje de beneficios y prueba social",
        "Widget embebible para cualquier sitio web — un script tag, cero cambios en el host",
        "Dashboard de admin para gestión de conocimiento, analíticas y configuración del bot",
        "Bilingüe completo EN/ES con adaptación de personalidad por idioma",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Las escuelas de idiomas y negocios de servicio tratan a los chatbots como herramientas de deflexión — reducir volumen de tickets, acelerar respuestas FAQ, terminar la conversación. El resultado es un centro de costos que nunca genera ingresos. Mientras tanto, visitantes anónimos se van sin convertir porque no hay sistema con conciencia de ventas guiándolos hacia acciones de alto valor como agendar una sesión pagada.",
      resultsTitle: "Resultados",
      results: [
        "Motor de ingresos de cinco capas: prompts del sistema, CTAs en errores, localización, límites de uso como estrategia, citaciones de fuentes",
        "Cada conversación dirige hacia la reserva — el chatbot es un cerrador automatizado, no un bot FAQ",
        "Doble fuente RAG entrega tanto precisión de contenido público como mensajería de ventas interna",
        "Respuestas en streaming sub-segundo vía Vercel AI SDK con cero fricción de registro",
        "Citaciones de fuentes dirigen trafico a paginas de alto valor, aumentando tiempo en sitio y eliminando alucinaciones",
      ],
    },
  },
  "cushlabs-ai-voice-agent": {
    slug: "cushlabs-ai-voice-agent",
    demoUrl: "https://voice.cushlabs.ai",
    en: {
      headline: "AI Voice Agent Platform — Your 24/7 Phone Team",
      subheadline:
        "Production voice AI agents that answer calls, qualify leads, book appointments into Google Calendar, and handle support — with sub-500ms response times and natural conversation across 5 industry demos.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "The Voice Agent Platform deploys conversational AI agents that handle real phone calls — both inbound and outbound. Built on Vapi's real-time voice infrastructure, each agent combines an LLM brain (Claude Sonnet or Groq Llama 3.1), speech-to-text (Deepgram Nova-2/3), text-to-speech (Cartesia), and a webhook-driven Express backend that executes real-world actions during live calls. Five production demo agents serve different industries: Clara qualifies leads for CushLabs, James books executive coaching appointments with real-time Google Calendar integration, Sophia runs a med spa front desk, Mike dispatches home service calls, and David — the platform's first outbound agent — proactively calls real estate prospects via Twilio PSTN to qualify buyers and book property tours.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Sub-500ms voice response via Vapi WebRTC: microphone → Deepgram STT → LLM → Cartesia TTS → speaker",
        "Outbound PSTN calling — David calls prospects via Twilio with E.164 validation and per-IP rate limiting",
        "Webhook function calling with 8 handlers: calendar booking, database writes, MLS lookup, business logic",
        "Real-time Google Calendar OAuth — checks availability and books confirmed appointments mid-call",
        "Redis session state for multi-turn context across function calls within a single conversation",
        "5-agent deployment across 5 industries with domain-specific LLM, voice, and prompt configurations",
        "Full bilingual EN/ES with client-side i18n and MutationObserver for dynamic Vapi status translation",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Businesses losing leads to unanswered calls, voicemail, and hold-time abandonment",
        "Service companies that need 24/7 phone coverage without hiring full-time receptionists",
        "Industries with appointment-heavy workflows — med spas, real estate, home services, coaching",
        "Anyone evaluating real-time voice AI architecture with production-grade latency",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Complex multi-party conference calling or call center routing",
        "Highly regulated industries requiring certified call recording and compliance",
        "Businesses needing deep CRM integration beyond webhook-based data capture",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "5 production demo agents across lead qualification, appointment booking, front desk, dispatch, and outbound calling",
        "Express.js webhook backend with Google Calendar, Neon PostgreSQL, and Redis integration",
        "Both inbound (Web SDK) and outbound (Twilio PSTN) calling from a single platform",
        "Domain-specific prompt engineering for each industry vertical",
        "Bilingual EN/ES marketing site with live demo access",
        "Render Blueprint deployment for reproducible infrastructure",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Businesses lose leads to unanswered calls, voicemail black holes, and hold-time abandonment. Hiring receptionists is expensive ($30-50K/year) and still leaves gaps outside business hours. Existing IVR systems frustrate callers with rigid menu trees that never actually solve the problem. There's no intelligence layer — traditional phone systems route calls but can't qualify, score, or take action based on what the caller needs.",
      resultsTitle: "Results",
      results: [
        "Every inbound call answered instantly, 24/7 — zero missed leads, zero hold times",
        "Qualified prospects booked directly into Google Calendar before hanging up",
        "Sub-500ms response time delivers natural conversation flow indistinguishable from human agents",
        "5-industry demo suite proves the platform works across verticals, not just one use case",
        "First outbound AI calling agent — David proactively reaches prospects instead of waiting for inbound",
        "L1 support handled automatically, reserving human agents for complex issues that need empathy",
      ],
    },
    es: {
      headline: "Plataforma de Agentes de Voz IA — Tu Equipo Telefónico 24/7",
      subheadline:
        "Agentes de voz IA en producción que contestan llamadas, califican leads, agendan citas en Google Calendar y manejan soporte — con tiempos de respuesta sub-500ms y conversación natural en 5 demos por industria.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "La Plataforma de Agentes de Voz despliega agentes de IA conversacional que manejan llamadas telefónicas reales — tanto entrantes como salientes. Construida sobre la infraestructura de voz en tiempo real de Vapi, cada agente combina un cerebro LLM (Claude Sonnet o Groq Llama 3.1), speech-to-text (Deepgram Nova-2/3), text-to-speech (Cartesia) y un backend Express con webhooks que ejecuta acciones reales durante llamadas en vivo. Cinco agentes demo en producción sirven diferentes industrias: Clara califica leads para CushLabs, James agenda citas de coaching ejecutivo con integración Google Calendar en tiempo real, Sophia atiende la recepción de un spa medico, Mike despacha llamadas de servicios del hogar, y David — el primer agente de llamadas salientes de la plataforma — llama proactivamente a prospectos inmobiliarios vía Twilio PSTN para calificar compradores y agendar tours de propiedades.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Respuesta de voz sub-500ms vía Vapi WebRTC: micrófono → Deepgram STT → LLM → Cartesia TTS → bocina",
        "Llamadas PSTN salientes — David llama prospectos vía Twilio con validación E.164 y rate limiting por IP",
        "Function calling por webhooks con 8 handlers: reservas de calendario, escritura a base de datos, búsqueda MLS, lógica de negocio",
        "Google Calendar OAuth en tiempo real — verifica disponibilidad y agenda citas confirmadas durante la llamada",
        "Estado de sesión Redis para contexto multi-turno entre function calls dentro de una conversación",
        "Despliegue de 5 agentes en 5 industrias con LLM, voz y configuración de prompts especifica por dominio",
        "Bilingüe completo EN/ES con i18n del lado del cliente y MutationObserver para traducción dinámica de status Vapi",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Negocios que pierden leads por llamadas sin contestar, buzón de voz y abandono por tiempos de espera",
        "Empresas de servicio que necesitan cobertura telefónica 24/7 sin contratar recepcionistas de tiempo completo",
        "Industrias con flujos intensivos de citas — spas médicos, bienes raíces, servicios del hogar, coaching",
        "Cualquiera evaluando arquitectura de voz IA en tiempo real con latencia de producción",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Llamadas de conferencia multi-parte complejas o enrutamiento de call center",
        "Industrias altamente reguladas que requieren grabación de llamadas certificada y cumplimiento normativo",
        "Negocios que necesitan integración profunda con CRM más allá de captura de datos por webhooks",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "5 agentes demo en producción: calificación de leads, reserva de citas, recepción, despacho y llamadas salientes",
        "Backend Express.js con webhooks, Google Calendar, Neon PostgreSQL e integración Redis",
        "Llamadas entrantes (Web SDK) y salientes (Twilio PSTN) desde una sola plataforma",
        "Ingeniería de prompts especifica por dominio para cada vertical de industria",
        "Sitio de marketing bilingüe EN/ES con acceso a demos en vivo",
        "Despliegue vía Render Blueprint para infraestructura reproducible",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los negocios pierden leads por llamadas sin contestar, buzones de voz que nadie revisa y abandono por tiempos de espera. Contratar recepcionistas es caro ($30-50K/año) y aún así deja huecos fuera de horario. Los sistemas IVR existentes frustran a quienes llaman con menús rígidos que nunca resuelven el problema. No hay capa de inteligencia — los sistemas telefónicos tradicionales rutean llamadas pero no pueden calificar, puntuar ni actuar sobre lo que el llamante necesita.",
      resultsTitle: "Resultados",
      results: [
        "Cada llamada entrante contestada al instante, 24/7 — cero leads perdidos, cero tiempos de espera",
        "Prospectos calificados agendados directamente en Google Calendar antes de colgar",
        "Tiempo de respuesta sub-500ms entrega flujo de conversación natural indistinguible de agentes humanos",
        "Suite de demos en 5 industrias demuestra que la plataforma funciona en múltiples verticales, no solo un caso de uso",
        "Primer agente de llamadas salientes con IA — David contacta prospectos proactivamente en vez de esperar llamadas entrantes",
        "Soporte L1 manejado automáticamente, reservando agentes humanos para temas complejos que necesitan empatía",
      ],
    },
  },
  "cushlabs-marketsignal": {
    slug: "cushlabs-marketsignal",
    demoUrl: "https://marketsignal.cushlabs.ai",
    en: {
      headline: "MarketSignal — AI-Powered Local Competitive Intelligence",
      subheadline:
        "Monitor Google Maps rankings, reviews, and competitor activity for multi-location businesses in Mexico — AI-generated weekly reports with one actionable recommendation, delivered straight to WhatsApp.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "MarketSignal is an AI-powered competitive intelligence platform built specifically for multi-location businesses in Mexico. It systematically tracks Google Maps rankings, review velocity, rating trends, and competitor activity — then uses Claude to distill everything into a weekly WhatsApp report with one specific, high-impact action item. No dashboards to check, no reports to download. The insight arrives in the conversation thread where business owners already operate. The architecture is built for phased go-to-market: Phase 1 validates willingness to pay through a manual service model, Phase 2 adds automated scraping and WhatsApp delivery, Phase 3 opens self-service onboarding.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Append-only snapshot architecture — historical data is never overwritten, enabling re-analysis and audit trails",
        "Claude API integration for natural-language insights with actionable recommendations per location",
        "Multi-org data model with dynamic [orgSlug] routing — scales from day one without migration",
        "JSONB raw data columns preserve full scraper output for future flexibility without schema changes",
        "Report status flow: Draft → Approved → Sent → Delivered ensures no report goes out unreviewed",
        "Drizzle ORM as single source of truth — schema-driven types flow from database to API to UI",
        "Phased architecture supports automation (Playwright + WhatsApp API) without rewriting Phase 1 code",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Multi-location businesses in Mexico that need affordable local SEO intelligence",
        "Companies competing on Google Maps where a 20-review swing can cost 3 ranking positions",
        "Business owners who want one clear action per week, not a dashboard full of charts",
        "Service businesses in markets where WhatsApp is the default communication channel",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Businesses outside Mexico (the platform is built for the Mexican market specifically)",
        "Enterprise organizations needing real-time monitoring with instant alerts",
        "Companies that prefer traditional email-based or dashboard-based reporting",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Full-stack Next.js 15 competitive intelligence dashboard with App Router and server components",
        "AI-powered weekly reports with Claude — structured analysis, not just raw data",
        "WhatsApp-native delivery formatted for mobile readability",
        "Week-over-week ranking and review delta tracking per keyword-location pair",
        "Multi-organization support with full data isolation from day one",
        "Phased go-to-market architecture that scales from manual service to self-service SaaS",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Local businesses in Mexico have no affordable way to systematically track their Google Maps rankings or monitor competitor activity. Enterprise tools like BrightLocal and Whitespark don't serve the Mexican market well — pricing is in USD, support is in English, and the tools assume US-centric search patterns. A competitor can gain 20 reviews in a week and jump 3 positions in Maps, and without systematic tracking, businesses don't know until their phone stops ringing. Most rank tracking tools show data but don't tell you what to do. And in Mexico, email reports get ignored — WhatsApp is where business happens.",
      resultsTitle: "Results",
      results: [
        "Structured competitive intelligence that multi-location businesses previously had no access to",
        "One actionable recommendation per week reduces decision fatigue and drives specific improvements",
        "WhatsApp delivery achieves higher read rates than email-based alternatives",
        "AI-generated analysis turns raw ranking data into business language that owners understand",
        "Phased architecture validates market demand before investing in full automation",
        "Most differentiated offering in the CushLabs portfolio — no competitor offers this in the Mexican market",
      ],
    },
    es: {
      headline: "MarketSignal — Inteligencia Competitiva Local con IA",
      subheadline:
        "Monitorea rankings en Google Maps, reseñas y actividad de competidores para negocios multi-sucursal en México — reportes semanales generados por IA con una recomendación accionable, entregados directo a WhatsApp.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "MarketSignal es una plataforma de inteligencia competitiva impulsada por IA construida específicamente para negocios multi-sucursal en México. Rastrea sistemáticamente rankings en Google Maps, velocidad de reseñas, tendencias de calificación y actividad de competidores — luego usa Claude para destilar todo en un reporte semanal por WhatsApp con una recomendación especifica y de alto impacto. Sin dashboards que revisar, sin reportes que descargar. El insight llega en el hilo de conversación donde los dueños de negocio ya operan. La arquitectura está construida para go-to-market por fases: Fase 1 valida disposición a pagar a través de un modelo de servicio manual, Fase 2 agrega scraping automatizado y entrega por WhatsApp, Fase 3 abre onboarding autoservicio.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Arquitectura de snapshots append-only — los datos históricos nunca se sobreescriben, habilitando re-análisis y trazabilidad",
        "Integración con API de Claude para insights en lenguaje natural con recomendaciones accionables por ubicación",
        "Modelo de datos multi-org con ruteo dinámico [orgSlug] — escala desde el día uno sin migración",
        "Columnas JSONB de datos crudos preservan la salida completa del scraper para flexibilidad futura sin cambios de esquema",
        "Flujo de estado de reportes: Borrador → Aprobado → Enviado → Entregado asegura que ningún reporte salga sin revisión",
        "Drizzle ORM como fuente única de verdad — tipos dirigidos por esquema fluyen de base de datos a API a UI",
        "Arquitectura por fases soporta automatización (Playwright + WhatsApp API) sin reescribir código de Fase 1",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Negocios multi-sucursal en México que necesitan inteligencia local SEO accesible",
        "Empresas compitiendo en Google Maps donde 20 reseñas de diferencia pueden costar 3 posiciones de ranking",
        "Dueños de negocio que quieren una acción clara por semana, no un dashboard lleno de gráficas",
        "Negocios de servicio en mercados donde WhatsApp es el canal de comunicación predeterminado",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Negocios fuera de México (la plataforma está construida para el mercado mexicano específicamente)",
        "Organizaciones enterprise que necesitan monitoreo en tiempo real con alertas instantáneas",
        "Empresas que prefieren reportes tradicionales por email o basados en dashboard",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Dashboard de inteligencia competitiva full-stack Next.js 15 con App Router y server components",
        "Reportes semanales impulsados por IA con Claude — análisis estructurado, no solo datos crudos",
        "Entrega nativa por WhatsApp formateada para lectura móvil",
        "Seguimiento de deltas semana-a-semana de ranking y reseñas por par keyword-ubicación",
        "Soporte multi-organización con aislamiento completo de datos desde el día uno",
        "Arquitectura go-to-market por fases que escala de servicio manual a SaaS autoservicio",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los negocios locales en México no tienen forma accesible de rastrear sistemáticamente sus rankings en Google Maps o monitorear la actividad de competidores. Herramientas enterprise como BrightLocal y Whitespark no sirven bien al mercado mexicano — los precios están en dólares, el soporte es en inglés, y las herramientas asumen patrones de búsqueda centrados en EE.UU. Un competidor puede ganar 20 reseñas en una semana y saltar 3 posiciones en Maps, y sin rastreo sistemático, los negocios no se enteran hasta que su teléfono deja de sonar. La mayoría de herramientas de ranking muestran datos pero no te dicen que hacer. Y en México, los reportes por email se ignoran — WhatsApp es donde sucede el negocio.",
      resultsTitle: "Resultados",
      results: [
        "Inteligencia competitiva estructurada que negocios multi-sucursal antes no tenían forma de acceder",
        "Una recomendación accionable por semana reduce la fatiga de decisiones y genera mejoras especificas",
        "Entrega por WhatsApp logra tasas de lectura superiores a alternativas basadas en email",
        "Análisis generado por IA convierte datos crudos de ranking en lenguaje de negocio que los dueños entienden",
        "Arquitectura por fases valida demanda de mercado antes de invertir en automatización completa",
        "Oferta más diferenciada en el portafolio de CushLabs — ningún competidor ofrece esto en el mercado mexicano",
      ],
    },
  },
  "context-writing-system": {
    slug: "context-writing-system",
    demoUrl: "https://context-writing-system.vercel.app",
    en: {
      headline:
        "AI Writing System — Clone Your Brand Voice Once, Write Everywhere",
      subheadline:
        "A structured framework that makes AI write like you instead of like AI. Persistent JSON truth files lock your voice, audience, business facts, and claim rules — then enforce them across every content channel with zero drift.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "The AI Writing System solves the root cause of why AI-generated content sounds generic: every chat session starts from zero. This framework stores your reality in four persistent JSON truth files — Voice DNA, Business Profile, Ideal Client Profile, and Claims Policy — loaded before every generation. Format-specific skill files provide structure for each content type. A hierarchical control stack (Truth > Voice > Audience > Format) eliminates conflicting instructions. The result: first drafts that arrive ready for review instead of rewriting, zero hallucinated claims, and one consistent voice across every platform. The system is tool-agnostic — it works with Claude, ChatGPT, Cursor, or any RAG-capable system.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Four JSON truth files as infrastructure — voice, business, audience, and claims loaded before every generation",
        "Claims Policy Engine blocks hallucinated metrics, fabricated testimonials, and unsupported statements at the system level",
        "Hierarchical control stack: Truth > Voice > Audience > Format — strict priority ordering eliminates ambiguity",
        "One markdown skill file per content type with inputs, structure, QA checklist, and constraints",
        "Knowledge compounding — gold-standard examples and reusable templates feed back into the system",
        "Static Explorer UI in vanilla HTML/CSS/JS with trust-level badges, markdown rendering, zero build tooling",
        "Tool-agnostic design — markdown + JSON works with any LLM or RAG system, no vendor lock-in",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Consultants and founders scaling content without losing their voice",
        "Businesses where AI-generated content needs to be factually correct and legally defensible",
        "Marketing teams tired of editing AI output more than they'd spend writing from scratch",
        "Anyone who wants their AI to get better over time instead of starting from zero every session",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Teams that need real-time collaborative editing of the truth files (this is file-based, not a CRUD app)",
        "Organizations requiring granular per-user voice variations within the same brand",
        "High-volume content mills where speed matters more than voice consistency",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Four-pillar truth file system: Voice DNA, Business Profile, Ideal Client Profile, Claims Policy",
        "Format-specific skill library with QA checklists and constraint enforcement",
        "Claims Policy Engine that prevents hallucination before content ships",
        "Static Explorer UI for browsing your entire writing system with trust-level badges",
        "Knowledge base of gold-standard examples that compounds with every successful piece",
        "Tool-agnostic architecture — works with Claude, ChatGPT, Cursor, or any RAG system",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "AI-generated content starts strong but drifts into generic corporate filler within minutes. Teams spend more time editing AI output than they saved generating it — killing hype, restoring voice, and fact-checking hallucinated claims. Every new chat session starts from zero because there's no persistent memory of who you are, what you sell, or what you're allowed to say. The result: prompt engineering that's disposable, instructions scattered across dozens of chat tabs, and a productivity tool that became an editing burden.",
      resultsTitle: "Results",
      results: [
        "First drafts arrive ready for review — editing time drops from 45 minutes to 5 minutes per asset",
        "Zero hallucinated claims — if it violates the Claims Policy, it doesn't ship",
        "One identity, consistent across every platform and content channel with no drift",
        "System compounds with use — your best work becomes fuel for the next asset",
        "Tool-agnostic design means zero vendor lock-in — switch LLMs without rebuilding your voice system",
      ],
    },
    es: {
      headline:
        "Sistema de Escritura IA — Clona Tu Voz de Marca Una Vez, Escribe en Todos Lados",
      subheadline:
        "Un framework estructurado que hace que la IA escriba como tú en vez de como IA. Archivos JSON persistentes bloquean tu voz, audiencia, hechos de negocio y reglas de claims — luego los aplican en cada canal de contenido sin drift.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "El Sistema de Escritura IA resuelve la causa raíz de por que el contenido generado por IA suena genérico: cada sesión de chat arranca desde cero. Este framework almacena tu realidad en cuatro archivos JSON persistentes de verdad — ADN de Voz, Perfil de Negocio, Perfil de Cliente Ideal y Política de Claims — cargados antes de cada generación. Archivos de habilidades por formato proveen estructura para cada tipo de contenido. Un stack de control jerárquico (Verdad > Voz > Audiencia > Formato) elimina instrucciones conflictivas. El resultado: primeros borradores listos para revisión en vez de reescritura, cero claims alucinados, y una voz consistente en cada plataforma. El sistema es agnóstico de herramientas — funciona con Claude, ChatGPT, Cursor o cualquier sistema capaz de RAG.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Cuatro archivos JSON de verdad como infraestructura — voz, negocio, audiencia y claims cargados antes de cada generación",
        "Motor de Política de Claims bloquea métricas alucinadas, testimonios fabricados y afirmaciones sin respaldo a nivel de sistema",
        "Stack de control jerárquico: Verdad > Voz > Audiencia > Formato — ordenamiento estricto de prioridades elimina ambigüedad",
        "Un archivo markdown de habilidad por tipo de contenido con inputs, estructura, checklist QA y restricciones",
        "Conocimiento que se acumula — ejemplos gold-standard y plantillas reutilizables retroalimentan el sistema",
        "UI Explorer estática en HTML/CSS/JS vanilla con badges de nivel de confianza, renderizado markdown, cero tooling de build",
        "Diseño agnóstico de herramientas — markdown + JSON funciona con cualquier LLM o sistema RAG, sin vendor lock-in",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Consultores y fundadores escalando contenido sin perder su voz",
        "Negocios donde el contenido generado por IA necesita ser factualmente correcto y legalmente defendible",
        "Equipos de marketing cansados de editar output de IA más de lo que tardarían escribiendo desde cero",
        "Cualquiera que quiera que su IA mejore con el tiempo en vez de arrancar desde cero cada sesión",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Equipos que necesitan edición colaborativa en tiempo real de los archivos de verdad (esto es basado en archivos, no una app CRUD)",
        "Organizaciones que requieren variaciones de voz granulares por usuario dentro de la misma marca",
        "Fabricas de contenido de alto volumen donde la velocidad importa más que la consistencia de voz",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Sistema de archivos de verdad de cuatro pilares: ADN de Voz, Perfil de Negocio, Perfil de Cliente Ideal, Política de Claims",
        "Biblioteca de habilidades por formato con checklists QA y aplicación de restricciones",
        "Motor de Política de Claims que previene alucinaciones antes de que el contenido se publique",
        "UI Explorer estática para navegar tu sistema de escritura completo con badges de nivel de confianza",
        "Base de conocimiento de ejemplos gold-standard que se acumula con cada pieza exitosa",
        "Arquitectura agnóstica de herramientas — funciona con Claude, ChatGPT, Cursor o cualquier sistema RAG",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "El contenido generado por IA arranca fuerte pero se desliza hacia relleno corporativo genérico en minutos. Los equipos gastan más tiempo editando output de IA del que ahorraron generandolo — matando entusiasmo, restaurando voz y verificando claims alucinados. Cada nueva sesión de chat arranca desde cero porque no hay memoria persistente de quien eres, que vendes o que tienes permitido decir. El resultado: prompt engineering desechable, instrucciones dispersas en docenas de pestañas de chat, y una herramienta de productividad que se convirtió en una carga de edición.",
      resultsTitle: "Resultados",
      results: [
        "Primeros borradores llegan listos para revisión — tiempo de edición baja de 45 minutos a 5 minutos por pieza",
        "Cero claims alucinados — si viola la Política de Claims, no se publica",
        "Una identidad, consistente en cada plataforma y canal de contenido sin drift",
        "El sistema se acumula con el uso — tu mejor trabajo se convierte en combustible para la siguiente pieza",
        "Diseño agnóstico de herramientas significa cero vendor lock-in — cambia de LLM sin reconstruir tu sistema de voz",
      ],
    },
  },
  "cushlabs-scrollytelling": {
    slug: "cushlabs-scrollytelling",
    demoUrl: "https://scrollytelling.cushlabs.ai",
    en: {
      headline:
        "CushLabs Scrollytelling — Cinematic Pitch Decks That Win Attention",
      subheadline:
        "Config-driven Astro template with dual-mode interaction: auto-narrated presentation mode for board meetings and free-browse mode for due diligence. New pitch decks ship in hours, not weeks.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "Traditional pitch decks are forgettable — investors see hundreds of static slide presentations every month. CushLabs Scrollytelling replaces them with cinematic web experiences that command attention. Dual-mode interaction lets presenters auto-advance through a narrated sequence for board meetings, or let investors browse freely for due diligence. The entire experience is config-driven — colors, fonts, content, and section structure come from a single TypeScript file, so new pitch decks ship in hours instead of weeks. Built on Astro 5 with Svelte 5 islands, the template scores 98 on Lighthouse while delivering Matrix rain effects, typewriter animations, and procedural audio.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Presentation mode with scroll-lock, auto-advance, and synchronized narration for board meetings",
        "Instant EN/ES language switching without page reloads via CSS visibility toggles",
        "Config-driven theming — colors, fonts, content, and structure from a single TypeScript file",
        "98 Lighthouse performance score with Astro islands architecture — Svelte 5 only hydrates where needed",
        "Scroll-triggered animations: typewriter text, Matrix rain effect, parallax backgrounds, fade reveals",
        "Mobile-responsive with scroll-snap carousels and touch support",
        "Consultation booking flow integrated directly into the scrollytelling experience",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Startups pitching to investors who want to stand out from hundreds of slide decks",
        "Agencies and consultancies creating premium pitch experiences for high-value prospects",
        "Organizations needing bilingual pitch materials that feel equally polished in both languages",
        "Technical founders who want a reusable template for future pitch decks without rebuilding from scratch",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Teams needing real-time collaborative editing of pitch content (config file requires code access)",
        "Print-friendly pitch materials (this is a web-first experience)",
        "Presentations requiring complex data visualizations or live charts",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Astro 5 + Svelte 5 scrollytelling template with dual presentation/browse modes",
        "Config-driven content system — swap the TypeScript config file, get a new pitch deck",
        "Full bilingual EN/ES with instant language switching",
        "Cinematic effects: typewriter text, Matrix rain, parallax, fade reveals, procedural audio",
        "Integrated consultation booking flow with calendar integration",
        "98 Lighthouse score — performance doesn't sacrifice for visual impact",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Traditional pitch decks are forgettable. Investors see hundreds of static slide presentations every month, and most blur together. Custom scrollytelling experiences take weeks to build and produce one-off code that can't be reused. The result: either you send forgettable slides, or you invest weeks in a custom build that only works once. Bilingual markets add another layer — maintaining two equally polished versions of a pitch doubles the production effort.",
      resultsTitle: "Results",
      results: [
        "Cinematic web experiences that command attention in a sea of static slide decks",
        "New pitch decks ship in hours via config swap — no rebuild, no redesign",
        "Dual-mode interaction serves both live presentations and async due diligence",
        "98 Lighthouse score proves you don't have to sacrifice performance for visual impact",
        "Bilingual support means one template serves both US and Latin American audiences",
        "Integrated booking flow converts pitch interest into scheduled conversations",
      ],
    },
    es: {
      headline:
        "CushLabs Scrollytelling — Pitch Decks Cinemáticos Que Capturan Atención",
      subheadline:
        "Template Astro dirigido por configuración con interacción dual: modo presentación auto-narrado para juntas directivas y modo navegación libre para due diligence. Nuevos pitch decks se entregan en horas, no semanas.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "Los pitch decks tradicionales son olvidables — los inversionistas ven cientos de presentaciones estáticas cada mes. CushLabs Scrollytelling los reemplaza con experiencias web cinemáticas que capturan atención. La interacción dual permite a los presentadores avanzar automáticamente a través de una secuencia narrada para juntas directivas, o dejar que los inversionistas naveguen libremente para due diligence. Toda la experiencia está dirigida por configuración — colores, fuentes, contenido y estructura de secciones vienen de un solo archivo TypeScript, para que nuevos pitch decks se entreguen en horas en vez de semanas. Construido sobre Astro 5 con islas Svelte 5, el template puntúa 98 en Lighthouse mientras entrega efectos Matrix rain, animaciones typewriter y audio procedural.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Modo presentación con scroll-lock, auto-avance y narración sincronizada para juntas directivas",
        "Cambio instantáneo de idioma EN/ES sin recarga de pagina vía toggles de visibilidad CSS",
        "Tematizacion dirigida por configuración — colores, fuentes, contenido y estructura desde un solo archivo TypeScript",
        "98 en Lighthouse con arquitectura de islas Astro — Svelte 5 solo hidrata donde se necesita",
        "Animaciones activadas por scroll: texto typewriter, efecto Matrix rain, fondos parallax, revelaciones con fade",
        "Responsivo en móvil con carruseles scroll-snap y soporte táctil",
        "Flujo de reserva de consultoría integrado directamente en la experiencia scrollytelling",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Startups presentando a inversionistas que quieren destacar entre cientos de decks de diapositivas",
        "Agencias y consultorías creando experiencias premium de pitch para prospectos de alto valor",
        "Organizaciones que necesitan materiales de pitch bilingües que se sientan igualmente pulidos en ambos idiomas",
        "Fundadores técnicos que quieren un template reutilizable para futuros pitch decks sin reconstruir desde cero",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Equipos que necesitan edición colaborativa en tiempo real del contenido de pitch (el archivo de configuración requiere acceso al código)",
        "Materiales de pitch para imprimir (esta es una experiencia web-first)",
        "Presentaciones que requieren visualizaciones de datos complejas o gráficas en vivo",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Template scrollytelling Astro 5 + Svelte 5 con modos duales presentación/navegación",
        "Sistema de contenido dirigido por configuración — cambia el archivo TypeScript, obtiene un nuevo pitch deck",
        "Bilingüe completo EN/ES con cambio de idioma instantáneo",
        "Efectos cinemáticos: texto typewriter, Matrix rain, parallax, revelaciones fade, audio procedural",
        "Flujo de reserva de consultoría integrado con integración de calendario",
        "98 en Lighthouse — el rendimiento no se sacrifica por el impacto visual",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los pitch decks tradicionales son olvidables. Los inversionistas ven cientos de presentaciones estáticas cada mes, y la mayoría se difuminan entre si. Las experiencias scrollytelling personalizadas toman semanas en construirse y producen código de un solo uso que no se puede reutilizar. El resultado: o envías diapositivas olvidables, o inviertes semanas en un build personalizado que solo funciona una vez. Los mercados bilingües agregan otra capa — mantener dos versiones igualmente pulidas de un pitch duplica el esfuerzo de producción.",
      resultsTitle: "Resultados",
      results: [
        "Experiencias web cinemáticas que capturan atención en un mar de decks de diapositivas estáticos",
        "Nuevos pitch decks se entregan en horas vía cambio de configuración — sin rebuild, sin rediseno",
        "Interacción dual sirve tanto presentaciones en vivo como due diligence asíncrono",
        "98 en Lighthouse demuestra que no tienes que sacrificar rendimiento por impacto visual",
        "Soporte bilingüe significa que un template sirve tanto a audiencias de EE.UU. como de América Latina",
        "Flujo de reserva integrado convierte interés del pitch en conversaciones agendadas",
      ],
    },
  },
  "cushlabs-ai-unwatermark": {
    slug: "cushlabs-ai-unwatermark",
    demoUrl: "https://unwatermark.cushlabs.ai",
    en: {
      headline: "Unwatermark — AI-Powered Watermark Detection & Removal",
      subheadline:
        "A layered AI pipeline that detects and removes baked-in watermarks from images, PDFs, and presentations using EasyOCR, Florence-2, Grounded SAM, Claude Vision, and LaMa neural inpainting — with pixel-perfect precision.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "Unwatermark solves a problem no single AI model can handle alone: baked-in watermarks where the pixels replace original content — no layer to delete, no metadata to strip. The solution is a layered detection pipeline that starts cheap and escalates: EasyOCR catches text-based watermarks for free, Florence-2 handles visual detection, Grounded SAM produces pixel-perfect binary masks, and Claude Vision serves as a fallback for non-standard cases. Removal is handled by LaMa neural inpainting, which reconstructs what was beneath the watermark rather than cloning or blurring. Multi-pass processing catches residual marks across up to 3 detect-remove cycles. The tool runs as a production web app and CLI, processing 14-slide PPTX exports in under 60 seconds.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "Layered detection: EasyOCR → Florence-2 → Grounded SAM → Claude Vision → heuristic — each tier adds cost only when cheaper methods fail",
        "SAM pixel-perfect masking isolates exactly the watermark pixels, preventing collateral damage to adjacent content",
        "LaMa neural inpainting reconstructs texture and content rather than cloning or blurring",
        "Multi-pass pipeline with up to 3 detect-remove cycles catches marks only visible after first pass",
        "PPTX baseline reuse — first successful detection on any slide is cached for subsequent slides",
        "Provider-agnostic ML inference via Replicate API with swappable local/Modal backends",
        "NDJSON streaming progress for real-time UI updates during processing",
        "Stateless Docker deployment on Hetzner VPS behind Caddy with HTTPS",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Content creators cleaning NotebookLM, stock photo, and draft document watermarks",
        "Educators and presenters who need clean slide exports from watermarked sources",
        "Anyone evaluating production AI pipeline architecture with cost-aware model orchestration",
        "Professionals who need batch processing across images, PDFs, and PowerPoint files",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Large semi-transparent overlays covering 50%+ of the image (neural inpainting can't reconstruct that much content)",
        "Real-time video watermark removal (this processes static files)",
        "Removing invisible/steganographic watermarks embedded in frequency domain",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "Production web app with drag-and-drop upload and real-time streaming progress",
        "CLI for batch processing of images, PDFs, and PPTX files",
        "5-tier AI detection pipeline with cost-aware escalation",
        "LaMa neural inpainting for artifact-free removal",
        "Format-specific handlers for images, PDFs, and PowerPoint presentations",
        "Docker deployment with Caddy reverse proxy and HTTPS",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Exported slide decks and documents embed watermarks directly into raster images — there's no layer to delete. NotebookLM, stock photo sites, and draft PDFs all produce files where the watermark pixels replace original content. Manual Photoshop cleanup doesn't scale across dozens of slides. Detection is hard because watermarks range from small text labels to semi-transparent logos to rotated diagonal overlays. And aggressive removal destroys surrounding content while conservative removal leaves visible remnants.",
      resultsTitle: "Results",
      results: [
        "Clean PPTX, PDF, and image exports from watermarked sources in under 60 seconds",
        "Neural inpainting produces results visually indistinguishable from unwatermarked originals",
        "Cost-aware pipeline — free OCR handles 70% of cases before expensive vision models are needed",
        "Pixel-perfect SAM masking means zero collateral damage to content surrounding the watermark",
        "Production deployment at unwatermark.cushlabs.ai serving real users",
        "Practical exploration of AI precision limits — what works, what doesn't, documented honestly",
      ],
    },
    es: {
      headline:
        "Unwatermark — Detección y Eliminación de Marcas de Agua con IA",
      subheadline:
        "Un pipeline de IA en capas que detecta y elimina marcas de agua incrustadas en imágenes, PDFs y presentaciones usando EasyOCR, Florence-2, Grounded SAM, Claude Vision e inpainting neuronal LaMa — con precisión pixel-perfect.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "Unwatermark resuelve un problema que ningún modelo de IA puede manejar solo: marcas de agua incrustadas donde los pixeles reemplazan el contenido original — no hay capa que borrar, no hay metadata que eliminar. La solución es un pipeline de detección en capas que arranca barato y escala: EasyOCR atrapa marcas de agua de texto gratis, Florence-2 maneja detección visual, Grounded SAM produce mascaras binarias pixel-perfect, y Claude Vision sirve como respaldo para casos no estándar. La eliminación la maneja LaMa inpainting neuronal, que reconstruye lo que estaba debajo de la marca de agua en vez de clonar o difuminar. El procesamiento multi-pasada atrapa marcas residuales en hasta 3 ciclos detectar-eliminar. La herramienta corre como app web en producción y CLI, procesando exportaciones PPTX de 14 slides en menos de 60 segundos.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "Detección en capas: EasyOCR → Florence-2 → Grounded SAM → Claude Vision → heuristico — cada nivel agrega costo solo cuando métodos más baratos fallan",
        "Mascaras pixel-perfect de SAM aíslan exactamente los pixeles de la marca de agua, previniendo daño colateral al contenido adyacente",
        "Inpainting neuronal LaMa reconstruye textura y contenido en vez de clonar o difuminar",
        "Pipeline multi-pasada con hasta 3 ciclos detectar-eliminar atrapa marcas visibles solo después de la primera pasada",
        "Reutilización de baseline PPTX — primera detección exitosa en cualquier slide se cachea para slides subsecuentes",
        "Inferencia ML agnóstica de proveedor vía API Replicate con backends locales/Modal intercambiables",
        "Progreso streaming NDJSON para actualizaciones de UI en tiempo real durante el procesamiento",
        "Despliegue Docker sin estado en VPS Hetzner detrás de Caddy con HTTPS",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Creadores de contenido limpiando marcas de agua de NotebookLM, fotos stock y documentos borrador",
        "Educadores y presentadores que necesitan exportaciones limpias de slides de fuentes con marca de agua",
        "Cualquiera evaluando arquitectura de pipeline de IA en producción con orquestación de modelos consciente de costos",
        "Profesionales que necesitan procesamiento por lotes de imágenes, PDFs y archivos PowerPoint",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Overlays semi-transparentes grandes cubriendo 50%+ de la imagen (el inpainting neuronal no puede reconstruir tanto contenido)",
        "Eliminación de marcas de agua en video en tiempo real (esto procesa archivos estáticos)",
        "Eliminación de marcas de agua invisibles/esteganograficas embebidas en dominio de frecuencia",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "App web en producción con upload drag-and-drop y progreso streaming en tiempo real",
        "CLI para procesamiento por lotes de imágenes, PDFs y archivos PPTX",
        "Pipeline de detección IA de 5 niveles con escalacion consciente de costos",
        "Inpainting neuronal LaMa para eliminación sin artefactos",
        "Handlers específicos por formato para imágenes, PDFs y presentaciones PowerPoint",
        "Despliegue Docker con reverse proxy Caddy y HTTPS",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Los decks de diapositivas y documentos exportados incrustan marcas de agua directamente en imágenes raster — no hay capa que borrar. NotebookLM, sitios de fotos stock y PDFs borrador producen archivos donde los pixeles de la marca de agua reemplazan el contenido original. La limpieza manual en Photoshop no escala para docenas de slides. La detección es difícil porque las marcas de agua van desde etiquetas de texto pequeñas hasta logos semi-transparentes hasta overlays diagonales rotados. Y la eliminación agresiva destruye el contenido circundante mientras la eliminación conservadora deja restos visibles.",
      resultsTitle: "Resultados",
      results: [
        "Exportaciones limpias de PPTX, PDF e imágenes de fuentes con marca de agua en menos de 60 segundos",
        "El inpainting neuronal produce resultados visualmente indistinguibles de originales sin marca de agua",
        "Pipeline consciente de costos — OCR gratuito maneja 70% de casos antes de que se necesiten modelos de vision costosos",
        "Mascaras pixel-perfect de SAM significan cero daño colateral al contenido que rodea la marca de agua",
        "Despliegue en producción en unwatermark.cushlabs.ai sirviendo usuarios reales",
        "Exploración práctica de los límites de precisión de IA — que funciona, que no, documentado honestamente",
      ],
    },
  },
  "ai-resume-tailor": {
    slug: "ai-resume-tailor",
    demoUrl: "https://resume.cushlabs.ai",
    en: {
      headline: "AI Resume Tailor — Beat the ATS Black Box",
      subheadline:
        "A bilingual SaaS that shows job seekers exactly why their resumes get rejected by Applicant Tracking Systems — structured ATS feedback in under 10 seconds, 5 free analyses, zero data stored.",
      overallVerdictTitle: "The Solution",
      overallVerdictBody:
        "AI Resume Tailor opens the black box. Over 75% of resumes are rejected by ATS systems before a human ever sees them, and job seekers have no visibility into why. This application takes a resume and a job description, runs them through GPT-4 with structured JSON output and ATS-focused prompts, and returns a match score, missing keywords, and severity-coded suggestions — all in under 10 seconds. The product is designed around zero friction: guests get 5 free analyses with no signup. Privacy is enforced by architecture — no resume data is stored, ever. Full bilingual EN/ES support serves the underserved Latin American job market. Stripe handles the guest-to-paid conversion with embedded checkout.",
      whatItDoesWellTitle: "Technical Highlights",
      whatItDoesWell: [
        "GPT-4 with strict JSON mode and low temperature (0.1) for deterministic, structured ATS analysis",
        "Type-safe API contract — TypeScript interfaces with union types and transformation functions",
        "Zero data retention by architecture — resume text is never persisted, eliminating data liability",
        "5 free analyses with no signup — value delivered before asking for anything in return",
        "Severity-coded UI with red/amber/blue visual hierarchy mapped directly to AI output",
        "Embedded Stripe Checkout with post-payment account creation for seamless conversion",
        "Clerk webhook pipeline for automatic profile provisioning across all auth methods",
        "Skeleton loading states matching final render dimensions — zero layout shift",
      ],
      goodForTitle: "Good for",
      goodFor: [
        "Job seekers who've submitted dozens of applications without getting interviews",
        "Career coaches who need a tool to show clients specific resume improvements",
        "The Latin American job market where bilingual EN/ES tools are scarce",
        "Anyone studying how to build a privacy-first SaaS with AI, payments, and zero-friction onboarding",
      ],
      notForTitle: "Not a complete solution for",
      notFor: [
        "Automated resume rewriting (this analyzes and recommends, it doesn't rewrite for you)",
        "Cover letter or LinkedIn profile optimization (focused on resume-to-JD matching)",
        "Enterprise HR/recruiting platforms needing bulk processing and team management",
      ],
      whatYouGetTitle: "What you get",
      whatYouGet: [
        "React 19 + Flask full-stack SaaS with AI analysis, auth, and payments",
        "GPT-4 structured ATS analysis engine with match scoring and keyword extraction",
        "Zero-friction guest experience — 5 free analyses, no signup wall",
        "Privacy-first architecture — resume data never persisted",
        "Full bilingual EN/ES across every UI element and AI-generated analysis",
        "Stripe embedded checkout with Clerk authentication and Neon PostgreSQL",
      ],
      problemTitle: "The Challenge",
      problemBody:
        "Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever sees them. Job seekers submit into a black box with no visibility into why they're filtered out. Existing tools charge upfront, require accounts, or provide generic advice not tied to the specific job posting. The Latin American market is further underserved — English-only tools don't serve Spanish-speaking professionals, and machine-translated interfaces feel like afterthoughts.",
      resultsTitle: "Results",
      results: [
        "Structured, actionable ATS feedback delivered in under 10 seconds",
        "5 free analyses with no signup, no email, no commitment — value first, monetization second",
        "Zero resume data stored — privacy by architecture, not just by policy",
        "Native bilingual EN/ES serving an underserved market with first-class language support",
        "End-to-end product engineering: AI prompts, payment flows, auth, i18n, and privacy design",
      ],
    },
    es: {
      headline: "AI Resume Tailor — Vence la Caja Negra del ATS",
      subheadline:
        "Un SaaS bilingüe que muestra a buscadores de empleo exactamente por que sus CVs son rechazados por los Sistemas de Rastreo de Candidatos — feedback ATS estructurado en menos de 10 segundos, 5 análisis gratis, cero datos almacenados.",
      overallVerdictTitle: "La Solución",
      overallVerdictBody:
        "AI Resume Tailor abre la caja negra. Más del 75% de los CVs son rechazados por sistemas ATS antes de que un humano los vea, y los buscadores de empleo no tienen visibilidad de por que. Esta aplicación toma un CV y una descripción de puesto, los procesa con GPT-4 con salida JSON estructurada y prompts enfocados en ATS, y devuelve un score de match, keywords faltantes y sugerencias codificadas por severidad — todo en menos de 10 segundos. El producto está diseñado alrededor de cero fricción: los invitados obtienen 5 análisis gratis sin registro. La privacidad se aplica por arquitectura — ningún dato de CV se almacena, nunca. Soporte bilingüe completo EN/ES sirve al mercado laboral latinoamericano desatendido. Stripe maneja la conversión de invitado a usuario de pago con checkout embebido.",
      whatItDoesWellTitle: "Destacados Técnicos",
      whatItDoesWell: [
        "GPT-4 con modo JSON estricto y temperatura baja (0.1) para análisis ATS estructurado y deterministico",
        "Contrato API type-safe — interfaces TypeScript con union types y funciones de transformación",
        "Cero retención de datos por arquitectura — el texto del CV nunca se persiste, eliminando responsabilidad de datos",
        "5 análisis gratis sin registro — valor entregado antes de pedir cualquier cosa a cambio",
        "UI codificada por severidad con jerarquía visual rojo/ámbar/azul mapeada directamente al output de IA",
        "Stripe Checkout embebido con creación de cuenta post-pago para conversión fluida",
        "Pipeline de webhooks Clerk para aprovisionamiento automático de perfiles en todos los métodos de auth",
        "Estados de carga skeleton que coinciden con dimensiones del render final — cero layout shift",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Buscadores de empleo que han enviado docenas de aplicaciones sin obtener entrevistas",
        "Coaches de carrera que necesitan una herramienta para mostrar a clientes mejoras especificas en su CV",
        "El mercado laboral latinoamericano donde herramientas bilingües EN/ES son escasas",
        "Cualquiera estudiando como construir un SaaS privacy-first con IA, pagos y onboarding sin fricción",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Reescritura automatizada de CVs (esto analiza y recomienda, no reescribe por ti)",
        "Optimización de carta de presentación o perfil de LinkedIn (enfocado en match CV-a-puesto)",
        "Plataformas enterprise de HR/recruiting que necesitan procesamiento masivo y gestión de equipos",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "SaaS full-stack React 19 + Flask con análisis IA, auth y pagos",
        "Motor de análisis ATS estructurado con GPT-4, scoring de match y extracción de keywords",
        "Experiencia de invitado sin fricción — 5 análisis gratis, sin muro de registro",
        "Arquitectura privacy-first — datos de CV nunca se persisten",
        "Bilingüe completo EN/ES en cada elemento de UI y análisis generado por IA",
        "Stripe checkout embebido con autenticación Clerk y Neon PostgreSQL",
      ],
      problemTitle: "El Desafío",
      problemBody:
        "Más del 75% de los CVs son rechazados por Sistemas de Rastreo de Candidatos antes de que un humano los vea. Los buscadores de empleo envían a una caja negra sin visibilidad de por que son filtrados. Las herramientas existentes cobran por adelantado, requieren cuentas o dan consejos genéricos no vinculados al puesto especifico. El mercado latinoamericano está aún más desatendido — herramientas solo en inglés no sirven a profesionales hispanohablantes, y las interfaces traducidas por máquina se sienten como ocurrencias tardías.",
      resultsTitle: "Resultados",
      results: [
        "Feedback ATS estructurado y accionable entregado en menos de 10 segundos",
        "5 análisis gratis sin registro, sin email, sin compromiso — valor primero, monetizacion después",
        "Cero datos de CV almacenados — privacidad por arquitectura, no solo por política",
        "Bilingüe nativo EN/ES sirviendo un mercado desatendido con soporte de idioma de primera clase",
        "Ingeniería de producto de principio a fin: prompts de IA, flujos de pago, auth, i18n y diseño de privacidad",
      ],
    },
  },
};

export function getProjectDetailOverride(
  slug: string,
): ProjectDetailOverride | null {
  return details[slug] ?? null;
}
