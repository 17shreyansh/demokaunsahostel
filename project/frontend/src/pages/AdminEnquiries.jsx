import { useState, useEffect } from 'react'
import { enquiryAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

const AdminEnquiries = () => {
  const { isDark } = useTheme()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const response = await enquiryAPI.getAll()
      setEnquiries(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Failed to fetch enquiries')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await enquiryAPI.updateStatus(id, status)
      alert('Status updated successfully')
      fetchEnquiries()
    } catch (error) {
      alert('Failed to update status')
    }
  }



  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Property Enquiries</h1>
        <p className={`transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage student enquiries for your properties</p>
      </div>

      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry._id} className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-lg`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{enquiry.name}</h3>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{enquiry.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{enquiry.phone}</span>
                  </div>
                </div>
                
                {enquiry.hostelId?.name && (
                  <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    <strong>Property:</strong> {enquiry.hostelId.name}
                  </p>
                )}
                
                {enquiry.message && (
                  <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    <strong>Message:</strong> {enquiry.message}
                  </p>
                )}
                
                <p className={`text-xs transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(enquiry.createdAt).toLocaleDateString()} at {new Date(enquiry.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedEnquiry(enquiry)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="View Details"
                >
                  <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                <select
                  value={enquiry.status}
                  onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                  className={`text-sm px-3 py-1 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {enquiries.length === 0 && !loading && (
        <div className={`text-center py-12 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No enquiries found</p>
        </div>
      )}

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Enquiry Details</h2>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
                  <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.name}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                  <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.status}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
                  <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.email}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</label>
                  <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.phone}</p>
                </div>
              </div>
              
              {selectedEnquiry.hostelId?.name && (
                <div>
                  <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Property</label>
                  <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.hostelId.name}</p>
                </div>
              )}
              
              <div>
                <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Message</label>
                <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEnquiry.message}</p>
              </div>
              
              <div>
                <label className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                <p className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEnquiries