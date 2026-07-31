import { test, expect } from '@playwright/test';
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
