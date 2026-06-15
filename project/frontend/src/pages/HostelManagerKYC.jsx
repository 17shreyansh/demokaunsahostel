import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiUpload, FiCheck, FiAlertCircle, FiClock, FiXCircle, FiFileText } from 'react-icons/fi';

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

  // KYC Verified - Success State
  if (manager?.kyc?.status === 'verified') {
    return (
      <HostelManagerLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">KYC Verified!</h2>
            <p className="text-gray-600 mb-2">Your account has been successfully verified on:</p>
            <p className="text-lg font-semibold text-green-600 mb-6">
              {new Date(manager.kyc.verifiedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-600 mb-8">You can now add and manage your hostels.</p>
            <button
              onClick={() => navigate('/hostel-manager/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  // KYC Submitted - Under Review State
  if (manager?.kyc?.status === 'submitted') {
    return (
      <HostelManagerLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-10 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiClock className="text-blue-600 text-4xl" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">KYC Under Review</h2>
              <p className="text-gray-600 mb-2">Your KYC documents are being reviewed by our admin team.</p>
              <p className="text-sm text-gray-500">Submitted on: {new Date(manager.kyc.submittedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            {/* Submitted Details - Read Only */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submitted Information</h3>
              
              {/* Company Details */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Company Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Company Name:</span>
                    <p className="font-medium">{manager.kyc.companyDetails?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Company Type:</span>
                    <p className="font-medium capitalize">{manager.kyc.companyDetails?.companyType || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">GST Number:</span>
                    <p className="font-medium">{manager.kyc.companyDetails?.gstNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Bank Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Account Holder Name:</span>
                    <p className="font-medium">{manager.kyc.bankDetails?.accountHolderName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Account Number:</span>
                    <p className="font-medium">{manager.kyc.bankDetails?.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">IFSC Code:</span>
                    <p className="font-medium">{manager.kyc.bankDetails?.ifscCode || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Bank Name:</span>
                    <p className="font-medium">{manager.kyc.bankDetails?.bankName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded border">
                    <FiFileText className="text-blue-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium">PAN Card</p>
                      <p className="text-xs text-green-600">Uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded border">
                    <FiFileText className="text-blue-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium">Bank Proof</p>
                      <p className="text-xs text-green-600">Uploaded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Review typically takes 24-48 hours. You'll be notified via email once your KYC is verified. Data cannot be edited while under review.
              </p>
            </div>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  // KYC Rejected - Can Resubmit
  if (manager?.kyc?.status === 'rejected') {
    return (
      <HostelManagerLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Rejection Notice */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
              <div className="flex items-start gap-3">
                <FiXCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">KYC Application Rejected</h3>
                  <p className="text-red-800 mb-2">
                    Your KYC was rejected on: {new Date(manager.kyc.rejectedAt || manager.kyc.submittedAt).toLocaleDateString('en-IN')}
                  </p>
                  <div className="bg-white rounded p-4 mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Reason for Rejection:</p>
                    <p className="text-gray-900">{manager.kyc.rejectionReason || 'No reason provided'}</p>
                  </div>
                  <p className="text-sm text-red-700 mt-3">
                    Please review the rejection reason, correct the information, and resubmit your KYC application.
                  </p>
                </div>
              </div>
            </div>

            {/* Resubmission Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resubmit KYC Application</h2>
              <KYCForm 
                formData={formData}
                setFormData={setFormData}
                files={files}
                setFiles={setFiles}
                error={error}
                loading={loading}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError('');
                  setLoading(true);

                  const data = new FormData();
                  Object.keys(formData).forEach(key => data.append(key, formData[key]));
                  if (files.panCard) data.append('panCard', files.panCard);
                  if (files.bankProof) data.append('bankProof', files.bankProof);

                  try {
                    await submitKYC(data);
                    navigate('/hostel-manager/kyc');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to submit KYC');
                  } finally {
                    setLoading(false);
                  }
                }}
                onCancel={() => navigate('/hostel-manager/dashboard')}
              />
            </div>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  // KYC Pending/First Time - Show Form
  return (
    <HostelManagerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h2 className="text-4xl font-bold mb-3">Complete KYC Verification</h2>
            <p className="text-blue-100 text-lg">Secure your account and start listing your properties</p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <span className="text-sm font-medium text-gray-700">Company</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <span className="text-sm font-medium text-gray-700">Documents</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <span className="text-sm font-medium text-gray-700">Bank</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <KYCForm 
              formData={formData}
              setFormData={setFormData}
              files={files}
              setFiles={setFiles}
              error={error}
              loading={loading}
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setLoading(true);

                const data = new FormData();
                Object.keys(formData).forEach(key => data.append(key, formData[key]));
                if (files.panCard) data.append('panCard', files.panCard);
                if (files.bankProof) data.append('bankProof', files.bankProof);

                try {
                  await submitKYC(data);
                  navigate('/hostel-manager/kyc');
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to submit KYC');
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => navigate('/hostel-manager/dashboard')}
            />
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

// Reusable KYC Form Component
const KYCForm = ({ formData, setFormData, files, setFiles, error, loading, onSubmit, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg flex items-start gap-3">
          <FiAlertCircle className="text-2xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

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
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
              title="Please enter a valid GST number"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
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
                <p className="text-sm text-gray-600 font-medium">
                  {files.panCard ? files.panCard.name : 'Click to upload PAN Card'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 10MB)</p>
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
                <p className="text-sm text-gray-600 font-medium">
                  {files.bankProof ? files.bankProof.name : 'Click to upload Bank Proof'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 10MB)</p>
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
              pattern="[0-9]{9,18}"
              title="Please enter a valid account number (9-18 digits)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code *</label>
            <input
              type="text"
              required
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="SBIN0001234"
              pattern="[A-Z]{4}0[A-Z0-9]{6}"
              title="Please enter a valid IFSC code"
            />
            <p className="text-xs text-gray-500 mt-1">Format: SBIN0001234</p>
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

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
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
  );
};

export default HostelManagerKYC;
