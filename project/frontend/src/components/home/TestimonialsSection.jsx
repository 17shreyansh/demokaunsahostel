import { memo, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

// Leaner CSS imports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* -------------------------------------------------------------------------- */
/* STATIC CONFIGURATIONS (Prevents Swiper Re-initialization)                  */
/* -------------------------------------------------------------------------- */
const EMPTY_ITEMS = [];

const SWIPER_MODULES = [Navigation, Pagination, Autoplay];

const SWIPER_NAVIGATION = {
  nextEl: '.testimonial-next',
  prevEl: '.testimonial-prev',
};

const SWIPER_PAGINATION = {
  el: '.testimonial-pagination',
  clickable: true,
  bulletClass: 'swiper-pagination-bullet custom-bullet',
  bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
};

const SWIPER_AUTOPLAY = {
  delay: 5000,
  disableOnInteraction: false,
};

const SWIPER_BREAKPOINTS = {
  768: {
    slidesPerView: 2,
    spaceBetween: 24
  },
  1024: {
    slidesPerView: 3,
    spaceBetween: 32
  }
};

// Premium Swiper Pagination Styles
const customSwiperStyles = `
  .testimonial-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .custom-bullet {
    width: 8px;
    height: 8px;
    background-color: #D1D5DB;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .custom-bullet-active {
    width: 24px;
    background-color: #FBBF24;
    border-radius: 9999px;
  }
`;

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENT                                                   */
/* -------------------------------------------------------------------------- */
const TestimonialCard = memo(({ testimonial }) => {
  // Pre-calculate stars once to prevent array allocation on every render
  const stars = useMemo(() => Array.from({ length: testimonial.rating || 5 }), [testimonial.rating]);

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 p-8 sm:p-10 mx-1 sm:mx-2 group border border-gray-100 flex flex-col h-full relative overflow-hidden">
      
      {/* Decorative SVG Quote Watermark */}
      <div className="absolute top-6 right-6 text-yellow-400/10 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 pointer-events-none">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      
      {/* Rating */}
      <div className="flex justify-start mb-6">
        {stars.map((_, i) => (
          <span 
            key={i} 
            className="text-yellow-400 text-lg mr-1 transform group-hover:scale-110 transition-transform duration-300" 
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        ))}
      </div>
      
      {/* Testimonial Text */}
      <blockquote className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 font-medium relative z-10 flex-1">
        "{testimonial.text}"
      </blockquote>
      
      {/* Author Info */}
      <div className="flex items-center pt-6 border-t border-gray-50 mt-auto">
        <div className="relative flex-shrink-0">
          {testimonial.image ? (
            <img 
              src={testimonial.image} 
              alt={testimonial.name} 
              loading="lazy"
              decoding="async"
              className="w-14 h-14 rounded-full object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-100 flex items-center justify-center shadow-sm">
              <span className="text-yellow-600 text-xl font-bold select-none">
                {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
          {/* Authentic Instagram-style Verified Tick */}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <svg className="w-5 h-5 text-[#0095F6]" fill="currentColor" viewBox="0 0 20 20" title="Verified Resident">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-bold text-gray-900 leading-tight">{testimonial.name}</h4>
          <p className="text-gray-500 text-sm font-medium">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const TestimonialsSection = memo(({ content }) => {
  const testimonials = content?.items || EMPTY_ITEMS;

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-[#F9FAFB] font-sans relative overflow-hidden">
      <style>{customSwiperStyles}</style>
      
      {/* Soft Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-full shadow-sm">
              Real Experiences
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">
              {content?.title || 'What Our Residents Say'}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed px-4">
              {content?.subtitle || 'We take pride in building a community that feels just like a home away from home.'}
            </p>
          </motion.div>
        </div>

        {/* Swiper Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full pb-4"
        >
          <Swiper
            modules={SWIPER_MODULES}
            spaceBetween={24}
            slidesPerView={1}
            navigation={SWIPER_NAVIGATION}
            pagination={SWIPER_PAGINATION}
            autoplay={SWIPER_AUTOPLAY}
            loop={true}
            breakpoints={SWIPER_BREAKPOINTS}
            className="testimonials-swiper !pb-12 !pt-4" // Padding for hover shadows
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id || index} className="h-auto">
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation & Pagination */}
          <div className="flex justify-center items-center mt-4 gap-6">
            <button 
              className="testimonial-prev w-12 h-12 bg-white border border-gray-100 hover:border-yellow-400 text-gray-600 hover:bg-yellow-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center focus:outline-none"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="testimonial-pagination min-w-[100px]"></div>
            
            <button 
              className="testimonial-next w-12 h-12 bg-white border border-gray-100 hover:border-yellow-400 text-gray-600 hover:bg-yellow-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center focus:outline-none"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;