import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="KaunsaHostel Logo" className="h-10 mr-2 bg-white rounded-md p-1" />
            </Link>
            <p className="text-gray-400">The easiest way to find your next hostel in Greater Noida. We provide a home away from home for students and professionals.</p>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-yellow-custom">Home</Link></li>
              <li><Link to="/hostels" className="text-gray-400 hover:text-yellow-custom">Hostels</Link></li>
              <li><a href="#services" className="text-gray-400 hover:text-yellow-custom">Services</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-yellow-custom">Testimonials</a></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-yellow-custom">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-yellow-custom">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-custom">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-custom">Disclaimer</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4">Stay Updated</h5>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest listings.</p>
            <form>
              <div className="flex">
                <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none" />
                <button type="submit" className="bg-yellow-custom text-gray-900 font-bold px-4 py-2 rounded-r-lg hover:bg-yellow-500">
                  →
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; 2024 KaunsaHostel. All Rights Reserved. Designed with ❤️ in India.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer