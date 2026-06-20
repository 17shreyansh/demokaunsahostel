import { useLocation } from 'react-router-dom';

/**
 * PageTransition — Hardware-accelerated CSS transition component.
 * Provides a buttery-smooth page load effect without JS overhead.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-in fade-in slide-in-from-bottom-4 zoom-in-[0.98] duration-500 ease-out will-change-transform w-full"
      style={{ 
        transformOrigin: 'top center',
        transform: 'translateZ(0)', 
        backfaceVisibility: 'hidden', 
        WebkitBackfaceVisibility: 'hidden',
        perspective: 1000 
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
