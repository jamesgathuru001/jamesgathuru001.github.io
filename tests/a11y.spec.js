import { test, expect } from '@playwright/test';

/**
 * The Craft section claims "keyboard-complete by default" and invites reviewers
 * to try to break it. These are the assertions behind that claim.
 *
 * Every test here corresponds to a bug that was actually found by driving the
 * UI — none of them are hypothetical.
 */

async function openDemo(page, index) {
  await page.goto('/');
  await page.locator('#craft').scrollIntoViewIfNeeded();
  await page.locator('.craft__card').nth(index).click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

test.describe('demo dialog', () => {
  test('each craft card opens its demo', async ({ page }) => {
    const expected = [
      'Springs, not durations.',
      '10,000 rows at 60fps.',
      'Keyboard-complete by default.',
    ];
    for (const [i, title] of expected.entries()) {
      await openDemo(page, i);
      await expect(page.locator('.modal__title')).toHaveText(title);
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 10_000 });
    }
  });

  test('focus stays trapped inside the dialog', async ({ page }) => {
    // Regression: the trap used `button:not([disabled])`, which matches a
    // tabindex="-1" button. That became the "last" stop, so Tab from the real
    // last element fell straight out of the dialog.
    await openDemo(page, 2);
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]')
      );
      expect(inside, `focus escaped on tab ${i + 1}`).toBe(true);
    }
  });

  test('restores page scrolling after close', async ({ page }) => {
    await openDemo(page, 0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden'
    );
    await page.locator('.modal__close').click();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow)
    ).not.toBe('hidden');
  });
});

test.describe('combobox', () => {
  test('keeps DOM focus on the input and moves aria-activedescendant', async ({ page }) => {
    await openDemo(page, 2);
    const input = page.locator('input[role="combobox"]');
    await input.click();
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await input.press('ArrowDown');
    await input.press('ArrowDown');

    // The whole point of the pattern: focus never leaves the input.
    expect(
      await page.evaluate(() => document.activeElement?.getAttribute('role'))
    ).toBe('combobox');
    await expect(input).toHaveAttribute('aria-activedescendant', /opt-1$/);
    await expect(page.locator('.a11y__option.is-active')).toHaveText(/ARIA live region/);
  });

  test('Escape is layered: list, then value, then dialog', async ({ page }) => {
    // Regression: the combobox called stopPropagation() unconditionally, so once
    // its list was closed and its field empty it swallowed Escape forever —
    // a keyboard trap, in the keyboard-accessibility demo.
    await openDemo(page, 2);
    const input = page.locator('input[role="combobox"]');
    await input.click();
    await expect(page.locator('.a11y__list.is-open')).toBeVisible();

    await input.press('Escape'); // 1: closes the listbox only
    await expect(page.locator('.a11y__list.is-open')).toHaveCount(0);
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await input.fill('focus');
    await input.press('Escape'); // closes the list the typing re-opened
    await input.press('Escape'); // 2: clears the value
    await expect(input).toHaveValue('');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await input.press('Escape'); // 3: nothing left to handle — dialog closes
    await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 10_000 });
  });
});

test.describe('contact', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copies the real address and announces it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('.cmail__copy').click();

    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'jamesgathuru001@gmail.com'
    );
    await expect(page.locator('#contact [role="status"]')).toHaveText(
      'Email address copied to clipboard'
    );
    await expect(page.locator('.cmail__copy')).toHaveText('Copied');
  });

  test('copying does not shift the layout', async ({ page }) => {
    // Regression: "Copied" is wider than "Copy", so the button resized on click
    // and shoved the email card at the exact moment you look for confirmation.
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const width = async () => (await page.locator('.cmail__link').boundingBox()).width;

    const before = await width();
    await page.locator('.cmail__copy').click();
    await expect(page.locator('.cmail__copy')).toHaveText('Copied');
    expect(await width()).toBe(before);
  });
});
