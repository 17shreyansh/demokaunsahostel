import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { pageAPI } from '../services/api'
import logo from '../assets/logo.png'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210')
  const location = useLocation()

  useEffect(() => {
    fetchPhoneNumber()
  }, [])

  const fetchPhoneNumber = async () => {
    try {
      const response = await pageAPI.getPageContent('contact')
      const phone = response.data.content?.contact?.contactInfo?.phone
      if (phone) setPhoneNumber(phone)
    } catch (error) {
      console.error('Error fetching phone number:', error)
    }
  }

  return (
    <header id="home" className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">

        <Link to="/" className="flex items-center group">
          <img src={logo} alt="KaunsaHostel Logo" className="h-11 transition-transform duration-300 group-hover:scale-105" />
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`nav-link font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
            location.pathname === '/' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:text-yellow-custom hover:bg-yellow-50'
          }`}>Home</Link>
          <Link to="/hostels" className={`nav-link font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
            location.pathname === '/hostels' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:text-yellow-custom hover:bg-yellow-50'
          }`}>Hostels</Link>
          <Link to="/about" className={`nav-link font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
            location.pathname === '/about' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:text-yellow-custom hover:bg-yellow-50'
          }`}>About</Link>
          <Link to="/contact" className={`nav-link font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
            location.pathname === '/contact' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:text-yellow-custom hover:bg-yellow-50'
          }`}>Contact</Link>
        </div>
        
        <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hidden md:flex items-center bg-black text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          {phoneNumber}
        </a>

        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-yellow-custom focus:outline-none p-2 rounded-lg hover:bg-yellow-50 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 pt-4 pb-6 space-y-2">
          <Link to="/" className={`block nav-link font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            location.pathname === '/' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-custom'
          }`}>Home</Link>
          <Link to="/hostels" className={`block nav-link font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            location.pathname === '/hostels' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-custom'
          }`}>Hostels</Link>
          <Link to="/about" className={`block nav-link font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            location.pathname === '/about' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-custom'
          }`}>About</Link>
          <Link to="/contact" className={`block nav-link font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            location.pathname === '/contact' 
              ? 'text-yellow-custom bg-yellow-50 border border-yellow-200' 
              : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-custom'
          }`}>Contact</Link>
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex items-center justify-center bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300 mt-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {phoneNumber}
          </a>
        </div>
      )}
    </header>
  )
}

export default Header