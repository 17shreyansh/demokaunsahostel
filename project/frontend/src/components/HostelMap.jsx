import { Card, Typography, Button } from 'antd'
import { MapPin, ExternalLink } from 'lucide-react'

const { Title, Text } = Typography

const HostelMap = ({ coordinates, hostelName, address }) => {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return null
  }

  const { lat, lng } = coordinates

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank')
  }

  const openInAppleMaps = () => {
    const url = `http://maps.apple.com/?q=${lat},${lng}`
    window.open(url, '_blank')
  }

  return (
    <Card className="mb-6">
      
      
      <div className="mb-4">
        <MapPin size={24} className="text-blue-600 mb-2" />
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          style={{ border: 0, borderRadius: '8px' }}
          src={`https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
          allowFullScreen
        />
        <Button icon={<ExternalLink size={16} className="mr-2" />} onClick={openInGoogleMaps}>View on Google Maps</Button>
      </div>

     
    </Card>
  )
}

export default HostelMap