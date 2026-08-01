import { test, expect } from './fixtures.js';
import { shown, pending, countWord } from '../src/data/projects.js';

const ROUTES = ['/', '/work', `/work/${shown[0].slug}`];
const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
];

test.describe('page integrity', () => {
  for (const route of ROUTES) {
    test(`${route} loads clean`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

      await page.goto(route);
      // Scroll the whole page so lazy images and whileInView blocks resolve.
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += 500) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(600);

      expect(errors).toEqual([]);
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((i) => i.loading !== 'lazy' || i.getBoundingClientRect().top < window.innerHeight * 3)
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src)
      );
      expect(broken).toEqual([]);
    });
  }

  for (const size of SIZES) {
    test(`no horizontal overflow at ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      for (const route of ROUTES) {
        await page.goto(route);
        await page.waitForTimeout(400);
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth
        );
        expect(overflows, `${route} overflows at ${size.name}`).toBe(false);
      }
    });
  }

  test('interactive targets meet the 24px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(400);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('a, button, input')]
          .filter((el) => el.offsetParent !== null)
          // The contact form's honeypot is a real input that no person can
          // reach — unfocusable and hidden from assistive tech. Sizing it to
          // 24px would only make it easier for a bot to notice.
          .filter((el) => el.tabIndex !== -1 && el.getAttribute('aria-hidden') !== 'true')
          .map((el) => ({
            label: (el.innerText || el.getAttribute('aria-label') || el.tagName).slice(0, 30),
            height: Math.round(el.getBoundingClientRect().height),
          }))
          .filter((x) => x.height > 0 && x.height < 24)
      );
      expect(small, `${route} has undersized targets`).toEqual([]);
    }
  });
});

test.describe('content stays in sync with the inventory', () => {
  test('the headline count tracks the project list', async ({ page }) => {
    // Guards the thing that was hardcoded: "Three platforms, shipped."
    await page.goto('/');
    await expect(page.locator('#work .section-title')).toHaveText(
      `${countWord(shown.length)} platforms, shipped.`
    );
    await expect(page.locator('.work__more-count')).toHaveText(String(shown.length));
  });

  test('/work lists exactly the verified projects', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.wcard')).toHaveCount(shown.length);
  });

  test('unverified projects appear nowhere', async ({ page }) => {
    // The inventory's core rule: no confirmed role, no presence on the site.
    expect(pending.length).toBeGreaterThan(0); // otherwise this proves nothing
    for (const route of ['/', '/work']) {
      await page.goto(route);
      const html = await page.content();
      for (const p of pending) {
        expect(html, `${p.slug} leaked onto ${route}`).not.toContain(p.title);
      }
    }
  });

  test('every rendered project states a role', async ({ page }) => {
    await page.goto('/work');
    // /work is a lazy chunk and allInnerTexts() does not auto-retry, so wait for
    // the route to actually mount before reading.
    await expect(page.locator('.wcard').first()).toBeVisible();
    const roles = await page.locator('.wcard__role').allInnerTexts();
    expect(roles).toHaveLength(shown.length);
    for (const r of roles) expect(r.replace(/MY ROLE/i, '').trim().length).toBeGreaterThan(8);
  });
});

test.describe('per-project accent theming', () => {
  test('each card resolves its own hue', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.wcard').first()).toBeVisible();
    const hues = await page.locator('.wcard').evaluateAll((els) =>
      els.map((e) => getComputedStyle(e).getPropertyValue('--p-hue').trim())
    );
    expect(hues).toEqual(shown.map((p) => String(p.accentHue)));
    // More than one distinct hue, or the theming isn't actually doing anything.
    expect(new Set(hues).size).toBeGreaterThan(1);
  });

  test('every accent hue stays legible on both surfaces', async ({ page }) => {
    // The derived tokens fix saturation and lightness so only the hue moves.
    // This asserts that promise holds for every hue in the inventory, including
    // any added later — yellow-ish hues are the usual way this breaks.
    await page.goto('/work');
    const results = await page.evaluate((hueList) => {
      const lum = ([r, g, b]) => {
        const c = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      const ratio = (a, b) =>
        (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

      const probe = document.createElement('span');
      document.body.appendChild(probe);
      const out = [];
      for (const hue of hueList) {
        probe.style.color = `hsl(${hue} 92% 74%)`;
        const rgb = getComputedStyle(probe).color.match(/\d+/g).map(Number).slice(0, 3);
        out.push({ hue, onBg: ratio(rgb, [7, 10, 18]), onBg1: ratio(rgb, [11, 15, 26]) });
      }
      probe.remove();
      return out;
    }, shown.map((p) => p.accentHue));

    for (const r of results) {
      expect(Math.min(r.onBg, r.onBg1), `hue ${r.hue} is too low-contrast`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('build output', () => {
  test('no third-party requests on any route', async ({ page }) => {
    // Fonts are self-hosted; nothing should reach out to another origin.
    const foreign = new Set();
    page.on('request', (r) => {
      const host = new URL(r.url()).host;
      if (host && host !== 'localhost:4173') foreign.add(host);
    });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(500);
    }
    expect([...foreign]).toEqual([]);
  });

  test('the demo bundles are not on the landing critical path', async ({ page }) => {
    // They sit behind a modal click; PerfDemo alone builds a 10,000-row fixture.
    const scripts = [];
    page.on('response', (r) => {
      if (r.request().resourceType() === 'script') scripts.push(r.url());
    });
    await page.goto('/');
    await page.waitForTimeout(1200);
    expect(scripts.filter((s) => /PerfDemo|MotionDemo|A11yDemo/.test(s))).toEqual([]);

    await page.locator('#craft').scrollIntoViewIfNeeded();
    await page.locator('.craft__card').nth(1).click();
    // Wait for the demo's own UI, not just the dialog: the dialog paints
    // immediately with the Suspense fallback inside it, so asserting on the
    // dialog raced the chunk request and failed under parallel load.
    await expect(page.locator('.perf__viewport')).toBeVisible();
    expect(scripts.some((s) => /PerfDemo/.test(s))).toBe(true);
  });
});

test.describe('seo', () => {
  // Everything here reads the RAW response, never the rendered DOM. A social
  // scraper does not run JS, so `document.title` proves nothing to it — the
  // only question that matters is what comes back over the wire.
  // index.html wraps its long meta tags across lines; the prerendered files
  // emit them on one. Match either, or the homepage silently reads as empty.
  const meta = (html, attr, key) => {
    const m = html.match(new RegExp(`${attr}="${key}"[\\s\\S]*?content="([^"]*)"`));
    return m ? m[1] : '';
  };

  const SEO_ROUTES = ['/', '/work', ...shown.map((p) => `/work/${p.slug}`)];

  test('every route serves its own title, canonical and og:url in the raw HTML', async ({
    request,
  }) => {
    const titles = new Set();

    for (const route of SEO_ROUTES) {
      const res = await request.get(route);
      expect(res.status(), `${route} must not be a 404 — Google drops those`).toBe(200);
      const html = await res.text();

      const title = (html.match(/<title>([^<]*)<\/title>/) || ['', ''])[1];
      const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || ['', ''])[1];
      const ogUrl = meta(html, 'property', 'og:url');
      const desc = meta(html, 'name', 'description');

      expect(title, `${route} has no title`).toBeTruthy();
      expect(desc, `${route} has no description`).toBeTruthy();
      expect(canonical, `${route} canonical is wrong`).toBe(
        `https://jamesgathuru.me${route === '/' ? '/' : route}`
      );
      expect(ogUrl, `${route} og:url should match canonical`).toBe(canonical);

      // The bug this whole prerender exists to prevent: one shared title
      // across every route, so every link previews as the landing page.
      expect(titles.has(title), `${route} reuses another route's title`).toBe(false);
      titles.add(title);
    }
  });

  test('each page carries exactly one JSON-LD graph, and it parses', async ({ request }) => {
    for (const route of SEO_ROUTES) {
      const html = await (await request.get(route)).text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      expect(blocks, `${route} should have one ld+json block`).toHaveLength(1);
      // Two graphs on one page is how contradictory structured data ships.
      expect(() => JSON.parse(blocks[0][1]), `${route} ld+json is malformed`).not.toThrow();
    }
  });

  test('case studies describe themselves, not the site', async ({ request }) => {
    const p = shown[0];
    const html = await (await request.get(`/work/${p.slug}`)).text();
    expect(html).toContain(`<title>${p.title} — ${p.subtitle} | James Gathuru</title>`);

    const ld = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]
    );
    const types = ld['@graph'].map((n) => n['@type']);
    expect(types).toContain('CreativeWork');
    expect(types).toContain('BreadcrumbList');
  });

  test('the share image is absolute and actually exists', async ({ request }) => {
    // A relative og:image silently resolves to nothing on every scraper.
    const html = await (await request.get('/')).text();
    const img = meta(html, 'property', 'og:image');
    expect(img).toBe('https://jamesgathuru.me/og.png');

    const res = await request.get('/og.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('png');
  });

  test('robots.txt and sitemap.xml ship, and the sitemap is complete', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap: https://jamesgathuru.me/sitemap.xml');

    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const route of SEO_ROUTES) {
      expect(xml, `${route} is missing from the sitemap`).toContain(
        `<loc>https://jamesgathuru.me${route === '/' ? '/' : route}</loc>`
      );
    }
    // Unverified projects have no page, so they must not be advertised either.
    for (const p of pending) expect(xml).not.toContain(p.slug);
  });

  test('the icons resolve', async ({ request }) => {
    for (const [file, type] of [
      ['/favicon.svg', 'svg'],
      ['/apple-touch-icon.png', 'png'],
    ]) {
      const res = await request.get(file);
      expect(res.status(), `${file} is missing`).toBe(200);
      expect(res.headers()['content-type']).toContain(type);
    }
  });
});
