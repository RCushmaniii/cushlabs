/**
 * Download external portfolio thumbnails, resize to 760x428 (2x retina
 * for 378×213 display), convert to WebP, and save locally.
 *
 * Run: node scripts/optimize-thumbnails.mjs
 */
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const OUT_DIR = 'public/images/portfolio/thumbs';
const WIDTH = 760;
const HEIGHT = 428;
const QUALITY = 80;

const THUMBNAILS = [
  { name: 'voice-cushlabs', url: 'https://voice.cushlabs.ai/portfolio/voice-cushlabs-thumb.webp' },
  { name: 'ai-chatbot-saas', url: 'https://raw.githubusercontent.com/RCushmaniii/ai-chatbot-saas/main/public/images/portfolio/ai-chatbot-saas-thumb.webp' },
  { name: 'ny-ai-chatbot', url: 'https://ny-ai-chatbot.vercel.app/images/portfolio/ny-eng-chatbot-thumbnail.jpg' },
  { name: 'ny-eng', url: 'https://www.nyenglishteacher.com/images/portfolio/ny-eng-thumb.jpg' },
  { name: 'ai-resume-tailor', url: 'https://ai-resume-tailor-client.vercel.app/images/ai-resume-tailor-thumb.jpg' },
  { name: 'ai-build-vs-outsource', url: 'https://ai-build-vs-outsource.vercel.app/images/ai-build-vs-outsource-thumb.jpg' },
  { name: 'context-writing-system', url: 'https://cushlabs-writing-system.vercel.app/public/images/context-writing-system-thumb.jpg' },
  { name: 'ai-idea-validator', url: 'https://ai-idea-validator.netlify.app/images/portfolio/aI-Idea-validator-thumb.jpg' },
  { name: 'ai-portfolio', url: 'https://ai-portfolio-cushlabs.vercel.app/images/portfolio-card.webp' },
  { name: 'freelance-income-planner', url: 'https://freelance-income-planner.vercel.app/images/freelance-income-planner-thumb.jpg' },
  { name: 'ai-scrabble-practice', url: 'https://scrabble-mini.netlify.app/images/ai-scrabble-practice-thumb.jpg' },
  { name: 'ai-filesense', url: 'https://raw.githubusercontent.com/RCushmaniii/ai-filesense/main/public/images/ai-filesense-thumb.jpg' },
  { name: 'stock-alert', url: 'https://raw.githubusercontent.com/RCushmaniii/stock-alert/main/public/images/stockalert-thumb.jpg' },
  { name: 'ai-filesense-website', url: 'https://ai-filesense-website.vercel.app/images/portfolio/ai-filesense-website-thumb.jpg' },
  { name: 'ai-stock-alert-website', url: 'https://aistockalert.app/images/ai-stockalert-website-thumb.jpg' },
  { name: 'comp-plan-simulator', url: 'https://comp-plan-simulator.vercel.app/images/comp-plan-sim-thumb.jpg' },
  { name: 'marble-does-not-yield', url: 'https://marble-does-not-yield.vercel.app/images/portfolio/marble-does-not-yield-thumb.jpg' },
  { name: 'mazebreak-trello', url: 'https://mazebreak-trello.vercel.app/images/mazebreak-trello.jpg' },
  { name: 'mazebreak-wiki', url: 'https://mazebreak-wiki.vercel.app/images/mazebreak-wiki-01.png' },
  { name: 'nextjs-react-agency-starter', url: 'https://nextjs-react-agency-starter.vercel.app/images/portfolio/nextjs-react-agency-starter-thumb.jpg' },
  { name: 'react-vite-tailwind-base', url: 'https://react-vite-tailwind-base.vercel.app/images/react-vite-tailwind-base-thumb.jpg' },
];

async function downloadAndOptimize({ name, url }) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  FAIL ${name}: HTTP ${res.status} from ${url}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const originalKB = (buffer.length / 1024).toFixed(1);

    const optimized = await sharp(buffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
      .webp({ quality: QUALITY })
      .toBuffer();

    const optimizedKB = (optimized.length / 1024).toFixed(1);
    const outPath = path.join(OUT_DIR, `${name}-thumb.webp`);
    await writeFile(outPath, optimized);

    console.log(`  OK ${name}: ${originalKB} KB → ${optimizedKB} KB (${outPath})`);
    return { name, outPath: `/images/portfolio/thumbs/${name}-thumb.webp`, saved: buffer.length - optimized.length };
  } catch (err) {
    console.error(`  FAIL ${name}: ${err.message}`);
    return null;
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  console.log(`Downloading and optimizing ${THUMBNAILS.length} thumbnails to ${WIDTH}x${HEIGHT} WebP...\n`);

  const results = await Promise.all(THUMBNAILS.map(downloadAndOptimize));
  const successful = results.filter(Boolean);
  const totalSaved = successful.reduce((sum, r) => sum + r.saved, 0);

  console.log(`\nDone: ${successful.length}/${THUMBNAILS.length} succeeded`);
  console.log(`Total savings: ${(totalSaved / 1024).toFixed(0)} KB`);

  // Output a mapping for updating references
  console.log('\nLocal path mapping:');
  successful.forEach(r => console.log(`  ${r.name} → ${r.outPath}`));
}

main();
