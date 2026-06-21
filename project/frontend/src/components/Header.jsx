import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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

// 1. Optimized Dropdown: Replaced heavy JS animations with CSS peer/focus states
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
        className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-800 transition-colors hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 font-bold text-gray-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden whitespace-nowrap text-sm font-semibold lg:block">
          {user.name?.split(' ')[0]}
        </span>
      </button>

      {/* Pure CSS Hardware-Accelerated Dropdown Transition */}
      <div
        className={`absolute right-0 top-full mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white/95 py-2 shadow-xl backdrop-blur-md transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-50
        ${isOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}
      >
        <div className="mb-1 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="truncate text-xs text-gray-500">{user.email}</p>
        </div>
        <Link
          to="/user/profile"
          onClick={closeMenu}
          className="mx-2 flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
        >
          <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Dashboard
        </Link>
      </div>
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
  const headerRef = useRef(null);

  // Initial load animation ONLY. Runs once, doesn't eat memory during user interaction.
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
      .fromTo('.gsap-stagger-item',
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'all' },
        "-=0.3"
      );
  }, { scope: headerRef });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // iOS-Optimized Scroll Lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Crucial for iOS Safari elastic scroll blocking
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const checkIsActive = useCallback((path, exact) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <header id="home" ref={headerRef} className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 py-2 sm:py-0">

        <div className="gsap-stagger-item shrink-0 py-2">
          <Link to="/">
            <img
              src={logo}
              alt="KaunsaHostel"
              fetchPriority="high"
              decoding="async"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center space-x-1 md:flex lg:space-x-2">
          {NAV_LINKS.map(({ path, label, exact }) => {
            const isActive = checkIsActive(path, exact);
            return (
              <div key={`desktop-${path}`} className="gsap-stagger-item">
                <Link
                  to={path}
                  className={`block whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 lg:px-4 lg:text-base ${isActive
                      ? 'bg-yellow-50 text-gray-900 border-yellow-100 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {label}
                </Link>
              </div>
            )
          })}
        </div>

        <div className="gsap-stagger-item hidden shrink-0 items-center gap-4 md:flex">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link to="/user/auth" className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2.5 text-sm font-bold text-gray-900 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg lg:text-base">
              Sign In
            </Link>
          )}
        </div>

        <div className="gsap-stagger-item shrink-0 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
            className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-yellow-50 hover:text-yellow-600 active:bg-yellow-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* 
        Native iOS Drawer: 
        Replaced Framer Motion with hardware-accelerated CSS. 
        Uses `100dvh` to prevent the notorious iOS Safari bottom-bar jump. 
      */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[280px] max-w-[85vw] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          {user && (
            <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-lg font-bold text-gray-900 shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
              <Link
                to="/user/profile"
                className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 transition-colors active:bg-gray-50"
              >
                View Dashboard
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            {NAV_LINKS.map(({ path, label, exact }) => {
              const isActive = checkIsActive(path, exact);
              return (
                <Link
                  key={`mobile-${path}`}
                  to={path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold transition-colors ${isActive
                      ? 'bg-yellow-50 text-gray-900 border border-yellow-100 shadow-sm'
                      : 'text-gray-600 active:bg-gray-50'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 space-y-4 border-t border-gray-100 bg-gray-50 px-5 py-6 pb-safe">
          {!user && (
            <Link
              to="/user/auth"
              className="block rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3.5 text-center font-bold text-gray-900 shadow-md transition-transform active:scale-95"
            >
              Sign In
            </Link>
          )}

          <div className="flex items-center justify-center gap-6 pt-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-yellow-500 active:text-yellow-600"
                aria-label={`Follow us on ${social.name}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header;