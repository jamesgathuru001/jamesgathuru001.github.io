import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'c:/Users/Coding/Ndai/james-portfolio';
const RAW = `${ROOT}/assets-src/work`;   // originals, git-lfs-able, NOT shipped
const OUT = `${ROOT}/public/assets/work`; // optimized, shipped

fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// move raw PNGs out of public/ first
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.png'))) {
  fs.renameSync(path.join(OUT, f), path.join(RAW, f));
}

const slugs = ['ndai', 'egesha', 'fomless', 'studioos', 'advance', 'dama', 'cheko', 'atom', 'algora'];
const rows = [];

for (const slug of slugs) {
  for (const kind of ['hero', 'full']) {
    const src = `${RAW}/${slug}-${kind}.png`;
    if (!fs.existsSync(src)) continue;
    const before = fs.statSync(src).size;
    const meta = await sharp(src).metadata();

    // hero → card widths; full → single long shot for case study
    const widths = kind === 'hero' ? [1600, 1200, 800, 400] : [1400];
    for (const w of widths) {
      if (w > meta.width) continue;
      const base = kind === 'hero' ? `${OUT}/${slug}-${w}` : `${OUT}/${slug}-full`;
      await sharp(src).resize(w).avif({ quality: 62, effort: 6 }).toFile(`${base}.avif`);
      await sharp(src).resize(w).webp({ quality: 80 }).toFile(`${base}.webp`);
    }
    const shipped = fs
      .readdirSync(OUT)
      .filter((f) => f.startsWith(slug) && (kind === 'full' ? f.includes('-full') : !f.includes('-full')))
      .reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
    rows.push({ slug, kind, dims: `${meta.width}x${meta.height}`, beforeKB: Math.round(before / 1024), shippedKB: Math.round(shipped / 1024) });
  }
}

console.table(rows);
const total = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
const raw = fs.readdirSync(RAW).reduce((a, f) => a + fs.statSync(path.join(RAW, f)).size, 0);
console.log(`raw originals (not shipped): ${(raw / 1048576).toFixed(1)} MB  →  shipped: ${(total / 1048576).toFixed(2)} MB`);
