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
    <section id="services" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{content?.title || 'Amenities & Services'}</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2 px-4">{content?.subtitle || 'Everything you need for a comfortable and hassle-free stay.'}</p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || FaHome;
            return (
              <div key={index} className="p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 cursor-pointer">
                <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4 text-yellow-custom transform hover:scale-110 transition duration-300">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{service.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection