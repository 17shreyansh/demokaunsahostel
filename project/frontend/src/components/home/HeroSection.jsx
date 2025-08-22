import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { hostelAPI } from '../../services/api'
import './HeroSection.css'

const useTypewriter = (texts, speed = 100, deleteSpeed = 50, pauseTime = 2000) => {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentText = texts[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [displayText, textIndex, isDeleting, texts, speed, deleteSpeed, pauseTime])

  return displayText
}

const HeroSection = ({ hostels, loading, content }) => {
  const navigate = useNavigate()
  const typewriterTexts = content?.typewriterTexts || [
    'Premium Hostels',
    'Safe Accommodations', 
    'Budget-Friendly PGs',
    'Modern Amenities',
    'Verified Properties'
  ]
  
  const animatedText = useTypewriter(typewriterTexts, 80, 40, 1500)
  
  const [currentHostelIndex, setCurrentHostelIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  
  useEffect(() => {
    const searchSuggestions = async () => {
      if (searchQuery.length > 1) {
        setSearchLoading(true)
        try {
          const response = await hostelAPI.getSuggestions(searchQuery)
          setSearchResults(response.data)
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setSearchLoading(false)
        }
      } else {
        setShowResults(false)
      }
    }
    
    const debounceTimer = setTimeout(searchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/hostels?search=${encodeURIComponent(searchQuery)}`)
    }
  }
  
  const handleResultClick = (result) => {
    if (result.type === 'hostel') {
      navigate(`/hostel/${result.slug || result.id}`)
    } else {
      navigate(`/hostels?location=${encodeURIComponent(result.name)}`)
    }
    setShowResults(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowResults(false)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (hostels.length > 0) {
      const hostelInterval = setInterval(() => {
        setCurrentHostelIndex(prev => (prev + 1) % hostels.length)
      }, 5000)
      return () => clearInterval(hostelInterval)
    }
  }, [hostels.length])

  return (
    <section className="relative min-h-screen lg:h-screen overflow-hidden flex items-center bg-transparent">
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />

      
      <div className="relative container mx-auto px-4 sm:px-6 w-full py-8 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:h-full">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {content?.trustBadge || 'Trusted by 1200+ Students'}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {content?.mainTitle || 'Find Your Perfect'}
              <span className="block bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-400 bg-clip-text text-transparent min-h-[1.2em]">
                {animatedText}
                <span className="typewriter-cursor text-yellow-custom">|</span>
              </span>
              <span className="block text-gray-700 text-2xl md:text-3xl lg:text-4xl font-medium mt-2">
                {content?.location || 'in Greater Noida'}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              {content?.description || 'Find your perfect nest! Premium hostels with modern amenities and vibrant communities. Where comfort meets convenience in Greater Noida.'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to={content?.primaryButton?.link || '/hostels'} className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-yellow-200 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {content?.primaryButton?.text || 'Explore Hostels'}
              </Link>
              <a href={content?.secondaryButton?.link || 'tel:+919876543210'} className="group bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {content?.secondaryButton?.text || 'Call Now'}
              </a>
            </div>
          </div>
          
          {/* Right Visual */}
          <div className="relative order-1 lg:order-2">
            {/* Floating background elements for right section */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div 
                className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-300/25 to-purple-300/25 rounded-2xl blur-lg"
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, -90, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
            {/* Enhanced Search Bar */}
            <motion.div 
              className="mb-8 relative z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="search-container bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-2 hover:shadow-3xl transition-all duration-500 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder={content?.searchPlaceholder || 'Search hostels, locations, colleges...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-4 py-4 text-gray-700 bg-transparent border-none outline-none text-lg placeholder-gray-400 font-medium"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-3 text-gray-400 hover:text-yellow-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </button>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button 
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-yellow-200 transition-all duration-300"
                      >
                        Search
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Search Results Dropdown */}
              {(showResults || searchLoading) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-50"
                >
                  {searchLoading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          result.type === 'hostel' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {result.type === 'hostel' ? '🏠' : '📍'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{result.name}</div>
                          {result.location && (
                            <div className="text-sm text-gray-500">{result.location}</div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
            
            {/* Enhanced Hostel Slider */}
            <motion.div 
              className="relative h-96 overflow-visible px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : hostels.length > 0 ? (
                <div className="relative h-full flex flex-col justify-center space-y-4">
                  {[-1, 0, 1].map((offset) => {
                    const index = (currentHostelIndex + offset + hostels.length) % hostels.length
                    const hostel = hostels[index]
                    const isCenter = offset === 0
                    
                    return (
                      <motion.div 
                        key={hostel._id}
                        animate={{
                          scale: isCenter ? 1.1 : 0.95,
                          y: isCenter ? 0 : offset === -1 ? -8 : 8,
                          rotate: isCenter ? 0 : offset === -1 ? 1 : -1,
                          opacity: isCenter ? 1 : 0.75,
                          zIndex: isCenter ? 20 : 0
                        }}
                        transition={{ 
                          duration: 0.8, 
                          ease: [0.16, 1, 0.3, 1],
                          delay: offset * 0.1,
                          layout: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                        }}
                        layout
                        whileHover={{ scale: isCenter ? 1.12 : 0.97 }}
                      >
                        <div className={`bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/30 mx-4 transition-all duration-300 ease-in-out hover:bg-white/98 group ${
                          isCenter ? 'shadow-2xl border-yellow-200/50 p-6 shadow-yellow-100/20' : 'p-4 hover:shadow-lg'
                        }`}>
                          {/* Card glow effect */}
                          <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                            isCenter ? 'opacity-30' : ''
                          }`} />
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-bold text-gray-900 leading-tight transition-all duration-300 ${
                                  isCenter ? 'text-xl' : 'text-lg'
                                }`}>{hostel.name}</h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                                  hostel.availability === 'Available' ? 'bg-green-100 text-green-700' :
                                  hostel.availability === 'Limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {hostel.availability}
                                </div>
                              </div>
                              <p className="text-gray-500 text-sm flex items-center mb-3">
                                <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {hostel.location}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className={`text-yellow-500 font-bold transition-all duration-300 ${
                                  isCenter ? 'text-2xl' : 'text-xl'
                                }`}>
                                  ₹{hostel.price}
                                  <span className="text-sm text-gray-400 font-normal">/month</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400 mr-2">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-gray-500 text-xs">{hostel.rating || '4.8'}</span>
                                </div>
                              </div>
                              
                              {isCenter && (
                                <motion.div 
                                  className="mt-3 pt-3 border-t border-gray-100 transition-opacity duration-300"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to={`/hostel/${hostel.slug || hostel._id}`} className="relative z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-xl transition-all duration-300 text-sm inline-block shadow-lg hover:shadow-xl">
                                      View Details &rarr;
                                    </Link>
                                  </motion.div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : null}
            </motion.div>
            
            {/* Enhanced Slider Indicators */}
            <motion.div 
              className="flex justify-center mt-4 space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {hostels.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentHostelIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentHostelIndex 
                      ? 'bg-yellow-400 w-6 shadow-lg shadow-yellow-200' 
                      : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </motion.div>
            
            {/* Enhanced View All Link */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/hostels" className="block bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-2xl rounded-2xl border border-yellow-300/30 p-4 text-center hover:from-yellow-400/30 hover:to-orange-400/30 transition-all duration-500 group hover:shadow-xl hover:border-yellow-300/50">
                  <div className="text-yellow-600 font-semibold text-sm group-hover:scale-105 transition-transform">
                    View All {hostels.length}+ Hostels &rarr;
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection