import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/change-requests`, {
        params: { status: filter },
        withCredentials: true
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to fetch change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this change request?')) return;

    try {
      await axios.post(`${API_URL}/admin/change-requests/${requestId}/approve`, {}, {
        withCredentials: true
      });
      alert('Change request approved successfully!');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/change-requests/${selectedRequest._id}/reject`, {
        reason: rejectionReason
      }, {
        withCredentials: true
      });
      alert('Change request rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRequestTypeBadge = (type) => {
    const colors = {
      create: 'bg-blue-100 text-blue-800',
      update: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hostel Change Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded ${filter === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No change requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getRequestTypeBadge(request.requestType)}
                    {getStatusBadge(request.status)}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {request.requestType === 'create' ? 'New Hostel' : request.hostel?.name || 'Hostel Update'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    By: {request.manager?.name} ({request.manager?.email})
                  </p>
                  <p className="text-gray-500 text-xs">
                    Submitted: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(request)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <strong>Hostel Name:</strong> {request.changeData?.name}
                </div>
                <div>
                  <strong>Location:</strong> {request.changeData?.location}
                </div>
                <div>
                  <strong>Price:</strong> ₹{request.changeData?.price}
                </div>
                <div>
                  <strong>Gender:</strong> {request.changeData?.gender}
                </div>
              </div>

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <strong className="text-red-800">Rejection Reason:</strong>
                  <p className="text-red-700 text-sm mt-1">{request.rejectionReason}</p>
                </div>
              )}

              {request.status !== 'pending' && request.reviewedAt && (
                <p className="text-gray-500 text-xs mt-3">
                  Reviewed: {new Date(request.reviewedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Change Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded p-2 mb-4"
              rows="4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChangeRequests;
