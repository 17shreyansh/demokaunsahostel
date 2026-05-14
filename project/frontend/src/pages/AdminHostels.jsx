import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import { stateManager, invalidateData } from '../utils/stateManager'
import { forceRefresh } from '../utils/cacheManager'

const AdminHostels = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [filteredHostels, setFilteredHostels] = useState([])
  const [searchText, setSearchText] = useState('')

  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchHostels = async (force = false) => {
    try {
      setLoading(true)
      console.log(`Fetching hostels at ${new Date().toISOString()}, force: ${force}`)
      if (force) {
        hostelAPI.clearCache() // Clear cache for forced refresh
        console.log('Cache cleared')
      }
      const response = await hostelAPI.getAll()
      console.log('Fetched hostels count:', response.data?.hostels?.length || response.data?.length || 0)
      console.log('First hostel description:', response.data?.hostels?.[0]?.description || response.data?.[0]?.description)
      setHostels(response.data.hostels || response.data || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
      setHostels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
    return stateManager.subscribe('hostels', () => fetchHostels(true))
  }, [])

  useEffect(() => {
    setFilteredHostels(hostels || [])
  }, [hostels])

  const handleAdd = () => {
    navigate('/admin/hostels/new')
  }

  const handleEdit = (record) => {
    navigate(`/admin/hostels/${record._id}`)
  }

  const handleView = (record) => {
    window.open(`/hostel/${record.slug || record._id}`, '_blank')
  }

  const handleDelete = async (id) => {
    try {
      // Optimistic update
      const originalHostels = hostels
      setHostels(prev => prev.filter(h => h._id !== id))
      setFilteredHostels(prev => prev.filter(h => h._id !== id))
      
      await hostelAPI.delete(id)
      
      // Trigger global refresh
      invalidateData('homepage')
      invalidateData('dashboard')
      alert('Property deleted successfully')
    } catch (error) {
      // Revert on error
      setHostels(originalHostels)
      setFilteredHostels(originalHostels)
      alert('Failed to delete property')
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    if (!value) {
      setFilteredHostels(hostels || [])
    } else {
      const filtered = hostels?.filter(hostel => 
        hostel.name?.toLowerCase().includes(value.toLowerCase()) ||
        hostel.location?.toLowerCase().includes(value.toLowerCase())
      ) || []
      setFilteredHostels(filtered)
    }
  }

  useEffect(() => {
    setFilteredHostels(hostels)
  }, [hostels])



  const stats = {
    total: hostels?.length || 0,
    available: hostels?.filter(h => h.availability === 'Available').length || 0,
    limited: hostels?.filter(h => h.availability === 'Limited').length || 0,
    full: hostels?.filter(h => h.availability === 'Full').length || 0
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>My Properties</h1>
            {lastUpdated && (
              <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                forceRefresh()
                hostelAPI.clearCache()
                fetchHostels(true)
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              } shadow-lg hover:shadow-xl`}
            >
              🔄 Force Refresh
            </button>
            <button 
              onClick={handleAdd}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } shadow-lg hover:shadow-xl`}
            >
              <span className="mr-2">+</span>
              Add New Property
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Properties</p>
            <p className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Available</p>
            <p className="text-2xl font-bold text-green-500">{stats.available}</p>
          </div>
          <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Limited</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.limited}</p>
          </div>
          <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full</p>
            <p className="text-2xl font-bold text-red-500">{stats.full}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search properties by name or location..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full max-w-md px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {(filteredHostels || []).map((hostel) => (
          <div key={hostel._id} className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-lg`}>
            <div className="h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
              {hostel.images?.[0] ? (
                <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${hostel.images[0]}`} 
                  alt={hostel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1 sm:gap-0">
                <h3 className={`font-semibold text-sm sm:text-base transition-colors ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{hostel.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full self-start ${
                  hostel.availability === 'Available' 
                    ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                    : hostel.availability === 'Limited' 
                    ? isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                    : isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {hostel.availability}
                </span>
              </div>
              <p className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 truncate`}>{hostel.location}</p>
              <div className={`text-base sm:text-lg font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
                Rs. {Number(hostel.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/{hostel.priceType || 'month'}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handleEdit(hostel)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="Edit"
                  >
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleView(hostel)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="View"
                  >
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this property?')) {
                        handleDelete(hostel._id)
                      }
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/50`}
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {hostel.rating || '4.5'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!filteredHostels || filteredHostels.length === 0) && !loading && (
        <div className={`text-center py-12 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>No properties found</p>
        </div>
      )}
    </div>
  )
}

export default AdminHostels