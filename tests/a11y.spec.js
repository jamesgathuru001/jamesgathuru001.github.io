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

const RELAY = 'https://api.web3forms.com/submit';

test.describe('contact', () => {
  test('the nav Contact link scrolls to the form on the landing page', async ({ page }) => {
    // Contact is a landing section, not a route: most visitors never leave the
    // landing page, and a navigation between them and the form costs replies.
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact .cform')).toBeInViewport();
  });

  test('the closing CTA on /work reaches the form', async ({ page }) => {
    await page.goto('/work');
    await page.getByRole('link', { name: 'Start a conversation' }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(page.locator('#contact .cform')).toBeVisible();
  });

  test('the footer carries phone and LinkedIn, and never a raw address', async ({ page }) => {
    // The address is deliberately unprinted: the form reaches the same inbox,
    // and a mailto in the DOM of every page is free food for scrapers.
    for (const route of ['/', '/work']) {
      await page.goto(route);
      await expect(page.locator('footer a[href^="tel:"]')).toBeVisible();
      await expect(page.locator('footer a[href*="linkedin.com"]')).toBeVisible();
      await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(0);
    }
  });
});

test.describe('contact form', () => {
  const ok = (page, delay = 0) =>
    page.route(RELAY, async (route) => {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
      });
    });

  const fill = async (page) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('What are you building?').fill('An analytical engine dashboard.');
  };

  test('every field has an accessible name', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    for (const label of ['Name', 'Email', 'What are you building?']) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });

  test('the honeypot is hidden from people and from assistive tech', async ({ page }) => {
    // A visible or focusable trap catches keyboard users instead of bots.
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const honey = page.locator('.cform__honey');
    await expect(honey).toHaveAttribute('aria-hidden', 'true');
    await expect(honey).toHaveAttribute('tabindex', '-1');
    expect((await honey.boundingBox()).x).toBeLessThan(0);
  });

  test('validation waits for blur, then clears as soon as it is fixed', async ({ page }) => {
    // Flagging an address as malformed while it is still being typed is
    // technically correct and hostile.
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const email = page.getByLabel('Email');
    await email.fill('ada@');
    await expect(page.locator('#cf-email-err')).toHaveText('');

    await email.blur();
    await expect(page.locator('#cf-email-err')).toContainText('missing an @ or a domain');
    await expect(email).toHaveAttribute('aria-invalid', 'true');

    await email.fill('ada@example.com');
    await expect(page.locator('#cf-email-err')).toHaveText('');
  });

  test('submitting empty focuses the first field that needs fixing', async ({ page }) => {
    // The form can be taller than the viewport; leaving someone to hunt for the
    // offending field is how a submit button starts feeling broken.
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.locator('#cf-name-err')).toContainText('Tell me who you are');
  });

  test('a successful send replaces the form with a confirmation', async ({ page }) => {
    // An emptied form under a success line reads as though the send failed and
    // wiped the message.
    await ok(page);
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.locator('.cform__donetitle')).toHaveText('Message sent');
    await expect(page.locator('.cform')).toHaveCount(0);

    await page.getByRole('button', { name: 'Send another' }).click();
    await expect(page.getByLabel('Name')).toHaveValue('');
  });

  test('the submission carries the message and the access key', async ({ page }) => {
    let posted;
    await page.route(RELAY, (route) => {
      posted = route.request().postData();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('.cform__donetitle')).toBeVisible();

    expect(posted).toContain('ada@example.com');
    expect(posted).toContain('analytical engine dashboard');
    expect(posted).toContain('access_key');
  });

  test('a rejected send keeps the message and offers the address', async ({ page }) => {
    // Losing what someone just typed because a relay was down is the one
    // failure mode a contact form cannot have.
    await page.route(RELAY, (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid access key' }),
      })
    );
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.locator('.cform__status.is-error')).toContainText('Invalid access key');
    await expect(page.locator('.cform__status a')).toHaveAttribute(
      'href',
      'mailto:jamesgathuru001@gmail.com'
    );
    await expect(page.getByLabel('What are you building?')).toHaveValue(
      'An analytical engine dashboard.'
    );
  });

  test('submitting does not resize the button', async ({ page }) => {
    // "Sending" is shorter than "Send message" — the same class of bug the Copy
    // button had, with the status text sitting right beside it.
    await ok(page, 900);
    await fill(page);
    const send = page.locator('.cform__send');
    const before = (await send.boundingBox()).width;
    await send.click();
    await expect(send).toContainText('Sending');
    expect((await send.boundingBox()).width).toBe(before);
  });
});
