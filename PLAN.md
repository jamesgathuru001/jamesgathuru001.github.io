# James Gathuru — Personal Portfolio (Ultra Spec)

A world-class personal portfolio positioning **James Gathuru** as a **Frontend Engineer (React)**.
Replaces the 2019-era portfolio at `jamesgathuru001.github.io/Portfolio-Website/` (Angular.js /
Django / Heroku links — all now stale).

**Key distinction:** `algora-digital` (algoradigital.tech) is the *company's* portfolio — it sells
Algora as a team ("we build for ambitious businesses"). This site is *James* — first person, an
engineer's craft résumé. Same underlying project inventory, completely different argument.

---

## 1. Positioning

| | Algora (company) | This site (personal) |
|---|---|---|
| Voice | "We" — agency, services, inquiries | "I" — engineer, craft, hire me |
| Sells | Scope of services, client outcomes | Frontend depth, taste, engineering judgment |
| CTA | "Start a project" | "Hire me / see the code / read the case study" |
| Proof | Logos + outcomes | **The site itself** is the proof of frontend skill |

> The single most important idea: for a *frontend engineer*, the portfolio **is** the work sample.
> Every animation here is an argument that he can be trusted with someone's interface.

**Headline direction** (pick one at build):
- *"I build interfaces that feel inevitable."*
- *"Frontend engineer. React specialist. Nairobi."*
- *"I make the web feel like it's on your side."*

**The honest frame on attribution.** These are real shipped products, but they were delivered
through Algora with a team — backend, mobile, and firmware were often other people. The site must
say **"my role: frontend"** on each case study, not imply solo authorship. This is not a modesty
tax; specificity ("I owned the React frontend and the design system") reads as *more* senior than a
vague claim on the whole stack, and it survives the interview where a vague claim doesn't.

---

## 2. Stack

Modeled on `parkiq` / `atom-website` / `ndai-website` — the cinematic house style — **not** on
`algora-digital` (Tailwind + shadcn + TanStack is heavier than a portfolio needs, and shadcn
defaults would make the site look like every other shadcn site, which is fatal here).

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 8 + React 19** | Already scaffolded as `james-portfolio` |
| Language | **JavaScript (JSX)** | Matches parkiq/atom/ndai; TS adds ceremony without payoff on a static site |
| Animation | **framer-motion** | Scroll reveals, layout transitions, springs, shared-element |
| Smooth scroll | **lenis** | Scroll feel is 50% of "expensive". Non-negotiable for this tier |
| Icons | **lucide-react** | House standard |
| Routing | **react-router-dom** | Landing + per-project case studies + /uses |
| Styling | **Hand-authored CSS + design tokens** (`styles/tokens.css`) | Total control; no utility-class ceiling |
| Hero FX | **WebGL/Canvas** — see §5 | The signature moment |
| 3D (optional) | **three** | `atom-website` already depends on it — precedent exists |

**Deliberately excluded:** Tailwind, shadcn, any component library. A frontend engineer's portfolio
built from someone else's components undercuts its own thesis.

---

## 3. Brand & Theme — **LOCKED**

The old portfolio had no real identity. This one needs one — a personal mark, not a company logo.

### The accent problem (measured, not guessed)

Every one of the 8 products was screenshotted and its dominant saturated hues sampled
(`npm run shoot`). The result reframes the color choice:

| Project | Canvas | Dominant hue(s) | Featured |
|---|---|---|---|
| egesha | near-black (12% L) | **150° spring green** | ★ |
| Ndai | near-black (16% L) | **360° crimson** + 195° cyan | ★ |
| Fomless | near-black (11% L) | **195° cyan → 330° magenta** (+ particle constellation) | ★ |
| Advance | dark (18% L) | **15–30° amber/orange** | |
| Orca | dark navy (9% L) | **195° cyan** | |
| Cheko | dark photo (20% L) | **45° gold** | |
| StudioOS | cream (76% L) | **30–45° gold** | |
| DAMA | white (90% L) | **210° blue** | |

Two findings that decide this:

1. **Green is unusable.** egesha — a *featured* project — is already spring green on near-black.
   A green portfolio would be indistinguishable from a project card sitting on its own homepage.
