import { defineConfig, devices } from '@playwright/test';
import { loadEnv } from 'vite';

// Read .env.local the same way Vite will. Without this the dummy key below was
// passed as a real shell variable, which OUTRANKS .env files — so `npm test`
// rebuilt dist/ with a placeholder key and left it there, and the next thing to
// serve that directory sent submissions Web3Forms rejects.
const env = loadEnv('production', process.cwd(), 'VITE_');

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
    // needs one. Prefer the real key wherever one exists, and fall back to a
    // placeholder only for a fresh clone with no .env.local — the tests
    // intercept api.web3forms.com either way, so nothing is ever sent.
    env: {
      VITE_WEB3FORMS_KEY:
        process.env.VITE_WEB3FORMS_KEY || env.VITE_WEB3FORMS_KEY || 'test-access-key',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
