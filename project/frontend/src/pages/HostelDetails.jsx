import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { hostelAPI } from '../services/api'
import EnquiryForm from '../components/EnquiryForm'
import HostelMap from '../components/HostelMap'
import NearbyPlacesDisplay from '../components/NearbyPlacesDisplay'
import BookingComponent from '../components/BookingComponent'
import ReviewSection from '../components/ReviewSection'
import { motion, AnimatePresence } from 'framer-motion'

const MemoizedEnquiryForm = memo(EnquiryForm)
const MemoizedHostelMap = memo(HostelMap)
const MemoizedNearbyPlacesDisplay = memo(NearbyPlacesDisplay)
const MemoizedBookingComponent = memo(BookingComponent)
const MemoizedReviewSection = memo(ReviewSection)

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS (Prevents Memory Reallocation)                               */
/* -------------------------------------------------------------------------- */
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || '';
const STARS = [0, 1, 2, 3, 4];
const TABS = [
  { id: 'overview', label: 'Overview', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'amenities', label: 'Amenities', icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
];

const HostelDetails = () => {
  const { slug } = useParams()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  const [selectedSharing, setSelectedSharing] = useState(null)
  
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)
  
  const overviewRef = useRef(null)
  const amenitiesRef = useRef(null)
  const locationRef = useRef(null)
  const reviewsRef = useRef(null)
  const activeTabRef = useRef(activeTab)

  // Keep ref in sync without triggering effects
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  // Set default selected sharing to lowest price option
  useEffect(() => {
    if (hostel?.sharingTypes?.length > 0 && !selectedSharing) {
      const lowest = hostel.sharingTypes.reduce((a, b) => a.price < b.price ? a : b)
      setSelectedSharing(lowest)
    }
  }, [hostel])

  const fetchHostelDetails = useCallback(async (abortController) => {
    setLoading(true)
    setError(null)
    try {
      const response = await hostelAPI.getBySlug(slug, { signal: abortController?.signal })
      if (!abortController?.signal.aborted) {
        setHostel(response.data)
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Error fetching hostel details:', error)
        setError('Failed to load hostel details. Please check your connection and try again.')
        setHostel(null)
      }
    } finally {
      if (!abortController?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [slug]);

  useEffect(() => {
    const abortController = new AbortController()
    fetchHostelDetails(abortController)
    return () => abortController.abort()
  }, [fetchHostelDetails])

  useEffect(() => {
    if (isAutoPlaying && hostel?.images?.length > 1 && !isFullscreen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, hostel?.images?.length, isFullscreen])

  // Extremely Optimized Hardware-Accelerated Scroll Listener
  useEffect(() => {
    if (!hostel) return;
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 200
          const sections = [
            { id: 'overview', ref: overviewRef },
            { id: 'amenities', ref: amenitiesRef },
            { id: 'location', ref: locationRef },
            { id: 'reviews', ref: reviewsRef }
          ]

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i]
            if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
              if (activeTabRef.current !== section.id) {
                setActiveTab(section.id) // Only update if changed (prevents lag)
              }
              break
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hostel])

  const nextImage = useCallback(() => {
    if (hostel?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length)
      setIsAutoPlaying(false)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }
  }, [hostel?.images?.length])

  const prevImage = useCallback(() => {
    if (hostel?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + hostel.images.length) % hostel.images.length)
      setIsAutoPlaying(false)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }
  }, [hostel?.images?.length])

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, nextImage, prevImage])

  const handleTouchStart = useCallback((e) => {
    touchEndRef.current = null
    touchStartRef.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEndRef.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return
    const distance = touchStartRef.current - touchEndRef.current
    
    if (distance > 50) nextImage()
    if (distance < -50) prevImage()
  }, [nextImage, prevImage])

  const openFullscreen = useCallback((index) => {
    setCurrentImageIndex(index)
    setIsFullscreen(true)
    setIsAutoPlaying(false)
  }, [])

  const handleThumbnailClick = useCallback((index) => {
    setCurrentImageIndex(index)
    setIsAutoPlaying(false)
  }, [])

  const handleEnquirySuccess = useCallback(() => {
    alert('Enquiry sent successfully! We will contact you soon.')
  }, [])

  const handleRetryFetch = useCallback(() => {
    fetchHostelDetails(new AbortController())
  }, [fetchHostelDetails])

  const formattedPrice = useMemo(() => 
    Number(hostel?.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), 
  [hostel?.price])

  const parsedVideoUrl = useMemo(() => {
    if (!hostel?.videoTourUrl) return null;
    return hostel.videoTourUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  }, [hostel?.videoTourUrl])

  const slicedInfo = useMemo(() => 
    hostel?.info ? hostel.info.slice(0, 3) : [], 
  [hostel?.info])


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-custom border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading hostel details...</p>
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
            onClick={handleRetryFetch}
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-gray-50 pb-12"
    >
      
      {/* 1. Big Preview Image Section (Now Padded & Rounded) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transform-gpu">
          {hostel.images && hostel.images.length > 0 ? (
            <div 
              className="relative w-full h-full group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  src={`${UPLOADS_BASE_URL}/${hostel.images[currentImageIndex]}`}
                  alt={`${hostel.name} Preview`}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer will-change-transform"
                  onClick={() => openFullscreen(currentImageIndex)}
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                />
              </AnimatePresence>
              
              {hostel.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="hidden md:flex absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/70 text-white p-3.5 rounded-full transition-all duration-300 shadow-xl z-10 items-center justify-center hover:scale-105"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="hidden md:flex absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/70 text-white p-3.5 rounded-full transition-all duration-300 shadow-xl z-10 items-center justify-center hover:scale-105"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-custom via-orange-400 to-red-500 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-16 h-16 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-2xl font-bold tracking-wide">No Images Available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Small Thumbnails (Also aligned with the padded container) */}
      {hostel.images && hostel.images.length > 1 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mt-4">
          <div className="flex gap-3 overflow-x-auto snap-x hide-scrollbar pb-2">
            {hostel.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 snap-start w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'ring-2 ring-yellow-custom scale-105 transform-gpu shadow-md opacity-100' 
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={`${UPLOADS_BASE_URL}/${image}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="hidden md:block mt-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="flex text-sm font-medium">
            <Link to="/" className="text-gray-500 hover:text-yellow-600 transition-colors">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/hostels" className="text-gray-500 hover:text-yellow-600 transition-colors">Hostels</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{hostel.name}</span>
          </nav>
        </div>
      </div>

      {/* Structured Header Information */}
      <div className="bg-white border-y shadow-sm mt-4 md:mt-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm ${
              hostel.availability === 'Available' ? 'bg-green-500 text-white' : 
              hostel.availability === 'Limited' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {hostel.availability}
            </span>
            <span className="bg-yellow-custom text-gray-900 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              {hostel.type || 'PG'} - {hostel.gender || 'Co-ed'}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{hostel.name}</h1>
            {/* Premium Verified Badge */}
            {hostel.verified && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center shadow-sm border border-blue-200">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-lg w-fit">
              <svg className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {hostel.mapCoordinates ? (
                <a
                  href={`https://maps.google.com/?q=${hostel.mapCoordinates.lat},${hostel.mapCoordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-yellow-600 transition-colors underline decoration-gray-300 underline-offset-2"
                >
                  {hostel.location}
                </a>
              ) : (
                <span className="font-medium">{hostel.location}</span>
              )}
            </div>
{/* 
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 w-fit">
              <div className="flex text-yellow-custom mr-2">
                {STARS.map((i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(hostel.rating || 4.8) ? 'text-yellow-custom' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-900 font-bold">{(hostel.rating || 4.8).toFixed(1)} <span className="text-gray-500 font-normal text-sm">/ 5</span></span>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
          
          <div className="xl:col-span-2 space-y-6 md:space-y-8">

            {/* Pricing Options Section */}
            {hostel.sharingTypes && hostel.sharingTypes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bed-Based Pricing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hostel.sharingTypes.map((sharing, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSharing(sharing)}
                      className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                        selectedSharing?.name === sharing.name
                          ? 'border-yellow-400 bg-yellow-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{sharing.name}</h4>
                        <div className="flex items-center gap-2">
                          {sharing.available > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {sharing.available} left
                            </span>
                          )}
                          {sharing.available === 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Full</span>
                          )}
                          {selectedSharing?.name === sharing.name && (
                            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        ₹{Number(sharing.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        <span className="text-xs font-normal text-gray-500 ml-1">/{sharing.priceType || 'month'}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedSharing && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Selected: <span className="text-yellow-700">{selectedSharing.name}</span></span>
                    <span className="text-lg font-bold text-yellow-600">
                      ₹{Number(selectedSharing.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<span className="text-xs font-normal text-gray-500 ml-1">/{selectedSharing.priceType || 'month'}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {parsedVideoUrl && (
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Virtual Tour
                </h3>
                <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={parsedVideoUrl}
                    title="Hostel Video Tour"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            <div className="xl:hidden space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-5 text-gray-900 text-center">
                  {hostel.sharingTypes && hostel.sharingTypes.length > 0 ? (
                    <div>
                      <div className="text-sm font-semibold mb-1 opacity-90">
                        {selectedSharing ? selectedSharing.name : 'Starting from'}
                      </div>
                      <div className="text-3xl font-extrabold drop-shadow-sm">
                        Rs. {Number(selectedSharing ? selectedSharing.price : Math.min(...hostel.sharingTypes.map(s => s.price))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        <span className="text-base font-semibold ml-1 opacity-90">/{selectedSharing?.priceType || 'month'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold mb-1 drop-shadow-sm">
                      Rs. {formattedPrice}
                      <span className="text-base font-semibold ml-1 opacity-90">/{hostel.priceType || 'month'}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-3">
                  {slicedInfo.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium text-sm">{item.title}</span>
                      <span className="font-bold text-base text-gray-900">{item.value}</span>
                    </div>
                  ))}
                  {(hostel.availableBeds || hostel.availableRooms) && (
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-sm">Available Beds</span>
                      <span className="font-bold text-base text-gray-900">{hostel.availableBeds || hostel.availableRooms}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2.5 pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium text-sm">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
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

              <MemoizedBookingComponent hostel={hostel} />

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-5 text-gray-900">
                  <h3 className="text-xl font-bold mb-1">Send Enquiry</h3>
                  <p className="text-gray-800 text-sm font-medium">Get personalized assistance</p>
                </div>
                <div className="p-5">
                  <MemoizedEnquiryForm 
                    hostelId={hostel._id}
                    hostelName={hostel.name}
                    source="hostel-details"
                    onSuccess={handleEnquirySuccess}
                  />
                </div>
              </div>
            </div>

            <div className="sticky top-20 z-30 bg-white rounded-2xl shadow-md border border-gray-100 mb-6">
              <nav className="flex overflow-x-auto hide-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const ref = tab.id === 'overview' ? overviewRef : 
                                 tab.id === 'amenities' ? amenitiesRef :
                                 tab.id === 'location' ? locationRef : reviewsRef
                      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`flex-1 min-w-0 py-4 sm:py-5 px-3 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-300 relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-yellow-600 bg-yellow-50/50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="hidden sm:inline tracking-wide">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-custom rounded-t-full"></motion.div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-8">
                <div ref={overviewRef} className="space-y-8 mb-12">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      About This Hostel
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 sm:p-6 rounded-2xl border border-yellow-200/60">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {hostel.description || 'Experience comfortable living in this well-maintained hostel facility. Perfect for students and working professionals looking for a safe and convenient accommodation option.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 text-center hover:shadow-md transition-shadow">
                      <div className="bg-blue-500 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">Room Types</h4>
                      <p className="text-gray-600 text-sm font-medium">
                        {hostel.roomTypes && hostel.roomTypes.length > 0 
                          ? hostel.roomTypes.map(rt => rt.name || rt.type).filter(Boolean).join(', ') 
                          : 'Contact for details'
                        }
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 text-center hover:shadow-md transition-shadow">
                      <div className="bg-green-500 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">Capacity</h4>
                      <p className="text-gray-600 text-sm font-medium">{hostel.capacity || '50+ Students'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100 text-center hover:shadow-md transition-shadow">
                      <div className="bg-purple-500 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">Check-in</h4>
                      <p className="text-gray-600 text-sm font-medium">{hostel.checkIn || 'Flexible timing'}</p>
                    </div>
                  </div>
                </div>

                {hostel.rules && hostel.rules.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Hostel Rules
                    </h3>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                      <ul className="space-y-4">
                        {hostel.rules.map((rule, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="bg-orange-500 p-1 rounded-full mt-1">
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-gray-800 font-medium">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div ref={amenitiesRef} className="mb-12" style={{ contentVisibility: 'auto', containIntrinsicSize: '250px' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Available Amenities
                  </h3>
                  {hostel.amenities && hostel.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {hostel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow">
                          <div className="bg-green-500 p-2 rounded-full shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-800 font-bold text-sm sm:text-base">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No amenities listed.</p>
                    </div>
                  )}
                </div>

                <div ref={locationRef} className="mb-12" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Nearby Places
                  </h3>
                  <MemoizedNearbyPlacesDisplay hostelCoordinates={hostel.mapCoordinates} hostelNearbyPlaces={hostel.nearbyPlaces} />
                </div>

                <div ref={reviewsRef} style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
                  <MemoizedReviewSection hostelId={hostel._id} />
                </div>
              </div>
            </div>

          </div>

          {/* Desktop Right Sidebar */}
          <div className="hidden xl:block xl:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-8 text-gray-900 text-center">
                {hostel.sharingTypes && hostel.sharingTypes.length > 0 ? (
                  <div>
                    <div className="text-sm font-semibold mb-2 opacity-90">
                      {selectedSharing ? selectedSharing.name : 'Starting from'}
                    </div>
                    <div className="text-4xl font-extrabold drop-shadow-sm">
                      Rs. {Number(selectedSharing ? selectedSharing.price : Math.min(...hostel.sharingTypes.map(s => s.price))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      <span className="text-lg font-semibold ml-1 opacity-90">/{selectedSharing?.priceType || 'month'}</span>
                    </div>
                    {!selectedSharing && (
                      <div className="text-xs mt-1 opacity-75">Select a sharing type above</div>
                    )}
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold mb-1 drop-shadow-sm">
                    Rs. {formattedPrice}
                    <span className="text-lg font-semibold ml-1 opacity-90">/{hostel.priceType || 'month'}</span>
                  </div>
                )}
              </div>
              
              <div className="p-8 space-y-4">
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
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
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
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Free consultation available
                  </p>
                  <p className="text-sm font-medium text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Quick response guaranteed
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky top-6">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-yellow-custom to-orange-400 p-6 text-gray-900">
                  <h3 className="text-2xl font-bold mb-1">Send Enquiry</h3>
                  <p className="text-gray-800 font-medium">Get personalized assistance</p>
                </div>
                <div className="p-6">
                  <MemoizedEnquiryForm 
                    hostelId={hostel._id}
                    hostelName={hostel.name}
                    source="hostel-details"
                    onSuccess={handleEnquirySuccess}
                  />
                </div>
              </div>

              <MemoizedBookingComponent hostel={hostel} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal with Smooth Animation */}
      <AnimatePresence>
        {isFullscreen && hostel.images && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 z-50 hover:scale-105"
                aria-label="Close fullscreen"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={`${UPLOADS_BASE_URL}/${hostel.images[currentImageIndex]}`}
                  alt={`${hostel.name} ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </AnimatePresence>
              
              {hostel.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105 z-40"
                    aria-label="Previous image"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105 z-40"
                    aria-label="Next image"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full z-40 shadow-lg">
                <span className="text-sm font-bold tracking-wide">
                  {currentImageIndex + 1} / {hostel.images.length} • {hostel.name}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(HostelDetails);