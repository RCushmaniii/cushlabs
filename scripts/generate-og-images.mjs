// Generate 1200×630 JPEG Open Graph images for every blog post that declares a
// `featuredImage`, cropped (cover, centered) from the post's hero and written to
// public/images/og/blog/<slug>.jpg — the stable URL PostLayout points og:image at.
//
// Why JPEG 1200×630: the Open Graph / Twitter industry standard. Social crawlers
// (Facebook, LinkedIn, X) render this size reliably; JPEG maximizes compatibility
// where WebP heroes are not guaranteed to preview.
//
// Runs in the build chain (before `astro build`) so public/ contains the files
// when Astro copies public/ → dist/. Output dir is gitignored (generated artifact).
//
// FAIL-LOUD: a declared featuredImage whose source is missing throws and fails the
// build — never ship a post with a broken og:image (per the data-pipeline rule).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIRS = [
  path.join(ROOT, "src/content/blog/en"),
  path.join(ROOT, "src/content/blog/es"),
];
const OUT_DIR = path.join(ROOT, "public/images/og/blog");

const OG_W = 1200;
const OG_H = 630;

fs.mkdirSync(OUT_DIR, { recursive: true });

let generated = 0;
let skipped = 0;
const errors = [];

for (const dir of BLOG_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const slug = file.replace(/\.md$/, "");
    const mdPath = path.join(dir, file);

    let data;
    try {
      ({ data } = matter(fs.readFileSync(mdPath, "utf-8")));
    } catch (err) {
      errors.push(`${file}: front-matter parse failed — ${err.message}`);
      continue;
    }

    const rel = data?.featuredImage;
    if (!rel) {
      skipped++;
      continue; // no hero → PostLayout falls back to the default OG image
    }

    const srcPath = path.resolve(path.dirname(mdPath), rel);
    if (!fs.existsSync(srcPath)) {
      errors.push(
        `${file}: featuredImage "${rel}" resolves to ${srcPath}, which does not exist`,
      );
      continue;
    }

    const outPath = path.join(OUT_DIR, `${slug}.jpg`);
    try {
      await sharp(srcPath)
        .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outPath);
      generated++;
    } catch (err) {
      errors.push(`${file}: sharp failed writing ${outPath} — ${err.message}`);
    }
  }
}

if (errors.length) {
  console.error(
    "\n❌ generate-og-images: FAILED\n" +
      errors.map((e) => "   - " + e).join("\n"),
  );
  process.exit(1);
}

console.log(
  `✅ generate-og-images: ${generated} OG image(s) written to public/images/og/blog/ (${OG_W}×${OG_H} JPEG); ${skipped} post(s) without a hero use the default.`,
);
