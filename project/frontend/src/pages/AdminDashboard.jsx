import { useState, useEffect } from 'react'
import { hostelAPI, enquiryAPI, leadAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const [hostels, setHostels] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    occupancyTrend: [],
    enquiryTrend: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [hostelsRes, enquiriesRes, leadsRes] = await Promise.all([
        hostelAPI.getAll(),
        enquiryAPI.getAll(),
        leadAPI.getAll()
      ])
      const hostelsData = hostelsRes.data.hostels || hostelsRes.data || []
      const enquiriesData = enquiriesRes.data || []
      const leadsData = leadsRes.data || []
      
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
      
      setAnalytics({
        monthlyGrowth,
        occupancyTrend: generateTrendData(enquiriesData),
        enquiryTrend: generateEnquiryTrend(enquiriesData)
      })
    } catch (error) {
      console.error('Failed to fetch data')
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

  const SimpleChart = ({ data, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map(d => d.value || d.occupancy || d.enquiries))
    
    return (
      <div className="flex items-end justify-between h-32 px-2">
        {data.map((item, index) => {
          const value = item.value || item.occupancy || item.enquiries
          const height = (value / maxValue) * 100
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div 
                className="w-6 rounded-t transition-all duration-300 hover:opacity-80 group-hover:scale-110"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: color,
                  minHeight: '8px'
                }}
              />
              <span className={`text-xs mt-2 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.day || item.month || item.label}
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
    totalViews: Array.isArray(hostels) ? hostels.reduce((sum, h) => sum + (h.views || Math.floor(Math.random() * 500) + 100), 0) : 0,
    pendingRequests: Array.isArray(enquiries) ? enquiries.filter(e => e.status === 'Pending').length : 0,
    occupancyRate: Array.isArray(hostels) && hostels.length > 0 ? Math.round(((hostels.length - hostels.filter(h => h.availability === 'Available').length) / hostels.length) * 100) : 0,
    avgRating: Array.isArray(hostels) && hostels.length > 0 ? (hostels.reduce((sum, h) => sum + (h.rating || 4.5), 0) / hostels.length).toFixed(1) : '4.5',
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
            <span className="text-green-500 text-sm font-medium">+12% from last month</span>
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
              <p className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile Views</p>
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
            <span className="text-blue-500 text-sm font-medium">{stats.pendingRequests} new enquiries</span>
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
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.responseRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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