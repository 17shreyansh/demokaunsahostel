import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import InteractiveMap from '../components/InteractiveMap'

const AdminNearbyPlaces = () => {
  const { isDark } = useTheme()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 })

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/nearbyplaces')
      const data = await response.json()
      setPlaces(data)
    } catch (error) {
      alert('Failed to fetch places')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPlace(null)
    setMapCoordinates({ lat: 28.6139, lng: 77.2090 })
    setModalVisible(true)
  }

  const handleEdit = (place) => {
    setEditingPlace(place)
    setMapCoordinates(place.mapCoordinates)
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
        mapCoordinates
      }

      const url = editingPlace 
        ? `http://localhost:5000/api/nearbyplaces/${editingPlace._id}`
        : 'http://localhost:5000/api/nearbyplaces'
      
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
      const response = await fetch(`http://localhost:5000/api/nearbyplaces/${id}`, {
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

  const officeTypes = ['IT Park', 'Office Complex', 'Tech Hub', 'Business Center', 'Corporate Office']
  const educationalTypes = ['University', 'College', 'Institute', 'School', 'Training Center']

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Nearby Places Management</h1>
            <p className={`transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage IT Parks, Offices & Educational Institutions</p>
          </div>
          <button 
            onClick={handleAdd}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } shadow-lg hover:shadow-xl`}
          >
            <span className="mr-2">+</span>
            Add New Place
          </button>
        </div>
      </div>

      {/* Places Table */}
      <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Name</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Type</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {places.map((place) => (
                <tr key={place._id} className={`transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {place.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      place.category === 'office' 
                        ? isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800'
                        : isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                    }`}>
                      {place.category === 'office' ? 'IT Parks & Offices' : 'Educational'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {place.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(place)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(place._id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {places.length === 0 && !loading && (
          <div className={`text-center py-12 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p>No places found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPlace ? 'Edit Place' : 'Add New Place'}
              </h2>
              <button
                onClick={() => setModalVisible(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPlace?.name || ''}
                  placeholder="Enter place name"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Category
                </label>
                <select
                  name="category"
                  required
                  defaultValue={editingPlace?.category || ''}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select category</option>
                  <option value="office">IT Parks & Offices</option>
                  <option value="educational">Educational Institutions</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Type
                </label>
                <select
                  name="type"
                  required
                  defaultValue={editingPlace?.type || ''}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select type</option>
                  {officeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  {educationalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Map Location
                </label>
                <InteractiveMap
                  coordinates={mapCoordinates}
                  onCoordinatesChange={setMapCoordinates}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingPlace ? 'Update' : 'Create'}
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