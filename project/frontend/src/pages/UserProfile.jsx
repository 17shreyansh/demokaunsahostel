import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiStar, FiTrash2, FiLogOut, FiSettings, FiMessageSquare } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { reviewAPI, authAPI } from '../services/api';

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS & HELPERS                                                    */
/* -------------------------------------------------------------------------- */
const STARS = [1, 2, 3, 4, 5];

const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: FiSettings },
  { id: 'bookings', label: 'My Bookings', icon: FiMessageSquare },
  { id: 'payments', label: 'My Payments', icon: FiMessageSquare },
  { id: 'assignments', label: 'My Assigned Hostels', icon: FiMessageSquare },
  { id: 'reviews', label: 'My Reviews', icon: FiStar }
];

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// 1. Reusable Premium Input Field
const PremiumInput = memo(({ id, name, type, label, value, onChange, disabled, icon: Icon }) => (
  <div className="relative group mb-5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-yellow-600">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-500 transition-all duration-300 shadow-sm ${
          disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' : 'bg-gray-50/50 border-gray-200 hover:bg-white'
        }`}
      />
    </div>
  </div>
));
PremiumInput.displayName = 'PremiumInput';

// 2. Isolated Profile Settings Tab (Prevents global re-renders on keystroke)
const ProfileSettings = memo(({ user, updateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus({ type: '', message: '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await authAPI.updateProfile(formData);
      setStatus({ type: 'success', message: 'Profile updated successfully' });
      updateUser({ ...user, name: formData.name, phone: formData.phone });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="max-w-2xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-500 text-sm">Update your details and password here.</p>
      </div>

      {status.message && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mb-6 p-4 rounded-xl border-l-4 text-sm font-medium ${
            status.type === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'
          }`}
        >
          {status.message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <PremiumInput id="name" name="name" type="text" label="Full Name" icon={FiUser} value={formData.name} onChange={handleChange} />
        <PremiumInput id="phone" name="phone" type="tel" label="Phone Number" icon={FiPhone} value={formData.phone} onChange={handleChange} />
      </div>

      <PremiumInput id="email" name="email" type="email" label="Email Address" icon={FiMail} value={user?.email || ''} disabled={true} onChange={() => {}} />

      <div className="mt-8 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <PremiumInput id="currentPassword" name="currentPassword" type="password" label="Current Password" icon={FiLock} value={formData.currentPassword} onChange={handleChange} />
          <PremiumInput id="newPassword" name="newPassword" type="password" label="New Password" icon={FiLock} value={formData.newPassword} onChange={handleChange} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 will-change-transform"
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex-1 sm:flex-none px-8 py-3.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-bold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </motion.form>
  );
});
ProfileSettings.displayName = 'ProfileSettings';

