import { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { useTheme, ThemeProvider } from '../contexts/ThemeContext';
import { FiUser, FiLock, FiMoon, FiSun, FiShield } from 'react-icons/fi';
import logo from '../assets/logo.png';

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// Isolated Input Field ensures keystrokes do NOT re-render the surrounding page layout
const MemoizedInputField = memo(({ id, name, type, label, value, onChange, icon: Icon, required, placeholder, isDark }) => (
  <div className="relative group">
    <label htmlFor={id} className={`block text-sm font-semibold mb-1.5 transition-colors duration-300 ${isDark ? 'text-gray-300 group-focus-within:text-yellow-500' : 'text-gray-700 group-focus-within:text-yellow-600'}`}>
      {label}
    </label>
    <div className="relative">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isDark ? 'text-gray-500 group-focus-within:text-yellow-500' : 'text-gray-400 group-focus-within:text-yellow-600'}`}>
        <Icon size={18} />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-300 shadow-sm ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 hover:bg-gray-800' 
            : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 hover:bg-white'
        }`}
        placeholder={placeholder}
      />
    </div>
  </div>
));
MemoizedInputField.displayName = 'MemoizedInputField';

/* -------------------------------------------------------------------------- */
/* MAIN CONTENT COMPONENT                                                     */
/* -------------------------------------------------------------------------- */

const AdminLoginContent = () => {
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Preserves referential equality to prevent child re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.adminLogin(formData);
      // Token is in HTTP-only cookie
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center transition-colors duration-500 overflow-hidden transform-gpu ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* GPU-Accelerated Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] transform-gpu transition-colors duration-700 ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-400/20'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[100px] transform-gpu transition-colors duration-700 ${isDark ? 'bg-blue-600/10' : 'bg-blue-900/10'}`}></div>
      </div>

      {/* Theme Toggle Button */}
      {/* <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3.5 rounded-full  shadow-lg transition-all duration-300 transform-gpu hover:scale-110 z-50 ${
          isDark ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700' : 'bg-white/80 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Toggle Theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.div>
        </AnimatePresence>
      </button> */}

      <motion.div 
        className="max-w-md w-full relative z-10 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={` p-8 sm:p-10 rounded-3xl shadow-2xl border transition-colors duration-500 ${
          isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/60'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-5 transform-gpu hover:scale-105 transition-transform">
              <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
                <img src={logo} alt="KaunsaHostel" className="h-8 object-contain" />
                <div className="w-px h-5 bg-gray-200"></div>
                <span className="text-gray-900 font-bold text-sm">Admin</span>
              </div>
            </Link>
            <h2 className={`text-3xl font-extrabold tracking-tight mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Admin Portal
            </h2>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Secure access to hostel management
            </p>
          </div>
          
          {/* Error Handling */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`border-l-4 p-4 rounded-r-xl overflow-hidden ${
                  isDark ? 'bg-red-500/10 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3 flex-shrink-0">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <MemoizedInputField
              id="username" name="username" type="text" label="Administrator Username"
              icon={FiUser} required={true} isDark={isDark}
              value={formData.username} onChange={handleChange}
              placeholder="Enter your username"
            />

            <MemoizedInputField
              id="password" name="password" type="password" label="Master Password"
              icon={FiLock} required={true} isDark={isDark}
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl transform-gpu hover:-translate-y-0.5 will-change-transform"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Secure Login'
                )}
              </button>
            </div>
          </form>


          
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ROOT WRAPPER                                                               */
/* -------------------------------------------------------------------------- */

const AdminLogin = () => {
  return (
    <ThemeProvider>
      <AdminLoginContent />
    </ThemeProvider>
  );
};

export default AdminLogin;