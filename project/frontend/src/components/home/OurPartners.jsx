import { memo } from 'react'
import { motion } from 'framer-motion'

// Import logos
import logo1 from '../../assets/logo/1.jpg'
import logo2 from '../../assets/logo/2.jpg'
import logo3 from '../../assets/logo/3.jpg'
import logo4 from '../../assets/logo/4.jpg'
import logo5 from '../../assets/logo/5.jpg'
import logo6 from '../../assets/logo/6.jpg'
import logo7 from '../../assets/logo/7.jpg'

// Partner logos data
const partners = [
  { id: 1, name: 'Partner 1', logo: logo1 },
  { id: 2, name: 'Partner 2', logo: logo2 },
  { id: 3, name: 'Partner 3', logo: logo3 },
  { id: 4, name: 'Partner 4', logo: logo4 },
  { id: 5, name: 'Partner 5', logo: logo5 },
  { id: 6, name: 'Partner 6', logo: logo6 },
  { id: 7, name: 'Partner 7', logo: logo7 },
]

const OurPartners = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background with gradient strip matching theme */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3/4 h-24 bg-gradient-to-r from-yellow-50 via-orange-50 to-transparent rounded-r-full opacity-50"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-20 bg-gradient-to-l from-yellow-100/30 to-transparent rounded-l-full opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header matching FeaturedHostels style */}
        <motion.div 
          className="text-center mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Partners</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2 px-4">
            Trusted by leading institutions and organizations across the country
          </p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </motion.div>

        {/* Partners Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-white rounded-2xl py-4 px-4 shadow-sm overflow-hidden">
            <motion.div 
              className="flex select-none"
              animate={{
                x: [0, -1400]
              }}
              transition={{
                x: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }
              }}
            >
              {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="flex-shrink-0 mx-12">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-cover rounded-full border border-gray-200 pointer-events-none select-none"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>


        </motion.div>

        {/* Yellow-themed floating decorative elements */}
        <motion.div
          className="absolute top-10 left-10 w-4 h-4 bg-gradient-to-br from-yellow-custom to-orange-400 rounded-full opacity-30"
          animate={{ 
            y: [0, -10, 0], 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-custom rounded-full opacity-20"
          animate={{ 
            y: [0, 15, 0], 
            x: [0, -10, 0],
            scale: [1, 0.8, 1] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
    </section>
  )
}

export default memo(OurPartners)