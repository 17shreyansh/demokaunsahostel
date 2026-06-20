import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * PageTransition — Hardware-accelerated Framer Motion route transition component.
 * Provides a buttery-smooth, optimistic page load effect using spring physics.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30, 
        mass: 0.8 
      }}
      className="will-change-transform w-full"
      style={{ 
        transformOrigin: 'top center',
        transform: 'translateZ(0)', 
        backfaceVisibility: 'hidden', 
        WebkitBackfaceVisibility: 'hidden',
        perspective: 1000 
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
