/**
 * Emit dist/404.html as a byte-for-byte copy of dist/index.html.
 *
 * GitHub Pages has no rewrite rules — `public/_redirects` (Netlify) and
 * `public/.htaccess` (Apache) are both inert there. Its only SPA escape hatch
 * is that it serves 404.html for any path it can't resolve to a file, so
 * copying the app shell there is what keeps /work and /work/:slug alive on a
 * direct hit or a refresh.
 *
 * Runs as part of `npm run build` rather than only in CI, so a local build
 * matches what deploys.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const index = path.join(dist, 'index.html');

if (!fs.existsSync(index)) {
  console.error('spa-fallback: dist/index.html not found — did the build run?');
  process.exit(1);
}

fs.copyFileSync(index, path.join(dist, '404.html'));
console.log('spa-fallback: wrote dist/404.html');
