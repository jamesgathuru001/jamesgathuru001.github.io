/**
 * Project inventory.
 *
 * Source of truth for facts: https://algora.transfa.org/public/projects
 * Source of truth for ROLE: James, 2026-07-30 — confirmed lead frontend on
 * egesha, Fomless, Advance, Cheko, Atom and Algora's own site.
 *
 * ── The rule this file exists to enforce ──
 * Every entry carries an explicit `role`. These products were delivered with a
 * team — backend, mobile and firmware were often other people. Claiming the whole
 * stack reads as junior and collapses in an interview; naming the surface you
 * owned reads as senior and survives one. See PLAN.md §1.
 *
 * `tech` lists the frontend surface only, for the same reason: Algora's API
 * lists Java and Flutter against several of these, and they were not his.
 *
 * `verified: true`  → role confirmed by James.
 * `verified: false` → PENDING. Not rendered anywhere. Do not invent a role to fill it.
 */

export const projects = [
  /* ── Featured: the three that carry the landing page ─────────────────────── */
  {
    slug: 'ndai',
    title: 'Ndai Africa',
    subtitle: 'Cars for drivers',
    year: '2026',
    category: 'Fintech',
    client: 'Ndai Africa',
    live: 'https://ndai.africa',
    featured: true,
    verified: true,

    role: 'Software Engineer · Ndai Africa',
    roleShort: 'Led design + build of the marketing site',
    // Scope guard: Algora's blurb covers the whole lease-to-own platform (credit
    // assessment, contracts, repayments). James's work is the marketing site.
    // The case study claims the site. Nothing more.
    scope: 'The public marketing site — not the lease-to-own financing platform.',

    summary:
      'A cinematic, mobile-first landing experience for a fintech that lets ride-hailing drivers own their car in 30–48 months.',
    contribution: [
      'Led design and development of the main site end to end.',
      'Built an animated WebGL hero and a video-driven driver testimonial experience.',
      'Shipped a vehicle showcase plus integrated sign-up, WhatsApp and contact CTAs to convert visitors into drivers.',
      'Built a centralized content system so the team manages vehicles, testimonials and blog posts without a developer.',
    ],
    tech: ['React', 'Vite', 'Framer Motion', 'WebGL', 'Lenis'],
    accentHue: 360,
  },
  {
    slug: 'egesha',
    title: 'egesha',
    subtitle: 'Smart parking payments',
    year: '2025',
    category: 'Fintech',
    client: 'egesha',
    live: 'https://egesha.net/',
    featured: true,
    verified: true,

    role: 'Lead Frontend Developer · egesha',
    roleShort: 'Led the frontend — the whole web surface',
    scope: 'The web application. The payment rails, backend and mobile app were other people.',

    summary:
      'A smart parking payments platform digitizing how cities collect parking fees — drivers pay from their phone in seconds, operators get real-time reconciliation instead of counting cash.',
    contribution: [
      'Led the frontend for the full web surface, from driver-facing payment flow to operator screens.',
      'Built the pay-by-plate journey down to the states that actually matter — pending, failed and retried payments.',
      'Implemented operator reporting views over live transaction data.',
      'Built a component system that kept the driver and operator surfaces consistent as both grew.',
    ],
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    accentHue: 150,
  },
  {
    slug: 'dama',
    title: 'DAMA Kenya',
    subtitle: 'Advancing data excellence in Kenya',
    year: '2026',
    category: 'Community',
    client: 'DAMA Kenya, Nairobi Chapter',
    live: 'https://damakenya.org',
    featured: true,
    verified: true,

    role: 'Lead Frontend Developer · DAMA Kenya',
    roleShort: 'Designed + built the UI and API integrations',
    scope: 'The web platform UI and its backend API integrations.',

    summary:
      'The official digital platform for the Kenyan chapter of the International Data Management Association — public site, member dashboard, events and resources.',
    contribution: [
      'Designed and implemented the user interface and backend API integrations.',
      'Built a responsive UI delivering a consistent experience across desktop and mobile.',
      'Integrated multiple backend APIs powering membership, events, training programs and dashboards.',
      'Implemented secure payment and transaction workflows for event registration and resource purchase.',
      'Engineered a scalable frontend architecture supporting blogs, news and community updates.',
    ],
    tech: ['React', 'TypeScript', 'REST APIs'],
    accentHue: 210,
  },

  /* ── The rest of the shipped work — /work page ───────────────────────────── */
  {
    slug: 'fomless',
    title: 'Fomless',
    subtitle: 'Kenya’s home of live events',
    year: '2026',
    category: 'Events',
    client: 'Fomless',
    live: 'https://fomless.com',
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · Fomless',
    roleShort: 'Led the frontend across the web platform',
    scope: 'The web platform. The companion Flutter app was not his.',

    summary:
      'An event ticketing platform — discover events, buy and manage tickets, and run organizer sales, with separate attendee, organizer and admin experiences.',
    contribution: [
      'Led the frontend for all three web surfaces: attendee, organizer and admin.',
      'Built event discovery and the checkout flow through to ticket delivery.',
      'Implemented the organizer console for event creation, approval workflows and live sales.',
      'Consumed a tRPC/REST API shared with the mobile client, keeping types honest end to end.',
    ],
    tech: ['React', 'TypeScript', 'tRPC', 'Tailwind CSS'],
    accentHue: 330,
  },
  {
    slug: 'atom',
    title: 'Atom IoT',
    subtitle: 'Fleet and asset intelligence',
    year: '2025',
    category: 'IoT',
    client: 'AtomIoT',
    live: 'https://atomiot.live/',
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · AtomIoT',
    roleShort: 'Led the frontend on three surfaces — site, Orca, Neutron',
    scope:
      'Three frontends under the Atom umbrella: the public site, the Orca fleet dashboard and the Neutron POS. Firmware and device telemetry were not his.',

    summary:
      'An IoT fleet and asset-tracking business with three distinct frontends: the public marketing site, Orca — the operator dashboard for live vehicle and asset tracking — and Neutron, the point-of-sale console.',
    contribution: [
      'Built the public marketing site at atomiot.live.',
      'Led the frontend for Orca, the operator dashboard for live fleet and asset tracking.',
      'Built Neutron, the point-of-sale console running on the same platform.',
      'Kept one component and data-fetching layer across all three so they stayed consistent as the product line grew.',
    ],
    tech: ['React', 'TypeScript', 'Mapbox', 'REST APIs'],
    accentHue: 190,
    // Only the public site is linked and screenshotted. Orca (bucket.atomiot.live)
    // and Neutron (neutron.atomiot.live) are login walls over AtomIoT's customers'
    // live vehicle positions and payment records — not ours to publish.
    privateSurfaces: ['Orca — bucket.atomiot.live', 'Neutron — neutron.atomiot.live'],
  },
  {
    slug: 'advance',
    title: 'Advance',
    subtitle: 'Salary on demand',
    year: '2025',
    category: 'Fintech',
    client: 'Advance',
    live: 'https://advance.transfa.org/',
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · Advance',
    roleShort: 'Led the frontend — employee and employer web app',
    scope: 'The web application. Payroll integration and disbursement rails were other people.',

    summary:
      'Earned wage access for African teams — draw on wages already earned before payday, with employer-side controls for eligibility, disbursement and automated repayment reconciliation.',
    contribution: [
      'Led the frontend for both sides of the product: the employee withdrawal flow and the employer console.',
      'Built the eligibility and withdrawal journey, including the limit and fee states that decide whether people trust it.',
      'Implemented employer-side controls for approvals and repayment reconciliation at payroll.',
    ],
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    accentHue: 25,
  },
  {
    slug: 'cheko',
    title: 'Cheko Properties',
    subtitle: 'Own land you can be proud of',
    year: '2025',
    category: 'Real Estate',
    client: 'Cheko Properties',
    live: 'https://chekoproperties.com/',
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · Cheko Properties',
    roleShort: 'Led the frontend — storefront + back office',
    scope: 'The public storefront and the inventory back office.',

    summary:
      'A property sales and listings platform — browse available homes and land, capture buyer enquiries, and manage inventory and leads from a back office.',
    contribution: [
      'Led the frontend for the public listings storefront and the internal back office.',
      'Built listing browse, filtering and detail views over the property inventory.',
      'Implemented the enquiry capture flow that feeds the sales team.',
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    accentHue: 45,
  },
  {
    slug: 'algora',
    title: 'Algora Digital',
    subtitle: 'The studio’s own site',
    year: '2026',
    category: 'Studio',
    client: 'Algora Digital',
    live: 'https://algoradigital.tech/',
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · Algora Digital',
    roleShort: 'Led the frontend — site + admin portfolio CMS',
    scope: 'The public site and the admin surface the team uses to manage it.',

    summary:
      'The studio’s own site — services, process and a portfolio index driven by an admin CMS rather than hard-coded, so the team publishes work without a deploy.',
    contribution: [
      'Led the frontend for the public site.',
      'Built the portfolio index against a live projects API instead of static content.',
      'Built the admin surface the team uses to add and reorder case studies.',
    ],
    tech: ['React', 'TypeScript', 'TanStack Router', 'Tailwind CSS'],
    accentHue: 200,
  },
  {
    slug: 'shuledrive',
    title: 'ShuleDrive',
    subtitle: 'Getting students safely to school',
    year: '2026',
    category: 'Mobility',
    client: 'ShuleDrive',
    // Offline at time of writing: DNS doesn't resolve, staging returns 502.
    live: null,
    featured: false,
    verified: true,

    role: 'Lead Frontend Developer · ShuleDrive',
    roleShort: 'Architected the frontend + admin dashboard',
    scope: 'Frontend architecture and the operations dashboard.',

    summary:
      'A transportation management platform for school transport operations, with an interactive dashboard for monitoring routes and fleets.',
    contribution: [
      'Architected and developed the frontend experience for the platform.',
      'Built a data-driven dashboard for administrators to manage transportation workflows.',
      'Integrated Mapbox for route visualization and geospatial interaction.',
      'Connected frontend systems to backend APIs for real-time operational insight.',
      'Implemented scalable, reusable UI components for consistency and performance.',
    ],
    tech: ['React', 'Mapbox', 'TypeScript', 'REST APIs'],
    accentHue: 140,
  },

  /* ── PENDING ROLE ──────────────────────────────────────────────────────────
     Shipped through Algora, but James did not name it as his when asked on
     2026-07-30. Stays `verified: false` and renders nowhere.

     Do not promote this by writing a plausible-sounding role. The whole value of
     this portfolio is that every claim on it survives being asked "walk me
     through how you built that."
     ──────────────────────────────────────────────────────────────────────── */
  {
    slug: 'studioos',
    title: 'StudioOS',
    subtitle: 'The OS for premium photography studios',
    year: '2025',
    category: 'SaaS',
    client: 'Milan Studios',
    live: 'https://portal.milanstudios.co.ke/',
    featured: false,
    verified: false,
    role: null,
    summary:
      'Bookings, CRM, branded client galleries, invoicing, payments and analytics unified in one studio dashboard.',
    tech: ['React', 'TypeScript', 'Stripe', 'Node.js'],
    accentHue: 40,
  },
];

export const featured = projects.filter((p) => p.featured && p.verified);
export const shown = projects.filter((p) => p.verified);
export const pending = projects.filter((p) => !p.verified);

const WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];

/**
 * Spelled-out count for headlines, so "Three platforms, shipped." tracks the
 * inventory instead of going stale the moment a project is added. Falls back to
 * the numeral past twenty, where spelling it out stops reading well anyway.
 */
export const countWord = (n) => WORDS[n] ?? String(n);
