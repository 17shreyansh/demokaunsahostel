import { useState, useEffect } from 'react'
import { Card, Button, Input, message, Space, Typography } from 'antd'
import { MapPin, Search } from 'lucide-react'
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons'
const { Text } = Typography

const InteractiveMap = ({ coordinates, onCoordinatesChange, address }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [currentCoords, setCurrentCoords] = useState(coordinates || { lat: 28.6139, lng: 77.2090 }) // Default to Delhi

  useEffect(() => {
    if (coordinates) {
      setCurrentCoords(coordinates)
    }
  }, [coordinates])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('Please enter a location to search')
      return
    }

    try {
      // Using a simple geocoding approach with OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const newCoords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
        setCurrentCoords(newCoords)
        onCoordinatesChange(newCoords)
        message.success('Location found and updated!')
      } else {
        message.error('Location not found. Please try a different search term.')
      }
    } catch (error) {
      message.error('Failed to search location. Please try again.')
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentCoords(newCoords)
          onCoordinatesChange(newCoords)
          message.success('Current location updated!')
        },
        (error) => {
          message.error('Unable to get current location. Please enable location services.')
        }
      )
    } else {
      message.error('Geolocation is not supported by this browser.')
    }
  }

  const handleManualInput = (field, value) => {
    const newCoords = { ...currentCoords, [field]: parseFloat(value) || 0 }
    setCurrentCoords(newCoords)
    onCoordinatesChange(newCoords)
  }

  const parseGoogleMapsLink = () => {
    if (!googleMapsLink.trim()) {
      message.warning('Please enter a Google Maps link')
      return
    }

    try {
      // Parse different Google Maps URL formats
      let lat, lng
      
      // Format 1: @lat,lng,zoom
      const atMatch = googleMapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (atMatch) {
        lat = parseFloat(atMatch[1])
        lng = parseFloat(atMatch[2])
      }
      
      // Format 2: ll=lat,lng
      if (!lat || !lng) {
        const llMatch = googleMapsLink.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (llMatch) {
          lat = parseFloat(llMatch[1])
          lng = parseFloat(llMatch[2])
        }
      }
      
      // Format 3: q=lat,lng
      if (!lat || !lng) {
        const qMatch = googleMapsLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (qMatch) {
          lat = parseFloat(qMatch[1])
          lng = parseFloat(qMatch[2])
        }
      }

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const newCoords = { lat, lng }
        setCurrentCoords(newCoords)
        onCoordinatesChange(newCoords)
        setGoogleMapsLink('')
        message.success('Coordinates extracted from Google Maps link!')
      } else {
        message.error('Could not extract coordinates from the link. Please check the URL format.')
      }
    } catch (error) {
      message.error('Invalid Google Maps link format')
    }
  }

  return (
    <Card title="Interactive Map Location" className="mb-4">
      <div className="space-y-4">
        {/* Search Section */}
        <div>
          <Text strong>Search Location:</Text>
          <Space.Compact style={{ width: '100%', marginTop: 8 }}>
            <Input
              placeholder="Enter address or landmark (e.g., Galgotias University, Greater Noida)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Search
            </Button>
          </Space.Compact>
        </div>

        {/* Current Location Button */}
        <div>
          <Button 
            icon={<EnvironmentOutlined />} 
            onClick={handleUseCurrentLocation}
            type="dashed"
          >
            Use Current Location
          </Button>
        </div>

        {/* Option 1: Manual Coordinates Input */}
        <div>
          <Text strong>Option 1: Manual Coordinates</Text>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Text>Latitude:</Text>
              <Input
                type="number"
                step="any"
                value={currentCoords.lat}
                onChange={(e) => handleManualInput('lat', e.target.value)}
                placeholder="28.6139"
              />
            </div>
            <div>
              <Text>Longitude:</Text>
              <Input
                type="number"
                step="any"
                value={currentCoords.lng}
                onChange={(e) => handleManualInput('lng', e.target.value)}
                placeholder="77.2090"
              />
            </div>
          </div>
        </div>

        {/* Option 2: Google Maps Link */}
        <div>
          <Text strong>Option 2: Google Maps Link</Text>
          <Space.Compact style={{ width: '100%', marginTop: 8 }}>
            <Input
              placeholder="Paste Google Maps link here (e.g., https://maps.google.com/...)"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
            />
            <Button type="primary" onClick={parseGoogleMapsLink}>
              Extract
            </Button>
          </Space.Compact>
          <div className="text-xs text-gray-500 mt-1">
            Share location from Google Maps and paste the link here
          </div>
        </div>

        {/* Map Preview */}
        <div>
          <Text strong>Map Preview:</Text>
          <div className="mt-2 border rounded-lg overflow-hidden">
            {currentCoords.lat && currentCoords.lng ? (
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&hl=en&z=15&output=embed`}
                allowFullScreen
              />
            ) : (
              <div className="h-[300px] bg-gray-100 flex items-center justify-center">
                <Text type="secondary">Set coordinates to see map preview</Text>
              </div>
            )}
          </div>
          {currentCoords.lat && currentCoords.lng && (
            <div className="mt-2 text-center">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View in Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Current Coordinates Display */}
        <div className="bg-gray-50 p-3 rounded">
          <Text strong>Current Coordinates:</Text>
          <div className="mt-1">
            <Text code>Lat: {(currentCoords.lat || 0).toFixed(6)}, Lng: {(currentCoords.lng || 0).toFixed(6)}</Text>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default InteractiveMap