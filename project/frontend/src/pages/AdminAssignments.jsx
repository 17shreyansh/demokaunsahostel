import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, Trash2, Loader2, User, Building2, 
  CheckCircle2, XCircle, AlertTriangle, ChevronDown 
} from 'lucide-react';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ userId: '', hostelId: '', notes: '' });
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, usersRes, hostelsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments/admin/all`, { withCredentials: true }),
        axios.get(`${API_URL}/users`, { withCredentials: true }),
        axios.get(`${API_URL}/hostels`, { withCredentials: true })
      ]);

      setAssignments(assignmentsRes.data.assignments);
      setUsers(usersRes.data.users || []);
      setHostels(hostelsRes.data.hostels || []);
    } catch (error) {
      alert('Failed to fetch data. Please login as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assignments/assign`, formData, { withCredentials: true });
      alert('✅ Assignment successful');
      setShowForm(false);
      setFormData({ userId: '', hostelId: '', notes: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign user');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await axios.delete(`${API_URL}/assignments/admin/${id}`, { withCredentials: true });
      fetchData();
    } catch (error) {
      alert('Failed to remove assignment');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">User Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage residency and property assignments.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] shadow-sm"
        >
          {showForm ? 'Cancel' : <><UserPlus size={16} /> Assign User</>}
        </button>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h2 className="text-lg font-semibold mb-6">New Assignment</h2>
          <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              >
                <option value="">Choose a user...</option>
                {users.map(user => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Hostel</label>
              <select
                value={formData.hostelId}
                onChange={(e) => setFormData({...formData, hostelId: e.target.value})}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              >
                <option value="">Choose a hostel...</option>
                {hostels.map(hostel => <option key={hostel._id} value={hostel._id}>{hostel.name} - {hostel.location}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                placeholder="Add any administrative notes..."
              />
            </div>

            <button type="submit" className="md:col-span-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm">
              Confirm Assignment
            </button>
          </form>
        </section>
      )}

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {['User', 'Hostel', 'Can Review', 'Reviewed', 'Assigned', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-semibold text-gray-900 tracking-tight">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(assignment => (
                <tr key={assignment._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                        {assignment.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{assignment.user?.name}</p>
                        <p className="text-xs text-gray-500">{assignment.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{assignment.hostel?.name}</p>
                        <p className="text-xs text-gray-500">{assignment.hostel?.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${assignment.canReview ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
                      {assignment.canReview ? <><CheckCircle2 size={12}/> Yes</> : <><XCircle size={12}/> No</>}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${assignment.hasReviewed ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-gray-50 text-gray-600 ring-gray-600/20'}`}>
                      {assignment.hasReviewed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(assignment._id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignments;