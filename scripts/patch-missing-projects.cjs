/**
 * One-time patch: manually populate ny-eng and ai-scrabble-practice data
 * that the sync script can't fetch due to fine-grained PAT scope limitations.
 */
const fs = require("fs");
const path = "./src/data/projects.generated.json";
const data = JSON.parse(fs.readFileSync(path, "utf-8"));

// ========== ny-eng ==========
const nyEng = data.projects.find((p) => p.name === "ny-eng");
if (nyEng) {
  nyEng.title = "NY English Teacher";
  nyEng.tagline =
    "Lead generation platform replacing 4 roles on $0/month infrastructure";
  nyEng.stack = [
    "Astro 5.5",
    "React 19",
    "TypeScript",
    "Cloudflare Workers",
    "Neon PostgreSQL",
  ];
  nyEng.thumbnail =
    "https://www.nyenglishteacher.com/images/portfolio/ny-eng-thumb.jpg";
  nyEng.status = "Production";
  nyEng.problem =
    "Solo professional service providers burn 10-15 hours per week on manual qualification, scheduling ping-pong, and follow-ups. Their websites look identical to commodity competitors, making it impossible to justify premium pricing while the Spanish-speaking professional market remains underserved.";
  nyEng.solution =
    "A fully automated lead generation platform that functions as four digital employees \u2014 SDR, marketing department, executive assistant, and brand manager \u2014 on free-tier infrastructure. Every conversation steers toward booking, every page justifies premium pricing, and the full EN/ES bilingual system doubles the addressable market from a single codebase.";
  nyEng.keyFeatures = [
    "4 role-specific diagnostic quizzes pre-qualify leads with mapped communication gaps",
    "3-step booking flow via Cloudflare Workers + Google Calendar OAuth \u2014 interest to confirmed Google Meet in under 60 seconds",
    "Full EN/ES bilingual mirror with localized routing and bidirectional hreflang SEO",
    "Premium positioning hard-coded into UX \u2014 named executive testimonials from multinational companies",
    "$0/month infrastructure \u2014 Astro static, Cloudflare Workers free tier, Neon free tier",
  ];
  nyEng.metrics = [
    "100 Lighthouse performance score",
    "$0/month infrastructure cost across all services",
    "< 60 seconds from interest to confirmed booking with Google Meet link",
    "2x addressable market from a single codebase via bilingual system",
    "10-15 hours/week of administrative and sales work automated away",
  ];
  nyEng.demoUrl = "https://www.nyenglishteacher.com";
  nyEng.liveUrl = "https://www.nyenglishteacher.com";
  nyEng.slides = [
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-01.png", altEn: "The Architecture of Authority", altEs: "La Arquitectura de la Autoridad" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-02.png", altEn: "An Automated Performance Engine", altEs: "Un Motor de Rendimiento Automatizado" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-03.png", altEn: "Digital Employee 01: The SDR", altEs: "Empleado Digital 01: El SDR" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-04.png", altEn: "Digital Employee 02: Marketing Dept", altEs: "Empleado Digital 02: Depto. de Marketing" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-05.png", altEn: "Digital Employee 03: The Executive Assistant", altEs: "Empleado Digital 03: La Asistente Ejecutiva" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-06.png", altEn: "Digital Employee 04: The Brand Manager", altEs: "Empleado Digital 04: El Brand Manager" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-07.png", altEn: "The Speed of Trust", altEs: "La Velocidad de la Confianza" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-08.png", altEn: "The Universal Model", altEs: "El Modelo Universal" },
    { src: "https://www.nyenglishteacher.com/images/portfolio/ny-eng-09.png", altEn: "The Zero-Cost Tech Stack", altEs: "El Tech Stack de Costo Cero" },
  ];
  nyEng.videoUrl = "https://www.nyenglishteacher.com/video/ny-eng-brief.mp4";
  nyEng.videoPoster = "https://www.nyenglishteacher.com/video/ny-eng-brief-poster.jpg";
  nyEng.dateCompleted = "2026-02";
  nyEng.tags = [...new Set([...nyEng.tags, "astro", "react", "typescript", "tailwind", "cloudflare-workers", "google-calendar", "neon-postgresql", "bilingual", "lead-generation", "solopreneur"])];
  console.log("ny-eng: populated");
}