2. **Cyan is the most crowded hue on the board** (195° in Ndai, Fomless, *and* Orca). The obvious
   "electric cyan" pick was the worst available option.

Occupied: 15, 30, 45, 150, 195, 210, 330, 360. **Free: 225–250°.**

### Decision: **blue — ultramarine / blue-violet**

| Token | Value | Hue | Contrast on canvas | Use |
|---|---|---|---|---|
| `--accent` | **`#5A6CFF`** | 233° | 4.73 : 1 ✅ | Core identity, links, focus rings, particles |
| `--accent-bright` | **`#7C9CFF`** | 225° | 7.59 : 1 ✅ | Small text, high-contrast needs |
| `--accent-deep` | **`#4361FF`** | 230° | 4.14 (large only) | Fills, glows, gradient stops — never text |

Blue was the right call of the two, but only when **pushed off the default**. Stock `#3B82F6` sits
at 217° — right next to DAMA — and is the single most common dev-portfolio accent alive. Pushing to
233° lands in the one gap nothing else occupies, stays unmistakably blue, and passes AA at 4.73:1.

- **Canvas:** `#070A12` — a blue-tinted ink, *not* neutral black. Six of the eight products use
  near-neutral black; the blue-shifted canvas makes this site read as its own world in a tab strip
  full of his own work.
- **Restraint rule (important):** every project card carries its own loud brand color — green,
  crimson, magenta, gold. If the portfolio's chrome is *also* loud, the work section becomes noise.
  So the site's chrome stays near-monochrome and **the accent is rationed** (particles, focus rings,
  links, one CTA). The project art brings the color. This is what stops a dark/neon portfolio from
  blending into its own dark/neon screenshots.
- **Type:** an editorial display face with real personality for headlines
  (Satoshi / General Sans / Instrument Serif for contrast) + **Inter** for body/UI. Variable fonts,
  self-hosted, `font-display: swap`, subset to Latin.
- **Motifs:** grain overlay, vignette, glass panels, hairline rules, oversized type, generous
  negative space, monospace metadata labels (`// 2025 — FINTECH`).
- **Light theme:** ship dark-first; light theme is a stretch goal, and only if it looks *designed*
  rather than inverted. A bad light mode is worse than no light mode.

---

## 4. Page map

### `/` — Landing
1. **Loader** — brief, branded, masks font/WebGL boot. Counts to 100 or wipes on a mask reveal.
   Hard rule: **never exceeds ~1.2s**, and is skipped on repeat visits (`sessionStorage`).
2. **Hero** — full-viewport signature moment (§5). Name, "Frontend Engineer / React", location,
   availability pill. Scroll cue.
3. **Intro / manifesto** — 2–3 sentences, big type, scroll-linked word-by-word reveal.
   Who he is and what he's for.
4. **Selected work** — 3 featured projects. **Provisionally Ndai, ShuleDrive, DAMA** — the three with
   verified frontend-lead roles (§7), *not* Algora's `featured: true` set. Full-bleed cards with
   hover video/scrub preview → click into case study.
5. **All work** — the remaining projects as a filterable index (Cheko, Advance, StudioOS, egesha,
   Fomless — pending the role answers in §7). Filters: All · Fintech · SaaS · Web.
6. **Craft / capabilities** — not a skills bar chart. **Interactive demos** proving frontend depth:
   see §6. This is the section that separates this portfolio from every other one.
7. **Stack** — the real inventory, frontend-weighted (§7).
8. **About** — photo, story, the Kenya/Nairobi context, the cars + Man United human detail
   (it was on the old site and it *works* — personality is a differentiator).
