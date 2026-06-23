import { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageAPI } from '../services/api';
import founderImage from '../assets/founder_image.png';

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS (Prevents Memory Reallocation)                               */
/* -------------------------------------------------------------------------- */
const FALLBACK_STATS = [
  { number: '500+', label: 'Happy Students' },
  { number: '50+', label: 'Premium Hostels' },
  { number: '5+', label: 'Years Experience' },
  { number: '24/7', label: 'Support Available' }
];

const FALLBACK_VALUES = [
  { title: 'Safety First', description: 'Your security is our top priority with 24/7 surveillance and secure access' },
  { title: 'Quality Living', description: 'Premium amenities and comfortable spaces for the best student experience' },
  { title: 'Community', description: 'Building connections and lifelong friendships in our vibrant communities' },
  { title: 'Innovation', description: 'Modern solutions and smart technology for contemporary living needs' }
];

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const About = memo(() => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchContent = async () => {
      try {
        const response = await pageAPI.getPageContent('about', {
          signal: abortController.signal
        });

        if (!abortController.signal.aborted) {
          setContent(response.data.content || {});
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching about content:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" aria-busy="true">
        {/* GPU-Accelerated Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-custom transform-gpu will-change-transform"></div>
      </div>
    );
  }

  // Derive arrays once per render using static fallbacks
  const stats = content.about?.stats || FALLBACK_STATS;
  const values = content.about?.values || FALLBACK_VALUES;

  return (
    <div className="bg-white">
      <Helmet>
        <title>About Us | KaunsaHostel - Revolutionizing Student Living</title>
        <meta name="description" content="Learn about KaunsaHostel's mission to provide premium, safe, and affordable student accommodation in Greater Noida. Meet our leadership team." />
        <link rel="canonical" href="https://kaunsahostel.com/about" />
        <meta property="og:title" content="About Us | KaunsaHostel" />
        <meta property="og:description" content="Learn about KaunsaHostel's mission to provide premium, safe, and affordable student accommodation in Greater Noida." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kaunsahostel.com/about" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-gray-900 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content.about?.title || 'About StayNest'}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {content.about?.subtitle || 'Your trusted partner in finding the perfect accommodation in Greater Noida'}
            </p>
            <div className="w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Students Choose Us</h2>
            <div className="w-16 h-1 bg-yellow-custom mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform-gpu will-change-transform"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {content.about?.story?.title || 'Our Story'}
              </h2>
              <div className="w-16 h-1 bg-yellow-custom mx-auto rounded"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Journey</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {content.about?.story?.content || 'StayNest was founded with a vision to revolutionize student living in Greater Noida. We understand the challenges students face when looking for safe, comfortable, and affordable accommodation. Our mission is to provide more than just a place to stay - we create communities where students can thrive academically and personally.'}
                  </p>

                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-custom rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Our Mission</h4>
                      <p className="text-gray-600">Creating homes, not just accommodations</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-custom">
                    <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO & Leadership Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-2 bg-yellow-custom text-gray-900 font-semibold rounded-full text-sm mb-6">
                CEO & Founder
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {content.leadership?.title || 'Leadership Excellence'}
              </h2>
              <div className="w-20 h-1 bg-yellow-custom mx-auto rounded mb-4"></div>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {content.leadership?.subtitle || 'Meet the visionary transforming student accommodation in Greater Noida'}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Founder Image Section */}
              <div className="order-2 lg:order-1">
                <div className="relative group max-w-md mx-auto lg:max-w-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-custom/20 to-yellow-custom/10 rounded-3xl transform rotate-3 group-hover:rotate-1 transition-transform duration-500 will-change-transform"></div>
                  <div className="relative bg-white p-4 md:p-6 rounded-3xl shadow-2xl transform -rotate-1 group-hover:rotate-0 transition-all duration-500 transform-gpu will-change-transform">
                    <img
                      src={content.leadership?.ceo?.image ? `${import.meta.env.VITE_API_URL}${content.leadership.ceo.image}` : founderImage}
                      alt="Founder & CEO"
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[4/5] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 transform-gpu will-change-transform"
                    />
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-custom/30 rounded-full blur-xl pointer-events-none"></div>
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-yellow-custom rounded-full opacity-80 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <div className="w-16 h-16 bg-yellow-custom rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                        {content.leadership?.ceo?.name || 'Founder Name'}
                      </h3>
                      <p className="text-yellow-600 font-semibold">
                        {content.leadership?.ceo?.position || 'CEO & Founder'}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Experience</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        {content.leadership?.ceo?.experience || '15+ years in hospitality and real estate'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Vision</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        {content.leadership?.ceo?.vision || 'Transforming student living with innovation and excellence'}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6 text-sm md:text-base">
                    {content.leadership?.ceo?.bio || 'Passionate about transforming student living experiences with innovative solutions and exceptional service quality. Committed to creating safe, comfortable, and affordable accommodation that feels like home.'}
                  </p>

                  {content.leadership?.ceo?.quote && (
                    <blockquote className="border-l-4 border-yellow-custom pl-4 md:pl-6 italic text-gray-600 mb-6 text-sm md:text-base">
                      "{content.leadership.ceo.quote}"
                    </blockquote>
                  )}

                  {content.leadership?.ceo?.achievements && content.leadership.ceo.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Key Achievements</h4>
                      <ul className="space-y-2">
                        {content.leadership.ceo.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-yellow-custom rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm md:text-base">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-r from-yellow-custom to-yellow-400 rounded-2xl p-6 md:p-8 text-center">
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Ready to Connect?</h4>
                  <p className="text-gray-800 mb-6 text-sm md:text-base">
                    Have questions about our services or want to learn more about our vision?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="/contact" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors transform-gpu hover:-translate-y-1 will-change-transform text-sm md:text-base">
                      Get in Touch
                    </a>
                    <a href="/hostels" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold border-2 border-gray-900 hover:bg-gray-100 transition-colors transform-gpu hover:-translate-y-1 will-change-transform text-sm md:text-base">
                      View Properties
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      {(content.mission?.content || content.vision?.content) && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {content.mission?.content && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {content.mission?.title || 'Our Mission'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {content.mission.content}
                    </p>
                  </div>
                )}

                {content.vision?.content && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {content.vision?.title || 'Our Vision'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {content.vision.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-yellow-custom">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have made StayNest their home away from home. Experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/hostels" className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors transform-gpu hover:-translate-y-1 will-change-transform">
              Explore Hostels
            </a>
            <a href="/contact" className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold border-2 border-gray-900 hover:bg-gray-100 transition-colors transform-gpu hover:-translate-y-1 will-change-transform">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

About.displayName = 'About';

export default About;