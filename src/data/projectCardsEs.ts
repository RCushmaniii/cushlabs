// Spanish (es-MX) card copy for portfolio project cards.
//
// The generated portfolio data (`projects.generated.json`, built from each repo's
// PORTFOLIO.md) only carries English `title`/`tagline`. As a result, Spanish project
// cards — both the `/es/portfolio` grid and the "Proyectos Relacionados" rail on
// `/es/projects/[slug]` — rendered English text on the Spanish site.
//
// This map provides es-MX overrides keyed by project `name` (slug). Proper brand and
// product names are intentionally kept in English (Converso AI, BioJalisco, Unwatermark,
// AI FileSense, etc.); only descriptive titles and all taglines are translated. Any slug
// not present here falls back to the English value, so coverage can grow incrementally
// without breaking pages.
//
// Spanish standard: Mexican Professional Spanish (es-MX) — "tú", "prospecto" over "lead"
// in prose, "agendar". Common dev anglicisms (full-stack, pipeline, serverless, scroll)
// are kept as they read naturally to a Mexican technical audience.

export interface EsCardCopy {
  /** Omit to keep the English brand/product name. */
  title?: string;
  tagline?: string;
}

export const esCardCopy: Record<string, EsCardCopy> = {
  "ai-chatbot-saas": {
    title: "Converso AI — Recepción y Ventas con IA Bilingüe",
    tagline:
      "Plataforma de chatbot con IA bilingüe para negocios de servicios — atiende recepción y ventas las 24 horas",
  },
  "ny-ai-chatbot": {
    title: "Chatbot con IA para Sitios Web de PYMES",
    tagline:
      "Chatbot con IA para un negocio de coaching — convierte a los visitantes del sitio en llamadas agendadas; reemplazó 4 roles",
  },
  "cushlabs-messenger": {
    tagline:
      "El asistente de IA bilingüe 24/7 para Facebook Messenger — construido con el contenido de tu propio negocio, para que ningún prospecto se enfríe.",
  },
  "cushlabs-ai-voice-agent": {
    title: "Plataforma de Agente de Voz con IA",
    tagline:
      "Agentes telefónicos con IA que contestan llamadas, califican prospectos y agendan citas — 24/7, con respuesta en menos de 500 ms",
  },
  "cushlabs-marketsignal": {
    title: "MarketSignal — Inteligencia Competitiva Local con IA",
    tagline:
      "Monitoreo de competidores en Google Maps — reportes semanales directo a tu WhatsApp",
  },
  "cushlabs-sticker-gen": {
    tagline:
      "De hojas de stickers generadas con IA a una app de stickers bilingüe y firmada para WhatsApp — pipeline de procesamiento de imágenes y entrega completa en Android.",
  },
  "ny-english-messenger-bot": {
    title: "NY English Messenger — Asistente Bilingüe con IA",
    tagline:
      "El asistente de producción en Facebook Messenger para New York English — un estudio de inglés ejecutivo en Guadalajara — que atiende a prospectos 24/7 en inglés y español.",
  },
  "ny-eng": {
    tagline:
      "Sitio de generación de prospectos para un negocio de coaching de inglés — reemplazó 4 roles y opera por $0 al mes",
  },
  "biojalisco-species-id": {
    title: "Identificador de Especies BioJalisco",
    tagline:
      "Identificación de especies con IA para investigadores de conservación en México — tomas la foto y obtienes datos verificados de la especie",
  },
  "cushlabs-OS-dashboard": {
    tagline:
      "Centro de comando operativo full-stack con 7 rutas API, 7 vistas de panel e integración en vivo con GitHub para la salud del portafolio, metas, tareas y desarrollo de negocio",
  },
  "context-writing-system": {
    title: "Sistema de Escritura con IA",
    tagline:
      "Clona la voz de tu marca una sola vez — la IA escribe como tú en cada canal, sin desviarse",
  },
  "cushlabs-scrollytelling": {
    tagline: "Presentaciones bilingües cinematográficas que ganan la atención",
  },
  "cushlabs-ai-unwatermark": {
    tagline:
      "Elimina marcas de agua incrustadas de imágenes, PDFs y presentaciones con un pipeline de detección con IA por capas e inpainting neuronal",
  },
  "ai-resume-tailor": {
    tagline:
      "Optimización de CV para sistemas ATS con IA, soporte bilingüe y retroalimentación instantánea",
  },
  "biojalisco-pitch": {
    title: "BioJalisco — Sitio de Presentación Cinematográfico",
    tagline:
      "Sitio de pitch con scrollytelling cinematográfico e identificación de especies con IA para la plataforma de biodiversidad del occidente de México",
  },
  "ai-idea-validator": {
    tagline:
      "Evaluación implacable de la defensibilidad de una startup, con detección de contradicciones por IA",
  },
  "cushlabs-ai-marketing": {
    title: "Suite de Marketing con IA para Claude Code",
    tagline:
      "15 comandos que convierten Claude Code en una plataforma completa de análisis de marketing",
  },
  "ai-build-vs-outsource": {
    title: "Framework de Decisión: Construir vs. Subcontratar",
    tagline:
      "Herramientas de decisión interactivas con puntuación ponderada, modelado de costos y resultados listos para el consejo directivo",
  },
  "ai-filesense": {
    tagline:
      "Organizador de archivos con IA, local — privado, seguro y sin configuración",
  },
  "freelance-income-planner": {
    title: "Planificador de Ingresos Freelance",
    tagline:
      "Simulador de ingresos con enfoque en privacidad — observa cómo las tarifas, los impuestos y las monedas impactan lo que te llevas a casa",
  },
  "expat-driver-license-prep": {
    title: "ExpatDrive — Preparación Bilingüe para el Examen de Licencia",
    tagline:
      "Aprueba el examen de licencia de conducir en cualquier país — aunque todavía no hables el idioma.",
  },
  "stock-alert": {
    tagline:
      "App de escritorio para Windows con alertas de acciones en tiempo real vía WhatsApp y notificaciones de Windows",
  },
  "comp-plan-simulator": {
    title: "Simulador de Planes de Compensación",
    tagline:
      "Modela en tiempo real los cambios a un plan de compensación de venta directa antes de implementarlos",
  },
  cushlabs: {
    tagline:
      "Portafolio bilingüe auto-mantenido con agendamiento serverless e i18n forzado en tiempo de compilación",
  },
  "ai-portfolio": {
    tagline:
      "Sistema de portafolio estático que sincroniza los datos de proyectos desde repos de GitHub en una vitrina filtrable",
  },
  "ai-scrabble-practice": {
    tagline:
      "Cinco herramientas de práctica con IA respaldadas por un diccionario de 370 mil palabras",
  },
  "marble-does-not-yield": {
    tagline:
      "App web literaria bilingüe con narrativa guiada por scroll y cumplimiento WCAG AAA",
  },
  "cushlabs-image-portfolio": {
    tagline:
      "Galería de imágenes autenticada con lightbox, compartir por WhatsApp, conversión automática a WebP y soporte PWA",
  },
  "ai-filesense-website": {
    title: "Sitio Web de AI FileSense",
    tagline:
      "Sitio de marketing bilingüe con Lighthouse 100 y captura de prospectos",
  },
  "ai-stock-alert-website": {
    title: "Sitio Web de AI StockAlert",
    tagline:
      "Sitio de marketing SaaS bilingüe — 18 rutas, probado de extremo a extremo, cero costo de servidor",
  },
  "mazebreak-trello": {
    title: "Automatización de Tablero Trello — MazeBreak",
    tagline:
      "Aprovisionamiento idempotente de tableros de sprint vía API REST de Trello para desarrollo de juegos en Roblox",
  },
  "mazebreak-wiki": {
    tagline:
      "Wiki privada y buscable del documento de diseño de juego (GDD) para un equipo de desarrollo en Roblox",
  },
};

/** Returns es-MX card overrides for a project slug, or an empty object if none exist. */
export function getEsCardCopy(name: string): EsCardCopy {
  return esCardCopy[name] ?? {};
}
