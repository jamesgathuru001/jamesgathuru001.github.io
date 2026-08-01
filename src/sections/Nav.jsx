import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { lockScroll, unlockScroll } from '../lib/scrollLock';
import { site, nav } from '../data/site';

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const toggleRef = useRef(null);
  const sheetRef = useRef(null);

  // The nav links are in-page anchors, which resolve to nothing on /work.
  // Off the landing page they have to be absolute (`/#work`) or they 404.
  const onLanding = useLocation().pathname === '/';
  const href = (h) => (onLanding ? h : `/${h}`);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section you're actually in. rootMargin biases the "current"
  // band to the upper third so a heading counts as soon as it's read, not once
  // the section happens to fill the viewport.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setCurrent(visible[visible.length - 1].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // Close on resize past the breakpoint, or the sheet stays mounted and locked
  // while the desktop nav is showing.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 821px)');
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    // Captured now: the cleanup runs after the burger may have re-rendered.
    const toggle = toggleRef.current;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = sheetRef.current?.querySelectorAll('a, button');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const raf = requestAnimationFrame(() => sheetRef.current?.querySelector('a')?.focus());
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      unlockScroll();
      toggle?.focus();
    };
  }, [open]);

  return (
    <motion.nav
      className={`nav ${solid || open ? 'is-solid' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Primary"
    >
      <div className="container nav__inner">
        <a href={onLanding ? '#top' : '/'} className="nav__mark" aria-label={`${site.name} — home`}>
          <span className="nav__initials">{site.initials}</span>
          <span className="nav__name">{site.name}</span>
        </a>

        <ul className="nav__links">
          {nav.map((n) => (
            <li key={n.href}>
              <a
                href={href(n.href)}
                className={`link-sweep ${current === n.href.slice(1) ? 'is-current' : ''}`}
                aria-current={current === n.href.slice(1) ? 'true' : undefined}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__end">
          {/* Was a mailto:. A form the visitor can fill in on the spot beats
              handing their mail client a blank compose window. */}
          <a href={href('#contact')} className="btn btn--primary nav__cta">
            Hire me
          </a>

          <button
            type="button"
            ref={toggleRef}
            className="nav__burger"
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-sheet"
            ref={sheetRef}
            className="nav__sheet"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="nav__sheet-links">
              {nav.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={href(n.href)} onClick={() => setOpen(false)}>
                    <span className="nav__sheet-idx">0{i + 1}</span>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href={href('#contact')}
              className="btn btn--primary nav__sheet-cta"
              onClick={() => setOpen(false)}
            >
              Hire me
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
