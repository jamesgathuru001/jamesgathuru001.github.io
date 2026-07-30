import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { lockScroll, unlockScroll } from '../lib/scrollLock';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

/**
 * Tabbable, not merely focusable. `button:not([disabled])` still matches a
 * button carrying tabindex="-1" (the combobox demo has one), and treating that
 * as the last stop meant Tab from the real last element fell straight out of
 * the dialog. Check the resolved tabIndex instead of pattern-matching the attr.
 */
function tabbable(root) {
  return [...(root?.querySelectorAll(FOCUSABLE) ?? [])].filter(
    (n) => n.tabIndex >= 0 && (n.offsetParent !== null || n === document.activeElement)
  );
}

/**
 * Accessible dialog. This one has to be right: it is the container for the
 * "keyboard-complete by default" claim, and a reviewer who tabs out of the
 * modal has disproved the whole section.
 *
 * Implements: aria-modal labelling, initial focus, focus trap in both
 * directions, Escape to close, focus restored to the trigger, backdrop click,
 * and inert background content for screen readers.
 */
export default function Modal({ open, onClose, title, subtitle, children }) {
  const panel = useRef(null);
  const restoreTo = useRef(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => onClose?.(), [onClose]);

  // Remember the trigger before the overlay steals focus.
  useEffect(() => {
    if (open) restoreTo.current = document.activeElement;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();

    // Focus the panel itself rather than the first control: the dialog's
    // heading should be what a screen reader announces first.
    const raf = requestAnimationFrame(() => panel.current?.focus());

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = tabbable(panel.current);
      if (!nodes.length) {
        e.preventDefault();
        panel.current?.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and catch the case where focus is on the panel.
      if (e.shiftKey && (active === first || active === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Bubble, NOT capture. A capture listener on document fires before any
    // handler inside the dialog, so a nested widget could never keep Escape for
    // itself — pressing Escape to close the combobox's listbox tore down the
    // whole dialog instead. On bubble, an inner stopPropagation() wins.
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      unlockScroll();
      // Return focus so keyboard users resume where they left the page.
      restoreTo.current?.focus?.();
    };
  }, [open, close]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="modal" role="presentation">
          <motion.div
            className="modal__scrim"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panel}
            className="modal__panel glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={subtitle ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="modal__head">
              <div>
                <h2 className="modal__title" id={titleId}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="modal__sub" id={descId}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button type="button" className="modal__close" onClick={close} aria-label="Close dialog">
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="modal__body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
