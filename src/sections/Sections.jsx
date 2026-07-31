import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Suspense, lazy, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Modal from '../components/Modal';
import ContactPanel from '../components/ContactPanel';
import ContactDetails from '../components/ContactDetails';
import useLocalTime from '../hooks/useLocalTime';
import { site } from '../data/site';
import { stack, craft } from '../data/stack';

/**
 * The demos load when a card is opened, not on first paint.
 *
 * PerfDemo in particular built its 10,000-row fixture at module scope, so every
 * visitor to the landing page paid for it — allocation and all — to render a
 * demo most of them never open.
 */
const MotionDemo = lazy(() => import('../components/craft/MotionDemo'));
const PerfDemo = lazy(() => import('../components/craft/PerfDemo'));
const A11yDemo = lazy(() => import('../components/craft/A11yDemo'));

/* ── Manifesto ──
   Scroll-linked word reveal. One idea, big type, then out of the way. */
export function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.25'] });
  // A second, full-section range for the portrait: the word reveal finishes
  // early by design, so reusing it would freeze the parallax halfway down.
  const { scrollYProgress: through } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const reduce = useReducedMotion();
  const y = useTransform(through, [0, 1], reduce ? ['0%', '0%'] : ['-4%', '4%']);
  const words = site.manifesto.split(' ');

  return (
    <section id="manifesto" className="section section--raised manifesto" ref={ref}>
      <div className="container manifesto__inner">
        <p className="manifesto__text">
          {words.map((word, i) => (
            <Word key={`${word}-${i}`} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {word}
            </Word>
          ))}
        </p>

        <motion.figure className="manifesto__media" style={{ y }}>
          <picture>
            <source
              type="image/avif"
              srcSet="/assets/brand/james-800.avif 800w, /assets/brand/james-1200.avif 1200w"
              sizes="420px"
            />
            <img
              src="/assets/brand/james-1200.webp"
              srcSet="/assets/brand/james-800.webp 800w, /assets/brand/james-1200.webp 1200w"
              sizes="420px"
              width="1200"
              height="1200"
              loading="lazy"
              decoding="async"
              /* Decorative here: the About section presents the same portrait
                 with a real name, and announcing it twice is just noise. */
              alt=""
              className="manifesto__photo"
            />
          </picture>
        </motion.figure>
      </div>
    </section>
  );
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  // The space has to live OUTSIDE the span: .manifesto__word is inline-block, and
  // browsers trim trailing whitespace inside an inline-block box — keeping it in
  // here ran every word together ("I'mafrontendengineer…").
  return (
    <>
      <motion.span style={{ opacity }} className="manifesto__word">
        {children}
      </motion.span>{' '}
    </>
  );
}

/* ── Craft ──
   Deliberately NOT skill bars — "React ████░ 90%" is unfalsifiable and everyone
   has it. Each card opens a real, working demo of the claim it makes. */
const DEMOS = { motion: MotionDemo, perf: PerfDemo, a11y: A11yDemo };

export function Craft() {
  const [openId, setOpenId] = useState(null);
  const item = craft.find((c) => c.id === openId);
  const Demo = openId ? DEMOS[openId] : null;

  return (
    <section id="craft" className="section section--raised section--major craft">
      <div className="container">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow__idx">02</span>Craft</p>
          <h2 className="section-title">
            Claims you can <span className="accent-text">check</span>.
          </h2>
          <p className="section-sub">
            No skill bars. A percentage next to a logo proves nothing. These are small, real, and
            interactive — open one and try to break it.
          </p>
        </Reveal>

        <div className="craft__grid">
          {craft.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.07}>
              {/* The whole card is the button: a card that opens a dialog should
                  be one tab stop, not a decorative div with a link buried in it. */}
              <button type="button" className="craft__card glass" onClick={() => setOpenId(c.id)}>
                <h3 className="craft__title">{c.title}</h3>
                <p className="craft__claim">{c.claim}</p>
                <p className="craft__body">{c.body}</p>
                <span className="craft__cta">
                  {c.cta}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={item?.claim ?? ''}
        subtitle={item?.modalSub}
      >
        <Suspense fallback={<p className="demo__hint">Loading demo…</p>}>
          {Demo && <Demo />}
        </Suspense>
      </Modal>
    </section>
  );
}

/* ── Stack ── */
export function Stack() {
  return (
    <section id="stack" className="section section--tight stack">
      <div className="container">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow__idx">03</span>Stack</p>
          <h2 className="section-title">What I reach for.</h2>
          <p className="section-sub">
            A specialist&rsquo;s list is short. The rest is real, and it stays — just quieter.
          </p>
        </Reveal>

        <div className="stack__grid">
          {stack.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.06}>
              <div className={`stack__group ${g.lead ? 'is-lead' : ''}`}>
                <h3 className="stack__label">{g.label}</h3>
                <ul className="stack__items">
                  {g.items.map((it) => (
                    <li key={it} className="stack__item">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── About ── */
export function About() {
  return (
    <section id="about" className="section section--raised about">
      <div className="container about__inner">
        <Reveal className="about__media">
          <picture>
            <source
              type="image/avif"
              srcSet="/assets/brand/james-400.avif 400w, /assets/brand/james-800.avif 800w"
              sizes="(max-width: 900px) 60vw, 380px"
            />
            <img
              src="/assets/brand/james-800.webp"
              srcSet="/assets/brand/james-400.webp 400w, /assets/brand/james-800.webp 800w"
              sizes="(max-width: 900px) 60vw, 380px"
              width="800"
              height="800"
              loading="lazy"
              decoding="async"
              alt="James Gathuru"
              className="about__photo"
            />
          </picture>
        </Reveal>

        <div className="about__copy">
          <Reveal>
            <p className="eyebrow"><span className="eyebrow__idx">04</span>About</p>
            <h2 className="section-title">
              The last 5% is the <span className="accent-text">whole job</span>.
            </h2>
          </Reveal>
          {site.about.map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={0.08 + i * 0.06}>
              <p className="about__para">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ── */
export function Contact() {
  return (
    <section id="contact" className="section section--major contact">
      <div className="container">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow__idx">05</span>Contact</p>
          <h2 className="contact__title">
            Let&rsquo;s build something
            <br />
            worth using.
          </h2>
          <p className="contact__lead">
            Open to frontend roles and selected freelance work. Tell me what you&rsquo;re building.
          </p>
        </Reveal>

        {/* The form is here, on the landing page, rather than behind a link.
            /work and the case studies close with a CTA pointing back at this
            section, so there is still only one copy of it. */}
        <Reveal delay={0.08}>
          <ContactPanel />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ── */
export function Footer() {
  const time = useLocalTime();
  return (
    <footer className="footer">
      <div className="container">
        <ContactDetails />
        <div className="footer__inner">
          <div>
            <p className="footer__mark">{site.initials}</p>
            <p className="footer__note">
              {site.location} — {time}
            </p>
          </div>
          <p className="footer__copy">© {new Date().getFullYear()} {site.name}</p>
        </div>
      </div>
    </footer>
  );
}
