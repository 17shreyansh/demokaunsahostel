import { 
  FaHome, FaBed, FaShower, FaWifi, FaUtensils, FaLock, FaTshirt, 
  FaSnowflake, FaCar, FaDumbbell, FaBook, FaGamepad, FaCoffee, 
  FaStore, FaBus, FaHospital, FaBolt, FaTint, FaThermometerHalf, FaPhone 
} from 'react-icons/fa';

const iconMap = {
  FaHome, FaBed, FaShower, FaWifi, FaUtensils, FaLock, FaTshirt,
  FaSnowflake, FaCar, FaDumbbell, FaBook, FaGamepad, FaCoffee,
  FaStore, FaBus, FaHospital, FaBolt, FaTint, FaThermometerHalf, FaPhone
};

const ServicesSection = ({ content }) => {
  const services = content?.items || [
    { icon: 'FaWifi', title: 'High-Speed Wi-Fi', description: 'Stay connected with uninterrupted, high-speed internet for work and entertainment.' },
    { icon: 'FaUtensils', title: 'Homely Meals', description: 'Enjoy delicious and hygienic home-style food, prepared fresh every day.' },
    { icon: 'FaLock', title: '24/7 Security', description: 'Your safety is our priority. All our hostels are equipped with CCTV and security personnel.' }
  ]

  return (
    <section id="services" className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{content?.title || 'Amenities & Services'}</h2>
          <p className="text-lg text-gray-600 mt-2">{content?.subtitle || 'Everything you need for a comfortable and hassle-free stay.'}</p>
          <div className="mt-4 w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || FaHome;
            return (
              <div key={index} className="p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 cursor-pointer">
                <div className="flex justify-center mb-4 text-yellow-custom transform hover:scale-110 transition duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection