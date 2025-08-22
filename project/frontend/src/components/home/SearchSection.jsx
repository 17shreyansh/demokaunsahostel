import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostelAPI } from '../../services/api'

const SearchSection = ({ content }) => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    location: '',
    nearbyPlace: '',
    minPrice: '',
    maxPrice: '',
    gender: ''
  })
  const [dropdownOpen, setDropdownOpen] = useState({
    location: false,
    nearby: false,
    budget: false,
    gender: false
  })
  const [filterOptions, setFilterOptions] = useState({ locations: [], nearbyPlaces: [] })
  const dropdownRef = useRef(null)

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await hostelAPI.getFilterOptions()
        setFilterOptions(response.data)
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    fetchFilterOptions()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen({ location: false, nearby: false, budget: false, gender: false })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const budgets = content?.budgetOptions || [
    { value: { min: '', max: '7000' }, label: 'Budget Friendly (Under ₹7K)' },
    { value: { min: '7000', max: '10000' }, label: 'Affordable (₹7K - ₹10K)' },
    { value: { min: '10000', max: '15000' }, label: 'Premium (₹10K - ₹15K)' },
    { value: { min: '15000', max: '' }, label: 'Luxury (Above ₹15K)' }
  ]

  const genders = content?.genderOptions || [
    { value: 'Boys', label: 'Boys Only' },
    { value: 'Girls', label: 'Girls Only' },
    { value: 'Co-ed', label: 'Co-ed' }
  ]

  const handleFilterChange = (type, value, label) => {
    if (type === 'budget') {
      setFilters(prev => ({ 
        ...prev, 
        minPrice: value.min, 
        maxPrice: value.max,
        budgetLabel: label 
      }))
    } else if (type === 'nearby') {
      setFilters(prev => ({ ...prev, nearbyPlace: value, nearbyLabel: label }))
    } else {
      setFilters(prev => ({ ...prev, [type]: value, [`${type}Label`]: label }))
    }
    setDropdownOpen(prev => ({ ...prev, [type]: false }))
  }

  const toggleDropdown = (type) => {
    setDropdownOpen(prev => ({
      location: false,
      nearby: false,
      budget: false,
      gender: false,
      [type]: !prev[type]
    }))
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (filters.location) searchParams.set('location', filters.location)
    if (filters.nearbyPlace) searchParams.set('nearbyPlace', filters.nearbyPlace)
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice)
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice)
    if (filters.gender) searchParams.set('gender', filters.gender)
    
    navigate(`/hostels?${searchParams.toString()}`)
  }

  const CustomDropdown = ({ type, placeholder, options, value, displayValue }) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(type)}
        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-left focus:ring-2 focus:ring-yellow-custom focus:border-yellow-custom hover:border-gray-300 transition-all duration-300 flex items-center justify-between group"
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
          {displayValue || placeholder}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:text-yellow-custom ${
            dropdownOpen[type] ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {dropdownOpen[type] && (
        <div className="search-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={typeof option.value === 'object' ? JSON.stringify(option.value) : option.value}
                onClick={() => handleFilterChange(type, option.value, option.label)}
                className="w-full px-4 py-3 text-left hover:bg-yellow-50 hover:text-yellow-custom transition-all duration-200 border-b border-gray-50 last:border-b-0 font-medium group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="search-container bg-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-8 p-8 sm:p-12 shadow-2xl border border-gray-100">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {content?.title || 'Search Your Ideal Hostel'}
              </h2>
              <p className="text-gray-600 text-lg font-medium">
                {content?.subtitle || 'Filter by location, budget, amenities, and more to find your perfect stay'}
              </p>
            </div>
          
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-inner p-8 border border-yellow-100">
              <div ref={dropdownRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                <CustomDropdown 
                  type="location" 
                  placeholder="Select Location" 
                  options={filterOptions.locations.map(loc => ({ value: loc, label: loc }))}
                  value={filters.location}
                  displayValue={filters.locationLabel}
                />
                <CustomDropdown 
                  type="nearby" 
                  placeholder="Near College/Office" 
                  options={filterOptions.nearbyPlaces.map(place => ({ value: place, label: place }))}
                  value={filters.nearbyPlace}
                  displayValue={filters.nearbyLabel}
                />
                <CustomDropdown 
                  type="budget" 
                  placeholder="Budget Range" 
                  options={budgets} 
                  value={filters.minPrice || filters.maxPrice}
                  displayValue={filters.budgetLabel}
                />
                <CustomDropdown 
                  type="gender" 
                  placeholder="Gender Preference" 
                  options={genders}
                  value={filters.gender}
                  displayValue={filters.genderLabel}
                />
                <button 
                  onClick={handleSearch}
                  className="search-button bg-gradient-to-r from-yellow-custom to-yellow-400 text-gray-900 font-bold px-6 py-3.5 rounded-xl hover:shadow-2xl hover:shadow-yellow-200 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Hostels
                </button>
              </div>
            </div>
          
            {/* University Logos */}
            <div className="mt-16">
              <p className="text-gray-500 text-sm mb-8 font-medium">Trusted by students from top universities</p>
              <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
                {(content?.universityLogos || [
                  'Galgotias University',
                  'Sharda University', 
                  'Bennett University',
                  'GL Bajaj Institute'
                ]).map((university) => (
                  <div key={university} className="group">
                    <span className="university-badge text-gray-500 font-semibold px-6 py-3 rounded-xl shadow-md border border-gray-100 hover:border-yellow-200 hover:shadow-lg hover:text-yellow-custom transition-all duration-300 group-hover:scale-105">
                      {university}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchSection