import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHostelManager } from '../contexts/HostelManagerContext';

const HostelManagerPayments = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { manager } = useHostelManager();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPaymentRequests();
  }, [filter]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await axios.get(`${API_URL}/api/hostel-manager/payments/payment-requests`, {
        params,
        withCredentials: true
      });
      setPaymentRequests(data.requests || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return;

    try {
      await axios.patch(
        `${API_URL}/api/hostel-manager/payments/payment-requests/${requestId}/approve`,
        {},
        { withCredentials: true }
      );
      alert('Payment approved successfully!');
      fetchPaymentRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/api/hostel-manager/payments/payment-requests/${requestId}/reject`,
        { reason: rejectionReason },
        { withCredentials: true }
      );
      alert('Payment rejected');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchPaymentRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject payment');
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests</h1>
        <p className="text-gray-600">Manage payment submissions from students</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 font-medium capitalize ${
                filter === status
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
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
                  </div>
                  <p className="text-gray-600 text-sm">{request.user?.email}</p>
                  <p className="text-gray-600 text-sm">{request.user?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{request.amount}</p>
                  <p className="text-sm text-gray-500 capitalize">{request.paymentType}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">Hostel:</label>
                  <p className="font-medium">{request.hostel?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Transaction ID:</label>
                  <p className="font-mono text-sm">{request.upiTransactionId}</p>
                </div>
                {request.sharingType && (
                  <div>
                    <label className="text-sm text-gray-600">Sharing Type:</label>
                    <p className="font-medium">{request.sharingType}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Submitted:</label>
                  <p className="text-sm">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {request.notes && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600">Notes:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{request.notes}</p>
                </div>
              )}

              {request.screenshot && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-2">Payment Screenshot:</label>
                  <img
                    src={`${API_URL}/uploads/payments/${request.screenshot}`}
                    alt="Payment Screenshot"
                    className="max-w-md border rounded cursor-pointer hover:opacity-90"
                    onClick={() => window.open(`${API_URL}/uploads/payments/${request.screenshot}`, '_blank')}
                  />
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => setSelectedRequest(request._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Reject Payment
                  </button>
                </div>
              )}

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <label className="text-sm font-medium text-red-800">Rejection Reason:</label>
                  <p className="text-sm text-red-600">{request.rejectionReason}</p>
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
      )}

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Payment</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this payment:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManagerPayments;
