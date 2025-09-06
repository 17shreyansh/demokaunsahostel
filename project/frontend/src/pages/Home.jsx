import { useState, useEffect, memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { hostelAPI, pageAPI } from '../services/api'
import { stateManager } from '../utils/stateManager'
import HeroSection from '../components/home/HeroSection'
import SearchSection from '../components/home/SearchSection'
import FeaturedHostels from '../components/home/FeaturedHostels'
import ServicesSection from '../components/home/ServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import OurPartners from '../components/home/OurPartners'
import { FaGraduationCap, FaBuilding, FaBus, FaShoppingCart } from 'react-icons/fa'

// Memoized components
const MemoizedHeroSection = memo(HeroSection)
const MemoizedSearchSection = memo(SearchSection)
const MemoizedFeaturedHostels = memo(FeaturedHostels)
const MemoizedServicesSection = memo(ServicesSection)
const MemoizedTestimonialsSection = memo(TestimonialsSection)
const MemoizedOurPartners = memo(OurPartners)

const Home = () => {
  const [hostels, setHostels] = useState([])
  const [pageContent, setPageContent] = useState({})
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    return stateManager.subscribe('homepage', fetchData)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Prioritize critical data first
      const hostelsResponse = await hostelAPI.getFeatured()
      setHostels(hostelsResponse.data || [])
      setLoading(false)
      
      // Load non-critical data after
      const [contentResponse, nearbyResponse] = await Promise.all([
        pageAPI.getPageContent('home'),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces`)
      ])
      setPageContent(contentResponse.data.content || {})
      const nearbyData = await nearbyResponse.json()
      setNearbyPlaces(nearbyData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setHostels([])
      setPageContent({})
      setNearbyPlaces([])
      setLoading(false)
    }
  }

  return (
    <main className="relative">
      {/* Fixed Hero Background with all effects */}
      <div className="fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden" style={{ zIndex: -1 }}>
        <motion.div 
          className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full opacity-10 blur-3xl"
          animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-2xl opacity-30 blur-sm"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-40 blur-sm"
          animate={{ y: [0, 25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`floating-dot-${i}`}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
      </div>
      
      <MemoizedHeroSection hostels={hostels} loading={loading} content={pageContent.hero} />
        <MemoizedSearchSection content={pageContent.search} />
        <MemoizedOurPartners />
        <MemoizedFeaturedHostels hostels={hostels} loading={loading} />
        <MemoizedServicesSection content={pageContent.services} />
        <MemoizedTestimonialsSection content={pageContent.testimonials} />
    </main>
  )
}

export default Home