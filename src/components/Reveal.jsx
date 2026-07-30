import { motion } from 'framer-motion';

/** Scroll-triggered reveal wrapper. Fades + rises children into view once. */
export default function Reveal({ children, as = 'div', delay = 0, y = 28, className = '', ...rest }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </M>
  );
}
