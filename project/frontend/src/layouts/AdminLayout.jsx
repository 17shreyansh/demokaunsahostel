import { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useTheme, ThemeProvider } from '../contexts/ThemeContext'
import { FiHome, FiGrid, FiUsers, FiSettings, FiFileText, FiFolder, FiMessageSquare } from 'react-icons/fi'

const AdminLayoutContent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: FiHome },
    { key: 'hostels', label: 'My Properties', icon: FiGrid },
    { key: 'blog', label: 'Blog Posts', icon: FiFileText },
    { key: 'nearbyplaces', label: 'Nearby Places', icon: FiUsers },
    { key: 'leads', label: 'Bookings', icon: FiUsers },
    { key: 'page-content', label: 'Page Content', icon: FiFolder },
    { key: 'settings', label: 'Settings', icon: FiSettings }
  ]

  const handleMenuClick = (key) => {
    if (location.pathname.includes('/hostels/') && key === 'hostels') {
      navigate('/admin/hostels')
    } else {
      navigate(`/admin/${key}`)
    }
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.includes('/hostels')) return ['hostels']
    if (path.includes('/blog')) return ['blog']
    if (path.includes('/nearbyplaces')) return ['nearbyplaces']
    if (path.includes('/leads')) return ['leads']
    if (path.includes('/page-content')) return ['page-content']
    if (path.includes('/settings')) return ['settings']
    return ['dashboard']
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/hostels/new')) return 'Add New Property'
    if (path.includes('/hostels/') && path.split('/').length > 3) return 'Edit Property'
    if (path.includes('/hostels')) return 'My Properties'
    if (path.includes('/blog/new')) return 'Create Blog Post'
    if (path.includes('/blog/edit')) return 'Edit Blog Post'
    if (path.includes('/blog')) return 'Blog Management'
    if (path.includes('/nearbyplaces')) return 'Nearby Places'
    if (path.includes('/leads')) return 'Booking Management'
    if (path.includes('/page-content')) return 'Page Content Editor'
    if (path.includes('/settings')) return 'Account Settings'
    return 'Provider Dashboard'
  }

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>KaunsaHostel</h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = getSelectedKey()[0] === item.key
              const IconComponent = item.icon
              return (
                <li key={item.key}>
                  <button
                    onClick={() => handleMenuClick(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="text-lg" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Version */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Version 1.0.0</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getPageTitle()}</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82a3 3 0 00-4.24 0L2.82 5.83a3 3 0 000 4.24l2.01 2.01a3 3 0 004.24 0l2.01-2.01a3 3 0 000-4.24L10.07 2.82z" />
                </svg>
              </button>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin User</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <AdminLayoutContent />
    </ThemeProvider>
  )
}

export default AdminLayout