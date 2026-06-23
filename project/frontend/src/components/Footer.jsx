import { Link } from 'react-router-dom'
import { useState, useEffect, memo } from 'react'
import { pageAPI } from '../services/api'
import logo from '../assets/logo-white.png'

const Footer = memo(() => {
  const [contactInfo, setContactInfo] = useState({})

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const cached = localStorage.getItem('kaunsa_contact_info')
      if (cached) {
        setContactInfo(JSON.parse(cached))
      }
      
      const response = await pageAPI.getPageContent('contact')
      const info = response.data.content?.contact?.contactInfo || {}
      setContactInfo(info)
      localStorage.setItem('kaunsa_contact_info', JSON.stringify(info))
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }
  return (
    <footer className="bg-gradient-to-br from-[#0a1929] via-[#001e3c] to-[#0a1929] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-6 group">
              <img src={logo} alt="Kaunsa Hostel Logo" loading="lazy" decoding="async" className="h-20 sm:h-24 w-auto group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-gray-200 leading-relaxed mb-6">
              Your trusted partner in finding premium hostels in Greater Noida. We create comfortable, safe, and vibrant communities for students and professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-xl mb-6 text-yellow-custom">Quick Links</h5>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>Home</Link></li>
              <li><Link to="/hostels" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>All Hostels</Link></li>
              <li><Link to="/about" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>About Us</Link></li>
              <li><Link to="/contact" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>Contact Us</Link></li>
              <li><Link to="/blog" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>Blog</Link></li>
            </ul>
          </div>

          {/* For Hostel Owners */}
          <div>
            <h5 className="font-bold text-xl mb-6 text-yellow-custom">For Hostel Owners</h5>
            <ul className="space-y-3">
              <li><Link to="/hostel-manager/auth?mode=register" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>Register Your Hostel</Link></li>
              <li><Link to="/hostel-manager/auth?mode=login" className="text-gray-200 hover:text-yellow-custom hover:translate-x-1 transition-all duration-200 flex items-center group"><span className="w-2 h-2 bg-yellow-custom rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>Hostel Owner Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="font-bold text-xl mb-6 text-yellow-custom">Contact Info</h5>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-custom mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-200">{contactInfo.address || 'Greater Noida, Uttar Pradesh, India'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-custom flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-200">{contactInfo.phone || '+91 73032 69615'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-custom flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-200">{contactInfo.email || 'support@kaunsahostel.com'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-bold text-xl mb-6 text-yellow-custom">Stay Updated</h5>
            <p className="text-gray-200 mb-6">Get the latest hostel listings and exclusive offers.</p>
            <form className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 rounded-lg bg-[#001e3c] border border-blue-900/30 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-custom focus:ring-2 focus:ring-yellow-custom/20 transition-all" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-yellow-custom text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Subscribe</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-blue-900/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} Kaunsa Hostel. All Rights Reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-yellow-custom transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-yellow-custom transition-colors">Terms of Service</Link>
              <Link to="/refund" className="hover:text-yellow-custom transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
)

Footer.displayName = 'Footer'

export default Footer