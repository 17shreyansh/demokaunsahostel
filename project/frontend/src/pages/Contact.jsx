import { useState, useEffect } from 'react'
import { leadAPI, pageAPI } from '../services/api'
import { sanitizeFormData } from '../utils/sanitize'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '', company: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [content, setContent] = useState({})
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await pageAPI.getPageContent('contact')
      setContent(response.data.content || {})
    } catch (error) {
      console.error('Error fetching contact content:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const sanitizedData = sanitizeFormData(formData)
      await leadAPI.createContact(sanitizedData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', company: '' })
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {content.contact?.title || 'Get In Touch'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {content.contact?.subtitle || 'Have questions? We\'d love to hear from you. Book a visit today!'}
          </p>
          <div className="mt-6 w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-custom rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">{content.contact?.contactInfo?.phone || '+91 98765 43210'}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-custom rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">{content.contact?.contactInfo?.email || 'hello@staynest.com'}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-custom rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm">{content.contact?.contactInfo?.address || 'Main Office, Knowledge Park III, Greater Noida, Uttar Pradesh 201310'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required
                      placeholder="john.doe@example.com" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      required
                      placeholder="+91 12345 67890" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      required
                      placeholder="What can we help you with?" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    placeholder="Your company name (optional)" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="6" 
                    required
                    placeholder="Tell us about your requirements, questions, or how we can help you..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-custom focus:border-transparent transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-yellow-custom text-gray-900 font-bold py-4 px-8 rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                  
                  {success && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Message sent successfully! We'll get back to you soon.
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      {(content.contact?.socialLinks || []).length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Follow Us</h3>
            <div className="flex justify-center space-x-6">
              {content.contact.socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url || '#'} 
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 text-gray-600 hover:text-yellow-custom"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    {social.platform === 'facebook' && (
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    )}
                    {social.platform === 'twitter' && (
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    )}
                    {social.platform === 'instagram' && (
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.792 2.013 10.146 2 12.315 2z" clipRule="evenodd" />
                    )}
                    {social.platform === 'linkedin' && (
                      <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Contact