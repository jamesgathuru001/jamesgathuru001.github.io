/**
 * Stack — frontend-weighted (PLAN.md §7).
 *
 * A specialist's list is short. The old CV led with "Experienced: React JS,
 * Python, Java, Django, AI, Prompt Engineering, Canva" and put Git under
 * "familiar" — that reads junior. Everything non-frontend is real and stays,
 * but it sits in a quieter tier so it doesn't compete with the headline claim.
 */

export const stack = [
  {
    label: 'Core',
    lead: true,
    items: ['React', 'React 19', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
  },
  {
    label: 'Frontend craft',
    lead: true,
    items: ['Framer Motion', 'Lenis', 'WebGL / Canvas', 'Vite', 'Tailwind CSS', 'Design systems'],
  },
  {
    label: 'Bridge',
    lead: false,
    items: ['Node.js', 'REST APIs', 'tRPC', 'Express'],
  },
  {
    label: 'Also worked with',
    lead: false,
    items: ['Java', 'Python', 'PostgreSQL', 'Mapbox', 'Google Maps', 'M-Pesa', 'Git', 'Docker'],
  },
];

/**
 * The craft section (PLAN.md §6) — demos, not skill bars.
 * "React ████░ 90%" is unfalsifiable; every portfolio has it. These are claims
 * a reviewer can check on the spot. `id` maps to the component in
 * components/craft/, opened in a dialog from the card.
 */
export const craft = [
  {
    id: 'motion',
    title: 'Motion',
    claim: 'Springs, not durations.',
    body: 'Throw the card. Tune stiffness and damping live — the plotted curve is the same solver driving it.',
    cta: 'Open the solver',
    modalSub: 'Framer Motion spring, simulated and plotted from the same parameters.',
  },
  {
    id: 'perf',
    title: 'Performance',
    claim: '10,000 rows at 60fps.',
    body: 'A virtualized list and a naive one over identical data, with a live FPS meter. One of them dies.',
    cta: 'Run the comparison',
    modalSub: 'Same 10,000 records. Watch the FPS meter and the DOM node count as you switch.',
  },
  {
    id: 'a11y',
    title: 'Accessibility',
    claim: 'Keyboard-complete by default.',
    body: 'A WAI-ARIA combobox built to spec, with its live ARIA state and screen-reader output exposed.',
    cta: 'Try to break it',
    modalSub: 'ARIA 1.2 editable combobox with list autocomplete. Every announcement is shown as it fires.',
  },
];
