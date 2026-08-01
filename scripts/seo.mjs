/**
 * Bake per-route meta into real HTML files, and emit the sitemap.
 *
 * ── Why this exists ──
 * This is a client-rendered SPA. Every route used to resolve to the same empty
 * shell, which caused two separate problems:
 *
 *   1. Social scrapers (WhatsApp, LinkedIn, X, Slack, iMessage) do not run JS.
 *      The `document.title` swaps in WorkPage/CaseStudy are invisible to them,
 *      so every shared link previewed as the landing page.
 *   2. GitHub Pages answered /work with its 404.html fallback — the app booted
 *      and looked fine, but the STATUS was 404, and Google drops 404s from the
 *      index. Writing dist/work.html makes it a real file, served 200.
 *
 * Writing physical files fixes both at once. The SPA still boots on top, so
 * behaviour for real users is unchanged; the baked meta is purely an upgrade
 * for machines that never get as far as running the bundle.
 *
 * ── Rules ──
 * Tags are REPLACED, matched by their unique attribute, never appended — an
 * appended og:title would leave two, and scrapers take the first.
 * This never fails the build: bad SEO output is worth less than a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/data/site.js';
import { shown } from '../src/data/projects.js';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const BASE = site.url;


/** Escape for an HTML attribute. Project copy is full of quotes and dashes. */
const attr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const url = (p) => `${BASE}${p === '/' ? '/' : p}`;

const routes = [
  {
    path: '/work',
    title: `Work — ${site.name}`,
    description:
      `Selected frontend work by ${site.name}: ${shown.map((p) => p.title).join(', ')}. ` +
      'Production platforms across fintech, mobility and community.',
    ld: () => [
      {
        '@type': 'CollectionPage',
        '@id': `${url('/work')}#page`,
        url: url('/work'),
        name: `Work — ${site.name}`,
        about: { '@id': `${BASE}/#person` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: shown.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: url(`/work/${p.slug}`),
            name: p.title,
          })),
        },
      },
      breadcrumb([['Home', '/'], ['Work', '/work']]),
    ],
  },
  ...shown.map((p) => ({
    path: `/work/${p.slug}`,
    title: `${p.title} — ${p.subtitle} | ${site.name}`,
    description: p.summary,
    ld: () => [
      {
        '@type': 'CreativeWork',
        '@id': `${url(`/work/${p.slug}`)}#work`,
        url: url(`/work/${p.slug}`),
        name: p.title,
        headline: `${p.title} — ${p.subtitle}`,
        description: p.summary,
        // The role, not the whole product: the inventory's core rule is that we
        // claim the surface James owned and nothing more. Marking him up as
        // `creator` of the platform would contradict the visible page.
        about: p.category,
        dateCreated: p.year,
        keywords: p.tech.join(', '),
        author: { '@id': `${BASE}/#person` },
        isPartOf: { '@id': `${BASE}/#website` },
      },
      breadcrumb([['Home', '/'], ['Work', '/work'], [p.title, `/work/${p.slug}`]]),
    ],
  })),
];

function breadcrumb(pairs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: pairs.map(([name, p], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: url(p),
    })),
  };
}

/** Swap a whole tag matched by a unique attribute, or report it as missing. */
function swap(html, pattern, replacement, label, missing) {
  if (!pattern.test(html)) {
    missing.push(label);
    return html;
  }
  return html.replace(pattern, replacement);
}

function render(shell, route) {
  const missing = [];
  const href = url(route.path);
  let out = shell;

  out = swap(out, /<title>[\s\S]*?<\/title>/, `<title>${attr(route.title)}</title>`, 'title', missing);
  out = swap(
    out,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${attr(route.description)}" />`,
    'description',
    missing
  );
  out = swap(
    out,
    /<link\s+rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${attr(href)}" />`,
    'canonical',
    missing
  );
  out = swap(out, /<meta\s+property="og:url"[^>]*\/>/, `<meta property="og:url" content="${attr(href)}" />`, 'og:url', missing);
  out = swap(
    out,
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${attr(route.title)}" />`,
    'og:title',
    missing
  );
  out = swap(
    out,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${attr(route.description)}" />`,
    'og:description',
    missing
  );
  out = swap(
    out,
    /<meta\s+name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${attr(route.title)}" />`,
    'twitter:title',
    missing
  );
  out = swap(
    out,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${attr(route.description)}" />`,
    'twitter:description',
    missing
  );

  // The site-wide graph is replaced, not supplemented — one page, one graph.
  const graph = JSON.stringify({ '@context': 'https://schema.org', '@graph': route.ld() }, null, 2);
  out = swap(
    out,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${graph}\n</script>`,
    'json-ld',
    missing
  );

  return { html: out, missing };
}

const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('seo: dist/index.html not found — did the build run?');
  process.exit(1);
}
const shell = fs.readFileSync(indexPath, 'utf8');

let wrote = 0;
const problems = new Set();
for (const route of routes) {
  const { html, missing } = render(shell, route);
  missing.forEach((m) => problems.add(m));
  // `<route>.html`, not `<route>/index.html`. Static hosts resolve an
  // extensionless request to the .html file and answer 200 directly, whereas
  // the directory form makes them 301 to the trailing-slash URL first — which
  // would leave every canonical pointing at a redirect rather than at a page.
  const file = path.join(dist, `${route.path}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  wrote++;
}

const all = ['/', ...routes.map((r) => r.path)];
const lastmod = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map((p) => `  <url>\n    <loc>${url(p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  .join('\n')}
</urlset>
`
);

console.log(`seo: prerendered ${wrote} routes, wrote sitemap.xml (${all.length} urls)`);
if (problems.size) {
  // A tag the template no longer has means the rewrite silently did nothing —
  // worth shouting about, but not worth blocking a deploy over.
  console.warn(`seo: WARNING — these tags were not found in index.html and were not rewritten: ${[...problems].join(', ')}`);
}
