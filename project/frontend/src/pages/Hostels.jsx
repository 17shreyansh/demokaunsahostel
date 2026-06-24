import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import HostelCard from '../components/common/HostelCard'
import Select from 'react-select'
import { debounce } from '../utils/performance'
import { motion, AnimatePresence } from 'framer-motion' // Removed for performance

// Memoized components
const MemoizedHostelCard = memo(HostelCard)
const MemoizedSelect = memo(Select)

// Common styles for Select components
const getSelectStyles = () => ({
  control: (base, state) => ({
    ...base,
    borderRadius: '16px',
    border: '2px solid #f3f4f6',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
    borderColor: state.isFocused ? '#3b82f6' : '#f3f4f6',
    padding: '6px',
    background: state.isFocused ? '#ffffff' : '#f9fafb',
    fontSize: '16px',
    fontWeight: '500',
    '&:hover': { borderColor: '#bfdbfe', background: '#ffffff' },
    transition: 'all 0.25s ease',
    cursor: 'pointer'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#374151',
    fontWeight: state.isSelected ? '600' : '500',
    padding: '14px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:active': { backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe' }
  }),
  menu: (base) => ({ ...base, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #f3f4f6', zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  indicatorSeparator: () => ({ display: 'none' })
})

// Reusable Filter Content
const FilterContentBlocks = memo(({ filters, updateFilters, filterOptions, clearFilters, setShowFilters, isDesktop }) => (
  <div className="space-y-6">
    <div className="space-y-5">

      {/* Verified Property */}
      <div>
        <label className="flex items-center justify-between gap-3 cursor-pointer group bg-gradient-to-r from-blue-50/50 to-white p-4 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm sm:text-base font-bold text-gray-800">Verified Properties</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={filters.verified === 'true'}
              onChange={(e) => updateFilters({ verified: e.target.checked ? 'true' : '' })}
            />
            <div className={`w-12 h-7 bg-gray-200 rounded-full transition-colors duration-300 ease-in-out ${filters.verified === 'true' ? 'bg-blue-600' : ''}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${filters.verified === 'true' ? 'transform translate-x-5' : ''}`}></div>
          </div>
        </label>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Property Type</label>
        <MemoizedSelect
          value={filters.type ? { value: filters.type, label: filters.type } : null}
          onChange={(opt) => updateFilters({ type: opt?.value || '' })}
          options={[{ value: '', label: 'All Types' }, { value: 'PG', label: 'PG' }, { value: 'Hostel', label: 'Hostel' }, { value: 'Co-living', label: 'Co-living' }]}
          placeholder="All Types"
          isClearable
          isSearchable={false}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Gender</label>
        <MemoizedSelect
          value={filters.gender ? { value: filters.gender, label: filters.gender === 'Boys' ? 'Boys Only' : filters.gender === 'Girls' ? 'Girls Only' : 'Co-ed' } : null}
          onChange={(opt) => updateFilters({ gender: opt?.value || '' })}
          options={[{ value: '', label: 'All Genders' }, { value: 'Boys', label: 'Boys Only' }, { value: 'Girls', label: 'Girls Only' }, { value: 'Co-ed', label: 'Co-ed' }]}
          placeholder="All Genders"
          isClearable
          isSearchable={false}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Nearby College */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Nearby College</label>
        <MemoizedSelect
          value={filters.nearbyPlace ? { value: filters.nearbyPlace, label: filters.nearbyPlace } : null}
          onChange={(opt) => updateFilters({ nearbyPlace: opt?.value || '' })}
          options={[{ value: '', label: 'All Colleges' }, ...(filterOptions.nearbyPlaces || []).map(place => ({ value: place, label: place }))]}
          placeholder="Select College"
          isClearable
          isSearchable={isDesktop}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">City</label>
        <MemoizedSelect
          value={filters.city ? { value: filters.city, label: filters.city } : null}
          onChange={(opt) => updateFilters({ city: opt?.value || '' })}
          options={[{ value: '', label: 'All Cities' }, ...(filterOptions.cities || []).map(city => ({ value: city, label: city }))]}
          placeholder="All Cities"
          isClearable
          isSearchable={isDesktop}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Food Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Food Type</label>
        <MemoizedSelect
          value={filters.foodType ? { value: filters.foodType, label: filters.foodType } : null}
          onChange={(opt) => updateFilters({ foodType: opt?.value || '' })}
          options={[{ value: '', label: 'All Food Types' }, ...(filterOptions.foodTypes || []).map(food => ({ value: food, label: food }))]}
          placeholder="All Food Types"
          isClearable
          isSearchable={isDesktop}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Availability</label>
        <MemoizedSelect
          value={filters.availability ? { value: filters.availability, label: filters.availability } : null}
          onChange={(opt) => updateFilters({ availability: opt?.value || '' })}
          options={[{ value: '', label: 'Any Availability' }, { value: 'Available', label: 'Available' }, { value: 'Limited', label: 'Limited' }, { value: 'Full', label: 'Full' }]}
          placeholder="Any Availability"
          isClearable
          isSearchable={false}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Amenities Multi-Select Checklist */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Amenities</label>
        <div className="p-3 border-2 border-gray-100/60 rounded-2xl bg-gray-50/50 shadow-inner max-h-64 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(filterOptions.amenities || []).map(amenity => {
              const selectedAmenities = filters.amenities ? filters.amenities.split(',') : []
              const isSelected = selectedAmenities.includes(amenity)
              return (
                <label key={amenity} className={`flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl transition-all border ${isSelected ? 'bg-blue-50/80 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                  <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                      checked={isSelected}
                      onChange={() => {
                        const newAmenities = isSelected ? selectedAmenities.filter(a => a !== amenity) : [...selectedAmenities, amenity]
                        updateFilters({ amenities: newAmenities.length > 0 ? newAmenities.join(',') : '' })
                      }}
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transform scale-50 peer-checked:scale-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium transition-colors truncate ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>{amenity}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">Budget</label>
        <MemoizedSelect
          value={
            (!filters.minPrice && !filters.maxPrice) ? { value: '', label: 'Any Budget' } :
              (filters.minPrice === '0' && filters.maxPrice === '100000') ? { value: '0-100000', label: 'Under ₹1,00,000' } :
                (filters.minPrice === '100000' && filters.maxPrice === '120000') ? { value: '100000-120000', label: '₹1,00,000 - ₹1,20,000' } :
                  (filters.minPrice === '120000' && filters.maxPrice === '140000') ? { value: '120000-140000', label: '₹1,20,000 - ₹1,40,000' } :
                    (filters.minPrice === '140000' && filters.maxPrice === '160000') ? { value: '140000-160000', label: '₹1,40,000 - ₹1,60,000' } :
                      (filters.minPrice === '160000' && filters.maxPrice === '180000') ? { value: '160000-180000', label: '₹1,60,000 - ₹1,80,000' } :
                        (filters.minPrice === '180000' && filters.maxPrice === '200000') ? { value: '180000-200000', label: '₹1,80,000 - ₹2,00,000' } :
                          (filters.minPrice === '200000' && filters.maxPrice === '220000') ? { value: '200000-220000', label: '₹2,00,000 - ₹2,20,000' } :
                            (filters.minPrice === '220000' && filters.maxPrice === '240000') ? { value: '220000-240000', label: '₹2,20,000 - ₹2,40,000' } :
                              (filters.minPrice === '240000' && !filters.maxPrice) ? { value: '240000-', label: 'Above ₹2,40,000' } :
                                { value: 'custom', label: `Custom: ₹${filters.minPrice || 0} - ₹${filters.maxPrice || 'Any'}` }
          }
          onChange={(opt) => {
            if (!opt || !opt.value || opt.value === 'custom') {
              updateFilters({ minPrice: '', maxPrice: '' });
            } else {
              const [min, max] = opt.value.split('-');
              updateFilters({ minPrice: min, maxPrice: max });
            }
          }}
          options={[
            { value: '', label: 'Any Budget' },
            { value: '0-100000', label: 'Under ₹1,00,000' },
            { value: '100000-120000', label: '₹1,00,000 - ₹1,20,000' },
            { value: '120000-140000', label: '₹1,20,000 - ₹1,40,000' },
            { value: '140000-160000', label: '₹1,40,000 - ₹1,60,000' },
            { value: '160000-180000', label: '₹1,60,000 - ₹1,80,000' },
            { value: '180000-200000', label: '₹1,80,000 - ₹2,00,000' },
            { value: '200000-220000', label: '₹2,00,000 - ₹2,20,000' },
            { value: '220000-240000', label: '₹2,20,000 - ₹2,40,000' },
            { value: '240000-', label: 'Above ₹2,40,000' }
          ]}
          placeholder="Any Budget"
          isClearable
          isSearchable={false}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={getSelectStyles()}
        />
      </div>

      {/* Actions */}
      {isDesktop && (
        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center z-10">
          <span className="text-sm text-gray-500 font-medium">
            <span className="text-gray-900 font-bold">{Object.values(filters).filter(v => v && typeof v === 'string' && v !== 'newest').length}</span> filters active
          </span>
          <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-bold tracking-wide transition-colors">
            Reset All
          </button>
        </div>
      )}
    </div>
  </div>
))


const Hostels = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filterOptions, setFilterOptions] = useState({ locations: [], roomTypes: [], amenities: [], nearbyPlaces: [], foodTypes: [] })
  const [showFilters, setShowFilters] = useState(false)
  const searchTimeout = useRef(null)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    gender: searchParams.get('gender') || '',
    type: searchParams.get('type') || '',
    amenities: searchParams.get('amenities') || '',
    availability: searchParams.get('availability') || '',
    nearbyPlace: searchParams.get('nearbyPlace') || '',
    verified: searchParams.get('verified') || '',
    foodType: searchParams.get('foodType') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  })

  // Sync state if URL changes externally (e.g. back button)
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      gender: searchParams.get('gender') || '',
      type: searchParams.get('type') || '',
      amenities: searchParams.get('amenities') || '',
      availability: searchParams.get('availability') || '',
      nearbyPlace: searchParams.get('nearbyPlace') || '',
      verified: searchParams.get('verified') || '',
      foodType: searchParams.get('foodType') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    });
  }, [searchParams]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (showFilters) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-filter-open');
      } else {
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-filter-open');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-filter-open');
      }
    }
  }, [showFilters]);

  // Optimized debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    searchTimeout.current = setTimeout(() => {
      fetchHostels()
    }, 300)

    return () => clearTimeout(searchTimeout.current)
  }, [searchParams])

  // Fetch filter options only once
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await hostelAPI.getFilterOptions()
      setFilterOptions(response.data || { locations: [], roomTypes: [], amenities: [], nearbyPlaces: [], foodTypes: [] })
    } catch (error) {
      console.error('Error fetching filter options:', error)
      setFilterOptions({ locations: [], roomTypes: [], amenities: [], nearbyPlaces: [], foodTypes: [] })
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

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters }

      const params = new URLSearchParams()
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value && value !== '') params.set(key, value)
      })
      setSearchParams(params, { replace: true })

      return updatedFilters
    })
  }, [setSearchParams])

  const clearFilters = () => {
    setFilters({
      search: '', city: '', minPrice: '', maxPrice: '',
      gender: '', type: '', amenities: '', availability: '', nearbyPlace: '', verified: '', foodType: '', sortBy: 'newest'
    })
    setSearchParams({})
  }

  return (
    <>
      <Helmet>
        <title>Find Hostels & PGs in Greater Noida | KaunsaHostel</title>
        <meta name="description" content="Browse our wide selection of verified hostels, PGs, and co-living spaces in Greater Noida. Filter by price, amenities, and location to find your perfect stay." />
        <link rel="canonical" href="https://kaunsahostel.com/hostels" />
        <meta property="og:title" content="Find Hostels & PGs in Greater Noida | KaunsaHostel" />
        <meta property="og:description" content="Browse our wide selection of verified hostels, PGs, and co-living spaces in Greater Noida. Filter by price, amenities, and location." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kaunsahostel.com/hostels" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans animate-in fade-in duration-500">

        {/* Sleek Hero Header */}
        <div className="bg-white border-b border-gray-100 pt-20 pb-12 mb-8">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight animate-in slide-in-from-top-4 fade-in duration-700">
              Find Your Perfect Stay
            </h1>
            <p className="text-gray-500 text-lg animate-in fade-in duration-1000 delay-150 fill-mode-both">
              Explore <span className="font-semibold text-gray-800">{pagination.total}</span> verified spaces
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Desktop Sidebar (Parallax Sticky) */}
            <div className="hidden lg:block w-[340px] flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar pb-6">
              <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                  Filters
                </h2>
                <FilterContentBlocks
                  filters={filters}
                  updateFilters={updateFilters}
                  filterOptions={filterOptions}
                  clearFilters={clearFilters}
                  setShowFilters={setShowFilters}
                  isDesktop={true}
                />
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
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex-shrink-0 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 shadow-md active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                    <span>Filters</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: 'Find Hostels & PGs in Greater Noida',
                            text: 'Check out these verified hostels and PGs on KaunsaHostel!',
                            url: window.location.href,
                          });
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      } catch (error) {
                        console.error('Error sharing:', error);
                      }
                    }}
                    className="flex-shrink-0 aspect-square sm:aspect-auto sm:px-5 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-sm active:scale-95"
                    title="Share this page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <span className="hidden sm:block">Share</span>
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
                    menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                    styles={getSelectStyles()}
                  />
                </div>
              </div>

              {/* Results Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent shadow-sm mb-4"></div>
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

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
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet (Hardware Accelerated CSS) */}
        {showFilters && typeof document !== 'undefined' && createPortal(
          <>
            {/* Backdrop Blur */}
            <div
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
            />

            {/* Bottom Sheet */}
            <div
              className="fixed inset-x-0 bottom-0 z-[110] bg-white rounded-t-[32px] shadow-2xl lg:hidden flex flex-col h-[85dvh] will-change-transform animate-in slide-in-from-bottom-full duration-300 ease-out"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 shrink-0 bg-white rounded-t-[32px]" onClick={() => setShowFilters(false)}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>

              {/* Header (sticky top) */}
              <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 shrink-0">
                <h3 className="text-2xl font-extrabold text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div
                className="px-6 py-4 overflow-y-auto overscroll-contain flex-1 relative custom-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <FilterContentBlocks
                  filters={filters}
                  updateFilters={updateFilters}
                  filterOptions={filterOptions}
                  clearFilters={clearFilters}
                  setShowFilters={setShowFilters}
                  isDesktop={false}
                />
              </div>

              {/* Footer Actions (sticky bottom) */}
              <div className="p-4 border-t border-gray-100/60 shrink-0 bg-white/90 backdrop-blur-md w-full z-20">
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-4 text-sm text-gray-700 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors w-[35%] text-center active:scale-95"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 active:scale-95 flex justify-center items-center gap-2"
                  >
                    <span>Show Results</span>
                    {hostels.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{hostels.length}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </>
  )
}

export default Hostels