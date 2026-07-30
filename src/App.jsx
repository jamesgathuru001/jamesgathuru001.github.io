import { MotionConfig } from 'framer-motion';
import useLenis from './hooks/useLenis';
import ScrollProgress from './components/ScrollProgress';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Work from './sections/Work';
import { Manifesto, Craft, Stack, About, Contact, Footer } from './sections/Sections';

import './styles/global.css';
import './styles/landing.css';
import './styles/craft.css';
import './styles/work.css';
import './components/ParticleField/ParticleField.css';

export default function App() {
  useLenis();

  return (
    // reducedMotion="user" strips transform/layout animation when the OS asks,
    // while keeping opacity fades — so the page still reads as designed rather
    // than as a stack of static blocks. PLAN §8.
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />

      <span id="top" />
      <Nav />

      <main id="main">
        <Hero />
        <Manifesto />
        <Work />
        <Craft />
        <Stack />
        <About />
        <Contact />
      </main>

      <Footer />
    </MotionConfig>
  );
}
