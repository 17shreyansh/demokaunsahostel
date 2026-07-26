import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import logo from '../assets/logo.png';

const HostelManagerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/hostel-manager/auth/forgot-password', { email });
      setSuccess(true);
      setMessage(res.data.message || 'If an account exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-gray-50">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-yellow-400/20 rounded-full blur-[100px] transform-gpu"></div>
        <div className="absolute bottom-0 -left-20 w-[350px] h-[350px] bg-yellow-600/5 rounded-full blur-[120px] transform-gpu"></div>
      </div>

      <motion.div 
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block transform-gpu hover:scale-105 transition-transform will-change-transform mb-6">
              <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                <img src={logo} alt="KaunsaHostel" className="h-8 object-contain" />
                <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
                <span className="text-gray-900 font-bold tracking-tight text-sm">Owner Portal</span>
              </div>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Reset Password
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
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

            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl overflow-hidden"
              >
                <div className="flex items-center">
                  <FiCheckCircle className="text-xl mr-3 flex-shrink-0" />
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-yellow-600">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                    <FiMail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-500 transition-all duration-300 shadow-sm hover:bg-white"
                    placeholder="manager@kaunsahostel.com"
                  />
                </div>
              </div>

              <div className="pt-2">
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
                      <span className="text-sm sm:text-base">Sending...</span>
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => setSuccess(false)}
                className="w-full flex justify-center py-3 sm:py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm sm:text-base font-bold rounded-xl focus:outline-none transition-all duration-300"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link to="/hostel-manager/auth" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-yellow-600 transition-colors group active:scale-95">
              <span className="transform-gpu group-hover:-translate-x-1 transition-transform">←</span> Back to Login
            </Link>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};

export default HostelManagerForgotPassword;