// 3. Isolated Reviews Manager (Handles own fetches safely)
const ReviewManager = memo(() => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();

    const fetchReviews = async () => {
      try {
        const response = await reviewAPI.getMyReviews({ signal: abortController.signal });
        if (!abortController.signal.aborted) {
          setReviews(response.data.reviews || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Failed to load reviews.');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchReviews();
    return () => abortController.abort();
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete review');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 transform-gpu"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No reviews yet</h3>
        <p className="text-gray-500 mt-1">You haven't shared your experience about any hostels.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h2>
        <p className="text-gray-500 text-sm">Manage the feedback you've left for hostels.</p>
      </div>

      {reviews.map((review) => (
        <motion.div 
          key={review._id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{review.hostel?.name || 'Unknown Hostel'}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex text-yellow-400">
                  {STARS.map(star => (
                    <FiStar key={star} className={star <= review.rating ? 'fill-current' : 'text-gray-200'} />
                  ))}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {review.isApproved ? 'Published' : 'Pending Review'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(review._id)}
              className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2.5 rounded-lg transition-colors transform-gpu will-change-transform"
              aria-label="Delete review"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            {review.comment}
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-wider">
            Posted on {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
});
ReviewManager.displayName = 'ReviewManager';

// 4. Assigned Hostels Manager with Installment Plans
const AssignedHostelsManager = memo(() => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedInstallment, setExpandedInstallment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/assignments/my-assignments`, {
          credentials: 'include',
          signal: abortController.signal
        });
        const data = await response.json();
        if (!abortController.signal.aborted) {
          setAssignments(data.assignments || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Failed to load assigned hostels.');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchAssignments();
    return () => abortController.abort();
  }, []);

  const handleReviewSubmit = async (hostelId) => {
    if (reviewData.comment.length < 10) {
      alert('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      await reviewAPI.create({ hostelId, rating: reviewData.rating, comment: reviewData.comment });
      alert('✅ Review submitted successfully! It will be visible after admin approval.');
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/assignments/my-assignments`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // TODO: Implement full payment system later
  // - Show hostel UPI/QR details
  // - User uploads payment screenshot
  // - User enters transaction ID
  // - Hostel owner approves/rejects payment
  // - Update installment payment status
  const handleSelectInstallmentPlan = async (assignmentId, planId) => {
    alert('Payment system coming soon! This will allow you to select installment plans and make payments.');
    // TODO: Call API to select installment plan
    // await fetch('/api/assignments/select-installment-plan', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({ assignmentId, installmentPlanId: planId })
    // });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  if (assignments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No assigned hostels</h3>
        <p className="text-gray-500 mt-1">Book a hostel visit to get assigned and write reviews.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Assigned Hostels</h2>
        <p className="text-gray-500 text-sm">Manage your hostel assignments, payments, and reviews.</p>
      </div>

      <div className="space-y-6">
        {assignments.map((assignment) => {
          const hostel = assignment.hostel;
          const hasInstallmentPlans = hostel?.installmentPlans?.length > 0;
          const selectedPlan = hostel?.installmentPlans?.find(p => p._id === assignment.selectedInstallmentPlan);
          
          return (
            <motion.div
              key={assignment._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Hostel Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel?.images?.[0]}`}
                    alt={hostel?.name}
                    className="w-full md:w-32 h-32 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-xl mb-1">{hostel?.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">{hostel?.location}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-yellow-600 font-bold text-lg">₹{hostel?.price}/month</p>
                      {hostel?.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FiStar className="text-yellow-400 fill-current" />
                          <span className="font-semibold">{hostel?.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/hostels/${hostel?.slug}`)}
                    className="px-4 py-2 h-fit bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Installment Plans Section - TODO: Full payment system */}
              {hasInstallmentPlans && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <FiSettings className="text-blue-600" />
                        Payment Plans Available
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">Choose an installment plan for flexible payments</p>
                    </div>
                  </div>

                  {/* TODO: Payment Summary Dashboard */}
                  {selectedPlan && (
                    <div className="bg-white rounded-xl p-5 mb-4 border-2 border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Total Fees</p>
                          <p className="text-2xl font-bold text-gray-900">₹{hostel?.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹0</p>
                          {/* TODO: Calculate from installmentPayments */}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Remaining</p>
                          <p className="text-2xl font-bold text-orange-600">₹{hostel?.price}</p>
                          {/* TODO: Calculate remaining amount */}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Selected Plan</p>
                          <p className="text-lg font-bold text-blue-600">{selectedPlan.name}</p>
                        </div>
                      </div>

                      {/* TODO: Installment Payment List */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-3">Payment Schedule</h5>
                        <div className="space-y-2">
                          {selectedPlan.installments?.map((inst, idx) => {
                            const amount = selectedPlan.type === 'percentage' 
                              ? (hostel?.price * inst.value / 100).toFixed(0)
                              : inst.value;
                            
                            return (
                              <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                                <div>
                                  <p className="font-semibold text-gray-900">Installment #{idx + 1}</p>
                                  {inst.dueDate && <p className="text-xs text-gray-500">{inst.dueDate}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{amount}</p>
                                  {/* TODO: Payment status badge */}
                                  <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mt-1">
                                    Pending
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* TODO: Add "Pay Now" button that shows UPI/QR, upload screenshot, enter transaction ID */}
                        <button
                          disabled
                          className="w-full mt-4 px-4 py-3 bg-gray-300 text-gray-600 font-bold rounded-lg cursor-not-allowed"
                        >
                          Payment System - Coming Soon
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Available Plans */}
                  {!selectedPlan && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hostel?.installmentPlans?.map((plan) => (
                        <div
                          key={plan._id}
                          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setExpandedInstallment(expandedInstallment === plan._id ? null : plan._id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-bold text-gray-900 text-lg">{plan.name}</h5>
                              <p className="text-sm text-gray-500 capitalize">{plan.type} based</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {plan.installments?.length} Installments
                            </span>
                          </div>

                          {expandedInstallment === plan._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-2 mb-4"
                            >
                              {plan.installments?.map((inst, idx) => {
                                const amount = plan.type === 'percentage' 
                                  ? (hostel?.price * inst.value / 100).toFixed(0)
                                  : inst.value;
                                
                                return (
                                  <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                    <span className="text-gray-600">
                                      #{idx + 1} {inst.dueDate && `- ${inst.dueDate}`}
                                    </span>
                                    <span className="font-bold text-gray-900">₹{amount}</span>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectInstallmentPlan(assignment._id, plan._id);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Select This Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Review Section */}
              <div className="p-6">
                {assignment.hasReviewed ? (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                    <FiStar className="fill-current" />
                    Review submitted
                  </div>
                ) : (
                  <>
                    {showReviewForm === hostel._id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                          <div className="flex gap-2">
                            {STARS.map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                className="text-3xl"
                              >
                                <span className={star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                          <textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
                            placeholder="Share your experience..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReviewSubmit(hostel._id)}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                          </button>
                          <button
                            onClick={() => setShowReviewForm(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReviewForm(hostel._id)}
                        className="w-full px-4 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiStar /> Write Review
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});
AssignedHostelsManager.displayName = 'AssignedHostelsManager';

// 5. Booking History Manager
const BookingHistoryManager = memo(() => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eligibility, setEligibility] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/visit-bookings/my-bookings`, {
          credentials: 'include',
          signal: abortController.signal
        });
        const bookingsData = await bookingsResponse.json();
        
        // Fetch eligibility
        const eligibilityResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/visit-bookings/check-eligibility`, {
          credentials: 'include',
          signal: abortController.signal
        });
        const eligibilityData = await eligibilityResponse.json();
        
        if (!abortController.signal.aborted) {
          setBookings(bookingsData.bookings || []);
          setEligibility(eligibilityData);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Failed to load bookings.');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No bookings yet</h3>
        <p className="text-gray-500 mt-1">Book a hostel visit to see your booking history here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Visit Bookings</h2>
        <p className="text-gray-500 text-sm">Track your hostel visit bookings and payment history.</p>
      </div>

      {/* Free Visits Summary */}
      {eligibility && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Free Visits Program</h3>
              <p className="text-sm text-gray-600">
                {eligibility.isFree ? (
                  <span className="text-green-700 font-semibold">
                    🎉 You have {eligibility.remainingFreeVisits} free visit{eligibility.remainingFreeVisits !== 1 ? 's' : ''} remaining!
                  </span>
                ) : (
                  <span className="text-gray-600">
                    You've used all {eligibility.completedVisits} free visits. Next visit: ₹299
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{eligibility.completedVisits}/3</div>
              <div className="text-xs text-gray-500 font-semibold">Visits Completed</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking._id}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${booking.hostel?.images?.[0]}`}
                  alt={booking.hostel?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.hostel?.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{booking.hostel?.location}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-yellow-600 font-bold">₹{booking.amount}</p>
                    {booking.isFree && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        FREE VISIT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Payment: {booking.paymentStatus}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  booking.visitStatus === 'completed' ? 'bg-blue-100 text-blue-700' :
                  booking.visitStatus === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                  booking.visitStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  Visit: {booking.visitStatus}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {booking.razorpayPaymentId && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Payment ID: {booking.razorpayPaymentId}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
BookingHistoryManager.displayName = 'BookingHistoryManager';

// 6. Payment Requests Manager
const PaymentRequestsManager = memo(() => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPaymentRequests = async () => {
      try {
        const response = await fetch(`${API_URL}/api/manual-payments/my-requests`, {
          credentials: 'include',
          signal: abortController.signal
        });
        const data = await response.json();
        if (!abortController.signal.aborted) {
          setPaymentRequests(data.requests || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Failed to load payment requests.');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchPaymentRequests();
    return () => abortController.abort();
  }, [API_URL]);

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
      case 'installment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'visit': return 'Visit Booking';
      case 'reservation': return 'Seat Reservation';
      case 'installment': return 'Installment Payment';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  if (paymentRequests.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No payment requests</h3>
        <p className="text-gray-500 mt-1">Your payment submissions will appear here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Payment Requests</h2>
        <p className="text-gray-500 text-sm">Track your payment submissions and approval status.</p>
      </div>

      <div className="space-y-4">
        {paymentRequests.map((request) => (
          <motion.div
            key={request._id}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{request.hostel?.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(request.paymentType)}`}>
                    {getTypeLabel(request.paymentType)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{request.hostel?.location}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">₹{request.amount}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Transaction ID:</label>
                <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg mt-1">{request.upiTransactionId}</p>
              </div>
              {request.sharingType && (
                <div>
                  <label className="text-sm text-gray-600 font-semibold">Sharing Type:</label>
                  <p className="font-medium text-sm bg-gray-50 px-3 py-2 rounded-lg mt-1">{request.sharingType}</p>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="mb-4">
                <label className="text-sm text-gray-600 font-semibold">Notes:</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{request.notes}</p>
              </div>
            )}

            {request.screenshot && (
              <div className="mb-4">
                <label className="text-sm text-gray-600 font-semibold block mb-2">Payment Screenshot:</label>
                <img
                  src={`${API_URL}/uploads/payments/${request.screenshot}`}
                  alt="Payment Screenshot"
                  className="max-w-sm border-2 border-gray-200 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(`${API_URL}/uploads/payments/${request.screenshot}`, '_blank')}
                />
              </div>
            )}

            {request.status === 'rejected' && request.rejectionReason && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <label className="text-sm font-bold text-red-800">Rejection Reason:</label>
                <p className="text-sm text-red-600 mt-1">{request.rejectionReason}</p>
              </div>
            )}

            {request.status === 'approved' && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-2">
                <FiStar className="text-green-600 fill-current" />
                <p className="text-sm font-bold text-green-800">Payment Approved! Your booking is confirmed.</p>
              </div>
            )}

            {request.reviewedBy && request.reviewedAt && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                Reviewed on {new Date(request.reviewedAt).toLocaleString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
PaymentRequestsManager.displayName = 'PaymentRequestsManager';


/* -------------------------------------------------------------------------- */
/* MAIN SHELL COMPONENT                                                       */
/* -------------------------------------------------------------------------- */

const UserProfile = () => {
  const { user, logout, updateUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transform-gpu">
      <div className="max-w-5xl mx-auto">
        
        {/* User Header Card */}
        <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-900 shadow-lg transform rotate-3">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left text-white">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user?.name || 'Student'}</h1>
              <p className="text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                <FiMail /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
          
          {/* Hardware-Accelerated Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 min-w-[200px] flex items-center justify-center gap-3 py-5 px-6 text-sm sm:text-base font-bold transition-colors duration-300 ${
                    isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-yellow-500' : ''} />
                  {tab.label}
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTabProfile"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-t-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Rendering */}
          <div className="p-6 sm:p-10 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' ? (
                <motion.div key="profile" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <ProfileSettings user={user} updateUser={updateUser} onLogout={handleLogout} />
                </motion.div>
              ) : activeTab === 'bookings' ? (
                <motion.div key="bookings" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <BookingHistoryManager />
                </motion.div>
              ) : activeTab === 'payments' ? (
                <motion.div key="payments" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <PaymentRequestsManager />
                </motion.div>
              ) : activeTab === 'assignments' ? (
                <motion.div key="assignments" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <AssignedHostelsManager />
                </motion.div>
              ) : (
                <motion.div key="reviews" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <ReviewManager />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;