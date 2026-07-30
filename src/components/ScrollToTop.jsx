import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Reset scroll on navigation.
 *
 * React Router does not do this: clicking "See all work" from halfway down the
 * landing page left /work opened at the same offset, mid-grid.
 *
 * Two details that matter:
 * - POP (back/forward) is excluded, so returning to the landing page restores
 *   where you were instead of dumping you at the hero.
 * - Lenis is torn down and re-created per page, but the browser keeps the old
 *   offset; scrolling in a layout effect gets it before paint, so there is no
 *   visible jump.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useLayoutEffect(() => {
    if (navType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, navType]);

  return null;
}
