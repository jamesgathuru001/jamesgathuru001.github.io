import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('"See all work" lands at the top of /work', async ({ page }) => {
    // Regression: React Router does not reset scroll, so /work opened at the
    // same offset you left the landing page at — mid-grid.
    await page.goto('/');
    await page.locator('.work__more-link').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    await page.locator('.work__more-link').click();
    await expect(page).toHaveURL(/\/work$/);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);
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
    await expect(page.locator('.nav__sheet-links a')).toHaveCount(4);
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
