/**
 * Rasterise public/favicon.svg into the PNG sizes that SVG favicons don't cover.
 *
 * Safari and iOS ignore `rel="icon"` SVGs entirely, so apple-touch-icon.png is
 * the only mark those platforms ever show. Kept as a script rather than a build
 * step because the source changes about once a year — run it when it does.
 *
 * The monogram is drawn as paths, so librsvg needs no font to rasterise it
 * correctly. Rendering at a high density first, then downsampling, keeps the
 * curve edges clean at 180px.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = fileURLToPath(new URL('../public/', import.meta.url));
const svg = fs.readFileSync(new URL('favicon.svg', `file://${pub.replace(/\\/g, '/')}`));

const targets = [{ file: 'apple-touch-icon.png', size: 180 }];

for (const { file, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(pub + file);
  console.log(`icons: wrote ${file} (${size}x${size})`);
}
