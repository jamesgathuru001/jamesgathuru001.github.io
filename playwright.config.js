import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against the PRODUCTION build, not the dev server.
 *
 * Two of the things worth guarding — code-split chunks resolving, and the
 * self-hosted fonts loading from /fonts — only exist after a build. Testing the
 * dev server would pass while the deployed site was broken.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    // The contact form only renders once it has a key, so the build under test
    // needs one. The tests intercept api.web3forms.com, so nothing is ever sent
    // and the value never has to be real.
    env: { VITE_WEB3FORMS_KEY: process.env.VITE_WEB3FORMS_KEY || 'test-access-key' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
