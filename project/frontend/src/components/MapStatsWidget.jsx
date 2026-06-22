import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { hostelAPI } from '../services/api'

const MapStatsWidget = () => {
  const { isDark } = useTheme()
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
      const response = await hostelAPI.getAll({ limit: 1000 })
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
    <div className={`h-full p-6 rounded-xl border shadow-sm transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span className={`font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Interactive Maps</span>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              <div className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Hostels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.withMaps}</div>
              <div className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>With Maps</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Map Coverage</span>
              <span className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.percentage}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className={`text-xs mt-3 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Interactive maps help customers find hostels easily and improve booking rates.
          </div>
        </div>
      )}
    </div>
  )
}

export default MapStatsWidget