import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { memo } from 'react'
import PriceDisplay from './PriceDisplay'
import { optimizeImageUrl } from '../../utils/imageOptimization'
import blueTick from '../../assets/blue.svg'

const HostelCard = memo(({ hostel, variant = 'default' }) => {
  const isCompact = variant === 'compact'
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden group flex flex-col ${
        isCompact ? 'h-auto' : 'h-full'
      }`}
    >
      {/* Image with proper scalable aspect ratio */}
      <div className={`relative overflow-hidden w-full ${isCompact ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[4/3] sm:aspect-[16/11]'}`}>
        {optimizeImageUrl(hostel.image, 400, 250) ? (
          <img 
            src={optimizeImageUrl(hostel.image, 400, 250)} 
            alt={hostel.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        
        <div className={`w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 ${optimizeImageUrl(hostel.image, 400, 250) ? 'hidden' : 'flex'}`}>
          <svg className="w-10 h-10 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
            hostel.availability === 'Available' ? 'bg-green-500/90 text-white' :
            hostel.availability === 'Limited' ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            {hostel.availability || 'Available'}
          </span>
        </div>

        {/* Rating Badge */}
        {/* <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-gray-800">{hostel.rating || '4.8'}</span>
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-4 ${isCompact ? 'sm:p-5' : 'sm:p-6'}`}>
        
        {/* Title & Verified Badge Row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <h3 className={`font-bold text-gray-900 leading-tight truncate ${
            isCompact ? 'text-lg' : 'text-xl'
          }`}>
            {hostel.name}
          </h3>
          {hostel.verified && (
            <img src={blueTick} alt="Verified" className="w-4 h-4 flex-shrink-0 mt-0.5" title="Verified" />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-500 mb-4">
          <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-[13px] truncate">{hostel.location}</span>
        </div>

        {/* Amenities / Facilities only */}
        {hostel.amenities && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {hostel.amenities.slice(0, 3).map((amenity, index) => (
              <span key={`${hostel._id}-amenity-${index}`} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-medium rounded-md">
                {amenity}
              </span>
            ))}
            {hostel.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-medium rounded-md">
                +{hostel.amenities.length - 3}
              </span>
            )}
          </div>
        )} {/* <--- This was fixed (was accidentally </div>) */}

        {/* Price and Action Wrapper (Pushed to bottom) */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5 -mx-4 sm:-mx-5 mb:-mb-5">
          
          {/* Price Layout */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Starts from
            </span>
            <PriceDisplay
              price={hostel.price}
              priceType={hostel.priceType || 'month'}
              sessionPrice={hostel.sessionPrice}
              sharingTypes={hostel.sharingTypes}
              size={isCompact ? 'small' : 'default'}
            />
          </div>
          
          {/* Premium Glowing Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
            <Link 
              to={`/hostel/${hostel.slug || hostel._id}`}
              className={`block bg-yellow-400 text-gray-900 font-bold rounded-xl text-center transition-all duration-300 shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:bg-yellow-300 border border-yellow-300/50 ${
                isCompact ? 'px-4 py-2.5 text-xs' : 'px-5 py-2.5 text-sm'
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