import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const TestimonialsSection = ({ content }) => {
  const testimonials = content?.items || []

  return (
    <section id="testimonials" className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-custom rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{content?.title || 'What Our Residents Say'}</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2 px-4">{content?.subtitle || 'We are proud to be a home away from home.'}</p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        <div className="w-full">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.testimonial-next',
              prevEl: '.testimonial-prev',
            }}
            pagination={{
              el: '.testimonial-pagination',
              clickable: true,
              bulletClass: 'swiper-pagination-bullet testimonial-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active testimonial-bullet-active'
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 20
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30
              }
            }}
            className="testimonials-swiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-4 sm:p-6 lg:p-8 xl:p-10 mx-1 sm:mx-2 group hover:-translate-y-2 border border-gray-100">
                  {/* Quote Icon */}
                  <div className="text-yellow-custom/20 text-4xl sm:text-5xl lg:text-6xl font-serif mb-2 sm:mb-3 lg:mb-4 leading-none">"</div>
                  
                  {/* Rating */}
                  <div className="flex justify-start mb-3 sm:mb-4 lg:mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-custom text-base sm:text-lg lg:text-xl mr-1 transform group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 100}ms`}}>★</span>
                    ))}
                  </div>
                  
                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed mb-4 sm:mb-6 lg:mb-8 font-medium italic relative">
                    {testimonial.text}
                  </blockquote>
                  
                  {/* Author Info */}
                  <div className="flex items-center">
                    <div className="relative">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full object-cover border-4 border-yellow-custom/20 shadow-lg group-hover:border-yellow-custom/40 transition-all duration-300" 
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-yellow-custom border-4 border-yellow-custom/20 shadow-lg group-hover:border-yellow-custom/40 transition-all duration-300 flex items-center justify-center">
                          <span className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
                            {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div className="flex justify-center items-center mt-8 gap-4">
            <button className="testimonial-prev w-10 h-10 bg-white hover:bg-yellow-custom text-gray-600 hover:text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="testimonial-pagination"></div>
            <button className="testimonial-next w-10 h-10 bg-white hover:bg-yellow-custom text-gray-600 hover:text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection