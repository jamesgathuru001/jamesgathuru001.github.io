import { useEffect, useRef } from 'react';

/**
 * The signature moment (PLAN.md §5).
 *
 * Particles drift in a curl-noise flow field, then resolve into "JG"; the cursor
 * pushes them off their targets and they spring back.
 *
 * ── Two constraints this component exists to respect ──
 *
 * 1. NO CONNECTING LINES. Fomless — a project whose card sits a few hundred
 *    pixels below this hero — already uses a joined-node constellation. Reusing
 *    that topology would make the hero look derivative of the work it's
 *    introducing. Motion carries the effect here, never lines.
 *
 * 2. Canvas2D, not three.js. ~2.5k particles is comfortably within Canvas2D's
 *    budget, and three.js costs 100KB+ gzipped on the landing route. Escalate
 *    only if profiling actually demands it — not before.
 *
 * The RAF loop pauses when the tab is hidden or the hero scrolls out of view:
 * the most common portfolio perf bug is a hero eating battery from three
 * screens away.
 */

const GLYPHS = 'JG';
/** Vertical centre of the mark, as a fraction of hero height. The hero copy is
 *  padded to start below this — keep the two in sync (see landing.css .hero__inner).
 *
 *  Was 0.3, which measured a NEGATIVE gap at 1920x1080: the glyph's lower dots
 *  overlapped the eyebrow, and left only 9px on a 390px phone. */
const GLYPH_CY = 0.25;

function sampleGlyphTargets(w, h, density) {
  // Render the initials to an offscreen canvas, read pixel alpha, keep the hits.
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  // The mark sits in the upper third and stays small enough to read AS a mark.
  // First pass filled the viewport and put the headline straight through the
  // middle of it — the glyph turned to mud and the copy lost its contrast.
  // The field still spans the whole hero (so the cursor works anywhere); only
  // the glyph is constrained.
  //
  // On narrow screens the width term dominates and collapses the glyph to a
  // sparse smudge, so phones get a much larger share of the width.
  // The height term drives the glyph on tall/large screens, where h * 0.3 grew
  // it faster than the copy below it moved down.
  const narrow = w < 720;
  const size = narrow ? Math.min(w * 0.44, h * 0.2) : Math.min(w * 0.2, h * 0.28);
  const cy = h * GLYPH_CY;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${size}px 'Bricolage Grotesque', system-ui, sans-serif`;
  ctx.fillText(GLYPHS, w / 2, cy);

  const { data } = ctx.getImageData(0, 0, w, h);
  const pts = [];
  for (let y = 0; y < h; y += density) {
    for (let x = 0; x < w; x += density) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        pts.push({ x, y });
      }
    }
  }
  return pts;
}

export default function ParticleField({ className = '' }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined; // no 2D context → CSS fallback stays visible

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    let raf = 0;
    let particles = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = false;
    let visible = true;
    let onScreen = true;
    let t = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Coarser sampling reads as *particles*; finer reads as a halftone screen.
      // The glyph is smaller on phones, so sample it tighter or it goes sparse.
      const density = w < 720 ? 4 : 5;
      const targets = sampleGlyphTargets(w, h, density);

      particles = targets.map((p) => ({
        // start scattered across the field; spring in toward the glyph
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        tx: p.x,
        ty: p.y,
        // slight per-particle variance so arrival isn't mechanical
        k: 0.014 + Math.random() * 0.02,
        drag: 0.86 + Math.random() * 0.06,
        r: Math.random() * 1.2 + 0.9,
        a: Math.random() * 0.35 + 0.65,
      }));
    };

    const step = () => {
      t += 0.004;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // spring toward the glyph target
        p.vx += (p.tx - p.x) * p.k;
        p.vy += (p.ty - p.y) * p.k;

        // curl-ish ambient drift so the resolved glyph still breathes
        const n = Math.sin(p.tx * 0.01 + t) * Math.cos(p.ty * 0.01 - t);
        p.vx += n * 0.06;
        p.vy += Math.cos(p.tx * 0.012 - t) * 0.06;

        // cursor repulsion — unconnected particles, pure force, no topology
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000 && d2 > 0.01) {
            const f = (16000 - d2) / 16000;
            const d = Math.sqrt(d2);
            p.vx += (dx / d) * f * 3.2;
            p.vy += (dy / d) * f * 3.2;
          }
        }

        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;

        // displacement drives brightness: disturbed particles glow
        const off = Math.min(Math.hypot(p.x - p.tx, p.y - p.ty) / 60, 1);
        const alpha = p.a * (0.45 + off * 0.55);
        ctx.fillStyle =
          off > 0.4
            ? `rgba(124, 156, 255, ${alpha})` // --accent-bright when scattered
            : `rgba(90, 108, 255, ${alpha})`; // --accent at rest
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + off * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (visible && onScreen ? start() : stop());

    const drawStatic = () => {
      // reduced-motion: draw the resolved glyph once, no loop, no cursor field
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        ctx.fillStyle = `rgba(90, 108, 255, ${p.a})`;
        ctx.beginPath();
        ctx.arc(p.tx, p.ty, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    build();
    if (reduce) {
      drawStatic();
    } else {
      start();
    }

    const onMove = (e) => {
      if (coarse) return;
      const rect = wrap.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    const onVis = () => {
      visible = !document.hidden;
      sync();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        build();
        if (reduce) drawStatic();
      });
    });
    ro.observe(wrap);

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      cancelAnimationFrame(resizeRaf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`pfield ${className}`} aria-hidden="true">
      {/* Poster/fallback: paints before the canvas boots, and stays as the whole
          effect when there's no 2D context. */}
      <div className="pfield__fallback" />
      <canvas ref={canvasRef} className="pfield__canvas" />
    </div>
  );
}
