import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Lock } from 'lucide-react';
import useLenis from '../hooks/useLenis';
import ScrollProgress from '../components/ScrollProgress';
import Reveal from '../components/Reveal';
import Shot from '../components/Shot';
import Nav from '../sections/Nav';
import { Footer } from '../sections/Sections';
import { countWord, shown } from '../data/projects';
import { site } from '../data/site';

import '../styles/global.css';
import '../styles/landing.css';
import '../styles/craft.css';
import '../styles/work.css';

export default function WorkPage() {
  useLenis();

  // Route-level title/description: this page is shared and indexed on its own.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Work — ${site.name}`;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    meta?.setAttribute(
      'content',
      `Every product James Gathuru has shipped as frontend lead — ${shown.length} platforms across fintech, mobility, events, IoT and community.`
    );
    return () => {
      document.title = prevTitle;
      if (prevDesc) meta?.setAttribute('content', prevDesc);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />

      <span id="top" />
      <Nav />

      <main id="main">
        <header className="workpage__head">
          <div className="container">
            <Link to="/" className="workpage__back link-sweep">
              <ArrowLeft size={14} aria-hidden="true" /> Back to home
            </Link>
            <p className="eyebrow">Portfolio</p>
            <h1 className="workpage__title">
              Everything I&rsquo;ve <span className="accent-text">shipped</span>.
            </h1>
            <p className="section-sub">
              {countWord(shown.length)} production platforms across fintech, mobility, events, IoT
              and community. Each card names the surface I owned — not the whole stack, and not the
              parts my teammates built.
            </p>
          </div>
        </header>

        <section className="section workpage__list" aria-label="All projects">
          <div className="container">
            <div className="wgrid">
              {shown.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 2) * 0.06}>
                  <WorkCard p={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section workpage__cta contact">
          <div className="container">
            <Reveal>
              <p className="eyebrow">Contact</p>
              <h2 className="contact__title">
                Want the detail behind
                <br />
                any of these?
              </h2>
              <p className="contact__lead">
                Every card above is a surface I owned. Ask me to walk you through any of them.
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

function WorkCard({ p }) {
  return (
    <motion.article className="wcard glass accent-scope" style={{ '--p-hue': p.accentHue }}>
      <Link to={`/work/${p.slug}`} className="wcard__media" aria-label={`${p.title} — case study`}>
        <Shot
          slug={p.slug}
          title={p.title}
          live={p.live}
          placeholder="Offline — capture pending"
          sizes="(max-width: 860px) 100vw, 46vw"
        />
      </Link>

      <div className="wcard__body">
        <p className="eyebrow">
          {p.year} — {p.category}
        </p>
        <h2 className="wcard__title">
          <Link to={`/work/${p.slug}`} className="wcard__title-link">
            {p.title}
          </Link>
        </h2>
        <p className="wcard__sub">{p.subtitle}</p>

        <p className="pcard__role wcard__role">
          <span className="pcard__role-key">My role</span>
          {p.roleShort}
        </p>

        <p className="wcard__summary">{p.summary}</p>

        {/* Surfaces that exist but can't be linked — see the Atom entry. */}
        {p.privateSurfaces && (
          <p className="wcard__private">
            <Lock size={12} aria-hidden="true" />
            Also built, behind login: {p.privateSurfaces.join(' · ')}
          </p>
        )}

        <ul className="pcard__tech wcard__tech">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="wcard__links">
          <Link to={`/work/${p.slug}`} className="link-sweep pcard__live">
            Read the case study <ArrowRight size={14} aria-hidden="true" />
          </Link>
          {p.live ? (
            <a
              className="link-sweep wcard__live"
              href={p.live}
              target="_blank"
              rel="noreferrer noopener"
            >
              Live site <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : (
            <span className="pcard__nolive">Offline</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
