import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import logo from '../assets/logo.png';

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS                                                              */
/* -------------------------------------------------------------------------- */
const NAV_LINKS = [
  { path: '/', label: 'Home', exact: true },
  { path: '/hostels', label: 'Hostels', exact: true },
  { path: '/blog', label: 'Blogs', exact: false },
  { path: '/about', label: 'About', exact: true },
  { path: '/contact', label: 'Contact', exact: true }
];

const SOCIAL_LINKS = [
  { 
    name: 'Facebook', 
    url: '#', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /> 
  },
  { 
    name: 'Instagram', 
    url: '#', 
    icon: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></> 
  },
  { 
    name: 'Twitter', 
    url: '#', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4l11.733 16h4.267L8.267 4H4zm8 8l8-8h-4.267L8 12l8 8h4.267L12 12z" fill="currentColor" stroke="none" /> 
  },
  { 
    name: 'LinkedIn', 
    url: '#', 
    icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect width="4" height="12" x="2" y="9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><circle cx="4" cy="4" r="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></> 
  }
];

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const UserDropdown = memo(({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-800 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all duration-300 transform-gpu will-change-transform group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-gray-900 font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="font-semibold text-sm hidden lg:block whitespace-nowrap">
          {user.name?.split(' ')[0]}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden transform-gpu will-change-transform z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Link
              to="/user/profile"
              onClick={closeMenu}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors mx-2 rounded-xl"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Dashboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

UserDropdown.displayName = 'UserDropdown';

/* -------------------------------------------------------------------------- */
/* MAIN HEADER COMPONENT                                                      */
/* -------------------------------------------------------------------------- */

const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const checkIsActive = useCallback((path, exact) => {
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <header id="home" className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transform-gpu">
      <nav className="container mx-auto px-3 sm:px-4 md:px-6 flex justify-between items-center">

        <img 
          src={logo} 
          alt="KaunsaHostel Logo" 
          className="h-16 sm:h-181 md:h-20 w-auto object-contain block cursor-pointer transition-transform duration-300 transform-gpu hover:scale-105 will-change-transform" 
          onClick={() => window.location.href = '/'}
        />
        
        <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1 xl:space-x-2 flex-1 justify-center">
          {NAV_LINKS.map(({ path, label, exact }) => {
            const isActive = checkIsActive(path, exact);
            return (
              <Link 
                key={`desktop-${path}`}
                to={path} 
                className={`nav-link font-semibold px-2 lg:px-3 xl:px-4 py-2 rounded-xl transition-all duration-300 text-sm lg:text-base whitespace-nowrap ${
                  isActive 
                    ? 'text-gray-900 bg-yellow-50 border border-yellow-200/50 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
        
        <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4 flex-shrink-0">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link to="/user/auth" className="px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform-gpu hover:-translate-y-0.5 shadow-md hover:shadow-lg text-xs lg:text-sm xl:text-base whitespace-nowrap">
              Sign In
            </Link>
          )}
        </div>

        <div className="md:hidden flex-shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
            className="text-gray-600 hover:text-yellow-600 focus:outline-none p-1.5 sm:p-2 rounded-xl hover:bg-yellow-50 transition-all duration-300"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden touch-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 h-[100dvh] w-[280px] sm:w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden flex flex-col overscroll-contain"
              style={{ 
                transform: 'translateZ(0)',
                WebkitOverflowScrolling: 'touch',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white flex-shrink-0">
                <img src={logo} alt="Logo" className="h-12 sm:h-14 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 sm:p-2 -mr-2 sm:-mr-0 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div 
                className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-6"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  transform: 'translateZ(0)'
                }}
              >
                {user && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl shadow-md">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/user/profile"
                      className="block text-center bg-white text-gray-800 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm border border-gray-200"
                    >
                      View Dashboard
                    </Link>
                  </div>
                )}

                <nav className="space-y-2">
                  {NAV_LINKS.map(({ path, label, exact }) => {
                    const isActive = checkIsActive(path, exact);
                    return (
                      <Link
                        key={`mobile-${path}`}
                        to={path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                          isActive
                            ? 'bg-yellow-50 text-gray-900 border border-yellow-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Enhanced Sidebar Footer with Social Icons */}
              <div className="px-4 sm:px-6 py-5 border-t border-gray-200 space-y-4 bg-gray-50 flex-shrink-0">
                {!user && (
                  <Link
                    to="/user/auth"
                    className="block text-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Sign In
                  </Link>
                )}

                {/* Social Media Links */}
                <div className="pt-2 flex items-center justify-center gap-5">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 transform hover:scale-110"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {social.icon}
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
})

Header.displayName = 'Header'

export default Header;