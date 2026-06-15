import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';

const HostelManagerKYC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    gstNumber: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: ''
  });
  const [files, setFiles] = useState({ panCard: null, bankProof: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { submitKYC, manager } = useHostelManager();
  const navigate = useNavigate();

  if (manager?.kyc?.status === 'submitted') {
    return (
      <HostelManagerLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-blue-600 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">KYC Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">Your KYC documents are under review. We'll notify you once verified. This typically takes 24-48 hours.</p>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  if (manager?.kyc?.status === 'verified') {
    navigate('/hostel-manager/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.panCard) data.append('panCard', files.panCard);
    if (files.bankProof) data.append('bankProof', files.bankProof);

    try {
      await submitKYC(data);
      navigate('/hostel-manager/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostelManagerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h2 className="text-4xl font-bold mb-3">Complete KYC Verification</h2>
            <p className="text-blue-100 text-lg">Secure your account and start listing your properties in just a few steps.</p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <span className="text-sm font-medium text-gray-700">Company Details</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span className="text-sm font-medium text-gray-700">Documents</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <span className="text-sm font-medium text-gray-700">Bank Details</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg mb-6 flex items-start gap-3">
                <FiAlertCircle className="text-2xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Details */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Company Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="ABC Properties Pvt Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Type *</label>
                    <select
                      required
                      value={formData.companyType}
                      onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select Type</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="private-limited">Private Limited</option>
                      <option value="public-limited">Public Limited</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Upload Documents
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Card *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                      <input
                        type="file"
                        id="panCard"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, panCard: e.target.files[0] })}
                        className="hidden"
                      />
                      <label htmlFor="panCard" className="cursor-pointer">
                        <FiUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{files.panCard ? files.panCard.name : 'Click to upload PAN Card'}</p>
                        <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 5MB)</p>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Passbook/Cheque *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                      <input
                        type="file"
                        id="bankProof"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, bankProof: e.target.files[0] })}
                        className="hidden"
                      />
                      <label htmlFor="bankProof" className="cursor-pointer">
                        <FiUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{files.bankProof ? files.bankProof.name : 'Click to upload Bank Proof'}</p>
                        <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 5MB)</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Bank Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="SBIN0001234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="State Bank of India"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/hostel-manager/dashboard')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit KYC for Verification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <FiAlertCircle /> Why KYC is Required?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
            <li>Ensures security and authenticity of hostel listings</li>
            <li>Builds trust with potential customers</li>
            <li>Complies with legal regulations</li>
            <li>Enables secure financial transactions</li>
          </ul>
        </div>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerKYC;
