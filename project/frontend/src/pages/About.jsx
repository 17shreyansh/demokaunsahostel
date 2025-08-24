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

      {/* CEO & Leadership Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-2 bg-yellow-custom text-gray-900 font-semibold rounded-full text-sm mb-6">
                CEO & Founder
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Leadership Excellence</h2>
              <div className="w-20 h-1 bg-yellow-custom mx-auto rounded mb-4"></div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Meet the visionary transforming student accommodation in Greater Noida</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              {/* Images Section */}
              <div className="lg:col-span-1 space-y-16">
                {/* First Image - Left Aligned */}
                <div className="relative group">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-2xl transform rotate-2 group-hover:rotate-0 transition-all duration-500">
                    <img 
                      src="/src/assets/photo 1.jpg" 
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
                      src="/src/assets/photo 2.jpg" 
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
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Pioneering Student-Centric Solutions
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    Our CEO brings years of experience in understanding student needs and creating innovative accommodation solutions. With a passion for excellence and community building, the leadership at Kaunsa Hostel ensures every student finds not just a place to stay, but a home to thrive.
                  </p>
                  
                  <div className="bg-gray-50 border-l-4 border-yellow-custom p-6 rounded-r-xl mb-8">
                    <blockquote className="text-lg italic text-gray-800 mb-3">
                      "We believe in creating spaces where students don't just live, but flourish. Every decision we make is centered around building communities that support academic success and personal growth."
                    </blockquote>
                    <cite className="text-gray-600 font-medium text-sm">— Founder & CEO</cite>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-yellow-custom rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">5+</div>
                      <div className="text-gray-800 text-sm font-medium">Years Experience</div>
                    </div>
                    <div className="text-center p-6 bg-white border-2 border-yellow-custom rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">2000+</div>
                      <div className="text-gray-700 text-sm font-medium">Students Served</div>
                    </div>
                    <div className="text-center p-6 bg-gray-100 rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
                      <div className="text-gray-700 text-sm font-medium">Properties</div>
                    </div>
                  </div>
                </div>
                
                {/* Vision Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-yellow-custom rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    Our Vision
                  </h4>
                  <p className="text-gray-700">To revolutionize student accommodation by creating safe, comfortable, and inspiring living spaces that foster academic excellence and lifelong friendships across India.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
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