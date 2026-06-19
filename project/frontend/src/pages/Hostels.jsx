import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import HostelCard from '../components/common/HostelCard'
import Select from 'react-select'
import { debounce } from '../utils/performance'
import { motion, AnimatePresence } from 'framer-motion'

// Memoized components
const MemoizedHostelCard = memo(HostelCard)
const MemoizedSelect = memo(Select)

// Custom styles for slider and sleek scrollbars
const customStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #F59E0B;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: transform 0.1s ease;
  }
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
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
  
  /* Hide scrollbar for premium sticky sidebar look */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

const Hostels = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  // Optimized debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)

    const timeout = setTimeout(() => {
      fetchHostels()
    }, 300)

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
      setFilterOptions(response.data || { locations: [], roomTypes: [], amenities: [], nearbyPlaces: [] })
    } catch (error) {
      console.error('Error fetching filter options:', error)
      setFilterOptions({ locations: [], roomTypes: [], amenities: [], nearbyPlaces: [] })
    }
  }, [])

  const fetchHostels = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        ...Object.fromEntries(searchParams),
        page
      }
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value && value !== '')
      )

      const response = await hostelAPI.search(cleanParams)
      setHostels(response.data.hostels || [])
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Error fetching hostels:', error)
      setError('Failed to load hostels. Please check your connection and try again.')
      setHostels([])
      setPagination({ current: 1, pages: 1, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const debouncedUpdateFilters = useMemo(
    () => debounce((newFilters) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)

      const params = new URLSearchParams()
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value && value !== '') params.set(key, value)
      })
      setSearchParams(params)
    }, 300),
    [filters, setSearchParams]
  )

  const updateFilters = useCallback((newFilters) => {
    debouncedUpdateFilters(newFilters)
  }, [debouncedUpdateFilters])

  const clearFilters = () => {
    setFilters({
      search: '', location: '', minPrice: '', maxPrice: '',
      gender: '', type: '', amenities: '', availability: '', nearbyPlace: '', sortBy: 'newest'
    })
    setSearchParams({})
  }

  // Common styles for Select components
  const getSelectStyles = () => ({
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : 'none',
      borderColor: state.isFocused ? '#f59e0b' : '#e5e7eb',
      padding: '4px',
      background: '#ffffff',
      '&:hover': { borderColor: '#fbbf24' },
      transition: 'all 0.2s ease'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
      color: state.isSelected ? '#1f2937' : '#374151',
      fontWeight: state.isSelected ? '600' : '500',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    }),
    menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', zIndex: 9999 }),
    menuPortal: (base) => ({ ...base, zIndex: 99999 })
  })

  // Reusable Filter Content (Search removed from here)
  const FilterContentBlocks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 lg:hidden">
        <h3 className="text-xl font-bold text-gray-900">Refine Search</h3>
        <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="space-y-5">

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
          <MemoizedSelect
            value={filters.location ? { value: filters.location, label: filters.location } : null}
            onChange={(opt) => updateFilters({ location: opt?.value || '' })}
            options={[{ value: '', label: 'All Locations' }, ...filterOptions.locations.map(loc => ({ value: loc, label: loc }))]}
            placeholder="All Locations"
            isClearable
            menuPortalTarget={document.body}
            styles={getSelectStyles()}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
          <MemoizedSelect
            value={filters.gender ? { value: filters.gender, label: filters.gender === 'Boys' ? 'Boys Only' : filters.gender === 'Girls' ? 'Girls Only' : 'Co-ed' } : null}
            onChange={(opt) => updateFilters({ gender: opt?.value || '' })}
            options={[{ value: '', label: 'All Genders' }, { value: 'Boys', label: 'Boys Only' }, { value: 'Girls', label: 'Girls Only' }, { value: 'Co-ed', label: 'Co-ed' }]}
            placeholder="All Genders"
            isClearable
            menuPortalTarget={document.body}
            styles={getSelectStyles()}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Hostel Type</label>
          <MemoizedSelect
            value={filters.type ? { value: filters.type, label: filters.type } : null}
            onChange={(opt) => updateFilters({ type: opt?.value || '' })}
            options={[{ value: '', label: 'All Types' }, { value: 'PG', label: 'PG' }, { value: 'Hostel', label: 'Hostel' }, { value: 'Apartment', label: 'Apartment' }]}
            placeholder="All Types"
            isClearable
            menuPortalTarget={document.body}
            styles={getSelectStyles()}
          />
        </div>

        {/* Nearby Place */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Near To</label>
          <MemoizedSelect
            value={filters.nearbyPlace ? { value: filters.nearbyPlace, label: filters.nearbyPlace } : null}
            onChange={(opt) => updateFilters({ nearbyPlace: opt?.value || '' })}
            options={[{ value: '', label: 'All Places' }, ...filterOptions.nearbyPlaces.map(place => ({ value: place, label: place }))]}
            placeholder="Select Place"
            isClearable
            isSearchable
            menuPortalTarget={document.body}
            styles={getSelectStyles()}
          />
        </div>

        {/* Amenities Multi-Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">Amenities</label>
          <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-100 rounded-xl bg-gray-50 shadow-inner">
            {filterOptions.amenities.map(amenity => {
              const selectedAmenities = filters.amenities ? filters.amenities.split(',') : []
              const isSelected = selectedAmenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  onClick={() => {
                    const newAmenities = isSelected ? selectedAmenities.filter(a => a !== amenity) : [...selectedAmenities, amenity]
                    updateFilters({ amenities: newAmenities.length > 0 ? newAmenities.join(',') : '' })
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${isSelected
                    ? 'bg-yellow-400 text-gray-900 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                >
                  {amenity}
                </button>
              )
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-4">Price Range <span className="text-gray-400 font-normal text-xs">(per month)</span></label>
          <div className="bg-gray-50 p-5 border border-gray-100 rounded-xl">
            <div className="space-y-5">
              <div>
                <label className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                  <span>Minimum</span>
                  <span className="font-bold text-gray-900">
                    ₹{parseInt(filters.minPrice || 0).toLocaleString('en-IN')}
                  </span>
                </label>
                <input
                  type="range" min="0" max="300000" step="1000"
                  value={filters.minPrice || 0}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                  <span>Maximum</span>
                  <span className="font-bold text-gray-900">
                    ₹{parseInt(filters.maxPrice || 300000).toLocaleString('en-IN')}
                  </span>
                </label>
                <input
                  type="range" min="0" max="300000" step="1000"
                  value={filters.maxPrice || 300000}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white pb-2 lg:static lg:bg-transparent lg:pb-0 z-10">
          <span className="text-sm text-gray-500 font-medium">
            <span className="text-gray-900 font-bold">{Object.values(filters).filter(v => v && v !== 'newest').length}</span> filters active
          </span>
          <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-bold tracking-wide transition-colors">
            Reset All
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans">
      <style>{customStyles}</style>

      {/* Sleek Hero Header */}
      <div className="bg-white border-b border-gray-100 pt-20 pb-12 mb-8">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Find Your Perfect Stay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            Explore <span className="font-semibold text-gray-800">{pagination.total}</span> verified spaces
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Desktop Sidebar (Parallax Sticky) */}
          <div className="hidden lg:block w-[340px] flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar pb-6">
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                Refine Search
              </h2>
              <FilterContentBlocks />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-full">

            {/* Top Control Bar (Search & Sort) */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 z-10 relative flex flex-col md:flex-row gap-4">

              {/* Search Bar & Mobile Filter Row */}
              <div className="flex-1 flex gap-3 items-center">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search colleges, hostels, locations ..."
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-custom/20 focus:border-yellow-custom text-sm font-medium transition-all"
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                  />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex-shrink-0 aspect-square sm:aspect-auto sm:px-5 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 shadow-md active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                  <span className="hidden sm:block">Filters</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="w-full md:w-56 flex-shrink-0">
                <MemoizedSelect
                  value={{ value: filters.sortBy, label: filters.sortBy === 'newest' ? 'Newest First' : filters.sortBy === 'price_low' ? 'Price: Low to High' : filters.sortBy === 'price_high' ? 'Price: High to Low' : 'Highest Rated' }}
                  onChange={(opt) => updateFilters({ sortBy: opt?.value })}
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' }
                  ]}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  styles={getSelectStyles()}
                />
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-yellow-400 border-t-transparent shadow-sm mb-4"></div>
                <p className="text-gray-500 font-medium">Curating your spaces...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-100">
                <div className="text-5xl mb-4">⚠️</div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">Network Issue</h4>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                  onClick={() => fetchHostels()}
                  className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

                <div className="flex justify-between items-center mb-6 px-2 lg:hidden">
                  <p className="text-gray-500 text-sm font-medium">
                    Found <span className="text-gray-900 font-bold">{hostels.length}</span> results
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hostels.map((hostel) => (
                    <MemoizedHostelCard
                      key={hostel._id}
                      hostel={{
                        ...hostel,
                        image: hostel.images?.[0] ? `${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel.images[0]}` : null
                      }}
                      variant="compact"
                    />
                  ))}
                </div>

                {hostels.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 mt-2">
                    <div className="text-6xl mb-6">🔍</div>
                    <h4 className="text-2xl font-bold mb-3 text-gray-900">No matches found</h4>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">We couldn't find any properties matching your exact criteria. Try broadening your search.</p>
                    <button
                      onClick={clearFilters}
                      className="bg-yellow-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-yellow-500 hover:shadow-lg transition-all active:scale-95"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12 mb-8">
                    <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => {
                            fetchHostels(i + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm transition-all ${pagination.current === i + 1
                            ? 'bg-gray-900 text-white font-bold shadow-md'
                            : 'bg-transparent text-gray-600 hover:bg-gray-100 font-semibold'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet (Framer Motion) */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] lg:hidden"
            />

            {/* Draggable Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 150 || velocity.y > 500) {
                  setShowFilters(false)
                }
              }}
              className="fixed inset-x-0 bottom-0 z-[110] bg-white rounded-t-[32px] shadow-2xl lg:hidden flex flex-col h-[85vh]"
            >
              {/* Drag Handle Indicator */}
              <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing shrink-0">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Scrollable Filter Area */}
              <div className="px-6 pb-6 overflow-y-auto overscroll-contain flex-1 relative">
                <FilterContentBlocks />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Hostels