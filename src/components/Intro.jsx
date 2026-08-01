import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { lockScroll, unlockScroll } from '../lib/scrollLock';

/**
 * The landing intro.
 *
 * A loader is a cost — it stands between a visitor and the thing they came for
 * — so this one is built to be honest about what it is doing rather than to
 * pad for effect:
 *
 * - The counter tracks REAL readiness: `document.fonts.ready` plus window load.
 *   A number that crawls to 100 on a fixed timer while the page is still
 *   loading is a progress bar that lies, and everyone can feel it.
 * - MIN stops it flashing on a warm cache, where everything resolves in 40ms
 *   and the curtain would strobe.
 * - MAX means a font that never arrives cannot trap anyone behind it.
 * - It shows once per tab. A recruiter clicking back to the landing page for
 *   the third time does not need the ceremony again.
 * - `prefers-reduced-motion` skips it entirely. It is decoration, and the
 *   honest response to that request is to not do it at all rather than to do
 *   it faster.
 *
 * Only transform and opacity animate, so the whole thing stays on the
 * compositor and cannot fight the hero's own entrance for main-thread time.
 */

const SEEN = 'jg:intro';
const MIN = 1100; // don't flash
const MAX = 3000; // don't trap
const PORTRAIT = '/assets/brand/james-800.webp';

export default function Intro() {
  // Resolved once, synchronously: reading these in an effect instead would
  // paint the overlay for a frame before deciding to remove it.
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem(SEEN) === '1') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const pct = useMotionValue(0);
  const rounded = useTransform(pct, (v) => Math.round(v));
  const fill = useTransform(pct, (v) => v / 100);

  // The portrait IS the progress bar. Clipping it from the bottom up means the
  // loading state and the image are one object rather than a spinner parked
  // next to a picture — the motion says "this is filling in", which is true.
  const reveal = useTransform(pct, (v) => `inset(${100 - v}% 0 0 0)`);
  const scanY = useTransform(pct, (v) => `${100 - v}%`);
  // The leading edge fades in and back out so it reads as a moving edge rather
  // than a rule that was always there.
  const scanFade = useTransform(pct, [0, 8, 92, 100], [0, 1, 1, 0]);
  // Grey until the last stretch, then colour — the same move the About photo
  // makes on hover. The face arriving is the site becoming ready.
  const grade = useTransform(pct, [64, 100], [1, 0], { clamp: true });
  const filter = useTransform(grade, (g) => `grayscale(${g}) contrast(${1 + g * 0.06})`);

  const locked = useRef(false);

  const release = () => {
    if (!locked.current) return;
    locked.current = false;
    unlockScroll();
  };

  useEffect(() => {
    if (!visible) return undefined;

    lockScroll();
    locked.current = true;
    sessionStorage.setItem(SEEN, '1');

    const started = performance.now();
    let cancelled = false;

    // Crawls to 90 and waits there. The last 10% belongs to actually being
    // ready, so the bar can never sit full while the page is still working.
    const crawl = animate(pct, 90, { duration: MIN / 1000, ease: 'easeOut' });

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      crawl.stop();
      animate(pct, 100, { duration: 0.26, ease: [0.16, 1, 0.3, 1] }).then(() => setVisible(false));
    };

    // Decoded, not merely fetched: `load` fires before the pixels are ready to
    // paint, which is long enough to reveal an empty frame on a slow device.
    // Failure resolves rather than rejects — a missing portrait should cost the
    // flourish, never strand someone on the loading screen.
    const portrait = new Image();
    portrait.src = PORTRAIT;
    const decoded = portrait
      .decode?.()
      .catch(() => {}) ?? Promise.resolve();

    const ready = Promise.all([
      decoded,
      document.fonts ? document.fonts.ready : Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
    ]);

    const cap = setTimeout(finish, MAX);
    let hold;
    ready.then(() => {
      hold = setTimeout(finish, Math.max(0, MIN - (performance.now() - started)));
    });

    return () => {
      cancelled = true;
      clearTimeout(cap);
      clearTimeout(hold);
      crawl.stop();
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <AnimatePresence onExitComplete={release}>
      {visible && (
        <motion.div
          className="intro"
          role="status"
          aria-label="Loading"
          // The curtain lifts rather than fading: upward motion hands off to a
          // page that is already there underneath, where a fade would read as
          // the content only now arriving.
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Leaves before the curtain does, so the mark isn't dragged up the
              screen with it. Exit is deliberately shorter than the entrance. */}
          <motion.div
            className="intro__body"
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg className="intro__mark" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="introStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7c9cff" />
                  <stop offset="1" stopColor="#4361ff" />
                </linearGradient>
              </defs>
              <g
                fill="none"
                stroke="url(#introStroke)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* The favicon's own geometry, drawn rather than shown —
                    `pathLength` is the one property that makes a stroke write
                    itself without measuring the path by hand. */}
                <motion.path
                  d="M25 19 V33 a8.5 8.5 0 0 1 -17 0"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.path
                  d="M53.4 24.6 A11.5 11.5 0 1 0 54.6 36.4 H46"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.05, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                />
              </g>
            </svg>

            {/* Echoes the share card: what someone sees in a WhatsApp preview
                is what the site opens with. */}
            <div className="intro__frame">
              <motion.img
                className="intro__portrait"
                src={PORTRAIT}
                srcSet="/assets/brand/james-400.webp 400w, /assets/brand/james-800.webp 800w"
                sizes="240px"
                alt=""
                aria-hidden="true"
                draggable="false"
                style={{ clipPath: reveal, filter }}
              />
              <motion.span
                className="intro__scan"
                style={{ top: scanY, opacity: scanFade }}
                aria-hidden="true"
              />
            </div>

            <div className="intro__meter">
              <div className="intro__rail">
                <motion.span className="intro__fill" style={{ scaleX: fill }} />
              </div>
              <p className="intro__pct">
                <motion.span>{rounded}</motion.span>
                <span aria-hidden="true">%</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
