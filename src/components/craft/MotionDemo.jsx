import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const PRESETS = [
  { name: 'Default', stiffness: 320, damping: 30, mass: 1 },
  { name: 'Gentle', stiffness: 120, damping: 26, mass: 1 },
  { name: 'Snappy', stiffness: 600, damping: 34, mass: 1 },
  { name: 'Bouncy', stiffness: 420, damping: 12, mass: 1 },
  { name: 'Overdamped', stiffness: 200, damping: 60, mass: 1.4 },
];

/**
 * Simulate the step response of Framer's spring so the curve on screen is the
 * same physics driving the card — not a decorative squiggle.
 *
 * m·x'' + c·x' + k·x = 0, semi-implicit Euler at a fixed 1ms step (small enough
 * that even stiffness 600 stays stable), sampled to `SAMPLES` points.
 */
const SAMPLES = 260;
const STEP = 0.001;
const PUCK = 116; // keep in sync with .demo__puck width

function simulate({ stiffness, damping, mass }) {
  let x = -1; // displacement from rest (-1 = fully displaced)
  let v = 0;
  const pts = [];
  let settledAt = null;

  for (let i = 0; i < SAMPLES; i++) {
    // 8 sub-steps per sample → ~2.1s of simulated time across the plot
    for (let s = 0; s < 8; s++) {
      const a = (-stiffness * x - damping * v) / mass;
      v += a * STEP;
      x += v * STEP;
    }
    const value = 1 + x; // 0 → 1 progress
    pts.push(value);
    if (settledAt === null && Math.abs(x) < 0.005 && Math.abs(v) < 0.05) {
      settledAt = i * 8 * STEP;
    }
  }
  return { pts, settledAt };
}

export default function MotionDemo() {
  const [stiffness, setStiffness] = useState(320);
  const [damping, setDamping] = useState(30);
  const [mass, setMass] = useState(1);
  const [side, setSide] = useState(0);

  // Throw distance measured, not guessed: dragConstraints needs real pixels,
  // and a CSS var can't feed framer's x target.
  const track = useRef(null);
  const dragged = useRef(false);
  const [throwX, setThrowX] = useState(0);

  // x is driven imperatively rather than through the `animate` prop. After a
  // drag, framer has already written x directly, so an unchanged `animate`
  // target would not re-run — the card would just stay where it was dropped and
  // the spring, the entire point of the demo, would never be seen.
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const measure = () => {
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const next = Math.max(0, el.clientWidth - PUCK - pad * 2);
      setThrowX(next);
      // Keep a thrown card pinned to the right edge across a resize.
      if (sideRef.current) x.set(next);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [x]);

  const { pts, settledAt } = useMemo(
    () => simulate({ stiffness, damping, mass }),
    [stiffness, damping, mass]
  );

  // Overshoot is the honest headline number: it's what a duration tween can
  // never produce, and what "bouncy" actually means numerically.
  const overshoot = useMemo(() => Math.max(0, Math.max(...pts) - 1), [pts]);

  const path = useMemo(() => {
    const W = 100;
    const H = 100;
    // Plot 0→1.5 on Y so overshoot stays inside the box.
    return pts
      .map((v, i) => {
        const x = (i / (pts.length - 1)) * W;
        const y = H - (v / 1.5) * H;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [pts]);

  const spring = { type: 'spring', stiffness, damping, mass };

  const sideRef = useRef(0);
  const throwTo = (next) => {
    sideRef.current = next;
    setSide(next);
    animate(x, next ? throwX : 0, spring);
  };
  const preset = PRESETS.find(
    (p) => p.stiffness === stiffness && p.damping === damping && p.mass === mass
  );

  return (
    <div className="demo">
      <div className="demo__stage">
        <div className="demo__track" ref={track}>
          <motion.button
            type="button"
            className="demo__puck"
            // Releasing a drag also fires click, which would toggle the side and
            // hide the spring settling back. Swallow the click that ends a drag.
            onClick={() => {
              if (dragged.current) {
                dragged.current = false;
                return;
              }
              throwTo(side ? 0 : 1);
            }}
            style={{ x }}
            // Drag then release: the same spring carries the card to the nearer
            // end, which is the clearest way to feel stiffness and damping.
            drag="x"
            dragConstraints={{ left: 0, right: throwX }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={() => { dragged.current = true; }}
            onDragEnd={() => throwTo(x.get() > throwX / 2 ? 1 : 0)}
            aria-label={`Move card ${side ? 'left' : 'right'}`}
          >
            <span className="demo__puck-label">drag or click</span>
          </motion.button>
        </div>
        <p className="demo__hint">
          Drag the card and let go, or click to throw it. Change the numbers below — the curve and
          the card are driven by the same solver.
        </p>
      </div>

      <div className="demo__panel">
        <div className="demo__plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {/* rest line at progress = 1 */}
            <line x1="0" y1={100 - (1 / 1.5) * 100} x2="100" y2={100 - (1 / 1.5) * 100} className="demo__plot-rest" />
            <path d={path} className="demo__plot-line" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="demo__plot-tag">step response</span>
        </div>

        <dl className="demo__readout">
          <div>
            <dt>Overshoot</dt>
            <dd>{(overshoot * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Settles</dt>
            <dd>{settledAt === null ? '> 2.1s' : `${settledAt.toFixed(2)}s`}</dd>
          </div>
          <div>
            <dt>Behaviour</dt>
            <dd>{overshoot < 0.001 ? 'Overdamped' : overshoot > 0.12 ? 'Underdamped' : 'Critical-ish'}</dd>
          </div>
        </dl>

        <Slider label="Stiffness" value={stiffness} min={40} max={700} step={10} onChange={setStiffness} />
        <Slider label="Damping" value={damping} min={4} max={70} step={1} onChange={setDamping} />
        <Slider label="Mass" value={mass} min={0.4} max={3} step={0.1} onChange={setMass} />

        <div className="demo__presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className={`demo__chip ${preset?.name === p.name ? 'is-on' : ''}`}
              aria-pressed={preset?.name === p.name}
              onClick={() => {
                setStiffness(p.stiffness);
                setDamping(p.damping);
                setMass(p.mass);
              }}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            className="demo__chip"
            onClick={() => {
              setStiffness(320);
              setDamping(30);
              setMass(1);
              throwTo(0);
            }}
          >
            <RotateCcw size={12} aria-hidden="true" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="demo__slider">
      <span className="demo__slider-head">
        {label}
        <output>{value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
