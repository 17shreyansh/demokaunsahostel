import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminHostelAssignments = () => {
  const [users, setUsers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedSharingType, setSelectedSharingType] = useState('');
  const [notes, setNotes] = useState('');
  const [useHostelPayment, setUseHostelPayment] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [hostelSearch, setHostelSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchHostels();
    fetchAssignments();
  }, []);

  const fetchUsers = async (search = '') => {
    try {
      const response = await axios.get(`${API_URL}/assignments/users/all`, {
        params: { search },
        withCredentials: true
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchHostels = async (search = '') => {
    try {
      const response = await axios.get(`${API_URL}/admin/assignments/hostels-for-assignment`, {
        params: { search },
        withCredentials: true
      });
      setHostels(response.data.hostels);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API_URL}/assignments/admin/all`, {
        withCredentials: true
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleUserSearch = (e) => {
    const value = e.target.value;
    setUserSearch(value);
    if (value.length > 2 || value.length === 0) {
      fetchUsers(value);
    }
  };

  const handleHostelSearch = (e) => {
    const value = e.target.value;
    setHostelSearch(value);
    if (value.length > 2 || value.length === 0) {
      fetchHostels(value);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleHostelSelect = async (hostelId) => {
    const hostel = hostels.find(h => h._id === hostelId);
    setSelectedHostel(hostel);
    setSelectedSharingType('');
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    if (!selectedHostel) {
      alert('Please select a hostel');
      return;
    }
    if (!selectedSharingType) {
      alert('Please select a sharing type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/assignments/bulk-assign`, {
        userIds: selectedUsers,
        hostelId: selectedHostel._id,
        selectedSharingType,
        notes,
        useHostelPayment
      }, {
        withCredentials: true
      });

      alert(response.data.message);
      
      // Reset form
      setSelectedUsers([]);
      setSelectedHostel(null);
      setSelectedSharingType('');
      setNotes('');
      setUseHostelPayment(true);
      
      // Refresh data
      fetchAssignments();
    } catch (error) {
      console.error('Error assigning hostel:', error);
      alert(error.response?.data?.message || 'Failed to assign hostel');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      await axios.delete(`${API_URL}/assignments/admin/${assignmentId}`, {
        withCredentials: true
      });
      alert('Assignment removed successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error removing assignment:', error);
      alert('Failed to remove assignment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Assign Hostels to Users</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Users</h2>
          <input
            type="text"
            value={userSearch}
            onChange={handleUserSearch}
            placeholder="Search users by name, email, or phone..."
            className="w-full border rounded p-2 mb-4"
          />
          <div className="max-h-64 overflow-y-auto border rounded">
            {users.map(user => (
              <label key={user._id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                </div>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {selectedUsers.length} user(s) selected
          </p>
        </div>

        {/* Hostel Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Hostel</h2>
          <input
            type="text"
            value={hostelSearch}
            onChange={handleHostelSearch}
            placeholder="Search hostels..."
            className="w-full border rounded p-2 mb-4"
          />
          <select
            value={selectedHostel?._id || ''}
            onChange={(e) => handleHostelSelect(e.target.value)}
            className="w-full border rounded p-2 mb-4"
          >
            <option value="">-- Select Hostel --</option>
            {hostels.map(hostel => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.name} - {hostel.location}
              </option>
            ))}
          </select>

          {selectedHostel && (
            <>
              <h3 className="font-semibold mb-2">Select Sharing Type</h3>
              <select
                value={selectedSharingType}
                onChange={(e) => setSelectedSharingType(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              >
                <option value="">-- Select Sharing Type --</option>
                {selectedHostel.sharingTypes?.map((type, idx) => (
                  <option key={idx} value={type.name}>
                    {type.name} - ₹{type.price}/{type.priceType === 'session' ? 'session' : 'month'} ({type.available} available)
                  </option>
                ))}
              </select>

              <label className="block font-semibold mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="w-full border rounded p-2 mb-4"
                rows="3"
              />

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={useHostelPayment}
                    onChange={(e) => setUseHostelPayment(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-blue-900">Use Hostel Owner Payment</div>
                    <div className="text-sm text-blue-700 mt-1">
                      {useHostelPayment 
                        ? '✓ User will pay to hostel owner using their UPI/QR code. Hostel manager will approve payments.'
                        : '✗ User will pay to admin using admin UPI/QR code. Admin will approve payments.'}
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          <button
            onClick={handleAssign}
            disabled={loading || selectedUsers.length === 0 || !selectedHostel || !selectedSharingType}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Assigning...' : 'Assign Hostel'}
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assignments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Hostel</th>
                  <th className="px-4 py-2 text-left">Sharing Type</th>
                  <th className="px-4 py-2 text-left">Assigned Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{assignment.user?.name}</div>
                      <div className="text-sm text-gray-600">{assignment.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{assignment.hostel?.name}</div>
                      <div className="text-sm text-gray-600">{assignment.hostel?.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{assignment.selectedSharingType || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {assignment.useHostelPayment ? '💳 Hostel Payment' : '💳 Admin Payment'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveAssignment(assignment._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHostelAssignments;
