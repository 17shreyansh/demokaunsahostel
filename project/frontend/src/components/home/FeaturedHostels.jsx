import { memo, useMemo } from 'react';
import HostelCard from '../common/HostelCard';

// 1. Extract static references outside the render cycle
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || '';
const EMPTY_HOSTELS = [];

const FeaturedHostels = memo(({ hostels = EMPTY_HOSTELS, loading = false }) => {
  
  // 2. Memoize data transformations to preserve referential equality.
  // This prevents <HostelCard /> from re-rendering unless the API data actually changes.
  const processedHostels = useMemo(() => {
    if (!hostels || hostels.length === 0) return EMPTY_HOSTELS;
    
    return hostels.map(hostel => ({
      ...hostel,
      image: hostel.images?.[0] ? `${UPLOADS_BASE_URL}/${hostel.images[0]}` : null
    }));
  }, [hostels]);

  return (
    <section id="hostels" className="py-12 sm:py-16 lg:py-20 transform-gpu">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Featured Hostels</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2 px-4">Handpicked for your comfort and convenience.</p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-12" aria-live="polite" aria-busy="true">
            {/* GPU-Accelerated Spinner */}
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-custom border-t-transparent" style={{ willChange: 'transform' }}></div>
            <p className="mt-4 text-gray-600">Loading featured hostels...</p>
          </div>
        ) : processedHostels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {processedHostels.map((hostel) => (
              <HostelCard 
                key={hostel._id} 
                hostel={hostel} 
                variant="default" 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 transform-gpu">🏠</div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900">No Featured Hostels Available</h4>
            <p className="text-gray-600">Please check back later or browse all hostels.</p>
          </div>
        )}
      </div>
    </section>
  );
});

// Explicit display name for React DevTools profiling
FeaturedHostels.displayName = 'FeaturedHostels';

export default FeaturedHostels;