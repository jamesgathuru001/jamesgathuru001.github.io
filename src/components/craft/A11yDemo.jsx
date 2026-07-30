import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Volume2 } from 'lucide-react';

const OPTIONS = [
  'Accessibility tree', 'ARIA live region', 'Bento grid', 'Combobox', 'Design tokens',
  'Easing curve', 'Focus ring', 'Focus trap', 'Grid template areas', 'Hydration',
  'Intersection Observer', 'Keyboard trap', 'Landmark region', 'Layout shift',
  'Reduced motion', 'Roving tabindex', 'Screen reader', 'Semantic HTML',
  'Skip link', 'Spring physics', 'Tab order', 'Virtualization', 'WCAG contrast',
];

/**
 * WAI-ARIA 1.2 combobox (editable, list autocomplete).
 *
 * The point of the demo is that it is checkable, so the important detail is
 * `aria-activedescendant`: DOM focus never leaves the input, while the visually
 * active option moves. Managing it with real focus is the common shortcut and
 * it breaks typing in the input.
 */
export default function A11yDemo() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState('');
  const [log, setLog] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const optionId = useCallback((i) => `${baseId}-opt-${i}`, [baseId]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? OPTIONS.filter((o) => o.toLowerCase().includes(q)) : OPTIONS;
  }, [query]);

  const say = (text) => setLog((l) => [{ text, at: Date.now() }, ...l].slice(0, 6));

  // Keep the active option scrolled into view without stealing DOM focus.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, optionId]);

  const openList = () => {
    if (open) return;
    setOpen(true);
    say(`Expanded. ${matches.length} suggestions available.`);
  };

  const closeList = (announce = true) => {
    if (!open) return;
    setOpen(false);
    setActive(-1);
    if (announce) say('Collapsed.');
  };

  const choose = (i) => {
    const value = matches[i];
    if (value === undefined) return;
    setSelected(value);
    setQuery(value);
    setOpen(false);
    setActive(-1);
    say(`${value}, selected.`);
    inputRef.current?.focus();
  };

  const move = (delta) => {
    if (!open) {
      openList();
      setActive(0);
      if (matches[0]) say(`${matches[0]}, 1 of ${matches.length}.`);
      return;
    }
    if (!matches.length) return;
    // Wrap in both directions — ARIA APG allows it and it's what users expect.
    const next = (active + delta + matches.length) % matches.length;
    setActive(next);
    say(`${matches[next]}, ${next + 1} of ${matches.length}.`);
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        if (!open) break;
        e.preventDefault();
        setActive(0);
        if (matches[0]) say(`${matches[0]}, 1 of ${matches.length}.`);
        break;
      case 'End':
        if (!open) break;
        e.preventDefault();
        setActive(matches.length - 1);
        if (matches.length) say(`${matches[matches.length - 1]}, ${matches.length} of ${matches.length}.`);
        break;
      case 'Enter':
        if (open && active >= 0) {
          e.preventDefault();
          choose(active);
        }
        break;
      case 'Escape':
        // Stop propagation ONLY when this widget actually consumes the key.
        // Swallowing it unconditionally meant that once the list was closed and
        // the field empty, Escape died here and the dialog could never be
        // closed from the input — a keyboard trap, in the keyboard demo.
        if (open) {
          e.stopPropagation();
          closeList();
        } else if (query) {
          e.stopPropagation();
          setQuery('');
          setSelected('');
          say('Cleared.');
        }
        // Nothing left to dismiss: let it bubble so the dialog closes.
        break;
      case 'Tab':
        closeList(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="demo demo--a11y">
      <div className="a11y__col">
        <label className="a11y__label" htmlFor={`${baseId}-input`}>
          Search front-end concepts
        </label>

        <div className="a11y__field">
          <input
            id={`${baseId}-input`}
            ref={inputRef}
            className="a11y__input"
            type="text"
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
            value={query}
            placeholder="Try typing, then press ↓"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              if (!open) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={openList}
            onBlur={() => closeList(false)}
          />
          <button
            type="button"
            className="a11y__toggle"
            tabIndex={-1}
            aria-label={open ? 'Close suggestions' : 'Open suggestions'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? closeList() : (openList(), inputRef.current?.focus()))}
          >
            <ChevronDown size={16} aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </button>

          <ul
            id={listId}
            ref={listRef}
            className={`a11y__list ${open ? 'is-open' : ''}`}
            role="listbox"
            aria-label="Front-end concepts"
          >
            {matches.length === 0 && <li className="a11y__empty">No matches</li>}
            {matches.map((o, i) => (
              <li
                key={o}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={`a11y__option ${i === active ? 'is-active' : ''}`}
                // mousedown, not click: click fires after blur has closed the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(i);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span>{o}</span>
                {selected === o && <Check size={14} aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </div>

        {/* The real live region a screen reader reads. Visually hidden. */}
        <span className="sr-only" role="status" aria-live="polite">
          {open ? `${matches.length} suggestions available.` : ''}
        </span>

        <dl className="a11y__state">
          <div><dt>role</dt><dd>combobox</dd></div>
          <div><dt>aria-expanded</dt><dd>{String(open)}</dd></div>
          <div><dt>aria-activedescendant</dt><dd>{open && active >= 0 ? `…opt-${active}` : '—'}</dd></div>
          <div><dt>DOM focus</dt><dd>input (never moves)</dd></div>
        </dl>
      </div>

      <div className="a11y__col">
        <p className="a11y__sr-head">
          <Volume2 size={14} aria-hidden="true" /> Screen-reader output
        </p>
        <ul className="a11y__sr-log">
          {log.length === 0 && <li className="a11y__sr-idle">Focus the field and use ↑ ↓ Home End Enter Esc.</li>}
          {log.map((l, i) => (
            <li key={l.at + l.text} className="a11y__sr-line" data-fresh={i === 0}>
              {l.text}
            </li>
          ))}
        </ul>
        <p className="demo__hint">
          Every key below is handled: <kbd>↓</kbd> <kbd>↑</kbd> <kbd>Home</kbd> <kbd>End</kbd>{' '}
          <kbd>Enter</kbd> <kbd>Esc</kbd> <kbd>Tab</kbd>. Tab out and back — the dialog still traps
          focus, and Esc closes the list before it closes the dialog.
        </p>
      </div>
    </div>
  );
}
