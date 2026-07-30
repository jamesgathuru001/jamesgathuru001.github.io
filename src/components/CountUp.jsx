import { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export default function CountUp({ to, suffix = '', duration = 1600 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(to); return; }
    const start = performance.now();
    let id = 0;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(eased * to));
      if (t < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [inView, to, reduce, duration]);

  return <span ref={ref}>{n}{suffix}</span>;
}
