import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Lock } from 'lucide-react';
import useLenis from '../hooks/useLenis';
import ScrollProgress from '../components/ScrollProgress';
import Reveal from '../components/Reveal';
import Shot from '../components/Shot';
import Nav from '../sections/Nav';
import { Footer } from '../sections/Sections';
import { shown } from '../data/projects';
import { site } from '../data/site';

import '../styles/global.css';
import '../styles/landing.css';
import '../styles/craft.css';
import '../styles/work.css';
import '../styles/case.css';

export default function CaseStudy() {
  const { slug } = useParams();
  useLenis();

  const i = shown.findIndex((p) => p.slug === slug);
  const p = shown[i];

  useEffect(() => {
    if (!p) return undefined;
    const prevTitle = document.title;
    document.title = `${p.title} — ${site.name}`;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    meta?.setAttribute('content', `${p.roleShort} · ${p.summary}`);
    return () => {
      document.title = prevTitle;
      if (prevDesc) meta?.setAttribute('content', prevDesc);
    };
  }, [p]);

  // Unknown or unverified slug: send them to the index rather than a dead end.
  if (!p) return <Navigate to="/work" replace />;

  const next = shown[(i + 1) % shown.length];

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />

      <span id="top" />
      <Nav />

      {/* The whole page adopts the project's hue, so a case study reads as that
          product's world rather than a blue template with a screenshot in it. */}
      <main id="main" className="accent-scope" style={{ '--p-hue': p.accentHue }}>
        <header className="cs__head">
          <div className="container">
            <Link to="/work" className="workpage__back link-sweep">
              <ArrowLeft size={14} aria-hidden="true" /> All work
            </Link>
            <p className="eyebrow">
              {p.year} — {p.category}
            </p>
            <h1 className="cs__title">{p.title}</h1>
            <p className="cs__sub">{p.subtitle}</p>

            <dl className="cs__facts">
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{p.role}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{p.year}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{p.live ? 'Live' : 'Offline'}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="container">
          <div className="cs__hero">
            <Shot slug={p.slug} title={p.title} live={p.live} placeholder="Offline — capture pending" sizes="(max-width: 1240px) 100vw, 1192px" />
          </div>
        </div>

        <section className="section cs__body">
          <div className="container cs__grid">
            <div className="cs__main">
              <Reveal>
                <h2 className="cs__h2">The problem</h2>
                <p className="cs__lead">{p.summary}</p>
              </Reveal>

              <Reveal delay={0.06}>
                <h2 className="cs__h2">What I built</h2>
                <ul className="cs__contrib">
                  {p.contribution.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Reveal>

              {p.privateSurfaces && (
                <Reveal delay={0.1}>
                  <p className="wcard__private cs__private">
                    <Lock size={12} aria-hidden="true" />
                    Also built, behind login: {p.privateSurfaces.join(' · ')}. Not published — those
                    consoles hold customers&rsquo; live operational data.
                  </p>
                </Reveal>
              )}
            </div>

            <aside className="cs__aside">
              <Reveal delay={0.08}>
                {/* The scope line is the honest core: what was mine, and what wasn't. */}
                <div className="cs__scope">
                  <p className="cs__scope-key">Scope I owned</p>
                  <p className="cs__scope-val">{p.scope}</p>
                </div>

                <p className="cs__aside-key">Frontend stack</p>
                <ul className="pcard__tech cs__tech">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                {p.live ? (
                  <a
                    className="btn btn--ghost cs__visit"
                    href={p.live}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Visit live site <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="pcard__nolive cs__offline">Currently offline — no public URL</p>
                )}
              </Reveal>
            </aside>
          </div>
        </section>

        {/* The long shot. Captured by `npm run shoot` and optimized already —
            this page is the reason those -full files exist. */}
        {p.live && (
          <section className="section cs__long">
            <div className="container">
              <Reveal>
                <p className="cs__long-key">The full page</p>
                <div className="cs__long-frame">
                  <picture>
                    <source type="image/avif" srcSet={`/assets/work/${p.slug}-full.avif`} />
                    <img
                      src={`/assets/work/${p.slug}-full.webp`}
                      alt={`${p.title} — full page`}
                      loading="lazy"
                      decoding="async"
                      className="cs__long-img"
                    />
                  </picture>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        <section className="section cs__next">
          <div className="container">
            <Link to={`/work/${next.slug}`} className="cs__next-link">
              <span className="cs__next-key">Next project</span>
              <span className="cs__next-title">{next.title}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="section contact cs__cta">
          <div className="container">
            <Reveal>
              <p className="eyebrow">Contact</p>
              <h2 className="contact__title">Want the detail?</h2>
              <p className="contact__lead">
                Happy to walk through any decision on this project — including the ones I&rsquo;d
                make differently now.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="contact__cta">
                <a href="/#contact" className="btn btn--primary">
                  Start a conversation
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </MotionConfig>
  );
}
