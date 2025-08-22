import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const TestimonialsSection = ({ content }) => {
  const testimonials = content?.items || []

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-custom rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{content?.title || 'What Our Residents Say'}</h2>
          <p className="text-lg text-gray-600 mt-2">{content?.subtitle || 'We are proud to be a home away from home.'}</p>
          <div className="mt-4 w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
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
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 md:p-10 mx-2 group hover:-translate-y-2 border border-gray-100">
                  {/* Quote Icon */}
                  <div className="text-yellow-custom/20 text-6xl font-serif mb-4 leading-none">"</div>
                  
                  {/* Rating */}
                  <div className="flex justify-start mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-custom text-xl mr-1 transform group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 100}ms`}}>★</span>
                    ))}
                  </div>
                  
                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 text-lg md:text-xl leading-relaxed mb-8 font-medium italic relative">
                    {testimonial.text}
                  </blockquote>
                  
                  {/* Author Info */}
                  <div className="flex items-center">
                    <div className="relative">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-yellow-custom/20 shadow-lg group-hover:border-yellow-custom/40 transition-all duration-300" 
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-custom border-4 border-yellow-custom/20 shadow-lg group-hover:border-yellow-custom/40 transition-all duration-300 flex items-center justify-center">
                          <span className="text-white text-2xl md:text-3xl font-bold">
                            {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm md:text-base font-medium">{testimonial.role}</p>
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