import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import HostelCard from '../components/common/HostelCard'
import Select from 'react-select'

// Custom slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #F59E0B;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #F59E0B;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
`

const Hostels = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filterOptions, setFilterOptions] = useState({ locations: [], roomTypes: [], amenities: [], nearbyPlaces: [] })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    gender: searchParams.get('gender') || '',
    type: searchParams.get('type') || '',
    amenities: searchParams.get('amenities') || '',
    availability: searchParams.get('availability') || '',
    nearbyPlace: searchParams.get('nearbyPlace') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  })

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
    
    const timeout = setTimeout(() => {
      fetchHostels()
    }, 500) // 500ms debounce
    
    setSearchTimeout(timeout)
    
    return () => clearTimeout(timeout)
  }, [searchParams])
  
  // Fetch filter options only once
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await hostelAPI.getFilterOptions()
      setFilterOptions(response.data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }, [])

  const fetchHostels = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        ...Object.fromEntries(searchParams),
        page
      }
      // Only send non-empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value && value !== '')
      )
      
      const response = await hostelAPI.search(cleanParams)
      setHostels(response.data.hostels)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') params.set(key, value)
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const clearFilters = () => {
    setFilters({
      search: '', location: '', minPrice: '', maxPrice: '',
      gender: '', type: '', amenities: '', availability: '', nearbyPlace: '', sortBy: 'newest'
    })
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{sliderStyles}</style>
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Hostel</h1>
          <p className="text-gray-600 text-lg">Discover {pagination.total} verified hostels in Greater Noida</p>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 relative" style={{zIndex: 10}}>
          {/* Main Search Bar */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search hostels by name, location, or nearby colleges..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-custom focus:border-transparent text-lg"
                  value={filters.search}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value !== filters.search) {
                      updateFilters({ search: value })
                    }
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    showFilters ? 'bg-yellow-custom text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Filters
                </button>
                <div className="w-full sm:w-auto min-w-[200px]">
                  <Select
                    value={{ value: filters.sortBy, label: filters.sortBy === 'newest' ? 'Newest First' : filters.sortBy === 'price_low' ? 'Price: Low to High' : filters.sortBy === 'price_high' ? 'Price: High to Low' : 'Highest Rated' }}
                    onChange={(option) => {
                      if (option.value !== filters.sortBy) {
                        updateFilters({ sortBy: option.value })
                      }
                    }}
                    options={[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'price_low', label: 'Price: Low to High' },
                      { value: 'price_high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Highest Rated' }
                    ]}
                    isSearchable={false}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '8px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', zIndex: 9999 }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 })
                    }}
                    menuPortalTarget={document.body}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-t border-gray-100" style={{position: 'relative', zIndex: 1}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Select
                    value={filters.location ? { value: filters.location, label: filters.location } : null}
                    onChange={(option) => {
                      const value = option?.value || ''
                      if (value !== filters.location) {
                        updateFilters({ location: value })
                      }
                    }}
                    options={[{ value: '', label: 'All Locations' }, ...filterOptions.locations.map(loc => ({ value: loc, label: loc }))]}
                    placeholder="All Locations"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '4px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' })
                    }}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <Select
                    value={filters.gender ? { value: filters.gender, label: filters.gender === 'Boys' ? 'Boys Only' : filters.gender === 'Girls' ? 'Girls Only' : 'Co-ed' } : null}
                    onChange={(option) => {
                      const value = option?.value || ''
                      if (value !== filters.gender) {
                        updateFilters({ gender: value })
                      }
                    }}
                    options={[
                      { value: '', label: 'All Genders' },
                      { value: 'Boys', label: 'Boys Only' },
                      { value: 'Girls', label: 'Girls Only' },
                      { value: 'Co-ed', label: 'Co-ed' }
                    ]}
                    placeholder="All Genders"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '4px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' })
                    }}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Type</label>
                  <Select
                    value={filters.type ? { value: filters.type, label: filters.type } : null}
                    onChange={(option) => {
                      const value = option?.value || ''
                      if (value !== filters.type) {
                        updateFilters({ type: value })
                      }
                    }}
                    options={[
                      { value: '', label: 'All Types' },
                      { value: 'PG', label: 'PG' },
                      { value: 'Hostel', label: 'Hostel' },
                      { value: 'Apartment', label: 'Apartment' }
                    ]}
                    placeholder="All Types"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '4px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' })
                    }}
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <Select
                    value={filters.availability ? { value: filters.availability, label: filters.availability } : null}
                    onChange={(option) => {
                      const value = option?.value || ''
                      if (value !== filters.availability) {
                        updateFilters({ availability: value })
                      }
                    }}
                    options={[
                      { value: '', label: 'All Availability' },
                      { value: 'Available', label: 'Available' },
                      { value: 'Limited', label: 'Limited' },
                      { value: 'Full', label: 'Full' }
                    ]}
                    placeholder="All Availability"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '4px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' })
                    }}
                  />
                </div>

                {/* Nearby Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Near To</label>
                  <Select
                    value={filters.nearbyPlace ? { value: filters.nearbyPlace, label: filters.nearbyPlace } : null}
                    onChange={(option) => {
                      const value = option?.value || ''
                      if (value !== filters.nearbyPlace) {
                        updateFilters({ nearbyPlace: value })
                      }
                    }}
                    options={[
                      { value: '', label: 'All Places' },
                      ...filterOptions.nearbyPlaces.map(place => ({ value: place, label: place }))
                    ]}
                    placeholder="Select Place"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '12px',
                        border: '2px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                        padding: '4px',
                        background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                        '&:hover': { borderColor: '#fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
                        color: state.isSelected ? '#1f2937' : '#374151',
                        fontWeight: state.isSelected ? '600' : '500',
                        padding: '12px 16px'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' })
                    }}
                  />
                </div>
              </div>

              {/* Amenities Multi-Select */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Amenities (Select Multiple)</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 border-2 border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-inner">
                  {filterOptions.amenities.map(amenity => {
                    const selectedAmenities = filters.amenities ? filters.amenities.split(',') : []
                    const isSelected = selectedAmenities.includes(amenity)
                    return (
                      <button
                        key={amenity}
                        onClick={() => {
                          let newAmenities
                          if (isSelected) {
                            newAmenities = selectedAmenities.filter(a => a !== amenity)
                          } else {
                            newAmenities = [...selectedAmenities, amenity]
                          }
                          const amenitiesString = newAmenities.length > 0 ? newAmenities.join(',') : ''
                          updateFilters({ amenities: amenitiesString })
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                          isSelected
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg border-2 border-yellow-600'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 shadow-md'
                        }`}
                      >
                        {amenity}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">Price Range (Rs.)</label>
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 border-2 border-gray-300 rounded-xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Minimum Price</label>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={filters.minPrice || 0}
                        onChange={(e) => updateFilters({ minPrice: e.target.value })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center mt-2 text-lg font-bold text-yellow-600">Rs. {filters.minPrice || 0}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Maximum Price</label>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={filters.maxPrice || 50000}
                        onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center mt-2 text-lg font-bold text-yellow-600">Rs. {filters.maxPrice || 50000}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-yellow-custom/30 focus:border-yellow-custom bg-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                        value={filters.minPrice}
                        onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="50000"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-yellow-custom/30 focus:border-yellow-custom bg-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {Object.values(filters).filter(v => v && v !== 'newest').length} filters applied
                </div>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-custom border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Searching hostels...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {hostels.length} of {pagination.total} hostels
                {filters.nearbyPlace && ` near ${filters.nearbyPlace}`}
              </p>
              <p className="text-sm text-gray-500">
                Page {pagination.current} of {pagination.pages}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {hostels.map((hostel) => (
                <HostelCard 
                  key={hostel._id} 
                  hostel={{
                  ...hostel,
                  image: hostel.images?.[0] ? `${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel.images[0]}` : null
                }} 
                  variant="compact" 
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => fetchHostels(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pagination.current === i + 1
                          ? 'bg-yellow-custom text-gray-900 font-semibold'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {hostels.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-2xl font-semibold mb-2">No hostels found</h4>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-yellow-custom text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hostels