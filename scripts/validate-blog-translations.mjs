// Fails the build if any cornerstone (bilingual) blog post has a broken or
// non-reciprocal translation link. Single-language posts (no `translations`)
// are valid by design — the hybrid model. See
// docs/strategy/BLOG-HYBRID-ARCHITECTURE-PROPOSAL.md.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve("./src/content/blog");

function read(dir) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(d, f), "utf-8"));
      return { slug: f.replace(/\.md$/, ""), data, file: `${dir}/${f}` };
    });
}

const bare = (v) =>
  v ? (v.startsWith("/") ? v.split("/").filter(Boolean).pop() : v) : null;

const en = read("en");
const es = read("es");
const enBySlug = new Map(en.map((p) => [p.slug, p]));
const esBySlug = new Map(es.map((p) => [p.slug, p]));
const errors = [];

for (const p of en) {
  const twin = bare(p.data?.translations?.es);
  if (!twin) continue;
  const esPost = esBySlug.get(twin);
  if (!esPost) {
    errors.push(
      `EN ${p.file} → translations.es "${twin}" but es/${twin}.md is missing`,
    );
    continue;
  }
  const back = bare(esPost.data?.translations?.en);
  if (back !== p.slug)
    errors.push(
      `Non-reciprocal: EN ${p.file} ↔ es/${twin}.md (ES translations.en = "${back ?? "missing"}", expected "${p.slug}")`,
    );
}

for (const p of es) {
  const twin = bare(p.data?.translations?.en);
  if (!twin) continue;
  const enPost = enBySlug.get(twin);
  if (!enPost) {
    errors.push(
      `ES ${p.file} → translations.en "${twin}" but en/${twin}.md is missing`,
    );
    continue;
  }
  const back = bare(enPost.data?.translations?.es);
  if (back !== p.slug)
    errors.push(
      `Non-reciprocal: ES ${p.file} ↔ en/${twin}.md (EN translations.es = "${back ?? "missing"}", expected "${p.slug}")`,
    );
}

if (errors.length) {
  console.error("❌ blog translation validation FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `✅ blog translations OK — ${en.length} EN + ${es.length} ES posts; all cornerstone links reciprocal.`,
);
