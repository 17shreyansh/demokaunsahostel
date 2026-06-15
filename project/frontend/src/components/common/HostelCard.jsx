import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { memo } from 'react'
import PriceDisplay from './PriceDisplay'
import { optimizeImageUrl } from '../../utils/imageOptimization'

const HostelCard = memo(({ hostel, variant = 'default' }) => {
  const isCompact = variant === 'compact'
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden group ${
        isCompact ? 'h-auto' : 'h-full'
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isCompact ? 'h-48' : 'h-56'}`}>
        {optimizeImageUrl(hostel.image, 400, 250) ? (
          <img 
            src={optimizeImageUrl(hostel.image, 400, 250)} 
            alt={hostel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 ${optimizeImageUrl(hostel.image, 400, 250) ? 'hidden' : 'flex'}`}>
          <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">Hostel Image</p>
          <p className="text-xs">Not Available</p>
        </div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hostel.availability === 'Available' ? 'bg-green-500 text-white' :
            hostel.availability === 'Limited' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {hostel.availability || 'Available'}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{hostel.rating || '4.8'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isCompact ? 'sm:p-5' : 'sm:p-6'}`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className={`font-bold text-gray-900 leading-tight ${
            isCompact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}>
            {hostel.name}
          </h3>
          {hostel.verified && (
            <div className="ml-2 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{hostel.location}</span>
        </div>

        {/* Description */}
        {hostel.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {hostel.description}
          </p>
        )}

        {/* Amenities */}
        {hostel.amenities && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hostel.amenities.slice(0, 3).map((amenity, index) => (
              <span key={`${hostel._id}-amenity-${index}`} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                {amenity}
              </span>
            ))}
            {hostel.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                +{hostel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <PriceDisplay
              price={hostel.price}
              priceType={hostel.priceType || 'month'}
              sessionPrice={hostel.sessionPrice}
              size={isCompact ? 'small' : 'default'}
            />
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
            <Link 
              to={`/hostel/${hostel.slug || hostel._id}`}
              className={`bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap ${
                isCompact ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm'
              }`}
            >
              View Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
})

HostelCard.displayName = 'HostelCard'

export default HostelCard