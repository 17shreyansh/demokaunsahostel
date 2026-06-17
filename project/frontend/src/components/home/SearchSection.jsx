import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostelAPI } from '../../services/api'

/* -------------------------------------------------------------------------- */
/* EXTRACTED & MEMOIZED MICRO-COMPONENT                                       */
/* -------------------------------------------------------------------------- */
// Extracted to prevent DOM destruction on parent render.
// Wrapped in memo so unaffected dropdowns ignore sibling state changes.
const CustomDropdown = memo(({ type, placeholder, options, value, displayValue, isOpen, onToggle, onSelect }) => {
  const handleOptionClick = (e, optionValue, optionLabel) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Option clicked:', type, optionValue, optionLabel);
    onSelect(type, optionValue, optionLabel);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked:', type, 'isOpen:', isOpen);
    onToggle(type);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full px-2.5 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-3.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-left focus:ring-2 focus:ring-yellow-custom focus:border-yellow-custom hover:border-gray-300 transition-all duration-300 flex items-center justify-between gap-2 group"
      >
        <span className={`${value || displayValue ? 'text-gray-900' : 'text-gray-500'} font-medium text-xs sm:text-sm lg:text-base truncate flex-1`}>
          {displayValue || placeholder}
        </span>
        <svg 
          className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-hover:text-yellow-custom ${
            isOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="search-dropdown absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-48 sm:max-h-60 overflow-y-auto">
            {options.map((option, index) => {
              const itemKey = typeof option.value === 'object' ? option.label : option.value;
              
              return (
                <button
                  type="button"
                  key={itemKey}
                  onClick={(e) => handleOptionClick(e, option.value, option.label)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-yellow-50 hover:text-yellow-custom transition-all duration-200 border-b border-gray-50 last:border-b-0 font-medium group text-xs sm:text-sm lg:text-base"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
});

CustomDropdown.displayName = 'CustomDropdown';


/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const SearchSection = ({ content }) => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    location: '',
    nearbyPlace: '',
    minPrice: '',
    maxPrice: '',
    gender: ''
  });
  
  // Replaced heavy object tracking with a single active pointer
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ locations: [], nearbyPlaces: [] });
  const dropdownRef = useRef(null);

  // Fetch filter options with abort control
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchFilterOptions = async () => {
      try {
        const response = await hostelAPI.getFilterOptions({ signal: abortController.signal });
        setFilterOptions(response.data);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching filter options:', error);
        }
      }
    };
    
    fetchFilterOptions();
    return () => abortController.abort();
  }, []);

  // Optimized click listener: Only attaches when a dropdown is actually open
  useEffect(() => {
    if (!activeDropdown) return; 

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Memoized static arrays to preserve referential equality
  const budgets = useMemo(() => content?.budgetOptions || [
    { value: { min: '', max: '7000' }, label: 'Budget Friendly (Under ₹7K)' },
    { value: { min: '7000', max: '10000' }, label: 'Affordable (₹7K - ₹10K)' },
    { value: { min: '10000', max: '15000' }, label: 'Premium (₹10K - ₹15K)' },
    { value: { min: '15000', max: '' }, label: 'Luxury (Above ₹15K)' }
  ], [content?.budgetOptions]);

  const genders = useMemo(() => content?.genderOptions || [
    { value: 'Boys', label: 'Boys Only' },
    { value: 'Girls', label: 'Girls Only' },
    { value: 'Co-ed', label: 'Co-ed' }
  ], [content?.genderOptions]);

  const universities = useMemo(() => content?.universityLogos || [
    'Galgotias University',
    'Sharda University', 
    'Bennett University',
    'GL Bajaj Institute'
  ], [content?.universityLogos]);

  // Transform dynamic options once per fetch, not per render
  const locationOptions = useMemo(() => 
    filterOptions.locations.map(loc => ({ value: loc, label: loc })), 
  [filterOptions.locations]);
  
  const nearbyPlaceOptions = useMemo(() => 
    filterOptions.nearbyPlaces.map(place => ({ value: place, label: place })), 
  [filterOptions.nearbyPlaces]);

  // Handlers memoized with useCallback to prevent child re-renders
  const handleFilterChange = useCallback((type, value, label) => {
    console.log('Filter change:', type, value, label);
    setFilters(prev => {
      if (type === 'budget') {
        return { ...prev, minPrice: value.min, maxPrice: value.max, budgetLabel: label };
      }
      if (type === 'nearby') {
        return { ...prev, nearbyPlace: value, nearbyLabel: label };
      }
      if (type === 'gender') {
        return { ...prev, gender: value, genderLabel: label };
      }
      if (type === 'location') {
        return { ...prev, location: value, locationLabel: label };
      }
      return { ...prev, [type]: value, [`${type}Label`]: label };
    });
    setActiveDropdown(null);
  }, []);

  const toggleDropdown = useCallback((type) => {
    console.log('Toggle dropdown:', type);
    setActiveDropdown(prev => {
      const newState = prev === type ? null : type;
      console.log('New dropdown state:', newState);
      return newState;
    });
  }, []);

  const handleSearch = useCallback(() => {
    const searchParams = new URLSearchParams();
    if (filters.location) searchParams.set('location', filters.location);
    if (filters.nearbyPlace) searchParams.set('nearbyPlace', filters.nearbyPlace);
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice);
    if (filters.gender) searchParams.set('gender', filters.gender);
    
    const queryString = searchParams.toString();
    navigate(queryString ? `/hostels?${queryString}` : '/hostels');
  }, [filters, navigate]);

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="search-container bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl mx-1 sm:mx-2 lg:mx-4 xl:mx-8 my-4 sm:my-6 lg:my-8 p-3 sm:p-6 lg:p-8 xl:p-12 shadow-xl sm:shadow-2xl border border-gray-100">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                {content?.title || 'Search Your Ideal Hostel'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium px-2 sm:px-4">
                {content?.subtitle || 'Filter by location, budget, amenities, and more to find your perfect stay'}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-inner p-3 sm:p-4 lg:p-6 xl:p-8 border border-yellow-100">
              <div ref={dropdownRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                <CustomDropdown 
                  type="location" 
                  placeholder="Select Location" 
                  options={locationOptions}
                  value={filters.location}
                  displayValue={filters.locationLabel}
                  isOpen={activeDropdown === 'location'}
                  onToggle={toggleDropdown}
                  onSelect={handleFilterChange}
                />
                <CustomDropdown 
                  type="nearby" 
                  placeholder="Near College/Office" 
                  options={nearbyPlaceOptions}
                  value={filters.nearbyPlace}
                  displayValue={filters.nearbyLabel}
                  isOpen={activeDropdown === 'nearby'}
                  onToggle={toggleDropdown}
                  onSelect={handleFilterChange}
                />
                <CustomDropdown 
                  type="budget" 
                  placeholder="Budget Range" 
                  options={budgets} 
                  value={filters.minPrice || filters.maxPrice}
                  displayValue={filters.budgetLabel}
                  isOpen={activeDropdown === 'budget'}
                  onToggle={toggleDropdown}
                  onSelect={handleFilterChange}
                />
                <CustomDropdown 
                  type="gender" 
                  placeholder="Gender Preference" 
                  options={genders}
                  value={filters.gender}
                  displayValue={filters.genderLabel}
                  isOpen={activeDropdown === 'gender'}
                  onToggle={toggleDropdown}
                  onSelect={handleFilterChange}
                />
                <button 
                  onClick={handleSearch}
                  type="button"
                  className="search-button bg-gradient-to-r from-yellow-custom to-yellow-400 text-gray-900 font-bold px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl hover:shadow-xl sm:hover:shadow-2xl hover:shadow-yellow-200 transform hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group sm:col-span-2 lg:col-span-1"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm sm:text-base">Search</span>
                </button>
              </div>
            </div>
            
            {/* University Logos */}
            <div className="mt-6 sm:mt-8 lg:mt-12 xl:mt-16">
              <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 lg:mb-6 xl:mb-8 font-medium">Trusted by students from top universities</p>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                {universities.map((university) => (
                  <div key={university} className="group">
                    <span className="university-badge text-gray-500 font-semibold px-2 sm:px-3 lg:px-4 xl:px-6 py-1.5 sm:py-2 lg:py-2.5 xl:py-3 rounded-md sm:rounded-lg lg:rounded-xl shadow-sm sm:shadow-md border border-gray-100 hover:border-yellow-200 hover:shadow-lg hover:text-yellow-custom transition-all duration-300 group-hover:scale-105 text-xs sm:text-sm inline-block">
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
  );
};

export default SearchSection;