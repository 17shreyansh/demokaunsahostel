import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  FiHome, FiGrid, FiUsers, FiSettings, FiFileText, 
  FiFolder, FiMessageSquare, FiStar, FiMenu, FiLogOut, FiBell, FiChevronDown
} from 'react-icons/fi';

/* -------------------------------------------------------------------------- */
/* STATIC ENTERPRISE CONFIGURATION                                            */
/* -------------------------------------------------------------------------- */

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
  { key: 'hostels', label: 'Properties', icon: FiGrid, path: '/admin/hostels' },
  { key: 'users', label: 'Users', icon: FiUsers, path: '/admin/users' },
  { key: 'managers', label: 'Hostel Owners', icon: FiUsers, path: '/admin/managers' },
  { key: 'reviews', label: 'Reviews', icon: FiStar, path: '/admin/reviews' },
  { key: 'blog', label: 'Blog Posts', icon: FiFileText, path: '/admin/blog' },
  { key: 'nearbyplaces', label: 'Nearby Places', icon: FiMessageSquare, path: '/admin/nearbyplaces' },
  { key: 'leads', label: 'Bookings', icon: FiFolder, path: '/admin/leads' },
  { key: 'page-content', label: 'CMS Content', icon: FiFileText, path: '/admin/page-content' },
  { key: 'settings', label: 'System Settings', icon: FiSettings, path: '/admin/settings' }
];

const getSelectedKey = (pathname) => {
  const match = MENU_ITEMS.find(item => pathname.includes(item.path));
  return match ? match.key : 'dashboard';
};

const getPageTitle = (pathname) => {
  if (pathname.includes('/hostels/new')) return 'Add New Property';
  if (pathname.includes('/hostels/') && pathname.split('/').length > 3) return 'Edit Property';
  const match = MENU_ITEMS.find(item => pathname.includes(item.path));
  return match ? match.label : 'Dashboard';
};

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const SidebarItem = memo(({ item, isActive, collapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <li className="px-3 py-0.5">
      <button
        onClick={() => onClick(item)}
        className={`w-full flex items-center h-10 rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        } ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && (
          <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
            {item.label}
          </span>
        )}
      </button>
    </li>
  );
});
SidebarItem.displayName = 'SidebarItem';

/* -------------------------------------------------------------------------- */
/* MAIN ENTERPRISE SHELL                                                      */
/* -------------------------------------------------------------------------- */

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false); // Desktop mini-sidebar
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false); // Mobile off-canvas
  const [notifications] = useState(3);

  // Strictly handle responsive states without layout thrashing
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setMobileDrawerOpen(false);
          setCollapsed(window.innerWidth < 1280); // Auto-collapse on medium desktops
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile drawer when clicking a link
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.logout();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const handleMenuClick = useCallback((item) => {
    navigate(item.path);
  }, [navigate]);

  const activeKey = getSelectedKey(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* 
        MOBILE OVERLAY 
      */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* 
        ENTERPRISE SIDEBAR
        Deep Slate background. Fixed on mobile, static on desktop.
      */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          mobileDrawerOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed && !mobileDrawerOpen ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Branding Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
          <div className={`flex items-center w-full ${collapsed && !mobileDrawerOpen ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
              K
            </div>
            {(!collapsed || mobileDrawerOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-bold text-sm tracking-wide">KaunsaHostel</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Admin Portal</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <SidebarItem 
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                collapsed={collapsed && !mobileDrawerOpen}
                onClick={handleMenuClick}
              />
            ))}
          </ul>
        </nav>

        {/* System Version */}
        <div className="h-14 flex items-center border-t border-slate-800 px-4">
          <div className="w-full flex items-center text-slate-500 text-xs">
            {(!collapsed || mobileDrawerOpen) ? (
              <div className="flex justify-between w-full">
                <span>System Status</span>
                <span className="text-green-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 
        MAIN CONTENT AREA 
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        
        {/* 
          CRISP WHITE HEADER 
        */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
          
          <div className="flex items-center gap-4">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <FiMenu size={20} />
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <FiMenu size={20} />
            </button>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
              <FiBell size={18} />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* User Profile Dropdown Trigger */}
            <div className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-semibold text-gray-900 leading-tight">System Admin</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Superuser</span>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-bold text-sm">
                A
              </div>
              <FiChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>

            {/* Strict Logout Action */}
            <button
              onClick={handleLogout}
              className="ml-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Sign Out"
            >
              <FiLogOut size={18} />
            </button>
            
          </div>
        </header>

        {/* 
          SCROLLABLE CONTENT OUTLET 
          Designed perfectly for Ant Design Tables & Forms
        */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Ant Design components rendered here will sit perfectly on the gray-50 background */}
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;