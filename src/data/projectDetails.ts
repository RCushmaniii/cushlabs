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
  videoPoster?: string;
  images?: { src: string; alt: { en: string; es: string } }[];
  en: ProjectDetailLocale;
  es: ProjectDetailLocale;
};

const details: Record<string, ProjectDetailOverride> = {
  "cushlabs": {
    slug: "cushlabs",
    demoUrl: "https://cushlabs.ai",
    thumbnail: "/images/portfolio/cushlabs-thumb.webp",
    videoUrl: "/images/portfolio/cushlabs-brief.mp4",
    videoPoster: "/images/portfolio/cushlabs-brief-poster.webp",
    images: [
      { src: "/images/portfolio/cushlabs-01.webp", alt: { en: "CushLabs AI Services — The Self-Maintaining Bilingual Portfolio", es: "CushLabs AI Services — El Portafolio Bilingüe Auto-Mantenido" } },
      { src: "/images/portfolio/cushlabs-02.webp", alt: { en: "Not Just a Website, But a System — bilingual, automated sync, serverless booking", es: "No Solo un Sitio Web, Sino un Sistema — bilingüe, sincronización automatizada, reservas serverless" } },
      { src: "/images/portfolio/cushlabs-03.webp", alt: { en: "Premium Design is About Behavior — zero-flash theming, time-based dark mode, micro-interactions", es: "El Diseño Premium es Sobre Comportamiento — temas sin flash, modo oscuro basado en hora, micro-interacciones" } },
      { src: "/images/portfolio/cushlabs-04.webp", alt: { en: "Engineering Visibility — the enterprise SEO stack with JSON-LD, hreflang, and lazy loading", es: "Visibilidad de Ingeniería — el stack SEO empresarial con JSON-LD, hreflang y carga lazy" } },
      { src: "/images/portfolio/cushlabs-05.webp", alt: { en: "True Bilingual Architecture — 24-line custom TypeScript i18n vs 40KB+ i18next", es: "Arquitectura Bilingüe Real — i18n TypeScript personalizado de 24 líneas vs i18next de 40KB+" } },
      { src: "/images/portfolio/cushlabs-06.webp", alt: { en: "The Serverless Booking Wizard — Cloudflare Worker to Google Calendar API, 3-step flow", es: "El Asistente de Reservas Serverless — Cloudflare Worker a Google Calendar API, flujo de 3 pasos" } },
      { src: "/images/portfolio/cushlabs-07.webp", alt: { en: "Localization Beyond Language — WhatsApp integration with locale-aware pre-filled messages", es: "Localización Más Allá del Idioma — integración WhatsApp con mensajes prellenados según el idioma" } },
      { src: "/images/portfolio/cushlabs-08.webp", alt: { en: "Security and Anti-Scraping — split-attribute email obfuscation", es: "Seguridad y Anti-Scraping — ofuscación de email por atributos divididos" } },
      { src: "/images/portfolio/cushlabs-09.webp", alt: { en: "Fluid Typography and Responsive Design — clamp()-based scaling across all viewports", es: "Tipografía Fluida y Diseño Responsivo — escalado con clamp() en todas las pantallas" } },
      { src: "/images/portfolio/cushlabs-10.webp", alt: { en: "Modern Services Page — scenario-based navigation with SVG icons and conversion-focused layout", es: "Página de Servicios Moderna — navegación por escenarios con íconos SVG y diseño orientado a conversión" } },
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
        "27 portfolio projects synced automatically from GitHub with zero manual maintenance",
        "Full bilingual parity enforced by automated pre-deploy audit — no translation drift",
        "Zero-runtime i18n: 24 lines of TypeScript vs ~40KB+ for i18next",
        "Booking flow creates Google Calendar events with Meet links — no third-party embed",
        "Static HTML output with zero server runtime cost on Vercel",
        "Pre-paint theme script eliminates flash-of-wrong-theme on every page load",
      ],
    },
    es: {
      headline: "CushLabs.ai — El Portafolio Bilingue Auto-Mantenido",
      subheadline:
        "Un sitio de marketing estatico que supera sus expectativas: sincronizacion automatica de portafolio desde GitHub, asistente de reservas serverless personalizado, sistema i18n de 24 lineas y SEO empresarial — todo desplegado como HTML estatico en Vercel.",
      overallVerdictTitle: "La Solucion",
      overallVerdictBody:
        "CushLabs.ai no es solo un sitio de marketing — es un sistema de portafolio auto-mantenido. Un pipeline de GitHub Actions sincroniza todos los repos publicos semanalmente, extrayendo metadatos, URLs de demo de los READMEs y desgloses de lenguajes. Las sobrecargas de contenido enriquecido agregan copy de marketing curado sobre los datos auto-sincronizados. Un Cloudflare Worker personalizado consulta la API FreeBusy de Google Calendar para disponibilidad de reservas en tiempo real. Un sistema i18n TypeScript de 24 lineas reemplaza i18next sin overhead en runtime. Y una auditoria pre-deploy detecta traducciones faltantes, secretos filtrados y builds rotos antes de que algo llegue a produccion.",
      whatItDoesWellTitle: "Destacados Tecnicos",
      whatItDoesWell: [
        "Pipeline automatizado GitHub-a-sitio via Actions + Octokit — cero entrada manual de datos",
        "i18n TypeScript personalizado de 24 lineas con tree-shaking en build — sin i18next, sin bloat en runtime",
        "Asistente de reservas serverless: Cloudflare Worker + API FreeBusy de Google Calendar + links Meet auto-generados",
        "Modo oscuro por defecto basado en hora (7am–7pm Ciudad de Mexico) con script pre-paint para prevenir FOUC",
        "Precarga de video con requestIdleCallback — cero bytes en carga inicial, protege Core Web Vitals",
        "Auditoria pre-deploy: deteccion de secretos filtrados, verificacion de paridad i18n, validacion de artefactos de build",
        "Ofuscacion anti-scraper de email via atributos de datos divididos ensamblados solo en JS del cliente",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Consultorias que necesitan un sitio de marketing bilingue que se mantenga actualizado automaticamente",
        "Fundadores individuales que quieren un portafolio que se actualiza solo al pushear codigo a GitHub",
        "Negocios que sirven mercados LATAM y necesitan WhatsApp como canal de contacto de primera clase",
        "Cualquiera que quiera un flujo de reservas personalizado sin embeber iframes de Calendly o Cal.com",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Sitios que necesitan mas de dos idiomas (el sistema i18n esta construido para EN/ES)",
        "E-commerce o sitios transaccionales que requieren renderizado del lado del servidor",
        "Equipos que necesitan un CMS para editores de contenido no tecnicos",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Sitio estatico Astro 4 con Tailwind CSS y seguridad de tipos TypeScript completa",
        "Sincronizacion automatica de portafolio via GitHub Actions (semanal + bajo demanda)",
        "Sistema de reservas personalizado: Cloudflare Worker + integracion Google Calendar",
        "SEO empresarial: hreflang, JSON-LD, Open Graph, Twitter Cards, sitemap automatico",
        "Script de auditoria pre-deploy con 6 verificaciones de validacion",
        "Diseno premium: textura SVG de ruido, orbes de gradiente, animaciones escalonadas, micro-interacciones",
      ],
      problemTitle: "El Desafio",
      problemBody:
        "Construir un sitio de marketing bilingue para una consultoria que sirve a EE.UU. y Mexico introduce complejidad acumulada: cada pagina necesita paridad completa de contenido en dos idiomas, el portafolio se vuelve obsoleto en el momento en que dejas de actualizarlo manualmente, los widgets de reservas de terceros rompen la consistencia del diseno, y el SEO para sitios bilingues es notoriamente complicado con hreflang, URLs canonicas y sitemaps que deben cubrir ambos idiomas correctamente. La mayoria de las soluciones involucran bibliotecas i18n pesadas, plataformas CMS y widgets de terceros embebidos — agregando costo, complejidad y overhead en runtime a lo que deberia ser un sitio estatico rapido.",
      resultsTitle: "Resultados",
      results: [
        "27 proyectos de portafolio sincronizados automaticamente desde GitHub sin mantenimiento manual",
        "Paridad bilingue completa aplicada por auditoria pre-deploy automatizada — sin drift de traducciones",
        "i18n sin runtime: 24 lineas de TypeScript vs ~40KB+ para i18next",
        "Flujo de reservas crea eventos de Google Calendar con links Meet — sin embed de terceros",
        "Salida HTML estatica con cero costo de runtime de servidor en Vercel",
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
        "Una plataforma de generacion de leads completamente automatizada que reemplaza cuatro roles — SDR, marketing, asistente ejecutiva y brand manager — con $0/mes de infraestructura para un negocio de coaching premium.",
      overallVerdictTitle: "La Solucion",
      overallVerdictBody:
        "NY English Teacher es una plataforma de generacion de leads y conversion de clientes en produccion, construida para un negocio de coaching premium operado por una sola persona en Guadalajara, Mexico. La plataforma reemplaza cuatro roles que una agencia tradicional staffearia con humanos usando sistemas automatizados que corren en infraestructura de tier gratuito. Cuatro quizzes diagnosticos precalifican leads con brechas de comunicacion mapeadas. Un flujo de reservas de 3 pasos via Cloudflare Workers crea sesiones confirmadas de Google Meet en menos de 60 segundos. Un espejo bilingue completo EN/ES con enrutamiento localizado duplica el mercado alcanzable desde una sola base de codigo. Y el posicionamiento premium esta integrado en la UX con testimonios ejecutivos reales de Driscoll's, CEVA Logistics y mas — sin codigos de descuento, sin tier de entrada.",
      whatItDoesWellTitle: "Destacados Tecnicos",
      whatItDoesWell: [
        "Arquitectura static-first: Astro 5.5 pre-renderiza cada pagina a HTML estatico — cero consultas a base de datos, cero errores runtime, Lighthouse 100",
        "API de reservas en el edge: Cloudflare Workers manejan Google Calendar OAuth con cache de tokens de 1 hora, resolucion de conflictos dual-calendario y rate limiting por IP",
        "Captura de leads serverless: Los envios de quizzes llegan a una funcion serverless de Vercel que escribe en Neon PostgreSQL con scores, analisis de brechas y parametros UTM",
        "Enrutamiento bilingue type-safe: Sistema central TKey mapea cada pagina a rutas EN/ES — hreflang, sitemap y navegacion se generan automaticamente",
        "Deteccion de estado de memes en build-time: Portafolio de 80 memes usa un modulo de deteccion que escanea directorios de imagenes en tiempo de build",
        "$0 de infraestructura: Astro en Hostinger (estatico), Cloudflare Workers (tier gratis), Neon PostgreSQL (tier gratis), Vercel serverless (tier gratis)",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Proveedores de servicios profesionales independientes que necesitan competir con agencias staffeadas sin contratar",
        "Negocios de coaching y consultoria premium que necesitan justificar precios 3-5x del mercado a traves de su sitio web",
        "Negocios bilingues que sirven mercados EE.UU.-Mexico y necesitan paridad completa de contenido EN/ES",
        "Cualquiera que gaste 10-15 horas/semana en calificacion manual, agendamiento y seguimientos",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Negocios que necesitan capacidades de e-commerce o transaccionales",
        "Equipos que requieren un CMS para editores de contenido no tecnicos",
        "Sitios multi-idioma mas alla de ingles y espanol",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Sitio estatico Astro 5.5 + React 19 con seguridad de tipos TypeScript completa",
        "4 quizzes diagnosticos por rol con captura de leads en Neon PostgreSQL",
        "Sistema de reservas Cloudflare Worker con integracion Google Calendar y links Meet auto-generados",
        "Espejo bilingue completo EN/ES con SEO hreflang y enrutamiento localizado",
        "80 memes compartibles, 15+ plantillas descargables y 13+ articulos de blog para marketing de contenido",
        "Sistema de posicionamiento premium con testimonios ejecutivos reales y sin senales de precios commodity",
      ],
      problemTitle: "El Desafio",
      problemBody:
        "Los proveedores de servicios profesionales independientes enfrentan una desventaja estructural contra agencias staffeadas: la calificacion manual quema 10-15 horas/semana de trabajo no remunerado, la friccion de agendamiento mata la conversion, los sitios web genericos no pueden justificar precios premium, y el mercado profesional hispanohablante esta desatendido. En el mercado de Guadalajara especificamente, el mercado local de tutoria de ingles esta saturado a precios commodity ($5-10/hora) con practicamente cero competencia en el segmento premium de coaching especifico por industria.",
      resultsTitle: "Resultados",
      results: [
        "La plataforma funciona como la unica operacion de ventas y marketing generando ingresos desde el dia uno",
        "La calificacion automatizada elimina 10-15 horas/semana de overhead administrativo",
        "Precio premium (500 MXN / $25 USD por sesion) sostenido a 3-5x la tarifa del mercado local",
        "El sistema bilingue captura busquedas en ingles (mayor intencion) y en espanol (mayor volumen)",
        "Puntuacion Lighthouse 100 — cero consultas a base de datos en carga de pagina",
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
        "Un dashboard full-stack en Next.js que reemplaza el malabarismo de pestanas y auditorias en hojas de calculo con una sola interfaz autenticada — 7 rutas API agregan repos de GitHub, pipeline de negocios, metas, tareas, logros y salud de infraestructura en 7 vistas especializadas.",
      overallVerdictTitle: "La Solucion",
      overallVerdictBody:
        "CushLabs OS es una aplicacion full-stack Next.js 15 que se autentica via GitHub OAuth y funciona como el sistema nervioso central de una consultoria multi-proyecto. Siete rutas API del lado del servidor manejan autenticacion, agregacion de datos, cache y health checks — todos los secretos permanecen en el servidor, toda la fusion de datos ocurre en tiempo de solicitud. El frontend renderiza siete vistas de dashboard especializadas, cada una disenada para una preocupacion operacional especifica: salud del portafolio, pipeline de desarrollo de negocios, seguimiento de metas en cuatro horizontes temporales, ejecucion de tareas, registro de logros, monitoreo de infraestructura y documentacion del sistema. Una arquitectura de enriquecimiento superpuesto mantiene las metricas en vivo de GitHub y el contexto de negocio curado en repos separados, fusionandolos en tiempo de solicitud para que ninguna fuente quede obsoleta.",
      whatItDoesWellTitle: "Destacados Tecnicos",
      whatItDoesWell: [
        "7 rutas API del lado del servidor con cache de 2 horas y bypass manual — los secretos nunca llegan al navegador",
        "Arquitectura de enriquecimiento superpuesto: metricas en vivo de GitHub fusionadas con metadatos de negocio en tiempo de solicitud, sin duplicacion",
        "Llamadas API en lotes via Promise.allSettled() en grupos de 10 — fallos individuales degradan gracilmente, el dashboard siempre renderiza",
        "Indicadores de obsolescencia computados con umbrales codificados por color (rojo >90 dias, amarillo >30 dias) para triaje visual instantaneo",
        "Monitoreo de salud de infraestructura con checks HTTP en tiempo real, graficas de tiempo de respuesta via Recharts y seguimiento de certificados SSL",
        "Renderizador de markdown personalizado para la vista Guia — soporte completo de markdown sin dependencias de bibliotecas externas",
        "Visualizaciones de barras apiladas en CSS puro para desglose de ingresos y distribucion de lenguajes — sin overhead de biblioteca de graficas",
      ],
      goodForTitle: "Ideal para",
      goodFor: [
        "Consultorias independientes que manejan 15+ repositorios y necesitan visibilidad agregada sin herramientas enterprise",
        "Fundadores tecnicos que quieren metricas operacionales junto a metricas de codigo en una sola vista",
        "Cualquiera que maneje un negocio multi-proyecto en GitHub y este cansado de cambiar pestanas y auditorias manuales",
        "Equipos que necesitan una alternativa ligera a Datadog/Grafana para monitoreo de infraestructura a pequena escala",
      ],
      notForTitle: "No resuelve por completo",
      notFor: [
        "Equipos grandes que necesitan control de acceso basado en roles mas alla de GitHub OAuth",
        "Organizaciones que requieren alertas en tiempo real o gestion de incidentes tipo PagerDuty",
        "Negocios que necesitan edicion colaborativa de metas y tareas (esto es lectura-de-JSON, no una app CRUD)",
      ],
      whatYouGetTitle: "Que obtienes",
      whatYouGet: [
        "Aplicacion full-stack Next.js 15 con React 19 y Tailwind CSS v4",
        "Autenticacion GitHub OAuth con listas de usuarios configurables",
        "7 vistas de dashboard: portafolio, desarrollo de negocios, metas, tareas, logros, infraestructura, guia",
        "7 rutas API con cache del lado del servidor, llamadas GitHub en lotes y degradacion gracil",
        "Monitoreo de salud de infraestructura con graficas de tiempo de respuesta y seguimiento SSL",
        "Sistema de temas claro/oscuro con deteccion de preferencia del sistema y persistencia en localStorage",
      ],
      problemTitle: "El Desafio",
      problemBody:
        "Operar una consultoria independiente con 15+ repositorios de GitHub crea puntos ciegos operacionales que se acumulan silenciosamente. GitHub muestra repos individuales pero no patrones a nivel de portafolio — tendencias de velocidad de commits, riesgos de concentracion de ingresos, brechas de cobertura de despliegues, o que repos se estan volviendo obsoletos. Metas estrategicas en cuatro horizontes (diario, semanal, trimestral, anual) viven en archivos JSON sin visualizacion. Pipelines de desarrollo de negocios — aplicaciones, propuestas, alcance — no tienen vista de embudo para analisis de conversion. Los logros se publican y desaparecen en el historial de commits sin registro buscable. La salud de infraestructura en multiples dominios requiere verificacion manual. El resultado: fatiga por cambio de contexto, riesgos ocultos, deuda de decisiones acumulada, y un operador que siempre reacciona en vez de comandar.",
      resultsTitle: "Resultados",
      results: [
        "Una sola interfaz autenticada reemplaza el malabarismo diario entre GitHub, hojas de calculo y verificaciones manuales",
        "15+ repositorios monitoreados con metricas de commits, estrellas y obsolescencia en tiempo real — salud del portafolio visible de un vistazo",
        "Pipeline de desarrollo de negocios visible para analisis de conversion con tasas de exito y desgloses por plataforma",
        "Progreso de metas rastreado en 4 horizontes temporales con advertencias automaticas de obsolescencia cuando las metas se estancan",
        "Filtrado sub-segundo del lado del cliente en todas las vistas interactivas — buscar, ordenar y filtrar sin recargas de pagina",
        "Salud de infraestructura de todos los sitios gestionados visible en una vista con historial de tiempos de respuesta y alertas SSL",
        "7 rutas API con cache de 2 horas reducen el consumo de la API de GitHub mientras soportan refresh manual instantaneo",
      ],
    },
  },
  "biojalisco-pitch": {
    slug: "biojalisco-pitch",
    demoUrl: "https://atlas-biodiversidad-pitch.vercel.app",
    en: {
      headline: "BioJalisco Pitch Site",
      subheadline: "Cinematic scrollytelling site pitching a citizen-science biodiversity platform for western Mexico",
      overallVerdictTitle: "The Verdict",
      overallVerdictBody: "A persuasion artifact built as a single self-contained HTML file with embedded images, bilingual content switching, procedural audio, and scroll-triggered animations. Demonstrates that high-impact storytelling doesn't require React or a build system.",
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
      headline: "Sitio de Presentación BioJalisco",
      subheadline: "Sitio de scrollytelling cinemático presentando una plataforma de biodiversidad de ciencia ciudadana para el occidente de México",
      overallVerdictTitle: "El Veredicto",
      overallVerdictBody: "Un artefacto de persuasión construido como un archivo HTML autocontenido con imágenes embebidas, cambio de contenido bilingüe, audio procedural y animaciones activadas por scroll. Demuestra que la narración de alto impacto no requiere React ni un sistema de compilación.",
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
};

export function getProjectDetailOverride(slug: string): ProjectDetailOverride | null {
  return details[slug] ?? null;
}
