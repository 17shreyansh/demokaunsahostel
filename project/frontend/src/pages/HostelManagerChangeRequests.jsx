import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HostelManagerChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/hostel-manager/change-requests`, {
        params,
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

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
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
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[type]}`}>
        {type === 'create' ? 'NEW HOSTEL' : 'UPDATE'}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Change Requests</h1>
        <button
          onClick={() => navigate('/hostel-manager/hostels/new')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Submit New Hostel
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <p className="text-blue-800">
          <strong>Note:</strong> All hostel submissions and updates require admin approval before going live. 
          You'll be notified once your request is reviewed.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
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
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No change requests found</p>
          <button
            onClick={() => navigate('/hostel-manager/hostels/new')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Submit Your First Hostel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {getRequestTypeBadge(request.requestType)}
                    {getStatusBadge(request.status)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {request.changeData?.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {request.changeData?.location}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Submitted: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                {request.changeData?.images?.[0] && (
                  <img 
                    src={`${API_URL.replace('/api', '')}/uploads/${request.changeData.images[0]}`}
                    alt={request.changeData.name}
                    className="w-24 h-24 object-cover rounded ml-4"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-semibold">₹{request.changeData?.price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-semibold">{request.changeData?.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">{request.changeData?.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amenities</p>
                  <p className="font-semibold">{request.changeData?.amenities?.length || 0}</p>
                </div>
              </div>

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="font-semibold text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-red-700">{request.rejectionReason}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Please fix the issues and resubmit your hostel.
                  </p>
                </div>
              )}

              {request.status === 'approved' && request.reviewedAt && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="text-green-800">
                    ✓ Approved on {new Date(request.reviewedAt).toLocaleString()}
                  </p>
                  {request.hostel && (
                    <button
                      onClick={() => navigate(`/hostels/${request.hostel._id}`)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      View Live Hostel →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelManagerChangeRequests;
