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

    // Walk the page before the full shot. Chromium captures fullPage by
    // expanding the capture region, never by scrolling, so IntersectionObserver
    // never fires and loading="lazy" images never request. On sites built
    // around scroll reveals — ndai, algora, studioos — everything below the
    // fold otherwise captures as empty boxes on a blank background.
    // Every wait below is bounded. A capture script that hangs on one site
    // blocks the whole run, and these are other people's pages: lazy sentinels
    // that keep extending the document and images that never settle are both
    // things they are entitled to do.
    await page.evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.round(window.innerHeight * 0.75);
      const deadline = Date.now() + 45000;
      let y = 0;
      // scrollHeight grows as reveals land, so re-read it every pass rather
      // than caching a height that was only true at the top.
      while (y < document.documentElement.scrollHeight && Date.now() < deadline) {
        window.scrollTo(0, y);
        await wait(250);
        y += step;
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
      await wait(800);
      window.scrollTo(0, 0);
      await wait(400);
    });
    // Anything the walk kicked off still has to arrive and decode. A request
    // that stalls fires neither load nor error, so race the lot against a cap.
    await page.evaluate(
      () =>
        Promise.race([
          Promise.all(
            Array.from(document.images)
              .filter((img) => !img.complete)
              .map((img) => new Promise((r) => { img.onload = img.onerror = r; })),
          ),
          new Promise((r) => setTimeout(r, 15000)),
        ]),
    );
    await page.waitForTimeout(1200);
    rec.height = await page.evaluate(() => document.documentElement.scrollHeight);

    // Full page for the case-study long shot, at CSS resolution rather than the
    // context's 2x. Chromium stops painting a fullPage capture somewhere around
    // 16,000 device pixels tall: at 2x that is only ~8,000 CSS px, and the
    // tallest sites here (ndai ~9,900, atom ~9,300) lost everything past it to
    // flat background. scale:'css' keeps the whole page. The long shot is
    // downscaled for shipping anyway, so 1x costs nothing visible.
    await page.screenshot({ path: `${OUT}${s.slug}-full.png`, fullPage: true, scale: 'css' });
    rec.full = true;
  } catch (e) {
    rec.error = String(e).split('\n')[0].slice(0, 120);
  }
  results.push(rec);
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
