/**
 * Render public/og.png — the 1200x630 card every share preview shows.
 *
 * Rendered in Chromium rather than composed with sharp, because the card is
 * typographic and sharp rasterises SVG text through whatever fonts fontconfig
 * happens to expose. That differs between this machine and a CI runner, which
 * is exactly the kind of silent drift a share image should not have. A real
 * browser loads the same self-hosted woff2 the site does.
 *
 * Run it by hand (`npm run og`) and commit the result — it changes about as
 * often as the name does, and putting a browser render in the build would make
 * every deploy depend on it.
 *
 * PNG, not WebP or AVIF: WhatsApp and several LinkedIn crawlers still refuse
 * anything else, and a share card that fails on WhatsApp fails where it matters.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = path.join(root, 'public');
const b64 = (p) => fs.readFileSync(path.join(pub, p)).toString('base64');

const display = b64('fonts/bricolage-grotesque-400-800-latin.woff2');
const mono = b64('fonts/jetbrains-mono-500-latin.woff2');
const portrait = b64('assets/brand/james-800.webp');

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: 'Bricolage'; font-weight: 400 800;
    src: url(data:font/woff2;base64,${display}) format('woff2'); }
  @font-face { font-family: 'Mono'; font-weight: 500;
    src: url(data:font/woff2;base64,${mono}) format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; display: flex; overflow: hidden;
    background: #070a12; color: #edeff7; font-family: 'Bricolage', sans-serif; }
  .l { flex: 1; padding: 72px; display: flex; flex-direction: column;
       justify-content: space-between; position: relative; z-index: 2; }
  .glow { position: absolute; width: 700px; height: 700px; left: -220px; top: -260px;
          background: radial-gradient(circle, rgba(90,108,255,.30), transparent 65%); }
  .mark { display: flex; align-items: center; gap: 14px; }
  .badge { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center;
           background: linear-gradient(180deg, #7c9cff, #4361ff); }
  .name { font-size: 22px; font-weight: 600; letter-spacing: -.01em; }
  h1 { font-size: 74px; font-weight: 800; letter-spacing: -.045em; line-height: 1.02; }
  h1 em { font-style: normal;
    background: linear-gradient(135deg, #7c9cff, #4361ff);
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .meta { font-family: 'Mono', monospace; font-size: 17px; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase; color: #6b7391;
          display: flex; align-items: center; gap: 14px; }
  .dot { width: 4px; height: 4px; border-radius: 999px; background: #4361ff; }
  .r { width: 430px; position: relative; }
  .r img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); }
  .fade { position: absolute; inset: 0;
          background: linear-gradient(90deg, #070a12 0%, rgba(7,10,18,.55) 42%, transparent 100%); }
</style>
<div class="l">
  <div class="glow"></div>
  <div class="mark">
    <span class="badge"><svg width="34" height="34" viewBox="0 0 64 64"><g fill="none" stroke="#fff"
      stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M25 19 V33 a8.5 8.5 0 0 1 -17 0"/>
      <path d="M53.4 24.6 A11.5 11.5 0 1 0 54.6 36.4 H46"/></g></svg></span>
    <span class="name">James Gathuru</span>
  </div>
  <h1>I build interfaces<br><em>that feel inevitable.</em></h1>
  <p class="meta">Frontend Engineer <span class="dot"></span> React <span class="dot"></span> Nairobi</p>
</div>
<div class="r">
  <img src="data:image/webp;base64,${portrait}" alt="">
  <div class="fade"></div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot();
await browser.close();

// Chromium's PNG encoder is fast, not small. Re-encoding costs a second and
// takes ~40% off a file that every scraper downloads.
await sharp(shot).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(pub, 'og.png'));

const { size } = fs.statSync(path.join(pub, 'og.png'));
console.log(`og: wrote og.png (1200x630, ${(size / 1024).toFixed(0)} kB)`);
