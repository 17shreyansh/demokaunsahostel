import { useState, useEffect } from 'react'
import { Card, Statistic, Progress } from 'antd'
import { EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { hostelAPI } from '../services/api'

const MapStatsWidget = () => {
  const [stats, setStats] = useState({
    total: 0,
    withMaps: 0,
    percentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMapStats()
  }, [])

  const fetchMapStats = async () => {
    try {
      const response = await hostelAPI.getAll()
      const hostels = response.data.hostels || []
      
      const total = hostels.length
      const withMaps = hostels.filter(h => h.mapCoordinates && h.mapCoordinates.lat && h.mapCoordinates.lng).length
      const percentage = total > 0 ? Math.round((withMaps / total) * 100) : 0

      setStats({ total, withMaps, percentage })
    } catch (error) {
      console.error('Error fetching map stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-blue-600" />
          <span>Interactive Maps</span>
        </div>
      }
      loading={loading}
      className="h-full"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Statistic
            title="Total Hostels"
            value={stats.total}
            prefix={<EnvironmentOutlined />}
          />
          <Statistic
            title="With Maps"
            value={stats.withMaps}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Map Coverage</span>
            <span className="text-sm font-medium">{stats.percentage}%</span>
          </div>
          <Progress 
            percent={stats.percentage} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            showInfo={false}
          />
        </div>

        <div className="text-xs text-gray-500 mt-3">
          Interactive maps help customers find hostels easily and improve booking rates.
        </div>
      </div>
    </Card>
  )
}

export default MapStatsWidget