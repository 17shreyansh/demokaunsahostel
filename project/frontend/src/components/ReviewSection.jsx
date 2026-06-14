import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { reviewAPI } from '../services/api';

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS & HELPERS                                                    */
/* -------------------------------------------------------------------------- */
const STARS = [1, 2, 3, 4, 5];

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// 1. Isolated Form Component (Prevents keystrokes from re-rendering the parent review list)
const MemoizedReviewForm = memo(({ onSubmit, onCancel, loading }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating, comment);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden will-change-transform"
    >
      <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl mb-8 shadow-xl relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
          <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          Write Your Review
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rate Your Experience
            </label>
            <div className="flex gap-2">
              {STARS.map((star) => (
                <button
                  key={`star-btn-${star}`}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform duration-200 transform-gpu hover:scale-110 focus:outline-none will-change-transform"
                >
                  <span className={star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2 h-5">
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Very Good'}
              {rating === 3 && '👌 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '👎 Poor'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Share Your Experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-500 transition-all duration-300 resize-none shadow-sm"
              placeholder="Tell others about your experience... What did you like? What could be improved?"
            />
            <p className="text-xs text-gray-400 mt-2 font-medium">Minimum 10 characters required</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
            <button
              type="submit"
              disabled={loading || comment.length < 10}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform-gpu hover:-translate-y-0.5 flex items-center justify-center gap-2 will-change-transform"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Review</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
});
MemoizedReviewForm.displayName = 'MemoizedReviewForm';

// 2. Isolated Review Card
// 2. Isolated Review Card
const ReviewCard = memo(({ review }) => {
  // Safely extract the name from either a nested 'user' object or the root 'review' object
  const displayName = review.user?.name || review.name || 'Anonymous Guest';
  const initial = review.avatar || displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1 will-change-transform">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl shadow-sm transform-gpu rotate-3">
            {initial}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">{displayName}</p>
            <div className="flex gap-0.5 mt-1 drop-shadow-sm">
              {STARS.map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
          {new Date(review.createdAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';
/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const ReviewSection = ({ hostelId }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Safe Data Fetching
  const fetchReviews = useCallback(async (abortSignal) => {
    try {
      const response = await reviewAPI.getByHostel(hostelId, { signal: abortSignal });
      if (!abortSignal?.aborted) {
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Failed to load reviews');
      }
    }
  }, [hostelId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchReviews(abortController.signal);
    return () => abortController.abort();
  }, [fetchReviews]);

  // Stable Form Handlers
  const handleReviewSubmit = useCallback(async (rating, comment) => {
    if (!user) {
      navigate('/user/auth');
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await reviewAPI.create({ hostelId, rating, comment });
      setStatus({ type: 'success', message: 'Review submitted! It will be visible after admin approval.' });
      setShowForm(false);
      fetchReviews(); // Re-fetch silently
      
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  }, [hostelId, user, navigate, fetchReviews]);

  const toggleForm = useCallback(() => setShowForm(true), []);
  const closeForm = useCallback(() => setShowForm(false), []);

  return (
    <div className="relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          Guest Reviews
        </h3>
        
        {user && !showForm && (
          <button
            onClick={toggleForm}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform-gpu hover:-translate-y-0.5 will-change-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write a Review
          </button>
        )}
      </div>

      {/* Guest Call to Action */}
      {!user && !showForm && (
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl shadow-inner">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-white font-bold mb-4 text-xl">Share your experience with others!</p>
            <button 
              onClick={() => navigate('/user/auth')} 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform-gpu hover:-translate-y-0.5"
            >
              Sign In to Write a Review
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      <AnimatePresence mode="wait">
        {status.message && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`border-l-4 p-4 rounded-r-xl overflow-hidden ${
              status.type === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'
            }`}
          >
            <div className="flex items-center font-medium">
              {status.type === 'error' ? (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <p>{status.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Review Form */}
      <AnimatePresence>
        {showForm && (
          <MemoizedReviewForm 
            onSubmit={handleReviewSubmit} 
            onCancel={closeForm} 
            loading={loading} 
          />
        )}
      </AnimatePresence>

      {/* Reviews Grid */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-20 h-20 flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-900 text-xl font-bold mb-2">No reviews yet</p>
            <p className="text-gray-500 font-medium">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review._id || `temp-${review.createdAt}`} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;