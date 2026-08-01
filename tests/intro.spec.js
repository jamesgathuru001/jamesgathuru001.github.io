// Straight from @playwright/test, NOT ./fixtures.js — every other spec
// pre-dismisses the intro, and these are the tests that need to see it.
import { test, expect } from '@playwright/test';

test.describe('landing intro', () => {
  test('plays on a first visit, then leaves', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro')).toBeVisible();

    // It must remove itself without being touched. A loader that needs a click
    // is a door.
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 6000 });
    await expect(page.locator('.hero__title')).toBeVisible();
  });

  test('releases the scroll lock it took', async ({ page }) => {
    // The failure this guards is nasty and silent: the intro leaves, the page
    // looks fine, and the visitor simply cannot scroll.
    await page.goto('/');
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 6000 });

    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden'
    );
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });

  test('shows once per tab, not on every navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 6000 });

    // Leaving and coming back must not replay it — sessionStorage survives both.
    await page.goto('/work');
    await page.goto('/');
    await expect(page.locator('.intro')).toHaveCount(0);
    await expect(page.locator('.hero__title')).toBeVisible();
  });

  test('never covers a deep route', async ({ page }) => {
    // It belongs to the landing page. Someone opening a case study link should
    // not sit through a title card first.
    await page.goto('/work/ndai');
    await expect(page.locator('.intro')).toHaveCount(0);
  });

  test('reduced motion skips it entirely', async ({ page }) => {
    // Not "plays faster" — the honest answer to that request is not to run a
    // decorative animation at all.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.intro')).toHaveCount(0);
    await expect(page.locator('.hero__title')).toBeVisible();
  });

  test('the counter reports real progress and finishes at 100', async ({ page }) => {
    await page.goto('/');
    const pct = page.locator('.intro__pct');
    await expect(pct).toBeVisible();
    // Starts low — a bar that opens near full is decoration, not progress.
    expect(Number((await pct.innerText()).replace('%', ''))).toBeLessThan(60);
    await expect(pct).toHaveText('100%', { timeout: 6000 });
  });

  test('does not block the content crawlers and screen readers read', async ({ page }) => {
    // The overlay is painted, not injected in place of the page: the hero must
    // already be in the DOM behind it.
    await page.goto('/');
    await expect(page.locator('.intro')).toBeVisible();
    await expect(page.locator('.hero__title')).toHaveCount(1);
    await expect(page.locator('.intro')).toHaveAttribute('aria-label', 'Loading');
  });

  test('the portrait is decoded before it is revealed', async ({ page }) => {
    // The frame must never flash empty: the intro waits on decode(), not just
    // load, because `load` fires before the pixels are paintable.
    await page.goto('/');
    const img = page.locator('.intro__portrait');
    await expect(img).toBeVisible();
    expect(await img.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
  });

  test('the reveal tracks progress rather than running on its own clock', async ({ page }) => {
    // The clip is the progress bar. If it ever ran independently the picture
    // could sit complete while the counter was still climbing, which is the
    // exact dishonesty this design avoids.
    // Hold the portrait back so the intro is guaranteed to still be mid-flight
    // when sampled. Racing a ~1.1s animation from the test side passes alone
    // and fails under a loaded parallel run, which is worse than no test.
    await page.route('**/assets/brand/james-*.webp', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });

    await page.goto('/');
    const clipAt = () =>
      page.locator('.intro__portrait').evaluate((el) => {
        const m = getComputedStyle(el).clipPath.match(/inset\(([\d.]+)%/);
        return m ? Number(m[1]) : null;
      });

    const early = await clipAt();
    expect(early).toBeGreaterThan(0); // still clipped
    await expect(page.locator('.intro__pct')).toHaveText('100%', { timeout: 6000 });
    expect(await clipAt()).toBeLessThan(1); // fully revealed only at the end
  });

  test('the portrait is decorative to assistive tech', async ({ page }) => {
    // It carries no information the page does not already state in text.
    await page.goto('/');
    await expect(page.locator('.intro__portrait')).toHaveAttribute('alt', '');
  });
});
