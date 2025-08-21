import { Card, Typography, Button } from 'antd'
import { EnvironmentOutlined, ExportOutlined } from '@ant-design/icons'

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
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`}
          style={{ border: 0, borderRadius: '8px' }}
        />
      </div>

     
    </Card>
  )
}

export default HostelMap