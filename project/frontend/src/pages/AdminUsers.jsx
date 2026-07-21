import { useState, useEffect } from 'react'
import { userAPI, hostelAPI } from '../services/api'
import { 
  Edit2, X, Check, Home, Users, UserCheck, 
  UserX, Star, Search, Trash2, Power, PowerOff, Loader2, AlertCircle, Eye 
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [allHostels, setAllHostels] = useState([])
  const [hostelSearch, setHostelSearch] = useState('')
  const [assignedHostels, setAssignedHostels] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchAllHostels()
  }, [search, status, page])

  const fetchStats = async () => {
    try {
      const response = await userAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getAll({ page, search, status, limit: 20 })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHostels = async () => {
    try {
      const response = await hostelAPI.getAll({ limit: 1000 })
      setAllHostels(response.data.hostels || [])
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id)
      fetchUsers()
      fetchStats()
    } catch (error) {
      alert('Failed to update user status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the user and all their reviews.')) return

    try {
      await userAPI.delete(id)
      fetchUsers()
      fetchStats()
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  const openAssignModal = (user) => {
    setSelectedUser(user)
    setAssignedHostels(user.assignedHostels || [])
    setAssignModalOpen(true)
    setHostelSearch('')
  }

  const closeAssignModal = () => {
    setAssignModalOpen(false)
    setSelectedUser(null)
    setAssignedHostels([])
    setHostelSearch('')
  }

  const handleToggleHostel = (hostelId) => {
    setAssignedHostels(prev => {
      const existingIndex = prev.findIndex(h => h.hostelId === hostelId || h === hostelId)
      if (existingIndex >= 0) {
        return prev.filter((h, i) => i !== existingIndex)
      } else {
        return [...prev, { hostelId, occupancy: '' }]
      }
    })
  }

  const handleUpdateOccupancy = (hostelId, occupancy) => {
    setAssignedHostels(prev => 
      prev.map(h => (h.hostelId === hostelId || h === hostelId) ? { ...(typeof h === 'string' ? { hostelId: h } : h), occupancy } : h)
    )
  }

  const handleSaveAssignments = async () => {
    try {
      setAssignLoading(true)
      await userAPI.assignHostels(selectedUser._id, assignedHostels)
      alert('Hostel assignments updated successfully!')
      fetchUsers()
      closeAssignModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update hostel assignments')
    } finally {
      setAssignLoading(false)
    }
  }

  const filteredHostels = allHostels.filter(hostel => 
    hostel.name.toLowerCase().includes(hostelSearch.toLowerCase()) ||
    hostel.location.toLowerCase().includes(hostelSearch.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor, manage, and assign properties to registered users.</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error Loading Users</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.totalUsers || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.activeUsers || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserX size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.inactiveUsers || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.totalReviews || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="sm:w-64 flex-shrink-0">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No users found</h3>
            <p className="text-sm text-gray-500 mt-1">Adjust your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wider hidden md:table-cell">Academic / KYC</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wider">Assigned Properties</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wider hidden sm:table-cell">Status & Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                      
                      {/* User Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/admin/users/${user._id}`} className="flex items-start gap-3 group/link">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm shadow-sm flex-shrink-0 mt-0.5">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-blue-600 group-hover/link:text-blue-700 text-sm mb-0.5">{user.name}</p>
                            <p className="text-xs text-gray-600 font-medium mb-0.5">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Academic / KYC (Hidden on small screens) */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          {user.college ? (
                            <span className="text-xs text-gray-700 font-medium truncate max-w-[180px] block" title={user.college}>
                              🏫 {user.college}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No college set</span>
                          )}
                          {user.aadhar ? (
                            <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 inline-block w-fit">
                              ID: {user.aadhar.slice(0,4)} •••• {user.aadhar.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No ID set</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Properties */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {user.assignedHostels && user.assignedHostels.length > 0 ? (
                              user.assignedHostels.slice(0, 2).map(assignment => {
                                const hId = typeof assignment === 'object' ? assignment.hostelId : assignment;
                                const hostel = allHostels.find(h => h._id === hId)
                                return (
                                  <span key={hId} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[150px]">
                                    {hostel ? `${hostel.name}${assignment?.occupancy ? ` (${assignment.occupancy})` : ''}` : 'Unknown Property'}
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-xs text-gray-400 italic">None assigned</span>
                            )}
                            {user.assignedHostels && user.assignedHostels.length > 2 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                +{user.assignedHostels.length - 2} more
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => openAssignModal(user)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 text-xs font-semibold transition-colors w-fit group/btn"
                          >
                            <Edit2 size={12} className="group-hover/btn:rotate-12 transition-transform" /> Manage Assignment
                          </button>
                        </div>
                      </td>

                      {/* Status & Date (Hidden on tiny screens) */}
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            user.isActive 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                              user.isActive 
                                ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-100 mt-auto">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assign Hostels Modal */}
      {assignModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-gray-900/40  flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" 
          onClick={closeAssignModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">Assign Properties</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Manage hostel assignments for <span className="font-semibold text-gray-700">{selectedUser.name}</span>
                </p>
              </div>
              <button 
                onClick={closeAssignModal} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Hostels */}
            <div className="relative mb-4 flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search hostels by name or location..."
                value={hostelSearch}
                onChange={(e) => setHostelSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Selected Count */}
            <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                <Check size={14} strokeWidth={3} />
              </div>
              <p className="text-sm font-medium text-blue-900">
                {assignedHostels.length} properties selected
              </p>
            </div>

            {/* Hostels List */}
            <div className="flex-1 overflow-y-auto mb-6 border border-gray-200 rounded-xl custom-scrollbar">
              {filteredHostels.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Home className="text-gray-400" size={24} />
                  </div>
                  <p className="font-medium text-gray-900">No properties found</p>
                  <p className="text-xs text-gray-500 mt-1">Try adjusting your search query.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredHostels.map((hostel) => {
                    const assignment = assignedHostels.find(a => a.hostelId === hostel._id || a === hostel._id)
                    const isAssigned = !!assignment
                    return (
                      <div
                        key={hostel._id}
                        className={`p-4 transition-colors group flex flex-col gap-3 ${
                          isAssigned ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleToggleHostel(hostel._id)}>
                          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isAssigned 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'border-gray-300 bg-white text-transparent group-hover:border-gray-400'
                          }`}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {hostel.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {hostel.location}
                            </p>
                          </div>
                          {hostel.availability && (
                            <div className="flex-shrink-0">
                              <span className={`inline-block px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md ring-1 ring-inset ${
                                hostel.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                hostel.availability === 'Limited' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                                'bg-rose-50 text-rose-700 ring-rose-600/20'
                              }`}>
                                {hostel.availability}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {isAssigned && (
                          <div className="ml-8 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Occupancy / Sharing Type</label>
                            <select
                              value={assignment.occupancy || ''}
                              onChange={(e) => handleUpdateOccupancy(hostel._id, e.target.value)}
                              className="w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
                            >
                              <option value="">Select Occupancy</option>
                              {hostel.sharingTypes?.length > 0 ? (
                                hostel.sharingTypes.map(st => (
                                  <option key={st._id || st.name} value={st.name}>{st.name}</option>
                                ))
                              ) : (
                                <>
                                  <option value="Single">Single Sharing</option>
                                  <option value="Double">Double Sharing</option>
                                  <option value="Triple">Triple Sharing</option>
                                  <option value="Quad">Quad Sharing</option>
                                </>
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-shrink-0 pt-2 border-t border-gray-100">
              <button
                onClick={closeAssignModal}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignments}
                disabled={assignLoading}
                className="flex-[2] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {assignLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Assignments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers