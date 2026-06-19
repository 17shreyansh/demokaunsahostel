import { useLocation } from 'react-router-dom';

/**
 * PageTransition — CSS-only route transition component.
 * 
 * Uses a key change on `location.pathname` to trigger a CSS animation
 * via the `page-transition-enter` class. All animation runs on the GPU
 * compositor thread via `translate3d` — zero JS animation overhead.
 * 
 * This replaces the need for Framer Motion's AnimatePresence at the route level.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition-enter"
    >
      {children}
    </div>
  );
};

export default PageTransition;
