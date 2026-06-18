import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const ManualPaymentModal = ({ isOpen, onClose, hostel, paymentType, amount, bookingId, onSuccess }) => {
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [sharingType, setSharingType] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('UPI ID copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!upiTransactionId.trim()) {
      setError('Please enter UPI Transaction ID');
      return;
    }

    if (!screenshot) {
      setError('Please upload payment screenshot');
      return;
    }

    if (paymentType === 'reservation' && !sharingType) {
      setError('Please select sharing type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('hostelId', hostel._id);
      formData.append('upiTransactionId', upiTransactionId);
      formData.append('screenshot', screenshot);
      formData.append('notes', notes);
      
      if (paymentType === 'visit' && bookingId) {
        formData.append('bookingId', bookingId);
      }
      
      if (paymentType === 'reservation') {
        formData.append('sharingType', sharingType);
      }

      const endpoint = paymentType === 'visit' 
        ? `${API_URL}/api/manual-payments/visit`
        : `${API_URL}/api/manual-payments/reservation`;

      const response = await axios.post(endpoint, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Payment submitted successfully! Awaiting hostel approval.');
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const paymentDetails = hostel?.paymentDetails || {};

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
              <p className="text-sm text-gray-500 mt-1">Secure payment for {hostel?.name}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-bold text-lg mb-2 text-gray-900">{hostel?.name}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Amount to Pay:</p>
                <p className="text-3xl font-bold text-blue-600">₹{amount?.toLocaleString()}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {paymentType === 'visit' ? 'Visit Booking' : 'Seat Reservation'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mb-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="font-bold text-gray-900">Payment Instructions</h4>
            </div>
            {paymentDetails.upiId && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-2">UPI ID:</label>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-4 py-3 rounded-lg flex-1 font-mono text-sm border border-gray-300 font-semibold">{paymentDetails.upiId}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentDetails.upiId)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            )}
            
            {paymentDetails.qrCode && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Scan QR Code:</label>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={`${API_URL}/uploads/${paymentDetails.qrCode}`} 
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            )}

            {paymentDetails.paymentInstructions && (
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200">
                {paymentDetails.paymentInstructions}
              </div>
            )}
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {paymentType === 'reservation' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sharing Type *</label>
                <select
                  value={sharingType}
                  onChange={(e) => setSharingType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  required
                >
                  <option value="">Select Sharing Type</option>
                  {hostel?.sharingTypes?.map((type, idx) => (
                    <option key={idx} value={type.name}>
                      {type.name} - ₹{type.price}/{type.priceType}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">UPI Transaction ID *</label>
              <input
                type="text"
                value={upiTransactionId}
                onChange={(e) => setUpiTransactionId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="Enter 12-digit UPI Transaction ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                required
              />
              {preview && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 inline-block">
                  <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                rows="3"
                placeholder="Any additional information..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold text-gray-700 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to escape z-index stacking context
  return createPortal(modalContent, document.body);
};

export default ManualPaymentModal;
