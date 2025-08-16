const About = () => {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About KaunsaHostel</h1>
          <p className="text-xl text-gray-600">Your trusted partner in finding the perfect accommodation in Greater Noida</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-yellow-custom mb-4">Our Story</h3>
          <p className="text-gray-700 mb-4">
            KaunsaHostel was founded with a simple mission: to help students and working professionals 
            find safe, affordable, and comfortable accommodation in Greater Noida. We understand the 
            challenges of relocating to a new city and the importance of having a home away from home.
          </p>
          <p className="text-gray-700">
            With years of experience in the hospitality industry, we have carefully curated a network 
            of verified hostels and PGs that meet our high standards of quality, safety, and affordability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h5 className="text-lg font-semibold mb-2">Safety First</h5>
            <p className="text-gray-600">All our partner hostels are verified for safety standards with 24/7 security and CCTV surveillance.</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h5 className="text-lg font-semibold mb-2">Affordable Pricing</h5>
            <p className="text-gray-600">We ensure transparent pricing with no hidden costs, making quality accommodation accessible to all.</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎧</div>
            <h5 className="text-lg font-semibold mb-2">24/7 Support</h5>
            <p className="text-gray-600">Our dedicated support team is available round the clock to assist you with any queries or concerns.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-yellow-custom mb-6">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-3">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Verified Properties</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Transparent Pricing</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Quality Assurance</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Easy Booking Process</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> 24/7 Customer Support</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Multiple Location Options</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Flexible Terms</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> Community Building</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About