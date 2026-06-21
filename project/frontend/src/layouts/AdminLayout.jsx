import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  Home, LayoutGrid, Users, Settings, FileText, 
  Folder, MessageSquare, Star, Menu, LogOut, Bell, ChevronDown
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* STATIC ENTERPRISE CONFIGURATION                                            */
/* -------------------------------------------------------------------------- */

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { key: 'hostels', label: 'Properties', icon: LayoutGrid, path: '/admin/hostels' },
  { key: 'change-requests', label: 'Change Requests', icon: FileText, path: '/admin/change-requests' },
  { key: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { key: 'managers', label: 'Hostel Owners', icon: Users, path: '/admin/managers' },
  { key: 'reviews', label: 'Reviews', icon: Star, path: '/admin/reviews' },
  { key: 'blog', label: 'Blog Posts', icon: FileText, path: '/admin/blog' },
  { key: 'faq', label: 'FAQ Management', icon: MessageSquare, path: '/admin/faq' },
  { key: 'nearbyplaces', label: 'Nearby Places', icon: MessageSquare, path: '/admin/nearbyplaces' },
  { key: 'leads', label: 'Bookings', icon: Folder, path: '/admin/leads' },
  { key: 'page-content', label: 'CMS Content', icon: FileText, path: '/admin/page-content' },
  { key: 'installment-templates', label: 'Installment Templates', icon: FileText, path: '/admin/installment-templates' },
  { key: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  { key: 'visits', label: 'Users Visits', icon: Settings, path: '/admin/visit-bookings' },
  { key: 'assignments', label: 'Hostel Assignments', icon: Settings, path: '/admin/assignments' },
  { key: 'payments', label: 'Payments', icon: Folder, path: '/admin/payments' },
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
        aria-current={isActive ? 'page' : undefined}
        className={`group relative flex w-full items-center h-10 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98] ${
          isActive
            ? 'bg-blue-50/80 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-medium'
        } ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon 
          size={18} 
          strokeWidth={isActive ? 2.5 : 2}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
          }`} 
        />
        
        {!collapsed && (
          <span className="ml-3 text-sm tracking-tight whitespace-nowrap overflow-hidden">
            {item.label}
          </span>
        )}

        {/* Active Indicator Line for subtle depth */}
        {isActive && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
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
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifications] = useState(3);

  // Strictly handle responsive states without layout thrashing
  useEffect(() => {
    // Dynamically load antd reset only for admin routes
    import('antd/dist/reset.css');

    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setMobileDrawerOpen(false);
          setCollapsed(window.innerWidth < 1280);
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

  // Close mobile drawer when navigating
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
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden font-sans antialiased text-gray-900">
      
      {/* MOBILE OVERLAY 
        Glassmorphic blur for premium feel
      */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ENTERPRISE SIDEBAR
        Crisp white, subtle border, Stripe/Vercel inspired
      */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-sm lg:shadow-none ${
          mobileDrawerOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${collapsed && !mobileDrawerOpen ? 'lg:w-20' : 'lg:w-72'}`}
        aria-label="Sidebar Navigation"
      >
        {/* Branding Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 px-4">
          <div className={`flex items-center w-full ${collapsed && !mobileDrawerOpen ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-inner shadow-blue-500/50 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg ring-1 ring-black/5">
              K
            </div>
            {(!collapsed || mobileDrawerOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-gray-900 font-semibold text-sm tracking-tight">KaunsaHostel</span>
                <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">Admin Portal</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 no-scrollbar">
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

        {/* System Version & Status */}
        <div className="h-14 flex items-center border-t border-gray-100 px-4 bg-gray-50/50">
          <div className="w-full flex items-center text-gray-500 text-xs font-medium">
            {(!collapsed || mobileDrawerOpen) ? (
              <div className="flex justify-between items-center w-full">
                <span>System Status</span>
                <span className="text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center text-emerald-600" title="System Online">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA 
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* GLASSMORPHIC HEADER 
        */}
        <header className="h-16 bg-white/95 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0 sticky top-0 supports-[backdrop-filter]:bg-white/95">
          
          <div className="flex items-center gap-4">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open sidebar menu"
              className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            <h2 className="text-lg font-semibold tracking-tight text-gray-900 hidden sm:block">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notifications */}
            <button 
              aria-label="View notifications"
              className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Bell size={18} strokeWidth={2.5} />
              {notifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

            {/* User Profile Dropdown Trigger */}
            <button 
              aria-label="User profile menu"
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left group"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 leading-none">System Admin</span>
                <span className="text-[11px] font-medium text-blue-600 mt-1">Superuser</span>
              </div>
              <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-semibold text-sm group-hover:bg-white transition-colors">
                A
              </div>
              <ChevronDown size={14} strokeWidth={2.5} className="text-gray-400 hidden sm:block group-hover:text-gray-600" />
            </button>

            {/* Strict Logout Action */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              title="Sign Out"
              className="ml-1 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
            
          </div>
        </header>

        {/* SCROLLABLE CONTENT OUTLET 
          Optimized spacing for Ant Design or standard forms/tables
        */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;