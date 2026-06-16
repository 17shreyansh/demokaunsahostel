import { useState, useEffect } from 'react'
import { userAPI, hostelAPI } from '../services/api'
import { 
  Edit2, X, Check, Home, Users, UserCheck, 
  UserX, Star, Search, Trash2, Power, PowerOff, Loader2 
} from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
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
      console.error('Failed to fetch stats')
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAll({ page, search, status, limit: 20 })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHostels = async () => {
    try {
      const response = await hostelAPI.getAll()
      setAllHostels(response.data.hostels || [])
    } catch (error) {
      console.error('Failed to fetch hostels')
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
      if (prev.includes(hostelId)) {
        return prev.filter(id => id !== hostelId)
      } else {
        return [...prev, hostelId]
      }
    })
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 tracking-wider">Contact</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 tracking-wider">Assigned Properties</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 tracking-wider">Joined Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-900 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm shadow-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 font-mono">ID: {user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.phone || 'No phone provided'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            {user.assignedHostels?.length || 0}
                          </span>
                          <button
                            onClick={() => openAssignModal(user)}
                            className="text-gray-400 hover:text-blue-600 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-blue-50"
                          >
                            <Edit2 size={12} /> Manage
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${
                          user.isActive 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                            : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                              user.isActive 
                                ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 focus:ring-amber-500' 
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" 
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
                    const isAssigned = assignedHostels.includes(hostel._id)
                    return (
                      <div
                        key={hostel._id}
                        onClick={() => handleToggleHostel(hostel._id)}
                        className={`p-4 cursor-pointer transition-colors group flex items-start gap-3 ${
                          isAssigned ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                        }`}
                      >
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