// ========== ai-scrabble-practice ==========
const scrabble = data.projects.find((p) => p.name === "ai-scrabble-practice");
if (scrabble) {
  scrabble.title = "AI Scrabble Practice";
  scrabble.tagline = "Five AI-powered practice tools backed by a 370K-word dictionary";
  scrabble.stack = ["React 19", "TypeScript", "Vite 7", "OpenAI GPT-4o-mini", "Playwright"];
  scrabble.thumbnail = "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-thumb.jpg";
  scrabble.status = "Production";
  scrabble.problem = "Scrabble practice tools are either too simple (word checkers) or too powerful (board solvers) \u2014 neither builds actual skill. Players bounce between fragmented sites for validation, anagram solving, and word discovery with no structured practice mode.";
  scrabble.solution = "A unified five-tool practice suite that consolidates word validation, anagram solving, strategic word finding, AI-powered natural language search, and timed gameplay into a single bilingual app with sub-second response times.";
  scrabble.keyFeatures = [
    "370,105-word dictionary with O(1) Set-based validation \u2014 sub-millisecond lookups even on mobile",
    "Magic Search translates plain English queries into validated words with scores via GPT-4o-mini",
    "Timed Practice Game with realistic tile draws, 60-second rounds, progressive scoring, and AI hints",
    "Anagram Solver processes 7-tile hands with wildcard support in under 500ms",
    "Full EN/ES bilingual interface with locale-based routing and Playwright E2E test coverage",
  ];
  scrabble.metrics = [
    "370,105-word dictionary with sub-millisecond validation",
    "Anagram solving in under 500ms for 7-tile hands",
    "5 practice tools in a single unified interface",
  ];
  scrabble.demoUrl = "https://scrabble-mini.netlify.app";
  scrabble.liveUrl = "https://scrabble-mini.netlify.app";
  scrabble.slides = [
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-01.png", altEn: "AI Scrabble Practice Suite", altEs: "AI Scrabble Practice Suite" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-02.png", altEn: "The Practice Gap", altEs: "La brecha de practica" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-03.png", altEn: "Word Validator", altEs: "Validador de Palabras" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-04.png", altEn: "Anagram Solver", altEs: "Solucionador de Anagramas" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-06.png", altEn: "Word Finder", altEs: "Buscador de Palabras" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-07.png", altEn: "Magic Search", altEs: "Busqueda Magica" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-08.png", altEn: "Practice Game", altEs: "Juego de Practica" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-09.png", altEn: "Bilingual and Tested", altEs: "Bilingue y Probado" },
    { src: "https://scrabble-mini.netlify.app/images/ai-scrabble-practice-10.png", altEn: "Technical Architecture", altEs: "Arquitectura Tecnica" },
  ];
  scrabble.videoUrl = "https://scrabble-mini.netlify.app/video/ai-scrabble-practice-brief.mp4";
  scrabble.videoPoster = "https://scrabble-mini.netlify.app/video/ai-scrabble-practice-brief-poster.jpg";
  scrabble.dateCompleted = "2025-09";
  scrabble.tags = [...new Set([...scrabble.tags, "react", "typescript", "ai", "openai", "vite", "tailwind-css", "playwright", "i18n", "scrabble"])];
  console.log("ai-scrabble-practice: populated");
}

// Re-sort
data.projects.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  if (a.isFeatured && !b.isFeatured) return -1;
  if (!a.isFeatured && b.isFeatured) return 1;
  return new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime();
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("\nDone. Verifying...");
["ny-eng", "ai-scrabble-practice"].forEach((name) => {
  const p = data.projects.find((x) => x.name === name);
  console.log(name + ":", "title=" + p.title, "thumb=" + (p.thumbnail ? "SET" : "MISSING"), "stack=" + p.stack.length, "slides=" + p.slides.length);
});
