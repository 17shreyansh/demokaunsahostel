import HostelCard from '../common/HostelCard'

const FeaturedHostels = ({ hostels, loading }) => {
  return (
    <section id="hostels" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Hostels</h2>
          <p className="text-lg text-gray-600 mt-2">Handpicked for your comfort and convenience.</p>
          <div className="mt-4 w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-custom"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {hostels.map((hostel) => (
              <HostelCard 
                key={hostel._id} 
                hostel={{
                  ...hostel,
                  image: hostel.images?.[0] ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${hostel.images[0]}` : null
                }} 
                variant="default" 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedHostels