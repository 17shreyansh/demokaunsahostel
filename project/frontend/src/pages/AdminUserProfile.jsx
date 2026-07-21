import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { userAPI, hostelAPI } from '../services/api'
import { 
  ArrowLeft, Edit2, Check, X, User, Phone, Mail, 
  Calendar, BookOpen, CreditCard, Loader2, AlertCircle, Save, Shield, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminUserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    dob: '',
    aadhar: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getById(id)
      setUser(response.data.user)
      setReviews(response.data.reviews || [])
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        college: response.data.user.college || '',
        dob: response.data.user.dob ? new Date(response.data.user.dob).toISOString().split('T')[0] : '',
        aadhar: response.data.user.aadhar || ''
      })
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError('Failed to load user profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await userAPI.update(id, formData)
      setIsEditing(false)
      fetchUserData() // refresh data
    } catch (err) {
      console.error('Failed to update user:', err)
      alert('Failed to update user details')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading profile data...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl flex flex-col items-center shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle size={40} className="mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Unable to load profile</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || 'User not found'}</p>
          <button 
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            Return to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto bg-gray-50/50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Users
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            User Profile
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage user details, access, and activity.</p>
        </div>
        
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.button 
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium text-sm transition-all flex items-center shadow-sm"
            >
              <Edit2 size={16} className="mr-2 text-gray-500" /> Edit Profile
            </motion.button>
          ) : (
            <motion.div 
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 w-full sm:w-auto"
            >
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    college: user.college || '',
                    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                    aadhar: user.aadhar || ''
                  })
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 font-medium text-sm transition-all flex items-center justify-center shadow-sm"
              >
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Save Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Core Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-2xl font-medium text-gray-600 mb-4">
                {formData.name?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}
              </div>
              
              <div className="w-full text-center">
                {isEditing ? (
                  <div className="space-y-3 text-left">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h2>
                    <p className="text-xs font-medium text-gray-500 flex items-center justify-center gap-1.5">
                      <Shield size={14} className={user.role === 'admin' ? 'text-blue-500' : 'text-gray-400'} /> 
                      {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500 flex items-center mb-1"><Mail size={14} className="mr-1.5" /> Email Address</span>
                <span className="text-gray-900 text-sm">{user.email}</span>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500 flex items-center mb-1"><Phone size={14} className="mr-1.5" /> Phone Number</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                  />
                ) : (
                  <span className="text-gray-900 text-sm">{user.phone || '—'}</span>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>Account Created</span>
              <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Extended Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Extended Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              Personal & Academic Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* College */}
              <div>
                <label className="flex items-center text-xs font-medium text-gray-500 mb-2">
                  <BookOpen size={14} className="mr-1.5" /> College / Institute
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder="Enter College Name"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 transition-all outline-none"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {user.college || <span className="text-gray-400 italic">—</span>}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center text-xs font-medium text-gray-500 mb-2">
                  <Calendar size={14} className="mr-1.5" /> Date of Birth
                </label>
                {isEditing ? (
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 transition-all outline-none"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {user.dob ? new Date(user.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : <span className="text-gray-400 italic">—</span>}
                  </div>
                )}
              </div>

              {/* Aadhar */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-medium text-gray-500 mb-2">
                  <CreditCard size={14} className="mr-1.5" /> Government ID (Aadhar)
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhar Number"
                    maxLength={12}
                    className="w-full max-w-sm px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-mono transition-all outline-none"
                  />
                ) : (
                  <div className="text-sm text-gray-900 font-mono">
                    {user.aadhar ? user.aadhar.replace(/(\d{4})/g, '$1 ').trim() : <span className="text-gray-400 font-sans italic">—</span>}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Activity / Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-gray-400" />
                Platform Reviews
              </div>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                {reviews.length} Total
              </span>
            </h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No reviews submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={review._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/hostel/${review.hostel?.slug}`} className="font-medium text-blue-600 hover:underline text-sm">
                        {review.hostel?.name || 'Unknown Property'}
                      </Link>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        {review.rating} <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">"{review.comment}"</p>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminUserProfile
