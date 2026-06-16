import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { KeyRound, UserCog, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const AdminSettings = () => {
  const { isDark } = useTheme()
  const [apiLoading, setApiLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [apiSaved, setApiSaved] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      fetchProfile()
      checkApiKey()
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.admin.username)
      }
    } catch (error) {
    }
  }

  const checkApiKey = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/settings/status/api-key`)
      if (response.ok) {
        const data = await response.json()
        setApiSaved(data.configured)
      } else {
        setApiSaved(false)
      }
    } catch (error) {
      setApiSaved(false)
    }
  }

  const handleApiSubmit = async (e) => {
    e.preventDefault()
    setApiLoading(true)
    try {
      const formData = new FormData(e.target)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: 'openroute_api_key',
          value: formData.get('apiKey'),
          encrypted: true,
          description: 'OpenRouteService API Key for distance calculations',
          category: 'api'
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        alert('API Key saved successfully')
        e.target.reset()
        setApiSaved(true)
      } else {
        alert(result.message || 'Failed to save')
      }
    } catch (error) {
      alert('Failed to save API key')
    } finally {
      setApiLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const formData = new FormData(e.target)
      const values = {
        username: formData.get('username'),
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword')
      }
      
      if (values.newPassword !== values.confirmPassword) {
        alert('Passwords do not match')
        setProfileLoading(false)
        return
      }
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })

      const result = await response.json()
      
      if (response.ok) {
        alert('Profile updated successfully')
        e.target.reset()
        setCurrentUser(values.username || currentUser)
      } else {
        alert(result.message || 'Failed to update')
      }
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className={`transition-colors duration-300 min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans ${isDark ? 'bg-black text-gray-100' : 'bg-[#FAFAFA] text-gray-900'}`}>
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={`text-2xl font-semibold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
          Admin Settings
        </h1>
        <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage system integrations, API configurations, and your security profile.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* API Configuration Card */}
        <div className={`transition-all duration-300 rounded-2xl p-6 sm:p-8 border shadow-sm ${
          isDark ? 'bg-gray-900 border-gray-800 shadow-black/50' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <KeyRound size={20} />
              </div>
              <h2 className={`text-lg font-semibold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Configuration
              </h2>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${
              apiSaved 
                ? (isDark ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20')
                : (isDark ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20')
            }`}>
              {apiSaved ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {apiSaved ? 'Key Configured' : 'Missing Key'}
            </div>
          </div>
          
          <form onSubmit={handleApiSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                OpenRouteService API Key
              </label>
              <input
                type="password"
                name="apiKey"
                required
                placeholder="Enter your API key"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                }`}
              />
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Required for calculating distances between properties and nearby places.
              </p>
            </div>
            <button
              type="submit"
              disabled={apiLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {apiLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {apiLoading ? 'Saving Configuration...' : 'Save API Key'}
            </button>
          </form>
        </div>

        {/* Profile Management Card */}
        <div className={`transition-all duration-300 rounded-2xl p-6 sm:p-8 border shadow-sm ${
          isDark ? 'bg-gray-900 border-gray-800 shadow-black/50' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <UserCog size={20} />
              </div>
              <h2 className={`text-lg font-semibold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Security Profile
              </h2>
            </div>
            
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Logged in as: <span className={isDark ? 'text-white' : 'text-gray-900'}>{currentUser}</span>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Administrator Username
              </label>
              <input
                type="text"
                name="username"
                required
                defaultValue={currentUser}
                placeholder="Enter username"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                }`}
              />
            </div>
            
            <div className="pt-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Update Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    placeholder="Enter current password"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      isDark 
                        ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      placeholder="New password"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                        isDark 
                          ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Confirm password"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                        isDark 
                          ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <UserCog size={18} />}
              {profileLoading ? 'Updating Profile...' : 'Update Security Profile'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default AdminSettings