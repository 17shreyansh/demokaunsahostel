import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * PageTransition — Framer Motion transition component.
 * Uses `useOutlet()` to freeze the exiting route's state during the exit animation,
 * ensuring smooth cross-fades without layout thrashing.
 */
const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full will-change-transform transform-gpu"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
