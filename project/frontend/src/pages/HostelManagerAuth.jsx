import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHostelManager } from '../contexts/HostelManagerContext';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiBriefcase, FiTrendingUp, FiShield, FiPieChart } from 'react-icons/fi';
import logo from '../assets/logo.png';

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const MemoizedInputField = memo(({ id, name, type, label, value, onChange, icon: Icon, required, placeholder, showPasswordToggle, onTogglePassword, isPasswordVisible }) => (
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
        value={value}
        onChange={onChange}
        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-500 transition-all duration-300 shadow-sm hover:bg-white"
        placeholder={placeholder}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-600 transition-colors focus:outline-none transform-gpu will-change-transform"
        >
          {isPasswordVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      )}
    </div>
  </div>
));
MemoizedInputField.displayName = 'MemoizedInputField';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const HostelManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, signup, manager, loading: authLoading } = useHostelManager();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && manager) {
      navigate('/hostel-manager/dashboard');
    }
  }, [manager, authLoading, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }, [error]);

  const togglePasswordVisibility = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData);
      }
      navigate('/hostel-manager/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 transform-gpu">
      
      {/* 
        LEFT SIDE - Premium Agency Info Panel
        Dark background with white logo pill
      */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-gray-900 p-6 md:p-8 lg:p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
        {/* Hardware-Accelerated Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] bg-yellow-500/10 rounded-full blur-[100px] transform-gpu"></div>
          <div className="absolute bottom-0 -left-20 w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] bg-yellow-600/5 rounded-full blur-[120px] transform-gpu"></div>
        </div>

        {/* LOGO FIX: Wrapped in a premium white pill card to stand out on dark BG */}
        <div className="relative z-10">
          <Link to="/" className="inline-block transform-gpu hover:scale-105 transition-transform will-change-transform">
            <div className="bg-white px-4 py-2.5 lg:px-5 lg:py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 lg:gap-3">
              <img src={logo} alt="KaunsaHostel" className="h-8 lg:h-10 object-contain" />
              <div className="w-px h-5 lg:h-6 bg-gray-200 mx-0.5 lg:mx-1"></div>
              <span className="text-gray-900 font-bold tracking-tight text-sm lg:text-base">Partners</span>
            </div>
          </Link>
        </div>
        
        {/* Value Proposition */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 lg:mb-6 leading-tight">
            Scale Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm">
              Hostel Business
            </span>
          </h1>
          <p className="text-base lg:text-lg text-gray-400 mb-8 lg:mb-10 leading-relaxed">
            Join the premier platform for hostel owners. Digitize your management, increase your visibility, and grow your revenue effortlessly.
          </p>
          
          {/* Features List */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 text-yellow-500">
                <FiPieChart size={20} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm lg:text-base text-gray-100">Centralized Dashboard</h4>
                <p className="text-xs lg:text-sm text-gray-400">Manage all your properties & analytics in one place</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 text-yellow-500">
                <FiTrendingUp size={20} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm lg:text-base text-gray-100">Increased Visibility</h4>
                <p className="text-xs lg:text-sm text-gray-400">Reach thousands of verified students instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 text-yellow-500">
                <FiShield size={20} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm lg:text-base text-gray-100">Secure Operations</h4>
                <p className="text-xs lg:text-sm text-gray-400">Verified reviews and secure booking management</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 text-gray-500 text-xs lg:text-sm font-medium">
          <p>© {new Date().getFullYear()} KaunsaHostel Partners. All rights reserved.</p>
        </div>
      </div>

      {/* 
        RIGHT SIDE - High-Trust Form 
        Crisp white background for inputs
      */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-gray-50 min-h-screen lg:min-h-0">
        
        {/* Mobile Background Blob */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-yellow-400/20 lg:bg-yellow-400/10 rounded-full blur-[100px] transform-gpu"></div>
        </div>

        {/* Mobile Logo - Shows only on small screens */}
        <div className="lg:hidden absolute top-6 left-4 z-20">
          <Link to="/" className="inline-block">
            <div className="bg-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <img src={logo} alt="KaunsaHostel" className="h-6 object-contain" />
              <div className="w-px h-4 bg-gray-200"></div>
              <span className="text-gray-900 font-bold text-xs">Partners</span>
            </div>
          </Link>
        </div>

        <motion.div 
          className="max-w-md w-full relative z-10 mt-16 lg:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            <div className="text-center mb-6 sm:mb-8">
              <div className="lg:hidden inline-flex items-center justify-center px-3 py-1 mb-4 sm:mb-5 text-xs font-bold tracking-wide text-yellow-800 uppercase bg-yellow-100 rounded-full">
                Partner Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Partner With Us'}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium">
                {isLogin ? 'Sign in to manage your properties' : 'Register your business to get started'}
              </p>
            </div>

            {/* Error Message Animation */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl overflow-hidden"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3 flex-shrink-0">⚠️</span>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dynamic Signup Fields */}
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden will-change-transform"
                  >
                    <div className="pb-5 space-y-5">
                      <MemoizedInputField
                        id="name" name="name" type="text" label="Full Name"
                        icon={FiUser} required={!isLogin}
                        value={formData.name} onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                      <MemoizedInputField
                        id="phone" name="phone" type="tel" label="Phone Number"
                        icon={FiPhone} required={!isLogin}
                        value={formData.phone} onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                      <MemoizedInputField
                        id="businessName" name="businessName" type="text" label="Hostel/Business Name"
                        icon={FiBriefcase} required={false}
                        value={formData.businessName} onChange={handleChange}
                        placeholder="Enter hostel name (optional)"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <MemoizedInputField
                id="email" name="email" type="email" label="Business Email"
                icon={FiMail} required={true}
                value={formData.email} onChange={handleChange}
                placeholder="manager@example.com"
              />

              <MemoizedInputField
                id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password"
                icon={FiLock} required={true}
                value={formData.password} onChange={handleChange}
                placeholder="Enter your password"
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onTogglePassword={togglePasswordVisibility}
              />

              {isLogin && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 transition-colors" />
                    <span className="ml-2 text-sm font-medium text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm font-bold text-gray-600 hover:text-yellow-600 transition-colors transform-gpu will-change-transform">
                    Forgot password?
                  </button>
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 sm:py-4 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 text-sm sm:text-base font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 transition-all duration-300 shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] transform-gpu hover:-translate-y-0.5 will-change-transform active:scale-95">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-gray-900" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Processing...</span>
                    </span>
                  ) : (
                    isLogin ? 'Sign In to Dashboard' : 'Submit Application'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={toggleAuthMode}
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors transform-gpu will-change-transform active:scale-95"
              >
                {isLogin ? (
                  <span>New to the platform? <span className="font-bold text-gray-900 hover:text-yellow-600 transition-colors">Register Business</span></span>
                ) : (
                  <span>Already a partner? <span className="font-bold text-gray-900 hover:text-yellow-600 transition-colors">Sign in</span></span>
                )}
              </button>
            </div>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 text-center">
              <Link to="/" className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors group active:scale-95">
                <span className="transform-gpu group-hover:-translate-x-1 transition-transform">←</span> Return to Main Site
              </Link>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HostelManagerAuth;