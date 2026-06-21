import { memo } from 'react';
import './OurPartners.css';

// Import logos
import logo1 from '../../assets/logo/1.jpg';
import logo2 from '../../assets/logo/2.jpg';
import logo3 from '../../assets/logo/3.jpg';
import logo4 from '../../assets/logo/4.jpg';
import logo5 from '../../assets/logo/5.jpg';
import logo6 from '../../assets/logo/6.jpg';
import logo7 from '../../assets/logo/7.jpg';
import logo8 from '../../assets/logo/8.jpg';

// Partner logos data
const partners = [
  { id: 1, name: 'Partner 1', logo: logo1 },
  { id: 2, name: 'Partner 2', logo: logo2 },
  { id: 3, name: 'Partner 3', logo: logo3 },
  { id: 4, name: 'Partner 4', logo: logo4 },
  { id: 5, name: 'Partner 5', logo: logo5 },
  { id: 6, name: 'Partner 6', logo: logo6 },
  { id: 7, name: 'Partner 7', logo: logo7 },
  { id: 8, name: 'Partner 8', logo: logo8 },
];

// Pre-calculate the doubled array outside the render cycle to prevent memory reallocation
const duplicatedPartners = [...partners, ...partners];

const OurPartners = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden transform-gpu">
      {/* Background with gradient strip matching theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3/4 h-24 bg-gradient-to-r from-yellow-50 via-yellow-50 to-transparent rounded-r-full opacity-50 will-change-transform"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-20 bg-gradient-to-l from-yellow-100/30 to-transparent rounded-l-full opacity-40 will-change-transform"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Partners</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2 px-4">
            Trusted by leading institutions and organizations across the country
          </p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        {/* Partners Slider */}
        <div className="relative">
          <div className="bg-white rounded-2xl py-4 px-4 shadow-sm overflow-hidden">
            <div className="partners-scroll flex select-none">
              {duplicatedPartners.map((partner, index) => (
                <div key={`partner-${partner.id}-${index}`} className="flex-shrink-0 mx-8 sm:mx-12">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-cover rounded-full border border-gray-200 pointer-events-none select-none"
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Static decorative elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-gradient-to-br from-yellow-custom to-yellow-400 rounded-full opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-custom rounded-full opacity-20 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default memo(OurPartners);