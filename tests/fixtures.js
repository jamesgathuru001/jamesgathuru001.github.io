import { test as base, expect } from '@playwright/test';

/**
 * The default `page` for every spec, with the landing intro pre-dismissed.
 *
 * The intro covers the viewport and locks scroll for up to ~1.2s. Left on, it
 * would not just slow the suite down — it would silently change what is being
 * measured: the scroll-through in the integrity specs would find nothing, and
 * the 24px target audit would see the intro's own elements instead of the
 * page's.
 *
 * Setting the flag it already uses is better than adding a test-only escape
 * hatch to the component. Tests that need to see the intro import `test`
 * straight from @playwright/test — see intro.spec.js.
 */
export const test = base.extend({
  // The second argument is Playwright's `use`, renamed: the lint rule for React
  // hooks matches on the name alone and reads `use(...)` here as a hook called
  // outside a component. It is positional, so the name is ours to choose.
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('jg:intro', '1');
      } catch {
        // Private-mode sessionStorage can throw; the intro handles that too.
      }
    });
    await runTest(page);
  },
});

export { expect };
