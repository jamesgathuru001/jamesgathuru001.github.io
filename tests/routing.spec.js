import { test, expect } from './fixtures.js';
import { nav } from '../src/data/site.js';

test.describe('navigation', () => {
  test('"See all work" lands at the top of /work', async ({ page }) => {
    // Regression: React Router does not reset scroll, so /work opened at the
    // same offset you left the landing page at — mid-grid.
    await page.goto('/');
    await page.locator('.work__more-link').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    await page.locator('.work__more-link').click();
    await expect(page).toHaveURL(/\/work$/);
    // Polled, not a fixed wait: the reset happens in a layout effect after
    // Lenis is re-created, and a hardcoded 400ms is a race on a loaded machine.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  });

  test('back button restores the previous scroll position', async ({ page }) => {
    // POP is deliberately excluded from the scroll reset.
    await page.goto('/');
    await page.locator('.work__more-link').scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);

    await page.locator('.work__more-link').click();
    await expect(page).toHaveURL(/\/work$/);
    await page.goBack();
    await page.waitForTimeout(900);

    // Not an exact match: lazy images finishing after the restore change the
    // document height. What matters is that it returned you near where you were
    // rather than dumping you at the hero.
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBeGreaterThan(before * 0.6);
  });

  test('nav links work from a non-landing route', async ({ page }) => {
    // Bare "#work" anchors resolve to nothing off the landing page.
    await page.goto('/work');
    await expect(page.locator('.nav__links a').first()).toHaveAttribute('href', '/#work');
  });

  test('/work survives a direct hit and a reload', async ({ page }) => {
    const res = await page.goto('/work');
    expect(res.status()).toBe(200);
    await expect(page.locator('.wcard')).not.toHaveCount(0);
    await page.reload();
    await expect(page.locator('.wcard')).not.toHaveCount(0);
  });
});

test.describe('case studies', () => {
  test('every listed project has a reachable case study', async ({ page }) => {
    await page.goto('/work');
    // Lazy route: evaluateAll() does not auto-retry, so wait for the mount.
    await expect(page.locator('.wcard').first()).toBeVisible();
    const slugs = await page.locator('.wcard__title-link').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href'))
    );
    expect(slugs.length).toBeGreaterThan(0);

    for (const href of slugs) {
      await page.goto(href);
      await expect(page.locator('.cs__title')).toBeVisible();
      // The fields the page exists to surface.
      await expect(page.locator('.cs__contrib li')).not.toHaveCount(0);
      await expect(page.locator('.cs__scope-val')).not.toBeEmpty();
    }
  });

  test('the full-page shot scrolls itself, not the page behind it', async ({ page }) => {
    // Regression: Lenis preventDefaults wheel at the window, so wheeling over
    // the capped frame scrolled the page straight past it and the frame never
    // moved. data-lenis-prevent hands wheel events inside it back to the browser.
    await page.goto('/work/ndai');
    const frame = page.locator('.cs__long-frame');
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible();

    const pageBefore = await page.evaluate(() => window.scrollY);
    await frame.hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => frame.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    // The page may drift a little on momentum, but it must not run away.
    const drift = Math.abs((await page.evaluate(() => window.scrollY)) - pageBefore);
    expect(drift).toBeLessThan(100);
  });

  test('unknown and unverified slugs redirect to the index', async ({ page }) => {
    // studioos is deliberately `verified: false` — no confirmed role, so it must
    // not be reachable, not even by typing the URL.
    for (const slug of ['does-not-exist', 'studioos']) {
      await page.goto(`/work/${slug}`);
      await expect(page).toHaveURL(/\/work$/);
    }
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('the menu is the only navigation below 820px, and it works', async ({ page }) => {
    // Regression: the desktop links were display:none with nothing replacing
    // them, so mobile visitors had no way to reach any section.
    await page.goto('/');
    await expect(page.locator('.nav__links')).toBeHidden();

    await page.locator('.nav__burger').tap();
    await expect(page.locator('.nav__sheet')).toBeVisible();
    // Counted from the nav data, not hardcoded — the sheet is the only
    // navigation at this width, so a new entry that misses it is a real bug.
    await expect(page.locator('.nav__sheet-links a')).toHaveCount(nav.length);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden'
    );

    await page.locator('.nav__sheet-links a').nth(1).tap();
    await expect(page.locator('.nav__sheet')).toBeHidden();
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow)
    ).not.toBe('hidden');
  });
});

test.describe('hero call to action', () => {
  test('"Hire me" reaches the form, not a mail client', async ({ page }) => {
    await page.goto('/');
    const hire = page.locator('.hero__cta a', { hasText: 'Hire me' });
    await expect(hire).toHaveAttribute('href', '#contact');
    await hire.click();
    await expect(page.locator('#contact .cform')).toBeInViewport();
  });

  test('the buttons do not chase the cursor', async ({ page }) => {
    // Regression: the magnetic wrapper wrote a new transform on every
    // pointermove while CSS eased transform over 420ms, so the button was
    // permanently lagging a target that kept moving — it visibly wobbled.
    // Hovering opposite ends of the same button must land on one transform.
    await page.goto('/');
    // The CTA row has its own entrance. Measuring mid-animation means the
    // second hover lands where the button no longer is, which fails for a
    // reason that has nothing to do with cursor chasing.
    await expect
      .poll(() => page.locator('.hero__cta').evaluate((el) => getComputedStyle(el).transform))
      .toBe('none');

    const btn = page.locator('.hero__cta .btn--primary');
    const box = await btn.boundingBox();
    const read = () => btn.evaluate((el) => getComputedStyle(el).transform);

    await page.mouse.move(box.x + 6, box.y + box.height / 2);
    await page.waitForTimeout(400);
    const left = await read();

    await page.mouse.move(box.x + box.width - 6, box.y + box.height / 2);
    await page.waitForTimeout(400);
    expect(await read()).toBe(left);
  });
});
