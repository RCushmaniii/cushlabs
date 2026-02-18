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
    thumbnail: "/images/portfolio/cushlabs-01.png",
    videoUrl: "/images/portfolio/cushlabs-brief.mp4",
    videoPoster: "/images/portfolio/cushlabs-video-poster.jpg",
    images: [
      { src: "/images/portfolio/cushlabs-01.png", alt: { en: "CushLabs AI Services — The Self-Maintaining Bilingual Portfolio", es: "CushLabs AI Services — El Portafolio Bilingue Auto-Mantenido" } },
      { src: "/images/portfolio/cushlabs-02.png", alt: { en: "Not Just a Website, But a System — bilingual, automated sync, serverless booking", es: "No Solo un Sitio Web, Sino un Sistema — bilingue, sincronizacion automatizada, reservas serverless" } },
      { src: "/images/portfolio/cushlabs-03.png", alt: { en: "Premium Design is About Behavior — zero-flash theming, time-based dark mode, micro-interactions", es: "El Diseno Premium es Sobre Comportamiento — temas sin flash, modo oscuro basado en hora, micro-interacciones" } },
      { src: "/images/portfolio/cushlabs-04.png", alt: { en: "Engineering Visibility — the enterprise SEO stack with JSON-LD, hreflang, and lazy loading", es: "Visibilidad de Ingenieria — el stack SEO empresarial con JSON-LD, hreflang y carga lazy" } },
      { src: "/images/portfolio/cushlabs-05.png", alt: { en: "True Bilingual Architecture — 24-line custom TypeScript i18n vs 40KB+ i18next", es: "Arquitectura Bilingue Real — i18n TypeScript personalizado de 24 lineas vs i18next de 40KB+" } },
      { src: "/images/portfolio/cushlabs-06.png", alt: { en: "The Serverless Booking Wizard — Cloudflare Worker to Google Calendar API, 3-step flow", es: "El Asistente de Reservas Serverless — Cloudflare Worker a Google Calendar API, flujo de 3 pasos" } },
      { src: "/images/portfolio/cushlabs-07.png", alt: { en: "Localization Beyond Language — WhatsApp integration with locale-aware pre-filled messages", es: "Localizacion Mas Alla del Idioma — integracion WhatsApp con mensajes prellenados segun el idioma" } },
      { src: "/images/portfolio/cushlabs-08.png", alt: { en: "Security and Anti-Scraping — split-attribute email obfuscation", es: "Seguridad y Anti-Scraping — ofuscacion de email por atributos divididos" } },
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
    thumbnail: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-01.png",
    videoUrl: "https://mazebreak-wiki.vercel.app/video/MazeBreak__Taming_the_GDD.mp4",
    images: [
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-01.png", alt: { en: "The Documentation Engine for Game Design", es: "El Motor de Documentación para Diseño de Juegos" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-02.png", alt: { en: "The 200-Page Monster — the problem with traditional GDDs", es: "El Monstruo de 200 Páginas — el problema con GDDs tradicionales" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-03.png", alt: { en: "Order from Chaos — markdown, Git push, instant deploy", es: "Orden del Caos — markdown, Git push, deploy instantáneo" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-04.png", alt: { en: "MazeBreak GDD Wiki documentation engine cover", es: "Portada del motor de documentación MazeBreak GDD Wiki" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-05.png", alt: { en: "Smart Engineering Decisions — architecture overview", es: "Decisiones Inteligentes de Ingeniería — vista de arquitectura" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-06.png", alt: { en: "Stop Managing Documents — value proposition", es: "Deja de Gestionar Documentos — propuesta de valor" } },
      { src: "https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-07.png", alt: { en: "Full infographic — problem, solution, architecture at a glance", es: "Infografía completa — problema, solución, arquitectura de un vistazo" } },
    ],
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
