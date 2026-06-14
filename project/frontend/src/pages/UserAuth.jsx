import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// Strictly isolates render cycles. Typing in one input will NOT re-render the others.
const MemoizedInputField = memo(({ id, name, type, label, value, onChange, icon: Icon, required, minLength }) => (
  <div className="relative group">
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
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-500 transition-all duration-300 shadow-sm hover:bg-white"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  </div>
));

MemoizedInputField.displayName = 'MemoizedInputField';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, signup } = useUser();

  // Preserves referential equality to prevent child re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }, [error]);

  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setError('');
    // Optional: clear form data on toggle
    // setFormData({ name: '', email: '', password: '', phone: '' });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Your backend is configured for credentials: true (cookies), 
        // the context provider will handle the secure storage implicitly.
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }, [isLogin, formData, login, signup, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden transform-gpu">
      
      {/* GPU-Accelerated Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px] transform-gpu"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] transform-gpu"></div>
      </div>

      <motion.div 
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/60">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {isLogin ? 'Enter your credentials to access your account' : 'Join us to find your perfect hostel stay'}
            </p>
          </div>
          
          {/* Error Handling */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50/80 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl overflow-hidden"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Animated Signup Fields */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                  style={{ willChange: 'height, opacity' }}
                >
                  <div className="pb-5">
                    <MemoizedInputField
                      id="name"
                      name="name"
                      type="text"
                      label="Full Name"
                      icon={FiUser}
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <MemoizedInputField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              icon={FiMail}
              required={true}
              value={formData.email}
              onChange={handleChange}
            />

            <MemoizedInputField
              id="password"
              name="password"
              type="password"
              label="Password"
              icon={FiLock}
              required={true}
              minLength={6}
              value={formData.password}
              onChange={handleChange}
            />

            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                  style={{ willChange: 'height, opacity' }}
                >
                  <div className="pt-5">
                    <MemoizedInputField
                      id="phone"
                      name="phone"
                      type="tel"
                      label="Phone Number"
                      icon={FiPhone}
                      required={!isLogin}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex items-center justify-end pt-1">
                <button type="button" className="text-sm font-semibold text-gray-600 hover:text-yellow-600 transition-colors">
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 will-change-transform"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="font-bold text-gray-900 hover:text-yellow-600 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};

export default UserAuth;