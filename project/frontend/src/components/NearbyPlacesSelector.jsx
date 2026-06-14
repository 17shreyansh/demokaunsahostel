import { useState, useEffect, useCallback, useMemo } from 'react'
import { Select, List, Typography, Tag, message, Spin, Collapse, Button, Space, Alert } from 'antd'
import { DeleteOutlined, ReloadOutlined, EnvironmentOutlined, PlusOutlined, ClearOutlined } from '@ant-design/icons'
import { FaGraduationCap, FaBuilding, FaBus, FaShoppingCart, FaHospital, FaFilm, FaUtensils, FaUniversity } from 'react-icons/fa'

const { Title, Text } = Typography
const { Panel } = Collapse

const NearbyPlacesSelector = ({ coordinates, value = {}, onChange }) => {
  const [availablePlaces, setAvailablePlaces] = useState({})
  const [loading, setLoading] = useState(false)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastCalculatedCoords, setLastCalculatedCoords] = useState(null)
  
  const categories = useMemo(() => ({
    educational: { name: 'Educational Institutions', color: 'green', icon: FaGraduationCap },
    office: { name: 'IT Parks & Offices', color: 'blue', icon: FaBuilding },
    transportation: { name: 'Transportation', color: 'purple', icon: FaBus },
    shopping: { name: 'Shopping', color: 'orange', icon: FaShoppingCart },
    healthcare: { name: 'Healthcare', color: 'red', icon: FaHospital },
    entertainment: { name: 'Entertainment', color: 'magenta', icon: FaFilm },
    restaurant: { name: 'Restaurants & Food', color: 'volcano', icon: FaUtensils },
    banking: { name: 'Banking & Finance', color: 'cyan', icon: FaUniversity }
  }), [])

  // Normalize value to ensure all categories exist
  const normalizedValue = useMemo(() => {
    const normalized = { ...value }
    Object.keys(categories).forEach(category => {
      if (!normalized[category] || !Array.isArray(normalized[category])) {
        normalized[category] = []
      }
    })
    console.log('Normalized nearby places value:', normalized)
    return normalized
  }, [value, categories])

  // Fetch available places on mount
  useEffect(() => {
    fetchAvailablePlaces()
  }, [])

  // Calculate distances when coordinates change
  useEffect(() => {
    const hasCoordinates = coordinates?.lat && coordinates?.lng
    const coordsChanged = !lastCalculatedCoords || 
      lastCalculatedCoords.lat !== coordinates?.lat || 
      lastCalculatedCoords.lng !== coordinates?.lng
    
    if (hasCoordinates && coordsChanged && hasSelectedPlaces()) {
      calculateDistances()
    }
  }, [coordinates?.lat, coordinates?.lng, normalizedValue])

  // Helper function to check if any places are selected
  const hasSelectedPlaces = useCallback(() => {
    return Object.values(normalizedValue).some(places => places.length > 0)
  }, [normalizedValue])

  const fetchAvailablePlaces = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const promises = Object.keys(categories).map(async category => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces?category=${category}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${category} places: ${response.statusText}`)
        }
        return response.json()
      })
      
      const results = await Promise.all(promises)
      
      const placesData = {}
      Object.keys(categories).forEach((category, index) => {
        placesData[category] = Array.isArray(results[index]) ? results[index] : []
      })
      
      setAvailablePlaces(placesData)
      console.log('Available places loaded:', placesData)
    } catch (error) {
      console.error('Error fetching places:', error)
      setError(`Failed to load nearby places: ${error.message}`)
      message.error('Failed to fetch nearby places')
    } finally {
      setLoading(false)
    }
  }, [categories])

  const calculateDistances = useCallback(async () => {
    if (!coordinates?.lat || !coordinates?.lng) {
      console.warn('No coordinates provided for distance calculation')
      return
    }

    setDistanceLoading(true)
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}`
      )
      
      if (!response.ok) {
        throw new Error(`Distance calculation failed: ${response.statusText}`)
      }
      
      const placesWithDistances = await response.json()
      console.log('Distance calculation result:', placesWithDistances)
      
      const updatedValue = { ...normalizedValue }
      let hasUpdates = false
      
      Object.keys(categories).forEach(category => {
        if (updatedValue[category] && updatedValue[category].length > 0) {
          updatedValue[category] = updatedValue[category].map(place => {
            const withDistance = placesWithDistances.find(p => p._id === place._id)
            if (withDistance && withDistance.distance !== place.distance) {
              hasUpdates = true
              return { ...place, distance: withDistance.distance }
            }
            return place
          })
        }
      })
      
      if (hasUpdates) {
        onChange(updatedValue)
        setLastCalculatedCoords({ lat: coordinates.lat, lng: coordinates.lng })
        message.success('Distances updated successfully')
      }
    } catch (error) {
      console.error('Distance calculation error:', error)
      message.error(`Failed to calculate distances: ${error.message}`)
    } finally {
      setDistanceLoading(false)
    }
  }, [coordinates, normalizedValue, categories, onChange])

  const addPlace = useCallback(async (category, placeId) => {
    if (!category || !placeId) {
      console.error('Invalid category or placeId provided')
      return
    }

    const place = availablePlaces[category]?.find(p => p._id === placeId)
    const selectedPlaces = normalizedValue[category] || []
    
    if (!place) {
      message.error('Selected place not found')
      return
    }

    if (selectedPlaces.find(p => p._id === placeId)) {
      message.warning('This place is already selected')
      return
    }

    let updatedPlace = {
      _id: place._id,
      name: place.name,
      type: place.type,
      category: place.category,
      distance: null
    }
      
    // Calculate distance if coordinates are available
    if (coordinates?.lat && coordinates?.lng) {
      setDistanceLoading(true)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}`
        )
        
        if (response.ok) {
          const placesWithDistances = await response.json()
          const placeWithDistance = placesWithDistances.find(p => p._id === placeId)
          if (placeWithDistance) {
            updatedPlace.distance = placeWithDistance.distance
          }
        }
      } catch (error) {
        console.error('Distance calculation failed:', error)
        message.warning('Added place but could not calculate distance')
      } finally {
        setDistanceLoading(false)
      }
    }
      
    const newValue = {
      ...normalizedValue,
      [category]: [...selectedPlaces, updatedPlace]
    }
    
    console.log('Adding place:', updatedPlace, 'to category:', category)
    console.log('New value:', newValue)
    
    onChange(newValue)
    message.success(`Added ${place.name} to ${categories[category].name}`)
  }, [availablePlaces, normalizedValue, coordinates, categories, onChange])

  const removePlace = useCallback((category, placeId) => {
    if (!category || !placeId) {
      console.error('Invalid category or placeId provided')
      return
    }

    const selectedPlaces = normalizedValue[category] || []
    const placeToRemove = selectedPlaces.find(p => p._id === placeId)
    
    if (!placeToRemove) {
      message.warning('Place not found in selection')
      return
    }

    const newValue = {
      ...normalizedValue,
      [category]: selectedPlaces.filter(p => p._id !== placeId)
    }
    
    console.log('Removing place:', placeToRemove, 'from category:', category)
    console.log('New value:', newValue)
    
    onChange(newValue)
    message.success(`Removed ${placeToRemove.name} from ${categories[category].name}`)
  }, [normalizedValue, categories, onChange])

  const recalculateDistances = useCallback(() => {
    if (coordinates?.lat && coordinates?.lng) {
      calculateDistances()
    } else {
      message.warning('Please set hostel coordinates first')
    }
  }, [coordinates, calculateDistances])

  const fetchAllNearbyPlaces = useCallback(async () => {
    if (!coordinates?.lat || !coordinates?.lng) {
      message.warning('Please set hostel coordinates first')
      return
    }

    setLoading(true)
    
    try {
      // Fetch all places with distances
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch places: ${response.statusText}`)
      }
      
      const placesWithDistances = await response.json()
      console.log('Fetched all places with distances:', placesWithDistances)
      
      // Group places by category
      const groupedPlaces = {}
      Object.keys(categories).forEach(category => {
        groupedPlaces[category] = placesWithDistances
          .filter(place => place.category === category)
          .map(place => ({
            _id: place._id,
            name: place.name,
            type: place.type,
            category: place.category,
            distance: place.distance
          }))
      })
      
      console.log('Grouped places by category:', groupedPlaces)
      onChange(groupedPlaces)
      
      const totalCount = Object.values(groupedPlaces).reduce((sum, places) => sum + places.length, 0)
      message.success(`Successfully added ${totalCount} nearby places across all categories`)
    } catch (error) {
      console.error('Failed to fetch all nearby places:', error)
      message.error(`Failed to fetch nearby places: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [coordinates, categories, onChange])

  const clearAllPlaces = useCallback(() => {
    const emptyPlaces = {}
    Object.keys(categories).forEach(category => {
      emptyPlaces[category] = []
    })
    onChange(emptyPlaces)
    message.success('All nearby places cleared')
  }, [categories, onChange])

  const getTotalSelectedCount = useCallback(() => {
    return Object.values(normalizedValue).reduce((total, places) => total + places.length, 0)
  }, [normalizedValue])

  return (
    <div className="nearby-places-selector">
      {/* Header with controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <Title level={5} className="mb-0">
            Nearby Places Management
          </Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchAvailablePlaces}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button 
              icon={<PlusOutlined />} 
              onClick={fetchAllNearbyPlaces}
              loading={loading || distanceLoading}
              disabled={!coordinates?.lat}
              size="small"
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Fetch All Places
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={clearAllPlaces}
              disabled={!hasSelectedPlaces()}
              size="small"
              danger
            >
              Clear All
            </Button>
            <Button 
              icon={<EnvironmentOutlined />} 
              onClick={recalculateDistances}
              loading={distanceLoading}
              disabled={!coordinates?.lat || !hasSelectedPlaces()}
              size="small"
              type="primary"
            >
              Calculate Distances
            </Button>
          </Space>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total selected: {getTotalSelectedCount()} places</span>
          {coordinates?.lat && coordinates?.lng ? (
            <span className="text-green-600">
              Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </span>
          ) : (
            <span className="text-orange-600">No coordinates set</span>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          closable 
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Loading indicator */}
      {(loading || distanceLoading) && (
        <div className="text-center py-4">
          <Spin size="large" />
          <div className="mt-2 text-gray-600">
            {loading ? 'Loading nearby places...' : 'Calculating distances...'}
          </div>
        </div>
      )}
      
      {/* Categories */}
      <Collapse 
        defaultActiveKey={['educational', 'office']} 
        ghost
        className="nearby-places-collapse"
      >
        {Object.entries(categories).map(([category, info]) => {
          const selectedPlaces = normalizedValue[category] || []
          const availableCategoryPlaces = availablePlaces[category] || []
          const availableForSelection = availableCategoryPlaces.filter(
            place => !selectedPlaces.find(p => p._id === place._id)
          )
          
          return (
            <Panel 
              header={
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center space-x-2">
                    <info.icon className="w-4 h-4" />
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedPlaces.length > 0 && (
                      <Tag color={info.color}>{selectedPlaces.length} selected</Tag>
                    )}
                    <Tag color="default">{availableCategoryPlaces.length} available</Tag>
                  </div>
                </div>
              } 
              key={category}
            >
              {/* Selection dropdown */}
              <div className="mb-4">
                <Select
                  placeholder={`Select ${info.name.toLowerCase()}`}
                  style={{ width: '100%' }}
                  onSelect={(placeId) => addPlace(category, placeId)}
                  value={undefined}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={availableForSelection.length === 0}
                  notFoundContent={availableForSelection.length === 0 ? 'All places selected' : 'No places found'}
                >
                  {availableForSelection.map(place => (
                    <Select.Option key={place._id} value={place._id}>
                      {place.name} ({place.type})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Selected places list */}
              {selectedPlaces.length > 0 ? (
                <List
                  dataSource={selectedPlaces}
                  renderItem={(place, index) => (
                    <List.Item
                      key={`${place._id}-${index}`}
                      actions={[
                        <Button
                          key="delete"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removePlace(category, place._id)}
                          size="small"
                        >
                          Remove
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center space-x-2">
                            <Text strong>{place.name}</Text>
                            <Tag color={info.color} size="small">{place.type}</Tag>
                          </div>
                        }
                        description={
                          <div className="flex items-center space-x-2">
                            {place.distance ? (
                              <Tag color="blue" icon={<EnvironmentOutlined />}>
                                {place.distance}
                              </Tag>
                            ) : (
                              <Tag color="default">Distance not calculated</Tag>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <info.icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <Text type="secondary">No {info.name.toLowerCase()} selected</Text>
                </div>
              )}
            </Panel>
          )
        })}
      </Collapse>

      {/* Footer info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text type="secondary" className="text-xs">
          💡 Tip: Set hostel coordinates first, then click "Fetch All Places" to automatically add all nearby places with distances.
          You can also add places manually or recalculate distances anytime.
        </Text>
      </div>
    </div>
  )
}

export default NearbyPlacesSelector