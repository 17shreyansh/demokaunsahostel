import { useState, useEffect } from 'react'
import { pageAPI } from '../services/api'
import photo1 from '../assets/photo 1.jpg'
import photo2 from '../assets/photo 2.jpg'

const About = () => {
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await pageAPI.getPageContent('about')
      console.log('About page response:', response.data)
      setContent(response.data.content || {})
    } catch (error) {
      console.error('Error fetching about content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-custom"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
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
            {(content.about?.stats || [
              { number: '500+', label: 'Happy Students' },
              { number: '50+', label: 'Premium Hostels' },
              { number: '5+', label: 'Years Experience' },
              { number: '24/7', label: 'Support Available' }
            ]).map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
                {(content.about?.values || [
                  { title: 'Safety First', description: 'Your security is our top priority with 24/7 surveillance and secure access' },
                  { title: 'Quality Living', description: 'Premium amenities and comfortable spaces for the best student experience' },
                  { title: 'Community', description: 'Building connections and lifelong friendships in our vibrant communities' },
                  { title: 'Innovation', description: 'Modern solutions and smart technology for contemporary living needs' }
                ]).map((value, index) => (
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
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-2 bg-yellow-custom text-gray-900 font-semibold rounded-full text-sm mb-6">
                CEO & Founder
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.leadership?.title || 'Leadership Excellence'}
              </h2>
              <div className="w-20 h-1 bg-yellow-custom mx-auto rounded mb-4"></div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {content.leadership?.subtitle || 'Meet the visionary transforming student accommodation in Greater Noida'}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              {/* Images Section */}
              <div className="lg:col-span-1 space-y-16">
                {/* First Image - Left Aligned */}
                <div className="relative group">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-2xl transform rotate-2 group-hover:rotate-0 transition-all duration-500">
                    <img 
                      src={content.leadership?.ceo?.image1 ? `${import.meta.env.VITE_API_URL}${content.leadership.ceo.image1}` : photo1}
                      alt="CEO Portrait" 
                      className="w-full aspect-[3/4] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-custom/20 rounded-full blur-2xl"></div>
                  <div className="absolute -top-3 -left-3 w-12 h-12 bg-yellow-custom rounded-full opacity-80"></div>
                </div>
                
                {/* Second Image - Right Aligned */}
                <div className="relative group flex justify-end">
                  <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-3xl shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                    <img 
                      src={content.leadership?.ceo?.image2 ? `${import.meta.env.VITE_API_URL}${content.leadership.ceo.image2}` : photo2}
                      alt="CEO Professional" 
                      className="w-full aspect-[3/4] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-custom/25 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-yellow-custom rounded-full opacity-70"></div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-yellow-custom rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {content.leadership?.ceo?.name || 'CEO Name'}
                      </h3>
                      <p className="text-yellow-600 font-semibold">
                        {content.leadership?.ceo?.position || 'CEO & Founder'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                      <p className="text-gray-600">
                        {content.leadership?.ceo?.experience || '15+ years in hospitality and real estate'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                      <p className="text-gray-600">
                        {content.leadership?.ceo?.education || 'MBA from premier business school'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {content.leadership?.ceo?.bio || 'Passionate about transforming student living experiences with innovative solutions and exceptional service quality.'}
                  </p>
                  
                  {content.leadership?.ceo?.quote && (
                    <blockquote className="border-l-4 border-yellow-custom pl-6 italic text-gray-600 mb-6">
                      "{content.leadership.ceo.quote}"
                    </blockquote>
                  )}
                  
                  {content.leadership?.ceo?.achievements && content.leadership.ceo.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {content.leadership.ceo.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-yellow-custom rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Team Members */}
                {content.leadership?.team && content.leadership.team.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Leadership Team</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {content.leadership.team.map((member, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          {member.image ? (
                            <img 
                              src={`${import.meta.env.VITE_API_URL}${member.image}`}
                              alt={member.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <p className="text-yellow-600 text-sm font-medium mb-2">{member.position}</p>
                            <p className="text-gray-600 text-sm">{member.bio}</p>
                            {(member.linkedin || member.email) && (
                              <div className="flex space-x-3 mt-2">
                                {member.linkedin && (
                                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                )}
                                {member.email && (
                                  <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-gray-800">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            <a href="/hostels" className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Explore Hostels
            </a>
            <a href="/contact" className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold border-2 border-gray-900 hover:bg-gray-100 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About