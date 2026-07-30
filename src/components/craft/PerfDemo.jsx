import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const COUNT = 10000;
const ROW_H = 44;
const OVERSCAN = 6;

// Deterministic sample data — generated once, shared by both modes so the
// comparison is genuinely like-for-like.
const CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'Machakos'];
const ROWS = Array.from({ length: COUNT }, (_, i) => ({
  id: i,
  ref: `TX-${(i * 7919 + 100003).toString(36).toUpperCase().slice(0, 6)}`,
  city: CITIES[i % CITIES.length],
  amount: (((i * 2654435761) % 480000) / 100 + 120).toFixed(2),
}));

/**
 * Rolling FPS from rAF deltas, restarted whenever `mode` changes.
 *
 * Restarting matters for fairness: both modes then get the same settle
 * window, so the dialog's own entrance animation isn't charged to whichever
 * mode happened to be showing first. What's left is steady-state scroll cost,
 * which is the thing actually being claimed.
 */
const SETTLE_MS = 1200;

function useFps(mode) {
  const [fps, setFps] = useState(60);
  const [worst, setWorst] = useState(60);

  useEffect(() => {
    setFps(60);
    setWorst(60);

    let raf = 0;
    let last = performance.now();
    const started = last;
    let acc = [];

    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (dt > 0) acc.push(1000 / dt);
      if (acc.length >= 12) {
        const avg = acc.reduce((a, b) => a + b, 0) / acc.length;
        setFps(avg);
        if (now - started > SETTLE_MS) setWorst((w) => Math.min(w, avg));
        acc = [];
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  return { fps, worst };
}

export default function PerfDemo() {
  const [naive, setNaive] = useState(false);
  const [auto, setAuto] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(320);
  const [nodes, setNodes] = useState(0);
  const viewport = useRef(null);
  const { fps, worst } = useFps(naive);

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height));
    ro.observe(el);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Auto-scroll makes the difference visible without asking the reviewer to
  // flick a trackpad at exactly the right moment.
  useEffect(() => {
    if (!auto) return undefined;
    let raf = 0;
    let dir = 1;
    const tick = () => {
      const el = viewport.current;
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        let next = el.scrollTop + dir * 14;
        if (next >= max) { next = max; dir = -1; }
        if (next <= 0) { next = 0; dir = 1; }
        el.scrollTop = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const total = COUNT * ROW_H;
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(COUNT, Math.ceil((scrollTop + height) / ROW_H) + OVERSCAN);
  const slice = useMemo(() => (naive ? ROWS : ROWS.slice(start, end)), [naive, start, end]);

  // Count what's actually in the DOM — the number the claim rests on.
  useEffect(() => {
    setNodes(viewport.current?.querySelectorAll('.perf__row').length ?? 0);
  }, [slice, naive]);

  const switchMode = (toNaive) => {
    setNaive(toNaive);
    if (viewport.current) viewport.current.scrollTop = 0;
    setScrollTop(0);
  };

  return (
    <div className="demo demo--perf">
      <div className="perf__bar">
        <div className="perf__modes" role="group" aria-label="Rendering mode">
          <button
            type="button"
            className={`demo__chip ${!naive ? 'is-on' : ''}`}
            aria-pressed={!naive}
            onClick={() => switchMode(false)}
          >
            Virtualized
          </button>
          <button
            type="button"
            className={`demo__chip ${naive ? 'is-on' : ''}`}
            aria-pressed={naive}
            onClick={() => switchMode(true)}
          >
            Naive
          </button>
        </div>
        <label className="perf__auto">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Auto-scroll
        </label>
      </div>

      <div className="perf__stats">
        <Stat label="FPS" value={fps.toFixed(0)} tone={fps > 50 ? 'good' : fps > 30 ? 'warn' : 'bad'} />
        <Stat label="Worst" value={worst.toFixed(0)} tone={worst > 50 ? 'good' : worst > 30 ? 'warn' : 'bad'} />
        <Stat label="Rows in DOM" value={nodes.toLocaleString()} tone={nodes > 1000 ? 'bad' : 'good'} />
        <Stat label="Rows in data" value={COUNT.toLocaleString()} />
      </div>

      <div
        className="perf__viewport"
        ref={viewport}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        tabIndex={0}
        role="region"
        aria-label={`${naive ? 'Naive' : 'Virtualized'} list of ${COUNT} transactions`}
      >
        {naive ? (
          <div>
            {slice.map((r) => (
              <Row key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div style={{ height: total, position: 'relative' }}>
            <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
              {slice.map((r) => (
                <Row key={r.id} r={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="demo__hint">
        {naive
          ? 'All 10,000 rows are mounted. Every scroll frame asks the compositor to deal with all of them.'
          : 'Only the rows crossing the viewport exist. The scrollbar is a spacer div of the full height.'}
      </p>
    </div>
  );
}

function Row({ r }) {
  return (
    <div className="perf__row" style={{ height: ROW_H }}>
      <span className="perf__ref">{r.ref}</span>
      <span className="perf__city">{r.city}</span>
      <span className="perf__amt">KES {r.amount}</span>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="perf__stat" data-tone={tone}>
      <span className="perf__stat-label">{label}</span>
      <span className="perf__stat-value">{value}</span>
    </div>
  );
}
