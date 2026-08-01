export const site = {
  name: 'James Gathuru',
  initials: 'JG',
  // Absolute, no trailing slash. Canonicals, OG tags and the sitemap are all
  // built from this, so the deployed domain lives in exactly one place.
  url: 'https://jamesgathuru.me',
  role: 'Frontend Engineer',
  specialism: 'React',
  location: 'Nairobi, Kenya',
  email: 'jamesgathuru001@gmail.com',
  phone: '+254 757 182050',
  phoneHref: 'tel:+254757182050',
  linkedin: 'https://www.linkedin.com/in/james-gathuru/',

  // GitHub is deliberately NOT surfaced yet — see PLAN.md §7.
  // The public account's newest push is 2024-10-08 and everything on it is the
  // 2019–24 Django/Heroku student era; the real work lives in a private org.
  // Linking it today would disprove the site's own thesis. Re-enable once the
  // account is cleaned up and this repo is public.
  github: null,

  headline: ['I build interfaces', 'that feel inevitable.'],

  manifesto:
    "I'm a frontend engineer in Nairobi. I work in React, and I care about the part most people skip — how it feels. The weight of a transition. Whether the thing you clicked responds before you doubt it. I build the front of products people actually use to get paid, get to school, and get to work.",

  about: [
    "I started out full-stack and drifted, deliberately, toward the front. It's where the judgment lives: the difference between a product that works and one that feels like it's on your side is almost always decided in the last 5% — the easing curve, the loading state, the focus ring nobody thanks you for.",
    'Now I lead frontend on production platforms across fintech, community, and mobility — cinematic marketing sites, live dashboards, and the unglamorous flows in between.',
    "Outside of it: cars, and Manchester United. Neither is negotiable.",
  ],
};

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Craft', href: '#craft' },
  { label: 'Stack', href: '#stack' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];
