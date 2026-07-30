import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { registerLenis } from '../lib/scrollLock';

/** Global smooth (momentum) scrolling. Returns a ref to the Lenis instance for anchor scrolling. */
export default function useLenis() {
  const ref = useRef(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true });
    ref.current = lenis;
    // Overlays need to freeze momentum scrolling, not just page overflow.
    registerLenis(lenis);
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      registerLenis(null);
      ref.current = null;
    };
  }, []);
  return ref;
}
