/**
 * Batch convert all JPG/PNG images in public/images/ to WebP.
 * Skips files that already have a .webp sibling.
 *
 * Usage: node scripts/convert-images.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');

function findFiles(dir, extensions) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFiles(full, extensions));
    } else if (extensions.some(e => entry.name.toLowerCase().endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const files = findFiles(imgDir, ['.jpg', '.jpeg', '.png']);
  const toConvert = files.filter(f => {
    const webp = f.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return !fs.existsSync(webp);
  });

  console.log(`Found ${files.length} JPG/PNG files, ${toConvert.length} need WebP conversion\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of toConvert) {
    const out = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const before = fs.statSync(file).size;
    await sharp(file).webp({ quality: 80 }).toFile(out);
    const after = fs.statSync(out).size;
    totalBefore += before;
    totalAfter += after;
    const pct = Math.round((1 - after / before) * 100);
    const rel = path.relative(imgDir, file);
    console.log(`  ${rel} -> .webp  (${Math.round(before/1024)}KB -> ${Math.round(after/1024)}KB, -${pct}%)`);
  }

  if (toConvert.length > 0) {
    console.log(`\nTotal: ${Math.round(totalBefore/1024)}KB -> ${Math.round(totalAfter/1024)}KB (-${Math.round((1-totalAfter/totalBefore)*100)}%)`);
  } else {
    console.log('All images already have WebP versions.');
  }
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
