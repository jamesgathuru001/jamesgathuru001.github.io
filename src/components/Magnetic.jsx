import { useRef } from 'react';

/** Wraps a child so it gently pulls toward the cursor on hover (desktop only). */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);

  const move = (e) => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };

  return (
    <span ref={ref} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </span>
  );
}
