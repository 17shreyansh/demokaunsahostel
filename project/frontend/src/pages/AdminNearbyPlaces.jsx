import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import InteractiveMap from '../components/InteractiveMap'
import { MapPin, Plus, Edit2, Trash2, X, Map, Loader2 } from 'lucide-react'

const AdminNearbyPlaces = () => {
  const { isDark } = useTheme()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 })
  const [categories, setCategories] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [coordinatesInput, setCoordinatesInput] = useState('')

  useEffect(() => {
    fetchPlaces()
    fetchCategories()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces`)
      const data = await response.json()
      setPlaces(data)
    } catch (error) {
      alert('Failed to fetch places')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/categories`)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleAdd = () => {
    setEditingPlace(null)
    setMapCoordinates({ lat: 28.6139, lng: 77.2090 })
    setSelectedCategory('')
    setCoordinatesInput('')
    setModalVisible(true)
  }

  const handleEdit = (place) => {
    setEditingPlace(place)
    setMapCoordinates(place.mapCoordinates)
    setSelectedCategory(place.category)
    setCoordinatesInput(`${place.mapCoordinates.lat}, ${place.mapCoordinates.lng}`)
    setModalVisible(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.target)
      const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        type: formData.get('type'),
        coordinates: coordinatesInput,
        mapCoordinates
      }

      const url = editingPlace 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/${editingPlace._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces`
      
      const method = editingPlace ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        alert(`Place ${editingPlace ? 'updated' : 'created'} successfully`)
        setModalVisible(false)
        fetchPlaces()
      } else {
        alert('Failed to save place')
      }
    } catch (error) {
      alert('Failed to save place')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        alert('Place deleted successfully')
        fetchPlaces()
      } else {
        alert('Failed to delete place')
      }
    } catch (error) {
      alert('Failed to delete place')
    }
  }

  const handleCoordinatesChange = (value) => {
    setCoordinatesInput(value)
    const coords = value.split(',')
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim())
      const lng = parseFloat(coords[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCoordinates({ lat, lng })
      }
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      office: 'IT Parks & Offices',
      educational: 'Educational',
      transportation: 'Transportation',
      shopping: 'Shopping',
      healthcare: 'Healthcare',
      entertainment: 'Entertainment',
      restaurant: 'Restaurant & Food',
      banking: 'Banking & Finance'
    }
    return labels[category] || category
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      
      {/* Header Section */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight transition-colors mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nearby Places
            </h1>
            <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage POIs, IT Parks, and Educational Institutions for distance calculation.
            </p>
          </div>
          <button 
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] shadow-sm flex-shrink-0"
          >
            <Plus size={18} />
            Add New Place
          </button>
        </div>
      </div>

      {/* Places Table Container */}
      <div className={`max-w-[1600px] mx-auto transition-all duration-300 rounded-2xl border shadow-sm overflow-hidden flex flex-col min-h-[400px] ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading places...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'
            }`}>
              <Map size={32} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <h3 className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No places found</h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Add a new place to start populating the map.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm transition-colors duration-300 border-collapse" style={{ borderColor: isDark ? '#1f2937' : '#e5e7eb' }}>
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                <tr>
                  <th className={`px-6 py-3.5 text-left font-semibold tracking-tight ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Name</th>
                  <th className={`px-6 py-3.5 text-left font-semibold tracking-tight ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Category</th>
                  <th className={`px-6 py-3.5 text-left font-semibold tracking-tight ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Type</th>
                  <th className={`px-6 py-3.5 text-right font-semibold tracking-tight ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-gray-800 bg-gray-900' : 'divide-gray-100 bg-white'}`}>
                {places.map((place) => (
                  <tr key={place._id} className={`group transition-colors ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                        {place.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset ${
                        isDark 
                          ? 'bg-blue-500/10 text-blue-400 ring-blue-500/20' 
                          : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      }`}>
                        {getCategoryLabel(place.category)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {place.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(place)}
                          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                            isDark 
                              ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800 focus:ring-blue-500' 
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
                          }`}
                          title="Edit Place"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(place._id)}
                          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                            isDark 
                              ? 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 focus:ring-rose-500' 
                              : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 focus:ring-rose-500'
                          }`}
                          title="Delete Place"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setModalVisible(false)}
        >
          <div 
            className={`rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border animate-in zoom-in-95 duration-200 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b transition-colors" style={{ borderColor: isDark ? '#1f2937' : '#f3f4f6' }}>
              <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPlace ? 'Edit Property Location' : 'Add New Location'}
              </h2>
              <button
                onClick={() => setModalVisible(false)}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 focus:ring-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-gray-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPlace?.name || ''}
                  placeholder="e.g., DLF Cyber City"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none ${
                      isDark 
                        ? 'bg-gray-950 border-gray-800 text-white focus:bg-black' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                    }`}
                  >
                    <option value="">Select category</option>
                    {Object.keys(categories).map(category => (
                      <option key={category} value={category}>{getCategoryLabel(category)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type / Specialty
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={editingPlace?.type || ''}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none ${
                      isDark 
                        ? 'bg-gray-950 border-gray-800 text-white focus:bg-black' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                    }`}
                  >
                    <option value="">Select type</option>
                    {selectedCategory && categories[selectedCategory] && categories[selectedCategory].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-2">
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  GPS Coordinates
                </label>
                <input
                  type="text"
                  value={coordinatesInput}
                  onChange={(e) => handleCoordinatesChange(e.target.value)}
                  placeholder="e.g., 28.6139, 77.2090"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 mb-3 ${
                    isDark 
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                  }`}
                />
                
                <div className={`text-xs font-medium mb-3 flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  <MapPin size={14} /> Click the map below to drop a pin automatically.
                </div>
                
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <InteractiveMap
                    coordinates={mapCoordinates}
                    onCoordinatesChange={(coords) => {
                      setMapCoordinates(coords)
                      setCoordinatesInput(`${coords.lat}, ${coords.lng}`)
                    }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t mt-6 transition-colors" style={{ borderColor: isDark ? '#1f2937' : '#f3f4f6' }}>
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-700' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingPlace ? 'Save Changes' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNearbyPlaces