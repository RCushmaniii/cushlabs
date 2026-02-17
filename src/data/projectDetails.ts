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
  demoUrl?: string;
  thumbnail?: string;
  videoUrl?: string;
  images?: { src: string; alt: { en: string; es: string } }[];
  en: ProjectDetailLocale;
  es: ProjectDetailLocale;
};

const details: Record<string, ProjectDetailOverride> = {
  "mazebreak-wiki": {
    slug: "mazebreak-wiki",
    demoUrl: "https://mazebreak-wiki.vercel.app",
    thumbnail: "https://opengraph.githubassets.com/1/RCushmaniii/mazebreak-wiki",
    images: [],
    en: {
      headline: "MazeBreak GDD Wiki",
      subheadline:
        "Private, searchable game design document wiki for a Roblox development team — 24 chapters, full-text fuzzy search, keyboard navigation, and Clerk authentication.",
      overallVerdictTitle: "Overview",
      overallVerdictBody:
        "The MazeBreak GDD Wiki transforms a 30+ page Game Design Document into a searchable, navigable web application with 24 chapters covering everything from combat systems and enemy AI to monetization strategy and technical architecture. It serves as the single source of truth for all game design decisions, accessible instantly from any browser while working in Roblox Studio.",
      whatItDoesWellTitle: "Technical highlights",
      whatItDoesWell: [
        "Full-text fuzzy search across 24 GDD chapters in under 50ms via Fuse.js",
        "Keyboard-driven navigation (Ctrl+K search, Ctrl+[ / Ctrl+] chapter nav)",
        "Content updates deploy automatically — edit markdown, push to Git, live in 60 seconds",
        "Restricted access via Clerk authentication with zero monthly cost",
        "357 KB gzipped bundle serving the entire GDD as a single-page application",
        "Dark mode UI designed for extended reference sessions alongside Roblox Studio",
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
        "Game design documents are typically 30+ page Word files that are difficult to navigate, search, and reference during active development. Team members waste time scrolling through monolithic documents to find specific stats, design rules, or system specifications. There is no fast way to cross-reference related systems or search across sections.",
      resultsTitle: "Results",
      results: [
        "Eliminated time spent scrolling through the Word document during development sessions",
        "Design rules and stat tables are accessible in 2-3 keystrokes from any browser",
        "Content stays current with the same Git workflow used for game code",
        "Both team members have authenticated access without sharing credentials",
        "357 KB gzipped bundle serving the entire GDD as a single-page application",
      ],
    },
    es: {
      headline: "MazeBreak GDD Wiki",
      subheadline:
        "Wiki privado y buscable del documento de diseño de juego para un equipo de desarrollo en Roblox — 24 capítulos, búsqueda fuzzy, navegación por teclado y autenticación con Clerk.",
      overallVerdictTitle: "Resumen",
      overallVerdictBody:
        "El MazeBreak GDD Wiki transforma un Documento de Diseño de Juego de más de 30 páginas en una aplicación web buscable y navegable con 24 capítulos que cubren desde sistemas de combate e IA de enemigos hasta estrategia de monetización y arquitectura técnica. Sirve como la fuente única de verdad para todas las decisiones de diseño, accesible al instante desde cualquier navegador mientras trabajas en Roblox Studio.",
      whatItDoesWellTitle: "Destacados técnicos",
      whatItDoesWell: [
        "Búsqueda fuzzy de texto completo en 24 capítulos del GDD en menos de 50ms vía Fuse.js",
        "Navegación por teclado (Ctrl+K búsqueda, Ctrl+[ / Ctrl+] nav entre capítulos)",
        "Actualizaciones de contenido se despliegan automáticamente — edita markdown, push a Git, en vivo en 60 segundos",
        "Acceso restringido con Clerk sin costo mensual",
        "Bundle de 357 KB gzipped sirviendo todo el GDD como aplicación de una sola página",
        "Interfaz en modo oscuro diseñada para sesiones extendidas junto a Roblox Studio",
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
        "Los documentos de diseño de juegos suelen ser archivos Word de más de 30 páginas difíciles de navegar, buscar y consultar durante el desarrollo activo. Los miembros del equipo pierden tiempo desplazándose por documentos monolíticos para encontrar estadísticas específicas, reglas de diseño o especificaciones del sistema. No hay forma rápida de hacer referencias cruzadas entre sistemas relacionados.",
      resultsTitle: "Resultados",
      results: [
        "Eliminó el tiempo perdido desplazándose por el documento Word durante sesiones de desarrollo",
        "Reglas de diseño y tablas de estadísticas accesibles en 2-3 teclas desde cualquier navegador",
        "El contenido se mantiene actualizado con el mismo flujo Git usado para el código del juego",
        "Ambos miembros del equipo tienen acceso autenticado sin compartir credenciales",
        "Bundle de 357 KB gzipped sirviendo todo el GDD como aplicación de una sola página",
      ],
    },
  },
  "mazebreak-trello": {
    slug: "mazebreak-trello",
    demoUrl: "https://mazebreak-trello.vercel.app",
    thumbnail: "https://mazebreak-trello.vercel.app/images/mazebreak-trello.jpg",
    videoUrl: "https://mazebreak-trello.vercel.app/video/MazeBreak__Sprint_as_Code.mp4",
    images: [
      { src: "https://mazebreak-trello.vercel.app/images/mazebreak-trello.jpg", alt: { en: "MazeBreak Trello — Sprint board provisioning landing page", es: "MazeBreak Trello — Landing page de aprovisionamiento de tableros sprint" } },
      { src: "https://mazebreak-trello.vercel.app/images/mazebreak-trello01.jpg", alt: { en: "Animated terminal demo showing board creation", es: "Demo animada de terminal mostrando creación de tablero" } },
      { src: "https://mazebreak-trello.vercel.app/images/mazebreak-trello02.jpg", alt: { en: "Interactive board hotspots and workflow lists", es: "Hotspots interactivos del tablero y listas de flujo" } },
      { src: "https://mazebreak-trello.vercel.app/images/mazebreak-trello03.jpg", alt: { en: "Card structure with checklists and dependencies", es: "Estructura de tarjetas con checklists y dependencias" } },
      { src: "https://mazebreak-trello.vercel.app/images/mazebreak-trello04.jpg", alt: { en: "Documentation site and setup instructions", es: "Sitio de documentación e instrucciones de configuración" } },
    ],
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
};

export function getProjectDetailOverride(slug: string): ProjectDetailOverride | null {
  return details[slug] ?? null;
}
