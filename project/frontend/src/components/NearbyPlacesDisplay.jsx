import { useState, useEffect } from 'react'
import { FaGraduationCap, FaBuilding, FaBus, FaShoppingCart, FaHospital, FaFilm, FaUtensils, FaUniversity } from 'react-icons/fa'

const NearbyPlacesDisplay = ({ hostelCoordinates, hostelNearbyPlaces }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let hasPlaces = false;
    const flatPlaces = []
    
    if (hostelNearbyPlaces) {
      Object.entries(hostelNearbyPlaces).forEach(([category, places]) => {
        if (Array.isArray(places) && places.length > 0) {
          hasPlaces = true;
          places.forEach(place => {
            flatPlaces.push({ ...place, category })
          })
        }
      })
    }

    if (hasPlaces) {
      setNearbyPlaces(flatPlaces)
      setLoading(false)
    } else if (hostelCoordinates?.lat && hostelCoordinates?.lng) {
      fetchNearbyPlaces()
    } else {
      setLoading(false)
    }
  }, [hostelCoordinates, hostelNearbyPlaces])

  const fetchNearbyPlaces = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${hostelCoordinates.lat}&lng=${hostelCoordinates.lng}`
      )
      const data = await response.json()
      setNearbyPlaces(data)
    } catch (error) {
      console.error('Error fetching nearby places:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (category) => {
    const categoryMap = {
      educational: { 
        name: 'Educational Institutions', 
        icon: FaGraduationCap, 
        color: 'yellow',
        bgColor: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-500'
      },
      office: { 
        name: 'IT Parks & Offices', 
        icon: FaBuilding, 
        color: 'blue',
        bgColor: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-500'
      },
      transportation: { 
        name: 'Transportation', 
        icon: FaBus, 
        color: 'green',
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-500'
      },
      shopping: { 
        name: 'Shopping', 
        icon: FaShoppingCart, 
        color: 'purple',
        bgColor: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-200',
        dotColor: 'bg-purple-500'
      },
      healthcare: { 
        name: 'Healthcare', 
        icon: FaHospital, 
        color: 'red',
        bgColor: 'from-red-50 to-pink-50',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-500'
      },
      entertainment: { 
        name: 'Entertainment', 
        icon: FaFilm, 
        color: 'indigo',
        bgColor: 'from-indigo-50 to-purple-50',
        borderColor: 'border-indigo-200',
        dotColor: 'bg-indigo-500'
      },
      restaurant: { 
        name: 'Restaurants & Food', 
        icon: FaUtensils, 
        color: 'orange',
        bgColor: 'from-orange-50 to-red-50',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-500'
      },
      banking: { 
        name: 'Banking & Finance', 
        icon: FaUniversity, 
        color: 'teal',
        bgColor: 'from-teal-50 to-cyan-50',
        borderColor: 'border-teal-200',
        dotColor: 'bg-teal-500'
      }
    }
    return categoryMap[category] || {
      name: category,
      icon: FaBuilding,
      color: 'gray',
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      dotColor: 'bg-gray-500'
    }
  }

  const groupedPlaces = nearbyPlaces.reduce((acc, place) => {
    if (!acc[place.category]) {
      acc[place.category] = []
    }
    acc[place.category].push(place)
    return acc
  }, {})

  // Sort categories by priority
  const categoryOrder = ['educational', 'office', 'transportation', 'shopping', 'healthcare', 'entertainment', 'restaurant', 'banking']
  const sortedCategories = Object.keys(groupedPlaces).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mx-auto mb-2"></div>
        <p className="text-gray-600">Loading nearby places...</p>
      </div>
    )
  }

  if (nearbyPlaces.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📍</div>
        <p className="text-gray-600">No nearby places found for this location.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedCategories.map(category => {
        const places = groupedPlaces[category]
        const categoryInfo = getCategoryInfo(category)
        const sortedPlaces = places.sort((a, b) => {
          const aDistance = parseFloat(String(a.distance).replace(/[^\\d.-]/g, '')) || 999
          const bDistance = parseFloat(String(b.distance).replace(/[^\\d.-]/g, '')) || 999
          return aDistance - bDistance
        })

        return (
          <div 
            key={category} 
            className={`bg-gradient-to-br ${categoryInfo.bgColor} p-6 rounded-xl border ${categoryInfo.borderColor}`}
          >
            <div className="flex items-center mb-4">
              <div className={`bg-${categoryInfo.color}-500 p-2 rounded-lg mr-3 text-white`}>
                <categoryInfo.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{categoryInfo.name}</h4>
                <p className="text-sm text-gray-600">{places.length} locations</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {sortedPlaces.map((place, index) => (
                <div key={place._id || index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={`w-2 h-2 ${categoryInfo.dotColor} rounded-full mr-3 flex-shrink-0`}></span>
                    <span className="text-gray-700 text-sm truncate" title={place.name}>{place.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{place.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NearbyPlacesDisplay