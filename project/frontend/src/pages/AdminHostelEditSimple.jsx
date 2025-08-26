import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

const AdminHostelEdit = () => {
  const { isDark } = useTheme()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [hostel, setHostel] = useState({
    name: '',
    location: '',
    description: '',
    price: '',
    priceType: 'month',
    sessionPrice: '',
    availability: 'Available',
    type: 'PG',
    gender: 'Co-ed',
    amenities: [],
    rules: []
  })

  useEffect(() => {
    if (id && id !== 'new') {
      fetchHostel()
    }
  }, [id])

  const fetchHostel = async () => {
    setLoading(true)
    try {
      const response = await hostelAPI.getById(id)
      setHostel(response.data)
    } catch (error) {
      alert('Failed to fetch hostel details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (id && id !== 'new') {
        await hostelAPI.update(id, hostel)
        alert('Property updated successfully')
      } else {
        await hostelAPI.create(hostel)
        alert('Property created successfully')
      }
      navigate('/admin/hostels')
    } catch (error) {
      alert('Failed to save property')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setHostel(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/hostels')}
          className={`flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Properties</span>
        </button>
        <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {id === 'new' ? 'Add New Property' : 'Edit Property'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
          <h2 className={`text-xl font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Property Name *</label>
              <input
                type="text"
                required
                value={hostel.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Location *</label>
              <input
                type="text"
                required
                value={hostel.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Description *</label>
            <textarea
              required
              rows={4}
              value={hostel.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Pricing Type</label>
              <select
                value={hostel.priceType}
                onChange={(e) => handleChange('priceType', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="month">Per Month</option>
                <option value="session">Per Session</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Price (per {hostel.priceType}) *</label>
              <input
                type="number"
                required
                value={hostel.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{hostel.priceType === 'month' ? 'Session Price' : 'Monthly Price'}</label>
              <input
                type="number"
                value={hostel.sessionPrice}
                onChange={(e) => handleChange('sessionPrice', e.target.value)}
                placeholder={hostel.priceType === 'month' ? 'Price per session' : 'Price per month'}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Availability</label>
              <select
                value={hostel.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Full">Full</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Type</label>
              <select
                value={hostel.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/hostels')}
            className={`px-6 py-2 rounded-lg border transition-colors ${isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : id === 'new' ? 'Create Property' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminHostelEdit