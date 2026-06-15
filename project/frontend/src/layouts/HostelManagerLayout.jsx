import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHostelManager } from '../contexts/HostelManagerContext';
import { 
  FiHome, FiStar, FiUser, FiLogOut, FiMenu, FiX, 
  FiCheckCircle, FiAlertCircle, FiClock, FiBell, FiSettings,
  FiChevronDown, FiGrid, FiBarChart2
} from 'react-icons/fi';

const HostelManagerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { manager, logout } = useHostelManager();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/hostel-manager/auth');
  };

  const getKYCStatusBadge = () => {
    const status = manager?.kyc?.status;
    const badges = {
      verified: { bg: 'bg-green-100', text: 'text-green-700', icon: <FiCheckCircle />, label: 'Verified' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiClock />, label: 'Under Review' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: <FiAlertCircle />, label: 'Rejected' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FiAlertCircle />, label: 'Pending' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const navigation = [
    { name: 'Dashboard', href: '/hostel-manager/dashboard', icon: FiGrid, badge: null },
    { name: 'My Properties', href: '/hostel-manager/hostels', icon: FiHome, badge: manager?.hostels?.length || 0 },
    { name: 'Reviews', href: '/hostel-manager/reviews', icon: FiStar, badge: null },
    { name: 'KYC Status', href: '/hostel-manager/kyc', icon: FiCheckCircle, badge: getKYCStatusBadge() },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <span className="font-bold text-gray-900">Kaunsa Hostel</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/hostel-manager/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Kaunsa Hostel</h1>
                <p className="text-xs text-gray-500">Manager Portal</p>
              </div>
            </Link>
          </div>

          {/* Profile Section */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-lg font-bold">{manager?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{manager?.name}</p>
                  <p className="text-xs text-gray-600 truncate">{manager?.email}</p>
                </div>
                <FiChevronDown className={`text-gray-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <Link
                    to="/hostel-manager/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileDropdown(false)}
                  >
                    <FiUser className="text-gray-400" />
                    <span className="text-sm text-gray-700">My Profile</span>
                  </Link>
                  <Link
                    to="/hostel-manager/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileDropdown(false)}
                  >
                    <FiSettings className="text-gray-400" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <FiLogOut />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className={`flex-1 font-medium text-sm ${active ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.badge && typeof item.badge !== 'number' && item.badge}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <FiBarChart2 className="w-5 h-5" />
                <h3 className="font-semibold text-sm">Upgrade Plan</h3>
              </div>
              <p className="text-xs text-white/80 mb-3">Get more features with Premium</p>
              <button className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg text-xs font-semibold hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72 pt-0 lg:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Welcome back, {manager?.name?.split(' ')[0]}!</p>
              </div>
              
              {/* Top Bar Actions */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <FiBell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Quick Actions */}
                {manager?.kyc?.status === 'verified' && (
                  <Link
                    to="/hostel-manager/hostels/add"
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm"
                  >
                    <FiHome className="w-4 h-4" />
                    <span>Add Property</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HostelManagerLayout;
