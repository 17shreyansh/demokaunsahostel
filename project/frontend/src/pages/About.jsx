import { useState, useEffect } from 'react'
import { pageAPI } from '../services/api'

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

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-12 h-12 bg-yellow-custom rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{content.about?.mission?.title || 'Our Mission'}</h3>
                <p className="text-gray-700">
                  {content.about?.mission?.content || 'To provide safe, comfortable, and affordable accommodation solutions that enable students to focus on their education and personal growth while building lasting connections.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-12 h-12 bg-yellow-custom rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{content.about?.vision?.title || 'Our Vision'}</h3>
                <p className="text-gray-700">
                  {content.about?.vision?.content || 'To be the leading student accommodation provider in Greater Noida, known for quality, safety, and community building that transforms student living experiences.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-custom">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {content.about?.cta?.title || 'Ready to Find Your Perfect Stay?'}
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            {content.about?.cta?.subtitle || 'Join thousands of students who have made StayNest their home away from home. Experience the difference.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={content.about?.cta?.primaryButton?.link || '/hostels'} className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {content.about?.cta?.primaryButton?.text || 'Explore Hostels'}
            </a>
            <a href={content.about?.cta?.secondaryButton?.link || 'tel:+919876543210'} className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {content.about?.cta?.secondaryButton?.text || 'Call Now'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About