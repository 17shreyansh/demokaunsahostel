import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hostelAPI } from '../../services/api';
import PriceDisplay from '../common/PriceDisplay';
import './HeroSection.css';

/* -------------------------------------------------------------------------- */
/* MICRO-COMPONENTS (State Isolation)                                         */
/* -------------------------------------------------------------------------- */

// 1. Isolated Typewriter Component
// Prevents the 50ms state updates from re-rendering the entire Hero section.
const AnimatedTitle = memo(({ texts, speed = 80, deleteSpeed = 40, pauseTime = 1500 }) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentText = texts[textIndex];

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, textIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

  return <>{displayText}</>;
});

// 2. Isolated Search Component
// Prevents keystrokes from causing global layout recalculations.
const SearchWidget = memo(({ content }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) {
        setSearchLoading(true);
        try {
          const response = await hostelAPI.getSuggestions(searchQuery, {
            signal: abortController.signal
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          if (error.name !== 'CanceledError') {
            console.error('Search error:', error);
          }
        } finally {
          setSearchLoading(false);
        }
      } else {
        setShowResults(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(debounceTimer);
      abortController.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/hostels?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, navigate]);

  const handleResultClick = useCallback((result) => {
    if (result.type === 'hostel') {
      navigate(`/hostel/${result.slug || result.id}`);
    } else {
      navigate(`/hostels?location=${encodeURIComponent(result.name)}`);
    }
    setShowResults(false);
    setSearchQuery('');
  }, [navigate]);

  return (
    <motion.div 
      className="mb-6 sm:mb-8 relative z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      ref={searchContainerRef}
    >
      <div className="search-container bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-3 sm:p-2 hover:shadow-3xl transition-all duration-500 group relative">
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 text-gray-700 bg-transparent border-none outline-none text-lg placeholder-gray-400 font-medium relative z-10"
            />
          </div>
          <div className="flex items-center space-x-2 relative z-10">
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
      
      <AnimatePresence>
        {(showResults || searchLoading) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-50"
          >
            {searchLoading ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    result.type === 'hostel' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
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
      </AnimatePresence>
    </motion.div>
  );
});

// 3. Isolated Slider Component
// Prevents the 5-second interval from triggering parent renders.
const OFFSETS = [-1, 0, 1];

const HostelSlider = memo(({ hostels, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayHostels = useMemo(() => hostels.slice(0, 6), [hostels]);

  useEffect(() => {
    if (displayHostels.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayHostels.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [displayHostels.length]);

  return (
    <>
      <motion.div 
        className="relative h-96 sm:h-[28rem] overflow-visible px-2 sm:px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : displayHostels.length > 0 ? (
          <div className="relative h-full flex flex-col justify-center space-y-4">
            {OFFSETS.map((offset) => {
              const index = (currentIndex + offset + displayHostels.length) % displayHostels.length;
              const hostel = displayHostels[index];
              const isCenter = offset === 0;
              
              if (!hostel) return null;
              
              return (
                <motion.div 
                  key={hostel._id}
                  // Removed 'layout' to prevent expensive main-thread DOM measurements
                  initial={false}
                  animate={{
                    scale: isCenter ? 1.1 : 0.85,
                    opacity: isCenter ? 1 : 0.4,
                    y: isCenter ? 0 : offset === -1 ? -10 : 10,
                    zIndex: isCenter ? 20 : 0,
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  whileHover={isCenter ? { scale: 1.12, transition: { duration: 0.2 } } : {}}
                  style={{
                    willChange: 'transform, opacity',
                    // Static filter prevents Framer from tweening the blur value frame-by-frame
                    filter: isCenter ? 'blur(0px)' : 'blur(1px)'
                  }}
                >
                  <div className={`bg-white/95 backdrop-blur-2xl rounded-xl sm:rounded-2xl shadow-xl border border-white/30 mx-2 sm:mx-4 transition-all duration-300 ease-in-out hover:bg-white/98 group ${
                    isCenter ? 'shadow-2xl border-yellow-200/50 p-4 sm:p-6 shadow-yellow-100/20' : 'p-3 sm:p-4 hover:shadow-lg'
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isCenter ? 'opacity-30' : ''
                    }`} />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-bold text-gray-900 leading-tight transition-all duration-300 ${
                            isCenter ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
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
                        
                        <div className="flex flex-col gap-2">
                          <PriceDisplay
                            price={hostel.price}
                            priceType={hostel.priceType || 'month'}
                            sessionPrice={hostel.sessionPrice}
                            size={isCenter ? 'default' : 'small'}
                          />
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
                            className="mt-3 pt-3 border-t border-gray-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
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
              );
            })}
          </div>
        ) : null}
      </motion.div>
      
      {/* Slider Indicators */}
      <motion.div 
        className="flex justify-center mt-4 space-x-2 relative z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {displayHostels.map((hostel, index) => (
          <motion.button
            key={`indicator-${hostel._id}-${index}`}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? 'bg-yellow-400 w-6 shadow-lg shadow-yellow-200' 
                : 'bg-gray-300 hover:bg-gray-400 w-2'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{ backgroundColor: index === currentIndex ? '#F59E0B' : '#D1D5DB' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
    </>
  );
});

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const HeroSection = memo(({ hostels, loading, content }) => {
  const typewriterTexts = useMemo(() => content?.typewriterTexts || [
    'Premium Hostels',
    'Safe Accommodations', 
    'Budget-Friendly PGs',
    'Modern Amenities',
    'Verified Properties'
  ], [content?.typewriterTexts]);

  // Memoizing background continuous animations prevents object regeneration 
  const bgAnimationOpts = useMemo(() => ({
    scale: [1, 1.3, 1],
    rotate: [0, 180, 360]
  }), []);
  
  const bgTransitionOpts = useMemo(() => ({
    duration: 12,
    repeat: Infinity,
    ease: "linear" // Changed to linear for smoother infinite compositor rotation
  }), []);

  const bgFloatOpts = useMemo(() => ({
    y: [0, -30, 0],
    rotate: [0, -90, 0]
  }), []);

  const bgFloatTransitionOpts = useMemo(() => ({
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
    delay: 1
  }), []);

  return (
    <section className="relative min-h-screen lg:h-screen overflow-hidden flex items-center bg-transparent transform-gpu">
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10 pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 w-full py-8 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:h-full">
          {/* Left Content */}
          <div className="text-center lg:text-left order-1 relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {content?.trustBadge || 'Trusted by 1200+ Students'}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              {content?.mainTitle || 'Find Your Perfect '}
              <span className="block bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-400 bg-clip-text text-transparent min-h-[1.2em]">
                <AnimatedTitle texts={typewriterTexts} />
                <span className="typewriter-cursor text-yellow-custom animate-pulse">|</span>
              </span>
              <span className="block text-gray-700 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mt-1 sm:mt-2">
                {content?.location || 'in Greater Noida'}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {content?.description || 'Find your perfect nest! Premium hostels with modern amenities and vibrant communities. Where comfort meets convenience in Greater Noida.'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
              <Link to="/hostels" className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-yellow-200 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center will-change-transform">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {content?.primaryButton?.text || 'Explore Hostels'}
              </Link>
              <Link to="/contact" className="group bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center will-change-transform">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {content?.secondaryButton?.text || 'Contact Us'}
              </Link>
            </div>
          </div>
          
          {/* Right Visual */}
          <div className="relative order-2 z-20">
            {/* Floating background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div 
                className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-xl will-change-transform"
                animate={bgAnimationOpts}
                transition={bgTransitionOpts}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-300/25 to-purple-300/25 rounded-2xl blur-lg will-change-transform"
                animate={bgFloatOpts}
                transition={bgFloatTransitionOpts}
              />
            </div>

            <SearchWidget content={content} />
            <HostelSlider hostels={hostels} loading={loading} />
            
            {/* View All Link */}
            <motion.div 
              className="mt-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/hostels" className="block bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-2xl rounded-2xl border border-yellow-300/30 p-4 text-center hover:from-yellow-400/30 hover:to-orange-400/30 transition-all duration-500 group hover:shadow-xl hover:border-yellow-300/50">
                  <div className="text-yellow-600 font-semibold text-sm group-hover:scale-105 transition-transform inline-block">
                    View All {hostels.length}+ Hostels &rarr;
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;