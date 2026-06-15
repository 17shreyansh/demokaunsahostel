import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiStar, FiUser, FiCalendar, FiMessageSquare, FiCheckCircle, FiClock } from 'react-icons/fi';

const HostelManagerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/hostel-manager/reviews', { withCredentials: true });
      setReviews(res.data.reviews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => filter === 'approved' ? r.isApproved : !r.isApproved);

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.isApproved).length,
    pending: reviews.filter(r => !r.isApproved).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  };

  if (loading) {
    return (
      <HostelManagerLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="text-white text-xl" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-white text-xl" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiClock className="text-white text-xl" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FiStar className="text-white text-xl" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900">{stats.avgRating} ⭐</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews ({stats.total})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'approved'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any reviews yet."
                  : filter === 'approved'
                  ? "No approved reviews yet."
                  : "No pending reviews."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-1">
                        {review.hostel?.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>{review.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-semibold text-gray-900">{review.rating}.0</span>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          review.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {review.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerReviews;
