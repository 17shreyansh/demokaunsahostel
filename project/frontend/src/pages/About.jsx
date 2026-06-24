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
      <section className="bg-gray-900 py-28 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-custom rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              {content.about?.title || 'About KaunsaHostel'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
              {content.about?.subtitle || 'Your trusted partner in finding the perfect accommodation in Greater Noida'}
            </p>
            <div className="w-32 h-1.5 bg-gradient-to-r from-yellow-custom to-yellow-500 mx-auto rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative -mt-10 z-20 rounded-t-[3rem] shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Students Choose Us</h2>
            <div className="w-20 h-1.5 bg-yellow-custom mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:shadow-2xl hover:border-yellow-custom/30 hover:-translate-y-2 transition-all duration-300 transform-gpu"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-3">{stat.number}</div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm mb-3 block">Discover Our Roots</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.about?.story?.title || 'Our Story'}
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-yellow-custom to-yellow-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-custom/20 to-transparent transform -rotate-2 rounded-[2.5rem]"></div>
                <div className="relative bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-10">
                    {content.about?.story?.content || 'KaunsaHostel was founded with a vision to revolutionize student living in Greater Noida. We understand the challenges students face when looking for safe, comfortable, and affordable accommodation. Our mission is to provide more than just a place to stay - we create communities where students can thrive academically and personally.'}
                  </p>

                  <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 shadow-sm">
                    <div className="w-14 h-14 bg-yellow-custom rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                      <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Our Core Promise</h4>
                      <p className="text-gray-600">Creating homes, not just accommodations. Fostering environments where students succeed.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {values.map((value, index) => (
                  <div key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-5 mb-4">
                      <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-yellow-custom group-hover:text-gray-900 transition-colors shadow-sm">
                        {index + 1}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">{value.title}</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-[4.25rem] text-lg">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO & Leadership Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-bl-full opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-50 rounded-tr-full opacity-50 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="inline-block px-6 py-2 bg-yellow-custom/10 text-yellow-700 font-bold tracking-wide rounded-full text-sm mb-6 border border-yellow-custom/20">
                MEET THE VISIONARY
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                {content.leadership?.title || 'Leadership Excellence'}
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-yellow-custom to-yellow-500 mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                {content.leadership?.subtitle || 'Meet the visionary transforming student accommodation in Greater Noida'}
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
              {/* Founder Image Section (Takes up 2 columns on lg) */}
              <div className="order-1 lg:col-span-2 relative mt-10 lg:mt-0">
                <div className="relative group mx-auto max-w-sm lg:max-w-none perspective-1000">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-custom/30 to-yellow-custom/5 rounded-[2.5rem] transform rotate-3 group-hover:rotate-2 transition-transform duration-500 ease-out"></div>
                  <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl transform -rotate-1 group-hover:rotate-0 transition-all duration-500 flex flex-col items-center border border-gray-100">
                    <div className="w-full relative overflow-hidden rounded-[1.5rem] mb-6">
                      <img
                        src={content.leadership?.ceo?.image ? `${import.meta.env.VITE_API_URL}${content.leadership.ceo.image}` : founderImage}
                        alt="Founder & CEO"
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    <div className="text-center w-full pb-2">
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        {content.leadership?.ceo?.name || 'Founder Name'}
                      </h3>
                      <p className="text-yellow-600 font-bold text-lg uppercase tracking-wider">
                        {content.leadership?.ceo?.position || 'CEO & Founder'}
                      </p>
                    </div>
                    
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-custom/30 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-custom/20 rounded-full blur-xl pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Content Section (Takes up 3 columns on lg) */}
              <div className="order-2 lg:col-span-3 space-y-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                  <div className="grid sm:grid-cols-2 gap-6 mb-10">
                    <div className="bg-gray-50/80 hover:bg-gray-50 p-6 rounded-2xl transition-colors border border-gray-100/50">
                      <div className="w-12 h-12 bg-yellow-custom/20 text-yellow-700 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Experience</h4>
                      <p className="text-gray-600">
                        {content.leadership?.ceo?.experience || '15+ years in hospitality and real estate'}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 hover:bg-gray-50 p-6 rounded-2xl transition-colors border border-gray-100/50">
                      <div className="w-12 h-12 bg-yellow-custom/20 text-yellow-700 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Vision</h4>
                      <p className="text-gray-600">
                        {content.leadership?.ceo?.vision || 'Transforming student living with innovation'}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-10 text-lg">
                    {content.leadership?.ceo?.bio || 'Passionate about transforming student living experiences with innovative solutions and exceptional service quality. Committed to creating safe, comfortable, and affordable accommodation that feels like home.'}
                  </p>

                  {content.leadership?.ceo?.quote && (
                    <div className="relative mb-10 bg-gray-50 rounded-2xl p-6 border-l-4 border-yellow-custom">
                      <svg className="absolute -top-4 -left-4 w-10 h-10 text-yellow-custom/30 transform -scale-x-100" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path></svg>
                      <blockquote className="relative z-10 text-xl font-medium italic text-gray-800 pl-4">
                        "{content.leadership.ceo.quote}"
                      </blockquote>
                    </div>
                  )}

                  {content.leadership?.ceo?.achievements && content.leadership.ceo.achievements.length > 0 && (
                    <div className="pt-8 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 text-xl">Key Achievements</h4>
                      <ul className="grid sm:grid-cols-2 gap-4">
                        {content.leadership.ceo.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="w-8 h-8 bg-yellow-custom/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-custom transition-colors">
                              <svg className="w-4 h-4 text-yellow-700 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="text-gray-700 font-medium pt-1">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-custom/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Ready to Connect?</h4>
                  <p className="text-gray-300 mb-8 text-lg relative z-10">
                    Have questions about our services or want to learn more about our vision?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <a href="/contact" className="bg-yellow-custom text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors transform-gpu hover:-translate-y-1 shadow-lg shadow-yellow-custom/30 text-lg">
                      Get in Touch
                    </a>
                    <a href="/hostels" className="bg-transparent text-white px-8 py-4 rounded-xl font-bold border-2 border-gray-700 hover:border-white hover:bg-white hover:text-gray-900 transition-all transform-gpu hover:-translate-y-1 text-lg">
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
        <section className="py-24 bg-gray-50 relative border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                {content.mission?.content && (
                  <div className="bg-white rounded-[2.5rem] shadow-xl p-10 lg:p-12 hover:-translate-y-2 transition-transform duration-500 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform shadow-sm">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        {content.mission?.title || 'Our Mission'}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {content.mission.content}
                      </p>
                    </div>
                  </div>
                )}

                {content.vision?.content && (
                  <div className="bg-white rounded-[2.5rem] shadow-xl p-10 lg:p-12 hover:-translate-y-2 transition-transform duration-500 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-8 transform rotate-3 group-hover:rotate-0 transition-transform shadow-sm">
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        {content.vision?.title || 'Our Vision'}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {content.vision.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-yellow-custom relative overflow-hidden">
        {/* Subtle patterned overlay could go here via pseudo-element if desired */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of students who have made KaunsaHostel their home away from home. Experience the difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="/hostels" className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors transform-gpu hover:-translate-y-1 shadow-xl shadow-gray-900/20 text-lg">
              Explore Hostels
            </a>
            <a href="/contact" className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold border-2 border-transparent hover:border-gray-900 hover:bg-transparent transition-all transform-gpu hover:-translate-y-1 shadow-lg text-lg">
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