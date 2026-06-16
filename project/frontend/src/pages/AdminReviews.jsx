import { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import { 
  MessageSquare, Clock, CheckCircle2, Star, 
  Trash2, Check, X, Loader2, MessageSquareOff, MapPin
} from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getAllAdmin();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isApproved) => {
    try {
      await reviewAPI.approve(id, isApproved);
      fetchReviews();
    } catch (error) {
      alert('Failed to update review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    try {
      await reviewAPI.deleteAdmin(id);
      fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.isApproved;
    if (filter === 'approved') return review.isApproved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;

  // UI Helpers
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Review Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor, moderate, and approve user reviews for all properties.</p>
      </div>

      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Sleek Segmented Control Filter */}
      <div className="flex mb-6 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
        <div className="inline-flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60 flex-shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
              filter === 'all' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Reviews
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === 'all' ? 'bg-gray-100' : 'bg-gray-200/50'}`}>
              {reviews.length}
            </span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none relative ${
              filter === 'pending' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200/50'}`}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
              filter === 'approved' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200/50'}`}>
              {approvedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <MessageSquareOff size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No reviews found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no reviews matching your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {filteredReviews.map((review) => (
              <article 
                key={review._id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="p-5 sm:p-6 flex-1">
                  
                  {/* Review Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm shadow-sm flex-shrink-0">
                        {getInitials(review.user?.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 leading-none">{review.user?.name || 'Anonymous User'}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
                            review.isApproved 
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                              : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                          }`}>
                            {review.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{review.user?.email || 'No email provided'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Context Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 mb-4">
                    <MapPin size={12} className="text-gray-400" />
                    For: <span className="font-semibold text-gray-900">{review.hostel?.name || 'Unknown Property'}</span>
                  </div>

                  {/* Review Content */}
                  <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
                    <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                      "{review.comment}"
                    </p>
                  </div>

                </div>

                {/* Card Footer / Actions */}
                <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100 rounded-b-xl flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!review.isApproved ? (
                      <button
                        onClick={() => handleApprove(review._id, true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98] shadow-sm"
                        aria-label="Approve Review"
                      >
                        <Check size={16} className="text-emerald-500" /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(review._id, false)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 active:scale-[0.98] shadow-sm"
                        aria-label="Revoke Approval"
                      >
                        <X size={16} className="text-amber-500" /> Revoke Approval
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 active:scale-[0.98]"
                    aria-label="Delete Review"
                  >
                    <Trash2 size={16} /> <span className="sm:hidden">Delete Review</span>
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminReviews;