import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { KeyRound, UserCog, CheckCircle2, XCircle, Loader2, CreditCard, Upload } from 'lucide-react'
import axios from 'axios'

const AdminSettings = () => {
  const { isDark } = useTheme()
  const [apiLoading, setApiLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [apiSaved, setApiSaved] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState({ upiId: '', paymentInstructions: '' })
  const [qrFile, setQrFile] = useState(null)
  const [qrPreview, setQrPreview] = useState(null)

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const BASE_URL = API_URL.replace('/api', '') // For non-api routes like /uploads

  useEffect(() => {
    fetchProfile()
    checkApiKey()
    fetchPaymentSettings()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      })
      
      if (response.data.success && response.data.role === 'admin') {
        setCurrentUser(response.data.user.username)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const checkApiKey = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/status/api-key`)
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

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/payment-config`, { 
        withCredentials: true
      })
      if (response.data.success && response.data.settings) {
        setPaymentSettings(response.data.settings)
        if (response.data.settings.qrCode) {
          setQrPreview(`${BASE_URL}/uploads/${response.data.settings.qrCode}`)
        }
      }
    } catch (error) {
      console.error('Payment settings fetch error:', error)
    }
  }

  const handleApiSubmit = async (e) => {
    e.preventDefault()
    setApiLoading(true)
    try {
      const formData = new FormData(e.target)
      
      const response = await axios.post(`${API_URL}/settings`, {
        key: 'openroute_api_key',
        value: formData.get('apiKey'),
        encrypted: true,
        description: 'OpenRouteService API Key for distance calculations',
        category: 'api'
      }, {
        withCredentials: true
      })
      
      if (response.data) {
        alert('API Key saved successfully')
        e.target.reset()
        setApiSaved(true)
      } else {
        alert('Failed to save')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save API key')
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
      
      const response = await axios.put(`${API_URL}/auth/admin/profile`, values, {
        withCredentials: true
      })
      
      if (response.data.success) {
        alert('Profile updated successfully')
        e.target.reset()
        setCurrentUser(values.username || currentUser)
      } else {
        alert('Failed to update')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setPaymentLoading(true)
    try {
      const formData = new FormData()
      formData.append('upiId', paymentSettings.upiId)
      formData.append('paymentInstructions', paymentSettings.paymentInstructions)
      if (qrFile) {
        formData.append('qrCode', qrFile)
      }

      const response = await axios.post(`${API_URL}/settings/payment-config`, formData, {
        withCredentials: true
      })

      if (response.data.success) {
        alert('Payment settings saved successfully')
        fetchPaymentSettings()
      }
    } catch (error) {
      alert('Failed to save payment settings')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleQrChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQrFile(file)
      setQrPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className={`transition-colors duration-300 min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans ${isDark ? 'bg-black text-gray-100' : 'bg-[#FAFAFA] text-gray-900'}`}>
      
      <div className="mb-8">
        <h1 className={`text-2xl font-semibold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
          Admin Settings
        </h1>
        <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage system integrations, payment configuration, and security profile.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* Payment Configuration Card */}
        <div className={`transition-all duration-300 rounded-2xl p-6 sm:p-8 border shadow-sm ${
          isDark ? 'bg-gray-900 border-gray-800 shadow-black/50' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <CreditCard size={20} />
              </div>
              <h2 className={`text-lg font-semibold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Default Payment Settings
              </h2>
            </div>
          </div>
          
          <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              These settings will be used for hostels without assigned managers. When a hostel has a manager, their payment details take priority.
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Default UPI ID
              </label>
              <input
                type="text"
                value={paymentSettings.upiId}
                onChange={(e) => setPaymentSettings({...paymentSettings, upiId: e.target.value})}
                placeholder="admin@upi"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Default QR Code
              </label>
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isDark 
                    ? 'bg-gray-950 border-gray-800 text-gray-300 hover:bg-gray-900' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}>
                  <Upload size={16} />
                  Upload QR
                  <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
                </label>
                {qrPreview && (
                  <img src={qrPreview} alt="QR Preview" className="h-16 w-16 object-cover rounded-lg border" />
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Payment Instructions
              </label>
              <textarea
                value={paymentSettings.paymentInstructions}
                onChange={(e) => setPaymentSettings({...paymentSettings, paymentInstructions: e.target.value})}
                rows={3}
                placeholder="Additional payment instructions for students..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={paymentLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              {paymentLoading ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </form>
        </div>

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
        <div className={`transition-all duration-300 rounded-2xl p-6 sm:p-8 border shadow-sm xl:col-span-2 ${
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
