import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import ParticleField from '../components/ParticleField/ParticleField';
import Magnetic from '../components/Magnetic';
import { site } from '../data/site';

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero() {
  return (
    <header className="hero">
      <ParticleField />

      <div className="container hero__inner">
        <motion.p className="hero__eyebrow eyebrow" variants={rise} initial="hidden" animate="show" custom={0}>
          {site.role} · {site.specialism}
        </motion.p>

        <h1 className="hero__title">
          {site.headline.map((line, i) => (
            <motion.span key={line} className="hero__line" variants={rise} initial="hidden" animate="show" custom={i + 1}>
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.div className="hero__meta" variants={rise} initial="hidden" animate="show" custom={3}>
          <span className="hero__loc">
            <MapPin size={14} aria-hidden="true" /> {site.location}
          </span>
        </motion.div>

        <motion.div className="hero__cta" variants={rise} initial="hidden" animate="show" custom={4}>
          <Magnetic>
            <a href="#work" className="btn btn--primary">
              See the work
            </a>
          </Magnetic>
          <Magnetic>
            <a href={`mailto:${site.email}`} className="btn btn--ghost">
              Hire me
            </a>
          </Magnetic>
        </motion.div>
      </div>

      <motion.a
        href="#manifesto"
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        aria-label="Scroll to content"
      >
        <span className="hero__rail" aria-hidden="true" />
      </motion.a>
    </header>
  );
}
