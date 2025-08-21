import { useState, useEffect } from 'react'
import { Select, List, Typography, Tag, message, Spin } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const NearbyPlacesSelector = ({ coordinates, value = { educational: [], offices: [] }, onChange }) => {
  const [availablePlaces, setAvailablePlaces] = useState({ educational: [], office: [] })
  const [loading, setLoading] = useState(false)
  
  const selectedEducational = value.educational || []
  const selectedOffices = value.offices || []

  useEffect(() => {
    fetchAvailablePlaces()
  }, [])

  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng && (selectedEducational.length > 0 || selectedOffices.length > 0)) {
      calculateDistances()
    }
  }, [coordinates?.lat, coordinates?.lng])

  const fetchAvailablePlaces = async () => {
    try {
      const [educationalRes, officeRes] = await Promise.all([
        fetch('http://localhost:5000/api/nearbyplaces?category=educational'),
        fetch('http://localhost:5000/api/nearbyplaces?category=office')
      ])
      
      const educational = await educationalRes.json()
      const office = await officeRes.json()
      
      setAvailablePlaces({ educational, office })
    } catch (error) {
      message.error('Failed to fetch nearby places')
    }
  }

  const calculateDistances = async () => {
    if (!coordinates?.lat || !coordinates?.lng) return
    setLoading(true)

    try {
      const [educationalRes, officeRes] = await Promise.all([
        fetch(`http://localhost:5000/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}&category=educational`),
        fetch(`http://localhost:5000/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}&category=office`)
      ])
      
      const educationalWithDistances = await educationalRes.json()
      const officeWithDistances = await officeRes.json()
      
      const updatedEducational = selectedEducational.map(place => {
        const withDistance = educationalWithDistances.find(p => p._id === place._id)
        return withDistance ? { ...place, distance: withDistance.distance } : place
      })
      
      const updatedOffices = selectedOffices.map(place => {
        const withDistance = officeWithDistances.find(p => p._id === place._id)
        return withDistance ? { ...place, distance: withDistance.distance } : place
      })
      
      onChange({ educational: updatedEducational, offices: updatedOffices })
    } catch (error) {
      message.error('Failed to calculate distances')
    }
    
    setLoading(false)
  }

  const addEducational = async (placeId) => {
    const place = availablePlaces.educational.find(p => p._id === placeId)
    if (place && !selectedEducational.find(p => (p._id || p.name) === placeId)) {
      let updatedPlace = { 
        ...place,
        _id: place._id,
        name: place.name,
        type: place.type || 'Educational'
      }
      
      if (coordinates?.lat && coordinates?.lng && place.mapCoordinates) {
        setLoading(true)
        try {
          const response = await fetch(`http://localhost:5000/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}&category=educational`)
          const placesWithDistances = await response.json()
          const placeWithDistance = placesWithDistances.find(p => p._id === placeId)
          if (placeWithDistance) {
            updatedPlace.distance = placeWithDistance.distance
          }
        } catch (error) {
          message.error('Failed to calculate distance')
        }
        setLoading(false)
      }
      
      const newEducational = [...selectedEducational, updatedPlace]
      onChange({ educational: newEducational, offices: selectedOffices })
    }
  }

  const addOffice = async (placeId) => {
    const place = availablePlaces.office.find(p => p._id === placeId)
    if (place && !selectedOffices.find(p => (p._id || p.name) === placeId)) {
      let updatedPlace = { 
        ...place,
        _id: place._id,
        name: place.name,
        type: place.type || 'Office'
      }
      
      if (coordinates?.lat && coordinates?.lng && place.mapCoordinates) {
        setLoading(true)
        try {
          const response = await fetch(`http://localhost:5000/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}&category=office`)
          const placesWithDistances = await response.json()
          const placeWithDistance = placesWithDistances.find(p => p._id === placeId)
          if (placeWithDistance) {
            updatedPlace.distance = placeWithDistance.distance
          }
        } catch (error) {
          message.error('Failed to calculate distance')
        }
        setLoading(false)
      }
      
      const newOffices = [...selectedOffices, updatedPlace]
      onChange({ educational: selectedEducational, offices: newOffices })
    }
  }

  const removeEducational = (placeId) => {
    const newEducational = selectedEducational.filter(p => (p._id || p.name) !== placeId)
    onChange({ educational: newEducational, offices: selectedOffices })
  }

  const removeOffice = (placeId) => {
    const newOffices = selectedOffices.filter(p => (p._id || p.name) !== placeId)
    onChange({ educational: selectedEducational, offices: newOffices })
  }

  return (
    <div>
      {loading && <Spin />}
      
      <Title level={5}>Educational Institutions</Title>
      <Select
        placeholder="Select educational institutions"
        style={{ width: '100%', marginBottom: 16 }}
        onSelect={addEducational}
        value={undefined}
      >
        {availablePlaces.educational
          .filter(place => !selectedEducational.find(p => p._id === place._id))
          .map(place => (
            <Select.Option key={place._id} value={place._id}>
              {place.name} ({place.type})
            </Select.Option>
          ))
        }
      </Select>

      <List
        dataSource={selectedEducational}
        renderItem={(place) => (
          <List.Item
            actions={[
              <DeleteOutlined 
                key="delete"
                onClick={() => removeEducational(place._id || place.name)}
                style={{ color: 'red', cursor: 'pointer' }}
              />
            ]}
          >
            <div>
              <Text strong>{place.name}</Text>
              <br />
              <Tag color="green">{place.type || 'Educational'}</Tag>
              {place.distance && <Tag color="blue">{place.distance}</Tag>}
            </div>
          </List.Item>
        )}
      />

      <Title level={5} style={{ marginTop: 24 }}>IT Parks & Offices</Title>
      <Select
        placeholder="Select IT parks & offices"
        style={{ width: '100%', marginBottom: 16 }}
        onSelect={addOffice}
        value={undefined}
      >
        {availablePlaces.office
          .filter(place => !selectedOffices.find(p => p._id === place._id))
          .map(place => (
            <Select.Option key={place._id} value={place._id}>
              {place.name} ({place.type})
            </Select.Option>
          ))
        }
      </Select>

      <List
        dataSource={selectedOffices}
        renderItem={(place) => (
          <List.Item
            actions={[
              <DeleteOutlined 
                key="delete"
                onClick={() => removeOffice(place._id || place.name)}
                style={{ color: 'red', cursor: 'pointer' }}
              />
            ]}
          >
            <div>
              <Text strong>{place.name}</Text>
              <br />
              <Tag color="blue">{place.type || 'Office'}</Tag>
              {place.distance && <Tag color="orange">{place.distance}</Tag>}
            </div>
          </List.Item>
        )}
      />

      {!coordinates?.lat && (
        <div className="text-center py-4">
          <Text type="secondary">Set hostel coordinates to calculate road distances</Text>
        </div>
      )}
    </div>
  )
}

export default NearbyPlacesSelector