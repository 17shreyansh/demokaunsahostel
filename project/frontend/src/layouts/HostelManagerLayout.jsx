import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHostelManager } from '../contexts/HostelManagerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiStar, FiUser, FiLogOut, FiMenu, FiX, 
  FiCheckCircle, FiAlertCircle, FiClock, FiBell, FiSettings,
  FiChevronUp, FiGrid, FiBriefcase, FiUsers, FiFileText
} from 'react-icons/fi';

/* -------------------------------------------------------------------------- */
/* MAIN PARTNER SHELL COMPONENT                                               */
/* -------------------------------------------------------------------------- */

const HostelManagerLayout = ({ children }) => {
  const { manager, logout } = useHostelManager();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/hostel-manager/auth');
  }, [logout, navigate]);

  // Memoized KYC Badge Generator
  const kycBadge = useMemo(() => {
    const status = manager?.kyc?.status || 'pending';
    const badges = {
      verified: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: <FiCheckCircle />, label: 'Verified' },
      submitted: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <FiClock />, label: 'Under Review' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <FiAlertCircle />, label: 'Rejected' },
      pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: <FiAlertCircle />, label: 'Pending KYC' }
    };
    const badge = badges[status];

    return (
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  }, [manager?.kyc?.status]);

  // Memoized Navigation Array
  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/hostel-manager/dashboard', icon: FiGrid },
    { name: 'My Properties', href: '/hostel-manager/hostels', icon: FiHome, badge: manager?.hostels?.length || 0 },
    { name: 'Change Requests', href: '/hostel-manager/change-requests', icon: FiFileText },
    { name: 'Payments', href: '/hostel-manager/payments', icon: FiBriefcase },
    { name: 'Reviews', href: '/hostel-manager/reviews', icon: FiStar },
    { name: 'My Users', href: '/hostel-manager/students', icon: FiUsers },
    { name: 'KYC Status', href: '/hostel-manager/kyc', icon: FiBriefcase, badgeElement: kycBadge },
  ], [manager?.hostels?.length, kycBadge]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);
  const activeRouteName = useMemo(() => navigation.find(item => isActive(item.href))?.name || 'Dashboard', [navigation, isActive]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* -------------------------------------------------------------------------- */}
      {/* MOBILE OVERLAY & HEADER                                                    */}
      {/* -------------------------------------------------------------------------- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center shadow-sm">
            <span className="text-slate-900 text-sm font-bold">K</span>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">Owner Portal</span>
        </div>
        <div className="w-10" /> {/* Centering Spacer */}
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------------------- */}
      {/* ENTERPRISE SIDEBAR (Dark Mode Strict)                                      */}
      {/* -------------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out transform-gpu ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:flex-shrink-0`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <FiX size={24} />
        </button>

        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          <Link to="/hostel-manager/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/10 group-hover:scale-105 transition-transform transform-gpu">
              <span className="text-slate-900 text-xl font-black">K</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-extrabold text-white tracking-wide">KaunsaHostel</h1>
              <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Owners</p>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 no-scrollbar">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-yellow-500 text-slate-900 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className={active ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'} />
                <span className="flex-1 font-semibold text-sm">{item.name}</span>
                
                {/* Number Badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    active ? 'bg-slate-900/10 text-slate-900' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                
                {/* Element Badge (KYC) */}
                {item.badgeElement && item.badgeElement}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section (SaaS Standard) */}
        <div className="p-4 border-t border-slate-800/50 relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-yellow-500/50 transition-colors">
              <span className="text-yellow-500 font-bold text-sm">{manager?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-white truncate">{manager?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{manager?.email}</p>
            </div>
            <FiChevronUp className={`text-slate-500 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {profileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 transform-gpu"
              >
                <div className="p-1">
                  <Link
                    to="/hostel-manager/profile"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 font-medium text-sm"
                  >
                    <FiUser size={16} className="text-slate-400" /> My Profile
                  </Link>
                  <Link
                    to="/hostel-manager/settings"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 font-medium text-sm"
                  >
                    <FiSettings size={16} className="text-slate-400" /> Account Settings
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium text-sm"
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* -------------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                                          */}
      {/* -------------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-16 lg:pt-0">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 items-center justify-between px-8 z-30 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeRouteName}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Welcome back, {manager?.name?.split(' ')[0]}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            {/* Primary Action Button */}
            {manager?.kyc?.status === 'verified' ? (
              <Link
                to="/hostel-manager/hostels/add"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm transform-gpu hover:-translate-y-0.5"
              >
                <FiHome size={16} className="text-yellow-500" />
                <span>Add Property</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-200" title="Complete KYC to add properties">
                <FiHome size={16} />
                <span>Add Property</span>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8 no-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default HostelManagerLayout;