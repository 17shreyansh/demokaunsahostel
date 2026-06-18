import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPayments = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', type: 'all' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPaymentRequests();
  }, [filter, pagination.currentPage]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.type !== 'all' && { type: filter.type })
      };
      
      const { data } = await axios.get(`${API_URL}/api/manual-payments/admin/all`, {
        params,
        withCredentials: true
      });
      
      setPaymentRequests(data.requests || []);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'visit': return 'bg-blue-100 text-blue-800';
      case 'reservation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests Monitor</h1>
        <p className="text-gray-600">View all payment requests across all hostels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Requests</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-yellow-800 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {paymentRequests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-green-800 text-sm">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {paymentRequests.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-red-800 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {paymentRequests.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status Filter</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="visit">Visit Booking</option>
              <option value="reservation">Seat Reservation</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : paymentRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No payment requests found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paymentRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.user?.name || 'Unknown User'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(request.paymentType)}`}>
                        {request.paymentType}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{request.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{request.amount}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600">Hostel:</label>
                    <p className="font-medium">{request.hostel?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Transaction ID:</label>
                    <p className="font-mono text-sm">{request.upiTransactionId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Submitted:</label>
                    <p className="text-sm">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {request.screenshot && (
                  <div className="mb-4">
                    <img
                      src={`${API_URL}/uploads/payments/${request.screenshot}`}
                      alt="Payment Screenshot"
                      className="max-w-xs border rounded cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`${API_URL}/uploads/payments/${request.screenshot}`, '_blank')}
                    />
                  </div>
                )}

                {request.reviewedBy && request.reviewedAt && (
                  <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                    Reviewed by {request.reviewedBy.name} on {new Date(request.reviewedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPayments;
