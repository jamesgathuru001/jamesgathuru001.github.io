# jamesgathuru.me

Portfolio of James Gathuru — frontend engineer, Nairobi.

React 19 + Vite. Hand-written CSS, no UI library. Framer Motion and Lenis for
motion. The hero is a 2,500-particle canvas that resolves into `JG`.

## Commands

| | |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` (also emits the SPA `404.html`) |
| `npm test` | Playwright suite, run against the production build |
| `npm run lint` | Oxlint |
| `npm run shoot` | Re-capture project screenshots (`npm run shoot -- atom algora` for specific slugs) |
| `npm run assets` | Optimize captures to avif/webp in `public/assets/work` |
| `npm run fonts` | Re-download and self-host the webfonts |

Playwright needs its browser once: `npx playwright install chromium`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages.

Two details that are load-bearing:

- **`public/CNAME`** holds the custom domain. It has to be in the build output,
  because Pages serves the uploaded artifact — not the repo.
- **`dist/404.html`** is a copy of `index.html`. GitHub Pages has no rewrite
  rules, so it is the only way `/work` and `/work/:slug` survive a direct hit or
  a refresh. `public/_redirects` (Netlify) and `public/.htaccess` (Apache) are
  kept for other hosts and are inert here.

The repo's Pages source must be set to **GitHub Actions**, not "Deploy from a
branch", or the workflow uploads an artifact nothing serves.

## The project inventory

`src/data/projects.js` is the source of truth. Every entry carries an explicit
`role` and a `verified` flag; anything unverified renders nowhere and is
unreachable by URL. See the comment at the top of that file, and PLAN.md §1,
for why that rule exists.
