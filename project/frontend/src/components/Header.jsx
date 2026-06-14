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

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// Isolated User Menu prevents entire header re-render on toggle
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
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-800 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all duration-300 transform-gpu will-change-transform group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-gray-900 font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="font-semibold text-sm hidden lg:block">{user.name?.split(' ')[0]}</span>
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const location = useLocation();
  const { user } = useUser();

  // Network Safety: AbortController prevents state updates on unmounted components
  useEffect(() => {
    const abortController = new AbortController();

    const fetchPhoneNumber = async () => {
      try {
        const response = await pageAPI.getPageContent('contact', { 
          signal: abortController.signal 
        });
        const phone = response.data?.content?.contact?.contactInfo?.phone;
        if (phone && !abortController.signal.aborted) {
          setPhoneNumber(phone);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching phone number:', error);
        }
      }
    };

    fetchPhoneNumber();
    return () => abortController.abort();
  }, []);

  // UX Optimization: Automatically close mobile menu when clicking a link
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Helper to determine active route
  const checkIsActive = useCallback((path, exact) => {
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <header id="home" className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transform-gpu">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">

        <Link to="/" className="flex items-center group">
          {/* GPU Acceleration for smooth hover scaling */}
          <img 
            src={logo} 
            alt="KaunsaHostel Logo" 
            className="h-11 transition-transform duration-300 transform-gpu group-hover:scale-105 will-change-transform" 
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {NAV_LINKS.map(({ path, label, exact }) => {
            const isActive = checkIsActive(path, exact);
            return (
              <Link 
                key={`desktop-${path}`}
                to={path} 
                className={`nav-link font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${
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
        
        <div className="hidden md:flex items-center gap-4">
          {phoneNumber && (
            <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex items-center bg-gray-900 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition-all duration-300 transform-gpu hover:-translate-y-0.5 shadow-md">
              <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {phoneNumber}
            </a>
          )}
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link to="/user/auth" className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform-gpu hover:-translate-y-0.5 shadow-md hover:shadow-lg">
              Sign In
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-yellow-600 focus:outline-none p-2 rounded-xl hover:bg-yellow-50 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-6 space-y-2">
              {user && (
                <div className="mb-4 pb-4 border-b border-gray-100 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-gray-900 font-bold text-lg shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}

              {NAV_LINKS.map(({ path, label, exact }) => {
                const isActive = checkIsActive(path, exact);
                return (
                  <Link 
                    key={`mobile-${path}`}
                    to={path} 
                    className={`block nav-link font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'text-gray-900 bg-yellow-50 border border-yellow-200/50' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              
              <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
                {user ? (
                  <Link to="/user/profile" className="block text-center bg-gray-50 border border-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors">
                    Dashboard Settings
                  </Link>
                ) : (
                  <Link to="/user/auth" className="block text-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-xl shadow-md">
                    Sign In to Account
                  </Link>
                )}
                
                {phoneNumber && (
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex items-center justify-center bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                    <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call: {phoneNumber}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})

Header.displayName = 'Header'

export default Header;