9. **Contact / CTA** — email, availability, socials. Big, warm, direct.
10. **Footer** — mark, nav, socials, colophon ("built with React 19 + Vite, animated with
    framer-motion, no UI library"), local time in Nairobi.

### `/work/:slug` — Case study (×8)
The depth play. Most portfolios stop at a screenshot grid; this is where senior reads.
Template: hero shot → the problem → **my role (explicit)** → the interesting frontend problem →
how I solved it → what shipped → live link. Shared-element transition from the card.

### `/uses` (stretch) — editor, tools, setup. Cheap to build, disproportionately loved.

---

## 5. The hero — signature moment — **LOCKED: interactive particles → "JG"**

Particles disperse in a cursor-reactive field, then **resolve into the initials `JG`** on load;
re-scatter on interaction; disperse again on scroll-out. `atom-website` already ships
`ParticleNetwork.jsx` + three.js — proven precedent to build from.

### One constraint discovered during asset capture

**Fomless — a featured project — already has a particle-constellation hero** (dots joined by
connecting lines over near-black). Its card will sit a few hundred pixels below this hero. So the
portfolio's particle field must not read as the same effect:

- **Do not draw connecting lines between particles.** The joined-node constellation *is* Fomless's
  look; reusing it makes the hero look derivative of a project on the same page.
- Use a **magnetic flow field** instead: unconnected particles with velocity/curl noise, attracted
  and repelled by the cursor, resolving to glyph-mask target positions. Motion carries the effect,
  not topology.
- Particles are `--accent` (233°) — a hue Fomless doesn't use (it runs 195→330°).

### Technique

Sample the `JG` glyphs to a target point cloud (render text to an offscreen canvas → read pixel
alpha → sample positions), then spring each particle toward its target. Canvas2D is likely enough
for ~2–4k particles; escalate to three.js/WebGL points only if profiling demands it — **do not pay
100KB+ for three.js before proving Canvas2D fails.**

**Non-negotiables:** static poster frame first paint; the field boots after; full CSS fallback if
`prefers-reduced-motion` or no WebGL/canvas context; **pause the RAF loop when the tab is hidden or
the hero is scrolled out** (the most common portfolio perf bug — a hero eating battery from three
screens away). On mobile: fewer particles, no cursor field, resolve straight to `JG`.

---

## 6. The "craft" section — the real differentiator

A React specialist's portfolio should *demonstrate*, not *assert*. Skills bars ("React ████░ 90%")
are the single strongest negative signal in a frontend portfolio — they're unfalsifiable and
everyone has them. Replace with 3–4 small, real, interactive demos, each with a "view source" toggle:

- **Animation** — a spring playground: drag a card, tune stiffness/damping live, watch it respond.
- **State** — a tiny undo/redo or optimistic-UI demo (he already built `undo.ts` + optimistic sync
  in `algora-digital/src/lib/` — port the real thing, not a toy).
- **Performance** — a virtualized 10,000-row list scrolling at 60fps next to a naive one dying.
- **Accessibility** — a keyboard-navigable combobox/dialog built to spec, with a live focus-ring
  and screen-reader-output visualizer.

Each demo is a claim that can be *checked* on the spot. That's the whole point.

---

## 7. Content inventory (real — pulled from `algora.transfa.org/public/projects`)

All 8 shipped, all React + TypeScript on the frontend.

| Project | Client | Year | Live | James's verified role | Evidence |
|---|---|---|---|---|---|
| **Ndai Africa** ★ | Ndai Africa | 2025–26 | ndai.africa | **Software Engineer, Ndai Africa (Jan 2026–). Led design + build of the *marketing website*** — WebGL hero, video testimonials, vehicle showcase, content system | LinkedIn + `ndai-website/` in this folder |
| **ShuleDrive** | ShuleDrive | 2026 | ✗ none | **Lead Frontend Developer (Jan 2026–).** Admin dashboard, Mapbox route visualization, reusable UI | LinkedIn + `shule-drive-revamp/` (**his own GitHub**) |
| **DAMA Kenya** | DAMA Kenya | 2025–26 | damakenya.org | **Lead Frontend Developer (Jan 2026–).** UI + backend API integration, payments, member dashboards | LinkedIn |
| **Cheko Properties** | Cheko Properties | 2025 | chekoproperties.com | Likely his — repo is `jamesgathuru001/agentsuite-pro` | Git remote (private repo) |
| **egesha** ★ | egesha | 2025 | egesha.net | ⬜ **UNKNOWN — needs James** | Algora API only |
| **Fomless** ★ | Fomless | 2026 | fomless.com | ⬜ **UNKNOWN — needs James** | `ALGORA-DIGITAL/FomlessWeb` |
| **StudioOS** | Milan Studios | 2025 | portal.milanstudios.co.ke | ⬜ **UNKNOWN — needs James** | Algora API only |
| **Advance** | Advance | 2025 | advance.transfa.org | ⬜ **UNKNOWN — needs James** | `ALGORA-DIGITAL/ADVANCE-WEB` |
| ~~Orca~~ | AtomIoT | — | — | **CUT** — login wall; dashboard holds third-party customer data | — |

★ = `featured: true` in Algora's API. **Note the tension: the two projects Algora features are the two
whose role is unverified, while the three with hard evidence (Ndai, ShuleDrive, DAMA) aren't featured
— and ShuleDrive isn't in Algora's list at all.** A personal portfolio should feature what he can
defend in an interview, not what the agency chose to feature. **Provisional featured set: Ndai,
ShuleDrive, DAMA** — revisit once the unknowns are answered.

### Two scope corrections that matter

1. **Ndai = the website, not the financing platform.** Algora's blurb describes lease-to-own credit
   assessment, contracts, and repayments. James's LinkedIn (and `ndai-website/`) describe the
   *marketing site*. The case study must claim the site — cinematic React/Vite/Framer Motion build
   with a WebGL hero and a self-serve content system. That's a strong, honest, verifiable story, and
   it's the closest thing he has to a direct work sample for *this* portfolio's own thesis.
2. **ShuleDrive has no live deployment.** `shuledrive.com` doesn't resolve; `staging.shuledrive.com`
   returns 502; the repo is private. To use it: **run `shule-drive-revamp` locally and screenshot the
   dashboard** (seed with fake data — it's a school-transport system, so real routes are children's
   locations and must never ship). Otherwise it's a text entry.

**Stack, frontend-weighted for a personal site:**
- **Frontend (lead):** React, React 19, TypeScript, Next.js, Vite, Tailwind CSS, framer-motion, Lenis
- **Bridge:** Node.js, Express, tRPC, REST APIs
- **Also worked with:** Java/Spring Boot, Flutter/Dart, C (firmware), PostgreSQL, Prisma, Redis
- **Integrations:** M-Pesa, MQTT, Google Maps, Stripe, WhatsApp
- **Ops:** AWS, Docker, Nginx, Linux, CI/CD

> Presentation note: the old portfolio listed Python/Django/Flask/Angular.js. **Cut them.** A
> specialist's list is short. Anything that isn't frontend goes under a quieter "also worked with"
> heading — present but not competing with the headline claim.

**Contact (carried over, verify before ship):** Nairobi, Kenya · jamesgathuru001@gmail.com ·
+254 757 182 050 · P.O. Box 00902-1050, Kikuyu · LinkedIn. Drop Facebook/Instagram unless
they're professional.

### ⚠️ GitHub: do NOT link prominently yet — *this reverses the earlier draft of this plan*

An earlier version of §7 said "add GitHub prominently — it was missing from the old site." **Checking
the account proves that advice wrong.** `github.com/jamesgathuru001` today:

- **38 public repos. Most recent push: 2024-10-08.** Nothing public from 2025 or 2026 — a visible
  ~2-year gap ending exactly where the React career story begins.
- The public repos are **the 2019–2024 student era**: `instagram-clone`, `neighbourhood-watch`,
  `News-highlight`, `Awwards`, `Quotes1` — mostly **Python/Django**, with **dead Heroku links**.
  These are the *same projects as the old portfolio* this site exists to replace.
- Bio still reads *"Am a Fullstack Web developer, and a car enthusiast."*
- **The real work isn't his to publish:** Ndai, Fomless, Advance, ParkIQ, and Laundry all live under
  the **`ALGORA-DIGITAL` org**. His own real repos (`shule-drive-revamp`, `agentsuite-pro`) are
  **private**. `DAMA-ADMIN` belongs to a colleague's account.

A recruiter clicking "GitHub" from a portfolio claiming React specialism lands on Django coursework
and a two-year silence. **That link would actively disprove the site's thesis** — the exact opposite
of what it's there for. Fix before linking, in rough order of payoff:

1. **Ship this portfolio as a public repo.** A hand-built React 19 site with a custom particle hero
   and no UI library is a *better* public artifact than anything currently on the account — and it's
   unambiguously his.
2. **Update the bio** to the frontend positioning.
3. **Archive the dead student repos** (or at minimum pin nothing with a broken Heroku link).
4. **Ask Algora** whether any client repo can be open-sourced, even partially.
5. Only then link GitHub — from the footer, not the hero.

**Assets — ✅ CAPTURED (was the main blocker)**

All 8 products shot at **2560×1600** (1280×800 @ 2× DPI) via Playwright + Chromium, plus full-page
long shots. Reproducible, not hand-made:

```
npm run shoot    # scripts/shoot.mjs    → assets-src/work/*.png   (raw, gitignored)
npm run assets   # scripts/optimize.mjs → public/assets/work/*.{avif,webp}
```

Every URL returned **200** — no dead links in the portfolio, which the old site couldn't say.
Optimized to 4 responsive widths (400/800/1200/1600) in AVIF + WebP:
**60.3 MB raw → 4.28 MB shipped.** Re-run `npm run shoot` any time a client site redesigns.

**Orca: CUT.** Its public URL is a login wall. Behind it is a live SuperAdmin console (Vehicles,
Users, Payments, Audit Log) holding **AtomIoT's customers'** vehicle positions and payment records —
third-party personal data that is not ours to publish, whoever wrote the code. Login screenshots and
the login script have been deleted; no credentials are stored anywhere in this repo. If Orca ever
returns, it needs a **demo account with seeded fake data** plus AtomIoT's written sign-off.

**StudioOS has a "View live demo" CTA** on its marketing page which may expose a real dashboard
without credentials — worth chasing, since a genuine dashboard shot beats another landing page.
Same rule applies: if it shows real client data, it doesn't ship.

**Photo: ✅ done.** `assets-src/james.jpeg` (1280×1280) → square crops at 200/400/800/1200 in
AVIF + WebP, `public/assets/brand/`, **280 KB total**. Grey blazer on a dark backdrop — sits well on
the `#070A12` ink canvas with the ultramarine accent.

**CV: ⚠️ needs a rewrite, not a link.** The current PDF documents IT-support and security
internships (Hillpark Hotel, Consolidated Bank) and lists Django, Canva, and prompt engineering as
"experienced," with Git as "familiar" — while omitting every 2026 frontend role. It contradicts the
site. Rewrite around the Ndai / ShuleDrive / DAMA roles before it's downloadable. See §15.

**Nice-to-have:** short silent MP4/WebM loops for hover previews. Scriptable with Playwright's
video recording — deferred to the motion pass, not a blocker.

---

## 8. Motion system

Motion is the thesis, so it has to be *systematic*, not sprinkled. Tokens in `tokens.css`,
one shared easing vocabulary, everything else composes from it.

- **Easing:** one expressive curve `cubic-bezier(.16,1,.3,1)` for entrances; springs
  (framer-motion) for anything interactive. Never linear, never `ease` default.
- **Durations:** 180ms (micro/hover) · 420ms (element) · 700ms (section) · 1000ms+ (hero only).
- **Choreography:** stagger children 40–60ms. Nothing arrives all at once.
- **Scroll:** Lenis + `useScroll`/`useTransform` for parallax and scrub. Reveals fire once at
  ~20% viewport, never re-trigger on scroll-up (re-triggering reads as cheap).
- **Page transitions:** shared-element card → case-study hero via framer-motion `layoutId`.
- **Micro-interactions:** magnetic buttons, link underline sweeps, tilt on cards, count-ups.
  `parkiq`/`ndai-website` already have `Magnetic.jsx`, `Reveal.jsx`, `CountUp.jsx`,
  `ScrollProgress.jsx` — **port them, don't rewrite.**
  A custom cursor was built and then **removed** (2026-07): replacing the system cursor costs
  every visitor their OS pointer conventions and buys atmosphere only. The native cursor stays.

**The taste rule:** the difference between "world-leading" and "over-animated" is *restraint under
load*. Every section animating equally hard = noise, and reads as a junior showing off every trick
learned. Pick **one** signature moment per section and let the rest be still. The hero earns 1000ms;
almost nothing else does.

**Reduced motion is a first-class path, not a fallback.** `prefers-reduced-motion` must yield a
site that is still *designed* — opacity fades only, no transforms, WebGL → static gradient. A
frontend engineer's portfolio failing an a11y preference is a self-refuting artifact, and it's the
first thing a senior reviewer checks.

---

## 9. Performance budget

Non-negotiable, because a slow portfolio disproves its own thesis:

- **Lighthouse ≥ 95** on all four categories, mobile profile. Verified before ship.
- **LCP < 1.8s** on 4G. **CLS ~0.** **INP < 200ms.**
- JS ≤ ~180KB gzipped on the landing route; three.js/WebGL **lazy + code-split**, never in the
  initial chunk.
- Images: AVIF/WebP via `sharp` (already a devDep in `ndai-website` — reuse the script), correct
  `width`/`height`, `loading="lazy"` below fold, LCP image preloaded.
- Video previews: `preload="none"`, load on hover intent, `muted playsinline`, poster always.
- Fonts self-hosted + preloaded + subset. No FOUT.
- Route-level code splitting for case studies.

## 10. Accessibility & SEO

- Semantic landmarks, real heading hierarchy, visible focus rings (styled, never removed).
- Full keyboard path through every interactive demo; skip link.
- Contrast ≥ 4.5:1 — **check the accent against `#08080A` early**, because a neon accent on
  near-black is exactly where a beautiful palette fails an audit and gets redesigned late.
- Alt text on every project image; captions on any video with speech.
- Per-route `<title>`/meta/OG, JSON-LD `Person` schema, OG images per case study, sitemap, RSS if
  a notes section lands.

## 11. Structure

```
src/
  styles/       tokens.css, global.css, type.css
  components/
    Hero/           (signature WebGL/canvas moment + fallback)
    Nav/  Loader/  Cursor/  Magnetic/  Reveal/  CountUp/  ScrollProgress/
    ProjectCard/  Marquee/  ThemeToggle/  Grain/
    craft/          SpringPlayground/  VirtualList/  A11yCombobox/  OptimisticDemo/
  sections/     Hero, Manifesto, SelectedWork, WorkIndex, Craft, Stack, About, Contact, Footer
  pages/        Landing.jsx, CaseStudy.jsx, Uses.jsx, NotFound.jsx
  data/         projects.js, stack.js, craft.js, site.js   ← real data from §7
  hooks/        useLenis.js, useReducedMotion.js, useDocumentMeta.js, useInView.js
  App.jsx  main.jsx
public/assets/  work/ (screens + loops)  brand/  james.jpg  cv.pdf
```

## 12. Build order

1. ✅ **Foundation** — `tokens.css` (accent scale, motion vocabulary), `global.css`, Lenis,
   `Reveal`/`Magnetic`/`CountUp`/`ScrollProgress`/`SocialIcon` **ported** from
   `ndai-website` rather than rewritten.
2. ✅ **Content layer** — `data/projects.js`, `site.js`, `stack.js`. Every project carries an
   explicit `role` and a `verified` flag; unverified ones render nowhere.
3. ✅ **Landing skeleton** — Nav, Hero, Manifesto, Work, Craft, Stack, About, Contact, Footer.
4. ✅ **Hero signature moment** — particle field resolving into `JG`. Canvas2D, ~2.5k particles,
   no connecting lines, RAF paused off-screen/hidden.
5. ✅ **Motion pass** — scroll reveals w/ stagger, scroll-linked manifesto, magnetic buttons,
   link sweeps, `MotionConfig reducedMotion="user"`.
6. ✅ **Case studies** — unblocked 2026-07-30 when James confirmed lead frontend on egesha,
   Fomless, Advance, Cheko, Atom and Algora. `/work` indexes all nine; `/work/:slug` renders the
   `contribution[]`, `scope` and full-page capture each entry already carried. An unverified or
   unknown slug redirects to the index, so the inventory rule holds at the route level too.
7. ✅ **Craft demos** — the differentiator (§6). All three built and live behind an accessible
   dialog: spring solver (plotted from the same physics driving the card), 10k-row virtualized
   vs naive with a live FPS meter, and an ARIA 1.2 combobox exposing its own announcements.
8. ⬜ **Polish** — OG images, prerendering for crawlers, full a11y audit.
   Done: mobile nav sheet (there was none below 820px), tap-target pass, hero leading,
   self-hosted fonts (§9 TODO closed — zero third-party requests, LCP 1.61s against the 1.8s
   budget), route + demo code-splitting (landing JS 143 → 134 KB gzip).
9. ✅ **Test suite** — `npm test`. 29 Playwright specs against the *production build*, because
   code-split chunks and `/fonts` only exist after `vite build`. Every spec corresponds to a bug
   actually found by driving the UI, not a hypothetical.
10. ✅ **Look and feel** —
   - **Per-project accent.** `accentHue` had been authored on all nine projects and read by
     nothing; the screenshots carried each product's colour while the UI around them stayed 233°
     blue. Work cards, /work cards and whole case-study pages now adopt it. Saturation and
     lightness are pinned so only the hue moves — verified all nine land between 7.71:1 and
     15.39:1 against both surfaces, and a test guards any hue added later.
   - **Chapters.** Every section was transparent over one flat `--bg`, so the page read as a
     single 6,500px slab. Manifesto / Craft / About now sit on a raised surface with faded
     seams, and padding is weighted by importance instead of uniform.
   - **Editorial.** Numbered section indices (01–05) ahead of the eyebrow rule.
9. ⬜ **Ship** — Vercel/Netlify, domain, analytics.

### Verified, not assumed (run against the production build)

| Check | Result |
|---|---|
| Build | ✅ passes — **117 kB JS gzipped** (budget: 180 kB), 3.9 kB CSS |
| Console/page errors | ✅ none |
| Particle glyph actually paints | ✅ 34k lit pixels on canvas |
| Reduced motion | ✅ glyph drawn statically, no RAF loop, reveals still resolve to opacity 1 |
| Mobile (390×844) | ✅ no horizontal scroll; glyph sized up so it reads |
| Anchor nav vs fixed header | ✅ `#work` heading clears the nav (`scroll-margin-top`) |
| Photo aspect | ✅ 380×380, ratio 1.00 |

**Bugs found by looking at it, then fixed:** the glyph originally filled the viewport with the
headline straight through it (mud); the `height="800"` attribute beat `width:100%` and rendered the
square photo at 1:2; the custom cursor painted a ring at viewport centre before the mouse moved
(the cursor has since been removed entirely); anchors landed under the fixed nav; the mobile glyph
collapsed to a sparse smudge; the manifesto's per-word spans were `inline-block`, so the browser
trimmed the trailing space inside each one and every word ran together.

**Bugs found by driving the craft demos in a real browser:** the dialog's focus trap treated
`button:not([disabled])` as tabbable, so a `tabindex="-1"` control became the "last" stop and Tab
fell straight out; the dialog listened for Escape in the *capture* phase, so no nested widget could
ever keep the key for itself; and the combobox called `stopPropagation()` unconditionally on
Escape, which meant that once its list was closed and its field empty it swallowed the key forever
— a keyboard trap, in the keyboard-accessibility demo.

## 13. Decision log

| # | Decision | Status |
|---|---|---|
| 1 | **Accent** — ultramarine `#5A6CFF` (233°) on ink `#070A12`; green rejected (egesha owns 150°), cyan rejected (3 projects own 195°) | ✅ **Locked** — §3 |
| 2 | **Hero** — cursor-reactive particle field resolving into `JG`; no connecting lines (Fomless owns that look) | ✅ **Locked** — §5 |
| 3 | **Assets** — all 8 shot at 2560×1600, optimized to 4.28 MB, reproducible via `npm run shoot` | ✅ **Done** — §7 |
| 4 | **Orca** — cut (login wall + third-party customer data) | ✅ **Cut** — §7 |
| 5 | **Photo** — processed to 200/400/800/1200 AVIF+WebP, 280 KB | ✅ **Done** — §7 |
| 6 | **Roles verified for Ndai / ShuleDrive / DAMA** via LinkedIn; Ndai = *website*, not the financing platform | ✅ **Confirmed** — §7 |
| 7 | **Role on egesha, Fomless, StudioOS, Advance** — case studies can't be written without this | ⬜ **Needs James — blocking §12.6** |
| 8 | **Employment relationship** — are the 3 "full-time" roles Algora client projects? Blocks the CV | ⬜ **Needs James — blocking §14** |
| 9 | **GitHub cleanup** before linking (public account contradicts the site) | ⬜ **Needs James** — §7 |
| 10 | **ShuleDrive shots** — no live site; run locally with seeded fake data? | ⬜ Open |
| 11 | **Domain** — `jamesgathuru.dev`? | ⬜ Open |
| 12 | **Craft demos** — all 4, or 2 done exceptionally? (2 done exceptionally, probably) | ⬜ Open — §6 |

Items 7 and 8 block the case studies and the CV. **Nothing blocks build steps 1–5** (foundation,
content layer, landing skeleton, particle hero, motion pass) — those can start now.

## 14. CV rewrite — **blocked on one answer**

James asked for the CV to be updated with the current Ndai role. Reading the PDF against LinkedIn
surfaced a problem bigger than a missing entry.

**What the current CV says:** Tecnovation dev intern (2020) → study/COVID gap (2020–23) → Hillpark
Hotel **IT Support** intern (Dec 2023–Jan 2025) → Consolidated Bank **security/anti-fraud** intern
(Apr–Aug 2025) → freelance **web & IT support** (Mar 2025–). Skills: *"Experienced: React JS,
Python, Java, Django, AI, Prompt Engineering, Canva. Familiar: REST APIs, Angular.js, Git."*

**What LinkedIn says:** three roles, all **Jan 2026 – Present · Full-time · On-site** — Software
Engineer at **Ndai Africa**, Lead Frontend Developer at **DAMA Kenya**, Lead Frontend Developer at
**ShuleDrive**.

**The blocker: three concurrent full-time on-site jobs.** Read literally, that is not possible, and
a recruiter will read it literally — it reads as padding and it undermines the true parts.
Near-certainly these are **client projects delivered through Algora Digital** (their repos live in
the `ALGORA-DIGITAL` org). If so, the honest structure is also the stronger one:

```
Frontend Engineer — Algora Digital · Jan 2026 – Present
  Ndai Africa      — led the marketing site: React/Vite/Framer Motion, WebGL hero, content system
  DAMA Kenya       — lead frontend: member platform UI, API integration, payment workflows
  ShuleDrive       — lead frontend: admin dashboard, Mapbox route visualization
```

One employer, three substantial client projects. Nothing is lost; the impossible timeline is.
**Needs James to confirm the employment relationship before the CV can be written.**

Other fixes queued for the rewrite:
- **Cut the skills inflation.** "Experienced: … Django, AI, Prompt Engineering, Canva" with "Git:
  familiar" is a junior-signalling list, and *Git as "familiar"* actively alarms a hiring manager.
  Replace with a short frontend-weighted list (§7).
- **Lead with 2026.** Reverse-chronological currently opens on hotel IT support.
- **The IT-support and bank-security internships stay** — but compressed to one line each. They're
  real and they show range; they just shouldn't outweigh the engineering.
- **Typo on LinkedIn:** ShuleDrive entry reads *"Lead Frontend **Develper**"*. Fix on the profile.
- **Drop the referees' phone numbers and emails** from a CV that gets posted publicly — replace with
  "References available on request."

## 15. Out of scope (v1)

- No backend. Contact is `mailto:` + socials (or a Formspree/Resend endpoint if a form is wanted).
- No CMS — content lives in `src/data/*.js`. It's 8 projects and one person; a CMS is overhead.
- No blog at launch. Leave `/notes` as a hook; an empty blog is worse than no blog.
- Not reusing the `algora-digital` admin/API. This site is static, personal, and independent.
