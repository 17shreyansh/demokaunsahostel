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
  { id: 'reviews', label: 'My Reviews', icon: FiMessageSquare }
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