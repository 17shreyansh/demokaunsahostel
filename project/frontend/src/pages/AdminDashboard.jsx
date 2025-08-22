import { useState, useEffect } from 'react'
import { hostelAPI, enquiryAPI, leadAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import MapStatsWidget from '../components/MapStatsWidget'

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const [hostels, setHostels] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [featuredHostels, setFeaturedHostels] = useState([])
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    occupancyTrend: [],
    enquiryTrend: [],
    topViewedHostels: [],
    trafficData: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('Fetching dashboard data...')
      
      const [hostelsRes, enquiriesRes, leadsRes] = await Promise.all([
        hostelAPI.getAll().catch(err => ({ data: { hostels: [] } })),
        enquiryAPI.getAll().catch(err => ({ data: [] })),
        leadAPI.getAll().catch(err => ({ data: [] }))
      ])
      
      const hostelsData = hostelsRes.data.hostels || hostelsRes.data || []
      const enquiriesData = enquiriesRes.data || []
      const leadsData = leadsRes.data || []
      
      console.log('Dashboard data:', { hostelsData, enquiriesData, leadsData })
      
      setHostels(hostelsData)
      setEnquiries(enquiriesData)
      setLeads(leadsData)
      
      // Calculate real analytics
      const thisMonth = enquiriesData.filter(e => {
        const eDate = new Date(e.createdAt)
        const now = new Date()
        return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear()
      }).length
      
      const lastMonth = enquiriesData.filter(e => {
        const eDate = new Date(e.createdAt)
        const lastMonthDate = new Date()
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
        return eDate.getMonth() === lastMonthDate.getMonth() && eDate.getFullYear() === lastMonthDate.getFullYear()
      }).length
      
      const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0
      
      // Get real top viewed hostels
      const topViewedHostels = hostelsData
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(h => ({ name: h.name, views: h.views || 0 }))
      
      // Get real traffic data from enquiries and leads
      const allInteractions = [...(Array.isArray(enquiriesData) ? enquiriesData : []), ...(Array.isArray(leadsData) ? leadsData : [])]
      const trafficData = generateRealTrafficData(allInteractions)
      
      setAnalytics({
        monthlyGrowth,
        occupancyTrend: generateTrendData(enquiriesData),
        enquiryTrend: generateEnquiryTrend(enquiriesData),
        topViewedHostels,
        trafficData
      })
      
      // Set real featured hostels from database
      const realFeaturedHostels = hostelsData.filter(h => h.featured === true).slice(0, 6)
      setFeaturedHostels(realFeaturedHostels)
      
      console.log('Analytics calculated:', {
        monthlyGrowth,
        topViewedHostels,
        trafficData,
        featuredHostels: realFeaturedHostels
      })
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set empty data on error
      setHostels([])
      setEnquiries([])
      setLeads([])
      setFeaturedHostels([])
      setAnalytics({
        monthlyGrowth: 0,
        occupancyTrend: Array.from({ length: 7 }, (_, i) => ({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i], enquiries: 0 })),
        enquiryTrend: Array.from({ length: 6 }, (_, i) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun'][i], enquiries: 0 })),
        topViewedHostels: [],
        trafficData: Array.from({ length: 7 }, (_, i) => ({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i], visitors: 0 }))
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = (enquiriesData) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        enquiries: enquiriesData.filter(e => {
          const eDate = new Date(e.createdAt)
          return eDate.toDateString() === date.toDateString()
        }).length
      }
    })
    return last7Days
  }

  const generateEnquiryTrend = (enquiriesData) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleDateString('en', { month: 'short' }),
        enquiries: enquiriesData.filter(e => {
          const eDate = new Date(e.createdAt)
          return eDate.getMonth() === date.getMonth() && eDate.getFullYear() === date.getFullYear()
        }).length
      }
    })
    return last6Months
  }

  const generateRealTrafficData = (allData) => {
    const safeData = Array.isArray(allData) ? allData : []
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayData = safeData.filter(item => {
        if (!item?.createdAt) return false
        const itemDate = new Date(item.createdAt)
        return itemDate.toDateString() === date.toDateString()
      })
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        visitors: dayData.length,
        pageViews: dayData.length * 2
      }
    })
  }

  const toggleFeaturedHostel = async (hostelId) => {
    try {
      const hostel = hostels.find(h => h._id === hostelId)
      const newFeaturedStatus = !hostel.featured
      
      await hostelAPI.updateFeatured(hostelId, newFeaturedStatus)
      
      setHostels(prev => prev.map(h => 
        h._id === hostelId ? { ...h, featured: newFeaturedStatus } : h
      ))
      
      // Update featured hostels list
      if (newFeaturedStatus) {
        if (featuredHostels.length < 6) {
          setFeaturedHostels(prev => [...prev, hostel])
        }
      } else {
        setFeaturedHostels(prev => prev.filter(h => h._id !== hostelId))
      }
      
      alert(`Hostel ${newFeaturedStatus ? 'added to' : 'removed from'} featured list`)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update featured status')
    }
  }

  const SimpleChart = ({ data, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map(d => d.value || d.occupancy || d.enquiries || d.visitors || d.pageViews), 1)
    
    return (
      <div className="flex items-end justify-between h-32 px-2">
        {data.map((item, index) => {
          const value = item.value || item.occupancy || item.enquiries || item.visitors || item.pageViews || 0
          const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div 
                className="w-6 rounded-t transition-all duration-300 hover:opacity-80 group-hover:scale-110"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: value > 0 ? color : isDark ? '#374151' : '#e5e7eb',
                  minHeight: '4px'
                }}
              />
              <span className={`text-xs mt-2 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.day || item.month || item.label}
              </span>
              <span className={`text-xs transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const stats = {
    totalProperties: Array.isArray(hostels) ? hostels.length : 0,
    totalEnquiries: Array.isArray(enquiries) ? enquiries.length : 0,
    totalViews: Array.isArray(hostels) ? hostels.reduce((sum, h) => sum + (h.views || 0), 0) : 0,
    pendingRequests: Array.isArray(enquiries) ? enquiries.filter(e => e.status === 'Pending').length : 0,
    occupancyRate: Array.isArray(hostels) && hostels.length > 0 ? Math.round(((hostels.filter(h => h.availability === 'Full').length) / hostels.length) * 100) : 0,
    avgRating: Array.isArray(hostels) && hostels.length > 0 ? (hostels.reduce((sum, h) => sum + (h.rating || 0), 0) / hostels.length).toFixed(1) : '0.0',
    responseRate: Array.isArray(enquiries) && enquiries.length > 0 ? Math.round((enquiries.filter(e => e.status !== 'Pending').length / enquiries.length) * 100) : 0,
    monthlyGrowth: analytics.monthlyGrowth
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Hostel Provider Dashboard
        </h1>
        <p className={`transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your properties, bookings, and grow your hostel business.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Properties</p>
              <p className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalProperties}</p>
            </div>
            <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${stats.totalProperties > 0 ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {stats.totalProperties > 0 ? '+12% from last month' : 'Add your first property'}
            </span>
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Enquiries</p>
              <p className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalEnquiries}</p>
            </div>
            <div className={`p-3 rounded-full ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${stats.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth}% this month
            </span>
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Property Views</p>
              <p className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium transition-colors ${stats.totalViews > 0 ? 'text-blue-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {stats.totalViews > 0 ? `Across ${stats.totalProperties} properties` : 'No views yet'}
            </span>
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Response Rate</p>
              <p className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.responseRate}%</p>
            </div>
            <div className={`p-3 rounded-full ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.responseRate >= 80 ? 'bg-green-500' : 
                  stats.responseRate >= 50 ? 'bg-yellow-500' : 
                  stats.responseRate > 0 ? 'bg-red-500' : 'bg-gray-400'
                }`} 
                style={{ width: `${Math.max(stats.responseRate, 2)}%` }}
              ></div>
            </div>
            <div className="mt-1">
              <span className={`text-xs transition-colors ${
                stats.totalEnquiries > 0 
                  ? isDark ? 'text-gray-400' : 'text-gray-500'
                  : isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {stats.totalEnquiries > 0 
                  ? `${enquiries.filter(e => e.status !== 'Pending').length}/${stats.totalEnquiries} enquiries responded`
                  : 'No enquiries yet'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Traffic</h3>
            <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>This Week</span>
          </div>
          <SimpleChart data={analytics.trafficData} color={isDark ? '#a78bfa' : '#8b5cf6'} />
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Booking Trends</h3>
            <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>This Week</span>
          </div>
          <SimpleChart data={analytics.occupancyTrend} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Enquiry Growth</h3>
            <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'}`}>6 Months</span>
          </div>
          <SimpleChart data={analytics.enquiryTrend.slice(0, 6)} color={isDark ? '#34d399' : '#10b981'} />
        </div>
      </div>

      {/* Top Viewed Hostels & Featured Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Most Viewed Hostels</h3>
          <div className="space-y-3">
            {analytics.topViewedHostels.length > 0 ? (
              analytics.topViewedHostels.map((hostel, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {index + 1}
                    </div>
                    <span className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{hostel.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{hostel.views} views</span>
                    <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min((hostel.views / Math.max(...analytics.topViewedHostels.map(h => h.views), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-sm">No property views yet</p>
                <p className="text-xs mt-1">Views will appear here once customers visit your properties</p>
              </div>
            )}
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Featured on Homepage</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>{featuredHostels.length}/6</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hostels.length > 0 ? (
              hostels.slice(0, 10).map((hostel) => (
                <div key={hostel._id} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{hostel.name}</span>
                    {hostel.featured && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Featured</span>}
                  </div>
                  <button
                    onClick={() => toggleFeaturedHostel(hostel._id)}
                    disabled={!hostel.featured && featuredHostels.length >= 6}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      hostel.featured 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : featuredHostels.length >= 6
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {hostel.featured ? 'Remove' : 'Feature'}
                  </button>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm">No properties yet</p>
                <p className="text-xs mt-1">Add your first property to start featuring on homepage</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Stats Widget */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MapStatsWidget />
          </div>
          <div className="lg:col-span-3">
            <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg h-full`}>
              <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Interactive Maps Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                <div className="text-center">
                  <div className={`p-3 rounded-full w-12 h-12 mx-auto mb-3 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Easy Location</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Help customers find your hostel easily with interactive maps</p>
                </div>
                <div className="text-center">
                  <div className={`p-3 rounded-full w-12 h-12 mx-auto mb-3 ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Higher Bookings</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Properties with maps get 40% more enquiries</p>
                </div>
                <div className="text-center">
                  <div className={`p-3 rounded-full w-12 h-12 mx-auto mb-3 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Better Trust</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Build customer confidence with accurate location data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Properties</h3>
            <button className={`text-sm font-medium transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Manage All</button>
          </div>
          <div className="space-y-4">
            {hostels.slice(0, 5).map((hostel, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{hostel.name}</p>
                    <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{hostel.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{hostel.price}/month</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    hostel.availability === 'Available' 
                      ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                      : hostel.availability === 'Limited' 
                      ? isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      : isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
                  }`}>
                    {hostel.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Booking Requests</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>{stats.pendingRequests} New</span>
          </div>
          <div className="space-y-4">
            {enquiries.slice(0, 5).map((enquiry, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{enquiry.name}</p>
                  <p className={`text-xs transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>{enquiry.phone}</p>
                  <p className={`text-xs transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  enquiry.status === 'Pending' 
                    ? isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-800'
                    : enquiry.status === 'Contacted' 
                    ? isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800'
                    : isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                }`}>
                  {enquiry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard