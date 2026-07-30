import { chromium } from 'playwright';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Raw originals land outside public/ — they are gitignored and never shipped.
// `npm run assets` turns these into the optimized avif/webp in public/assets/work.
const OUT = fileURLToPath(new URL('../assets-src/work/', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });

const sites = [
  { slug: 'ndai',   url: 'https://ndai.africa' },
  { slug: 'egesha', url: 'https://egesha.net/' },
  { slug: 'fomless', url: 'https://fomless.com' },
  { slug: 'studioos', url: 'https://portal.milanstudios.co.ke/' },
  { slug: 'advance', url: 'https://advance.transfa.org/' },
  // Atom: shoot the PUBLIC marketing site only. The other two surfaces James built —
  // Orca (bucket.atomiot.live) and Neutron (neutron.atomiot.live) — sit behind login
  // walls over AtomIoT's customers' live vehicle and payment records. Both return 200,
  // but that is the login screen; anything past it is third-party personal data and a
  // login-wall screenshot makes a poor card anyway. The card names all three surfaces.
  { slug: 'atom', url: 'https://atomiot.live/' },
  { slug: 'algora', url: 'https://algoradigital.tech/' },
  { slug: 'dama', url: 'https://damakenya.org' },
  { slug: 'cheko', url: 'https://chekoproperties.com/' },
];

// `npm run shoot -- atom algora` re-captures just those, instead of all eight.
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = only.length ? sites.filter((s) => only.includes(s.slug)) : sites;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2, // → 2560x1600 output
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

const results = [];
for (const s of targets) {
  const page = await ctx.newPage();
  const rec = { slug: s.slug, url: s.url };
  try {
    const resp = await page.goto(s.url, { waitUntil: 'networkidle', timeout: 45000 });
    rec.status = resp?.status();
    // let fonts/hero animations settle
    await page.waitForTimeout(3500);
    try { await page.evaluate(() => document.fonts?.ready); } catch {}
    rec.title = await page.title();
    // kill obvious cookie/consent overlays before the shot
    await page.evaluate(() => {
      const kill = /cookie|consent|gdpr/i;
      document.querySelectorAll('div,section,aside').forEach((el) => {
        const cs = getComputedStyle(el);
        if ((cs.position === 'fixed' || cs.position === 'sticky') && kill.test(el.className + ' ' + el.id)) el.remove();
      });
    });
    await page.screenshot({ path: `${OUT}${s.slug}-hero.png` });
    rec.hero = true;
    // full page for the case-study long shot
    await page.screenshot({ path: `${OUT}${s.slug}-full.png`, fullPage: true });
    rec.full = true;
  } catch (e) {
    rec.error = String(e).split('\n')[0].slice(0, 120);
  }
  results.push(rec);
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
