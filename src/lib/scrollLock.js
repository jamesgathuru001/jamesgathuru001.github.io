/**
 * Scroll lock shared by every overlay (demo modal, mobile menu).
 *
 * Lenis owns the scroll position, so `overflow: hidden` alone is not enough —
 * Lenis keeps applying momentum from wheel events it already captured. We stop
 * the instance too, which is why the hook registers it here.
 *
 * Ref-counted: two overlays can be open across a transition without the first
 * one to close releasing the lock for both.
 */

let lenis = null;
let locks = 0;

export function registerLenis(instance) {
  lenis = instance;
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;

  lenis?.stop();
  // Hiding the scrollbar reflows the page ~10px narrower; pad it back so the
  // fixed nav and centred hero don't visibly jump when a modal opens.
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
  lenis?.start();
}
