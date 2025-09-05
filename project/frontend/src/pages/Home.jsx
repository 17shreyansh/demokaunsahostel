import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hostelAPI, pageAPI } from '../services/api'
import { stateManager } from '../utils/stateManager'
import HeroSection from '../components/home/HeroSection'
import SearchSection from '../components/home/SearchSection'
import FeaturedHostels from '../components/home/FeaturedHostels'
import ServicesSection from '../components/home/ServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { FaGraduationCap, FaBuilding, FaBus, FaShoppingCart } from 'react-icons/fa'

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
    try {
      const [hostelsResponse, contentResponse, nearbyResponse] = await Promise.all([
        hostelAPI.getFeatured(),
        pageAPI.getPageContent('home'),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces`)
      ])
      setHostels(hostelsResponse.data || [])
      setPageContent(contentResponse.data.content || {})
      const nearbyData = await nearbyResponse.json()
      setNearbyPlaces(nearbyData || [])
    } catch (error) {
      console.error('Error:', error)
      // Fallback to regular hostels if featured endpoint fails
      try {
        const fallbackResponse = await hostelAPI.getAll()
        setHostels(fallbackResponse.data.hostels?.slice(0, 6) || [])
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
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
      
      <HeroSection hostels={hostels} loading={loading} content={pageContent.hero} />
        <SearchSection content={pageContent.search} />
        <FeaturedHostels hostels={hostels} loading={loading} />
        
        {/* Nearby Places Section */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Nearby Places</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover important locations around our hostels - from educational institutions to shopping centers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['educational', 'office', 'transportation', 'shopping'].map(category => {
                const categoryPlaces = nearbyPlaces.filter(place => place.category === category)
                const categoryLabels = {
                  educational: { name: 'Educational', icon: FaGraduationCap, color: 'blue' },
                  office: { name: 'IT Parks & Offices', icon: FaBuilding, color: 'purple' },
                  transportation: { name: 'Transportation', icon: FaBus, color: 'green' },
                  shopping: { name: 'Shopping', icon: FaShoppingCart, color: 'orange' }
                }
                const categoryInfo = categoryLabels[category]
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`bg-gradient-to-br from-${categoryInfo.color}-50 to-${categoryInfo.color}-100 p-6 rounded-2xl border border-${categoryInfo.color}-200 hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="text-center mb-4">
                      <div className="mb-2">
                        <categoryInfo.icon className="w-8 h-8 mx-auto text-gray-700" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{categoryInfo.name}</h3>
                      <p className="text-gray-600 text-sm">{categoryPlaces.length} locations</p>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categoryPlaces.slice(0, 3).map((place, index) => (
                        <div key={place._id} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 bg-${categoryInfo.color}-500 rounded-full`}></div>
                          <span className="text-gray-700 truncate">{place.name}</span>
                        </div>
                      ))}
                      {categoryPlaces.length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-2">
                          +{categoryPlaces.length - 3} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
        
        <ServicesSection content={pageContent.services} />
        <TestimonialsSection content={pageContent.testimonials} />
    </main>
  )
}

export default Home