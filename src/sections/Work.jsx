import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Shot from '../components/Shot';
import { countWord, featured, shown } from '../data/projects';

function ProjectCard({ p, i }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="pcard accent-scope"
      style={{ '--p-hue': p.accentHue }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pcard__media">
        <Shot slug={p.slug} title={p.title} live={p.live} />
      </div>

      <div className="pcard__body">
        <p className="eyebrow">
          {p.year} — {p.category}
        </p>

        <h3 className="pcard__title">{p.title}</h3>
        <p className="pcard__sub">{p.subtitle}</p>

        {/* The role line is the point. Naming the surface he owned reads senior;
            claiming the whole stack collapses under one interview question. */}
        <p className="pcard__role">
          <span className="pcard__role-key">My role</span>
          {p.roleShort}
        </p>

        <p className="pcard__summary">{p.summary}</p>

        <ul className="pcard__tech">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="pcard__links">
          <Link className="link-sweep pcard__live" to={`/work/${p.slug}`}>
            Read the case study <ArrowRight size={14} aria-hidden="true" />
          </Link>
          {p.live && (
            <a className="link-sweep pcard__livesite" href={p.live} target="_blank" rel="noreferrer noopener">
              Live site <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Work() {
  return (
    <section id="work" className="section section--major work">
      <div className="container">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow__idx">01</span>Selected work</p>
          {/* Counts come from the inventory — adding a project updates both. */}
          <h2 className="section-title">
            {countWord(shown.length)} platforms, <span className="accent-text">shipped</span>.
          </h2>
          <p className="section-sub">
            Frontend lead on production products used to get paid, get parked, and manage data. The{' '}
            {countWord(featured.length).toLowerCase()} below each name the surface I owned — not the
            whole stack.
          </p>
        </Reveal>

        <div className="work__grid">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>

        <Reveal>
          <div className="work__more">
            <Link to="/work" className="work__more-link">
              See all work
              <span className="work__more-count">{shown.length}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
