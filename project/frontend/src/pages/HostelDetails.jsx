import { useState, useEffect, useRef, memo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import EnquiryForm from '../components/EnquiryForm'
import HostelMap from '../components/HostelMap'
import NearbyPlacesDisplay from '../components/NearbyPlacesDisplay'
import BookingComponent from '../components/BookingComponent'

const MemoizedEnquiryForm = memo(EnquiryForm)
const MemoizedHostelMap = memo(HostelMap)
const MemoizedNearbyPlacesDisplay = memo(NearbyPlacesDisplay)
const MemoizedBookingComponent = memo(BookingComponent)

const HostelDetails = () => {
  const { slug } = useParams()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  
  const overviewRef = useRef(null)
  const amenitiesRef = useRef(null)
  const locationRef = useRef(null)
  const reviewsRef = useRef(null)

  useEffect(() => {
    fetchHostelDetails()
  }, [slug])

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && hostel?.images?.length > 1 && !isFullscreen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, hostel?.images?.length, isFullscreen])

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'overview', ref: overviewRef },
        { id: 'amenities', ref: amenitiesRef },
        { id: 'location', ref: locationRef },
        { id: 'reviews', ref: reviewsRef }
      ]

      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
          setActiveTab(section.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hostel])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'Escape') setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen])

  const fetchHostelDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await hostelAPI.getBySlug(slug)
      setHostel(response.data)
    } catch (error) {
      console.error('Error fetching hostel details:', error)
      setError('Failed to load hostel details. Please check your connection and try again.')
      setHostel(null)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (hostel?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length)
      setIsAutoPlaying(false)
      setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
    }
  }

  const prevImage = () => {
    if (hostel?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + hostel.images.length) % hostel.images.length)
      setIsAutoPlaying(false)
      setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
    }
  }

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) nextImage()
    if (isRightSwipe) prevImage()
  }

  const openFullscreen = (index) => {
    setCurrentImageIndex(index)
    setIsFullscreen(true)
    setIsAutoPlaying(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-custom border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading hostel details...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Connection Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-y-3">
          <button
            onClick={fetchHostelDetails}
            className="bg-yellow-custom hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors w-full"
          >
            Try Again
          </button>
          <Link to="/hostels" className="block bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            ← Back to Hostels
          </Link>
        </div>
      </div>
    </div>
  )

  if (!hostel && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hostel Not Found</h2>
        <p className="text-gray-600 mb-6">The hostel you are looking for does not exist.</p>
        <Link to="/hostels" className="bg-yellow-custom hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors">
          ← Back to Hostels
        </Link>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'amenities', label: 'Amenities', icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section with Better Slider */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
        {hostel.images && hostel.images.length > 0 ? (
          <>
            {/* Image Container with Touch Support */}
            <div 
              className="relative w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex transition-transform duration-500 ease-in-out h-full"
                   style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                {hostel.images.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    <img
                      src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${image}`}
                      alt={`${hostel.name} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openFullscreen(index)}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Zoom indicator - Hidden on mobile */}
                    <div className="hidden md:block absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>
            
            {hostel.images.length > 1 && (
              <>
                {/* Navigation Buttons - Hidden on mobile */}
                <button
                  onClick={prevImage}
                  className="hidden md:block absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 shadow-lg z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="hidden md:block absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 shadow-lg z-10"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Enhanced Dots Indicator - Hidden on mobile */}
                <div className="hidden md:flex absolute bottom-24 left-1/2 transform -translate-x-1/2 space-x-2 z-10">
                  {hostel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setIsAutoPlaying(false)
                        setTimeout(() => setIsAutoPlaying(true), 10000)
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentImageIndex 
                          ? 'bg-white w-8 h-3' 
                          : 'bg-white/60 hover:bg-white/80 w-3 h-3'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Image Counter - Hidden on mobile */}
                <div className="hidden md:block absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  {currentImageIndex + 1} / {hostel.images.length}
                </div>
                
                {/* Auto-play Control - Hidden on mobile */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="hidden md:block absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 hover:bg-black/70 z-10"
                  aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isAutoPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM11 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-custom via-orange-400 to-red-500 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-2xl font-semibold">No Images Available</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mr-0 sm:mr-4 w-fit ${
                hostel.availability === 'Available' ? 'bg-green-500 text-white' : 
                hostel.availability === 'Limited' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {hostel.availability}
              </span>
              <span className="bg-yellow-custom text-gray-900 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold w-fit">
                {hostel.type || 'PG'} - {hostel.gender || 'Co-ed'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">{hostel.name}</h1>
            <div className="flex items-center text-white text-sm sm:text-lg md:text-xl mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {hostel.mapCoordinates ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hostel.mapCoordinates.lat},${hostel.mapCoordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  {hostel.location}
                </a>
              ) : (
                <span className="truncate">{hostel.location}</span>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex text-yellow-custom mr-2 sm:mr-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${i < Math.floor(hostel.rating || 4.8) ? 'text-yellow-custom' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white text-xs sm:text-sm md:text-lg">({(hostel.rating || 4.8).toFixed(1)}/5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-500 hover:text-yellow-custom transition-colors">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/hostels" className="text-gray-500 hover:text-yellow-custom transition-colors">Hostels</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{hostel.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Enhanced Image Gallery */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Gallery</h3>
                {hostel.images && hostel.images.length > 0 && (
                  <button
                    onClick={() => openFullscreen(0)}
                    className="text-yellow-custom hover:text-yellow-600 font-medium text-xs sm:text-sm flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>View All</span>
                  </button>
                )}
              </div>
              {hostel.images && hostel.images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {hostel.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => openFullscreen(index)}
                      className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                        index === currentImageIndex ? 'border-yellow-custom ring-2 ring-yellow-custom/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${image}`} 
                        alt={`${hostel.name} ${index + 1}`}
                        className="w-full h-16 sm:h-20 md:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      {index === currentImageIndex && (
                        <div className="absolute top-1 right-1 bg-yellow-custom text-gray-900 rounded-full p-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  No images available
                </div>
              )}
            </div>

            {/* Video Tour Section */}
            {hostel.videoTourUrl && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Virtual Tour
                </h3>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={hostel.videoTourUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Hostel Video Tour"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Mobile Pricing Card - Show after gallery on mobile */}
            <div className="xl:hidden">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-4 text-gray-900 text-center">
                  <div className="text-2xl font-bold mb-1">
                    Rs. {Number(hostel.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    <span className="text-base font-normal ml-1">/{hostel.priceType || 'month'}</span>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex text-gray-900">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(hostel.rating || 4.8) ? 'text-gray-900' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-800">({(hostel.rating || 4.8).toFixed(1)})</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {hostel.info && hostel.info.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium text-sm">{item.title}</span>
                      <span className="font-bold text-base text-gray-900">{item.value}</span>
                    </div>
                  ))}
                  {(hostel.availableBeds || hostel.availableRooms) && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-sm">Available Beds</span>
                      <span className="font-bold text-base text-gray-900">{hostel.availableBeds || hostel.availableRooms}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium text-sm">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      hostel.availability === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : hostel.availability === 'Limited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hostel.availability}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Booking Component */}
            <div className="xl:hidden">
              <BookingComponent hostel={hostel} />
            </div>

            {/* Mobile Enquiry Form */}
            <div className="xl:hidden">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-4 text-gray-900">
                  <h3 className="text-lg font-bold mb-1">Send Enquiry</h3>
                  <p className="text-gray-800 text-sm">Get personalized assistance</p>
                </div>
                <div className="p-4">
                  <EnquiryForm 
                    hostelId={hostel._id}
                    hostelName={hostel.name}
                    source="hostel-details"
                    onSuccess={() => {
                      alert('Enquiry sent successfully! We will contact you soon.')
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Tab Navigation */}
            <div className="sticky top-20 z-30 bg-white rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6">
              <nav className="flex border-b border-gray-100 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const ref = tab.id === 'overview' ? overviewRef : 
                                 tab.id === 'amenities' ? amenitiesRef :
                                 tab.id === 'location' ? locationRef : reviewsRef
                      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`flex-1 min-w-0 py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 transition-all duration-300 relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-yellow-600 bg-yellow-50 rounded-xl sm:rounded-2xl'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 '
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-custom rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <div ref={overviewRef} className="space-y-4 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-12">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      About This Hostel
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-yellow-200">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                        {hostel.description || 'Experience comfortable living in this well-maintained hostel facility. Perfect for students and working professionals looking for a safe and convenient accommodation option.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200 text-center">
                      <div className="bg-blue-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Room Types</h4>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {hostel.roomTypes && hostel.roomTypes.length > 0 
                          ? hostel.roomTypes.map(rt => rt.name || rt.type).filter(Boolean).join(', ') 
                          : 'Contact for details'
                        }
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200 text-center">
                      <div className="bg-green-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Capacity</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{hostel.capacity || '50+ Students'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200 text-center">
                      <div className="bg-purple-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Check-in</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{hostel.checkIn || 'Flexible timing'}</p>
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                {hostel.rules && hostel.rules.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Hostel Rules
                    </h3>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                      <ul className="space-y-3">
                        {hostel.rules.map((rule, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="bg-orange-500 p-1 rounded-full mt-1">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-gray-700 font-medium">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div ref={amenitiesRef} className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Available Amenities
                  </h3>
                  {hostel.amenities && hostel.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hostel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                          <div className="bg-green-500 p-2 rounded-full">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-800 font-medium text-lg">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No amenities listed for this hostel.</p>
                    </div>
                  )}
                </div>

                <div ref={locationRef} className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location & Nearby
                  </h3>
                  
                  {/* Interactive Map */}
                  {hostel.mapCoordinates && hostel.mapCoordinates.lat && hostel.mapCoordinates.lng ? (
                    <HostelMap 
                      coordinates={hostel.mapCoordinates}
                      hostelName={hostel.name}
                      address={hostel.contactInfo?.address || hostel.location}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-64 rounded-xl flex items-center justify-center mb-6 border border-blue-200">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-blue-600 font-semibold text-lg">Map not available for this hostel</span>
                      </div>
                    </div>
                  )}
                  {/* Enhanced Nearby Places */}
                  <NearbyPlacesDisplay hostelCoordinates={hostel.mapCoordinates} hostelNearbyPlaces={hostel.nearbyPlaces} />
                </div>

                <div ref={reviewsRef} className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Guest Reviews
                  </h3>
                  <div className="space-y-6">
                    {hostel.reviews && hostel.reviews.length > 0 ? (
                      hostel.reviews.map((review, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-start space-x-4">
                          <div className="bg-yellow-custom text-gray-900 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                            {review.avatar || review.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-bold text-gray-900 text-lg">{review.name}</div>
                                <div className="flex text-yellow-custom">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg">No reviews available yet.</p>
                        <p className="text-gray-400 text-sm mt-2">Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Enhanced Sidebar - Hidden on mobile */}
          <div className="hidden xl:block xl:col-span-1 space-y-6">
            {/* Enhanced Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-6 text-gray-900 text-center">
                <div className="text-4xl font-bold mb-2">
                  Rs. {Number(hostel.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  <span className="text-lg font-normal ml-1">/{hostel.priceType || 'month'}</span>
                </div>
                <div className="flex justify-center mt-3">
                  <div className="flex text-gray-900">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(hostel.rating || 4.8) ? 'text-gray-900' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-800">({(hostel.rating || 4.8).toFixed(1)})</span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {hostel.info && hostel.info.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600 font-medium">{item.title}</span>
                    <span className="font-bold text-lg text-gray-900">{item.value}</span>
                  </div>
                ))}
                {(hostel.availableBeds || hostel.availableRooms) && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Available Beds</span>
                    <span className="font-bold text-lg text-gray-900">{hostel.availableBeds || hostel.availableRooms}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 pt-4 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    hostel.availability === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : hostel.availability === 'Limited'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hostel.availability}
                  </span>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Free consultation available
                  </p>
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Quick response guaranteed
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Enquiry Form */}
            <div className="sticky top-16">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-4 text-gray-900">
                  <h3 className="text-xl font-bold mb-1">Send Enquiry</h3>
                  <p className="text-gray-800 text-sm">Get personalized assistance</p>
                </div>
                <div className="p-4">
                  <EnquiryForm 
                    hostelId={hostel._id}
                    hostelName={hostel.name}
                    source="hostel-details"
                    onSuccess={() => {
                      alert('Enquiry sent successfully! We will contact you soon.')
                    }}
                  />
                </div>
              </div>

              {/* Booking Component */}
              <div className="mt-6">
                <BookingComponent hostel={hostel} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && hostel.images && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-10"
              aria-label="Close fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img
              src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel.images[currentImageIndex]}`}
              alt={`${hostel.name} ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation */}
            {hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {currentImageIndex + 1} of {hostel.images.length} • {hostel.name}
              </span>
            </div>
            
            {/* Thumbnail Strip */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
              {hostel.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all duration-300 ${
                    index === currentImageIndex ? 'border-white' : 'border-white/50 hover:border-white/80'
                  }`}
                >
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HostelDetails