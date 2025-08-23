import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import apiClient from '../services/apiClient'

const AdminSettings = () => {
  const { isDark } = useTheme()
  const [apiLoading, setApiLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const { user } = useAuth()
  const [currentUser, setCurrentUser] = useState('')
  const [apiSaved, setApiSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setCurrentUser(user.username)
      checkApiKey()
    }
  }, [user])



  const checkApiKey = async () => {
    try {
      const response = await apiClient.get('/settings/status/api-key')
      setApiSaved(response.data.configured)
    } catch (error) {
      setApiSaved(false)
    }
  }

  const handleApiSubmit = async (e) => {
    e.preventDefault()
    setApiLoading(true)
    try {
      const formData = new FormData(e.target)
      await apiClient.settings.update({
        key: 'openroute_api_key',
        value: formData.get('apiKey'),
        encrypted: true,
        description: 'OpenRouteService API Key for distance calculations',
        category: 'api'
      })
      
      console.log('API Key saved successfully')
      e.target.reset()
      setApiSaved(true)
    } catch (error) {
      console.error('Failed to save API key:', error)
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
        console.error('Passwords do not match')
        setProfileLoading(false)
        return
      }
      
      await apiClient.put('/auth/profile', values)
      e.target.reset()
      setCurrentUser(values.username || currentUser)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Admin Settings</h1>
        <p className={`transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage API configuration and profile settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
          <div className="flex items-center space-x-2 mb-4">
            <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z" />
            </svg>
            <h2 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>API Configuration</h2>
          </div>
          
          <div className="mb-4">
            <span className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status: </span>
            <span className={`text-sm font-medium ${apiSaved ? 'text-green-500' : 'text-red-500'}`}>
              {apiSaved ? '✓ API Key Saved' : '✗ API Key Not Configured'}
            </span>
          </div>
          
          <form onSubmit={handleApiSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                OpenRouteService API Key
              </label>
              <input
                type="password"
                name="apiKey"
                required
                placeholder="Enter your API key"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              type="submit"
              disabled={apiLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {apiLoading ? 'Saving...' : 'Save API Key'}
            </button>
          </form>
        </div>

        {/* Profile Management */}
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
          <div className="flex items-center space-x-2 mb-4">
            <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Management</h2>
          </div>
          
          <div className="mb-4">
            <span className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current user: </span>
            <span className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser}</span>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                defaultValue={currentUser}
                placeholder="Enter username"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="Current password"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="New password"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Confirm password"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings