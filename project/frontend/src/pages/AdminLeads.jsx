import { useState } from 'react'
import { leadAPI } from '../services/api'
import { useRefreshableData, invalidateAllData } from '../hooks/useRefreshableData'
import { 
  RefreshCw, Mail, Phone, Building2, 
  Calendar, Eye, X, MessageSquare, Loader2, ListFilter
} from 'lucide-react'

const AdminLeads = () => {
  const [selectedLead, setSelectedLead] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  const { data: leads, loading } = useRefreshableData('leads', async () => {
    const params = activeTab !== 'all' ? { type: activeTab } : {}
    const response = await leadAPI.getAll(params)
    return response.data.leads || []
  }, [activeTab])

  const updateStatus = async (id, status) => {
    try {
      await leadAPI.updateStatus(id, status)
      invalidateAllData()
      
      // Update modal state if open
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(prev => ({ ...prev, status }))
      }
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'New').length || 0,
    contacted: leads?.filter(l => l.status === 'Contacted').length || 0,
    converted: leads?.filter(l => l.status === 'Converted').length || 0
  }

  const tabItems = [
    { key: 'all', label: 'All Requests' },
    { key: 'enquiry', label: 'Enquiries' },
    { key: 'contact', label: 'Contact Forms' }
  ]

  // FIXED: Now returns actual JSX (<span>) instead of a raw text string!
  const getStatusBadge = (status) => {
    const styles = {
      'New': 'bg-orange-50 text-orange-700 ring-orange-600/20',
      'Contacted': 'bg-blue-50 text-blue-700 ring-blue-600/20',
      'Qualified': 'bg-purple-50 text-purple-700 ring-purple-600/20',
      'Converted': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'Closed': 'bg-gray-50 text-gray-700 ring-gray-600/20',
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${styles[status] || styles['New']}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans bg-[#FAFAFA]">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
              Booking Requests
            </h1>
            <p className="text-sm text-gray-500">
              Manage student enquiries, contact forms, and booking requests.
            </p>
          </div>
          <button 
            onClick={() => invalidateAllData()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] shadow-sm flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Flat Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 border shadow-sm bg-white border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl p-5 border shadow-sm bg-white border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">New</p>
          <p className="text-2xl font-bold tracking-tight text-orange-500">{stats.new}</p>
        </div>
        <div className="rounded-2xl p-5 border shadow-sm bg-white border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">Contacted</p>
          <p className="text-2xl font-bold tracking-tight text-blue-500">{stats.contacted}</p>
        </div>
        <div className="rounded-2xl p-5 border shadow-sm bg-white border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">Converted</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-500">{stats.converted}</p>
        </div>
      </div>

      {/* Sleek Segmented Control Filters */}
      <div className="flex mb-6 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
        <div className="inline-flex p-1 rounded-lg border flex-shrink-0 bg-gray-100/80 border-gray-200/60">
          {tabItems.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading && (!leads || leads.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-white border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading requests...</p>
        </div>
      ) : leads?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-white border-gray-200">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border bg-gray-50 border-gray-100">
            <ListFilter className="text-gray-400" size={32} />
          </div>
          <h3 className="text-base font-medium text-gray-900">No requests found</h3>
          <p className="text-sm mt-1 text-gray-500">There are no leads matching your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {leads?.map((lead) => (
            <article 
              key={lead._id} 
              className="transition-all duration-300 rounded-2xl border shadow-sm flex flex-col group bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
            >
              <div className="p-5 sm:p-6 flex-1">
                
                {/* Header: Name & Badges */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-lg leading-none text-gray-900">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ring-1 ring-inset ${
                      lead.type === 'enquiry' 
                        ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                        : 'bg-purple-50 text-purple-700 ring-purple-600/20'
                    }`}>
                      {lead.type}
                    </span>
                    {/* JSX Rendering properly now */}
                    {getStatusBadge(lead.status)}
                  </div>
                </div>
                
                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate" title={lead.email}>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{lead.phone}</span>
                  </div>
                </div>
                
                {/* Property Context */}
                {lead.hostelName && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium mb-4 bg-gray-50 text-gray-600 border border-gray-100">
                    <Building2 size={12} className="text-gray-400" />
                    <span>For: <span className="font-semibold text-gray-900">{lead.hostelName}</span></span>
                  </div>
                )}
                
                {/* Message Snippet */}
                {lead.message && (
                  <div className="rounded-xl p-3 text-sm leading-relaxed border bg-gray-50 border-gray-100 text-gray-600">
                    "{lead.message.substring(0, 100)}{lead.message.length > 100 ? '...' : ''}"
                  </div>
                )}
              </div>
              
              {/* Footer Actions */}
              <div className="px-5 py-4 border-t flex flex-wrap justify-between items-center gap-3 rounded-b-2xl bg-gray-50/50 border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Calendar size={12} />
                  {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      className="w-full appearance-none text-xs font-semibold rounded-lg border pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors cursor-pointer bg-white border-gray-300 text-gray-700"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 opacity-70">
                      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 flex-shrink-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
                    title="View Full Details"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Glassmorphic Lead Details Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedLead(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border animate-in zoom-in-95 duration-200 custom-scrollbar bg-white border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  Request Details
                </h2>
                <p className="text-sm mt-1 font-mono text-gray-500">
                  ID: {selectedLead._id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)} 
                className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              
              {/* Core Info Grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 rounded-xl p-5 border bg-gray-50/50 border-gray-100">
                <div>
                  <dt className="text-xs font-medium mb-1 text-gray-500">Full Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">{selectedLead.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium mb-1 text-gray-500">Request Type</dt>
                  <dd className="text-sm font-semibold uppercase text-gray-900">{selectedLead.type}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium mb-1 text-gray-500">Email Address</dt>
                  <dd className="text-sm font-semibold text-gray-900">{selectedLead.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium mb-1 text-gray-500">Phone Number</dt>
                  <dd className="text-sm font-semibold font-mono text-gray-900">{selectedLead.phone}</dd>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-200">
                  <dt className="text-xs font-medium mb-1 text-gray-500">Current Status</dt>
                  {/* JSX Rendering properly now */}
                  <dd className="mt-1">{getStatusBadge(selectedLead.status)}</dd>
                </div>
              </dl>
              
              {/* Context & Message */}
              {selectedLead.hostelName && (
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 text-gray-500">
                    <Building2 size={14} /> Associated Property
                  </h4>
                  <div className="p-4 rounded-xl border bg-white border-gray-200 text-gray-900">
                    <span className="font-semibold">{selectedLead.hostelName}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 text-gray-500">
                  <MessageSquare size={14} /> Submitted Message
                </h4>
                <div className="p-4 rounded-xl border whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 border-gray-200 text-gray-700">
                  {selectedLead.message || <span className="italic opacity-50">No message provided.</span>}
                </div>
              </div>
              
              <div className="text-xs font-medium flex items-center gap-1.5 text-gray-400">
                <Calendar size={14} />
                Received: {new Date(selectedLead.createdAt).toLocaleString(undefined, { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedLead(null)} 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLeads