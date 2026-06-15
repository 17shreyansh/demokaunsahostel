import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const AdminHostelManagers = () => {
  const [managers, setManagers] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        axios.get('/api/admin/managers', { withCredentials: true }),
        axios.get('/api/admin/managers/kyc/pending', { withCredentials: true })
      ]);
      setManagers(allRes.data.managers);
      setPendingKYC(pendingRes.data.managers);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this KYC? This will verify the manager and all their hostels.')) return;
    try {
      await axios.post(`/api/admin/managers/${id}/kyc/approve`, {}, { withCredentials: true });
      alert('✅ KYC approved successfully! Manager can now list hostels.');
      fetchData();
      setSelectedManager(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      await axios.post(`/api/admin/managers/${rejectionModal._id}/kyc/reject`, 
        { reason: rejectionReason }, 
        { withCredentials: true }
      );
      alert('❌ KYC rejected. Manager will be notified to resubmit.');
      fetchData();
      setSelectedManager(null);
      setRejectionModal(null);
      setRejectionReason('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject KYC');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`/api/admin/managers/${id}/toggle-status`, {}, { withCredentials: true });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading managers...</p>
        </div>
      </div>
    );
  }

  const displayList = selectedTab === 'all' ? managers : pendingKYC;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Hostel Manager Management</h2>
        <p className="text-gray-600 mt-1">Manage hostel managers and review KYC submissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setSelectedTab('all')} 
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            selectedTab === 'all' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          All Managers ({managers.length})
        </button>
        <button 
          onClick={() => setSelectedTab('pending')} 
          className={`px-6 py-3 rounded-lg font-semibold transition relative ${
            selectedTab === 'pending' 
              ? 'bg-yellow-600 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          Pending KYC ({pendingKYC.length})
          {pendingKYC.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {pendingKYC.length}
            </span>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostels</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FiAlertCircle className="mx-auto text-4xl mb-2 text-gray-400" />
                    <p>No managers found</p>
                  </td>
                </tr>
              ) : (
                displayList.map((manager) => (
                  <tr key={manager._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{manager.name}</div>
                        <div className="text-sm text-gray-500">ID: {manager._id.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{manager.email}</div>
                        <div className="text-gray-500">{manager.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                        manager.kyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                        manager.kyc.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        manager.kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {manager.kyc.status === 'verified' && <FiCheckCircle />}
                        {manager.kyc.status === 'submitted' && <FiClock />}
                        {manager.kyc.status === 'rejected' && <FiXCircle />}
                        {manager.kyc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {manager.hostels?.length || 0} hostels
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(manager._id)} 
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition ${
                          manager.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {manager.isActive ? <><FiCheck /> Active</> : <><FiX /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedManager(manager)} 
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <FiEye /> View
                        </button>
                        {manager.kyc.status === 'submitted' && (
                          <>
                            <button 
                              onClick={() => handleApprove(manager._id)} 
                              className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1"
                            >
                              <FiCheck /> Approve
                            </button>
                            <button 
                              onClick={() => {
                                setRejectionModal(manager);
                                setRejectionReason('');
                              }} 
                              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                            >
                              <FiX /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Details Modal */}
      {selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedManager(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Manager Details</h3>
                <p className="text-gray-500 text-sm mt-1">Complete profile and KYC information</p>
              </div>
              <button onClick={() => setSelectedManager(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedManager.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedManager.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedManager.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">KYC Status:</span>
                    <p className="font-medium capitalize">{selectedManager.kyc.status}</p>
                  </div>
                </div>
              </div>
              
              {selectedManager.kyc.status !== 'pending' && (
                <>
                  {/* Company Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Company Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Company Name:</span>
                        <p className="font-medium">{selectedManager.kyc.companyDetails?.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Company Type:</span>
                        <p className="font-medium capitalize">{selectedManager.kyc.companyDetails?.companyType || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">GST Number:</span>
                        <p className="font-medium font-mono">{selectedManager.kyc.companyDetails?.gstNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Documents</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="font-medium">PAN Card</span>
                        {selectedManager.kyc.documents?.panCard ? (
                          <a 
                            href={`http://localhost:5000${selectedManager.kyc.documents.panCard}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <FiEye /> View Document
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not uploaded</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="font-medium">Bank Proof</span>
                        {selectedManager.kyc.documents?.bankProof ? (
                          <a 
                            href={`http://localhost:5000${selectedManager.kyc.documents.bankProof}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <FiEye /> View Document
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bank Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2">
                        <span className="text-gray-500">Account Holder:</span>
                        <p className="font-medium">{selectedManager.kyc.bankDetails?.accountHolderName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Account Number:</span>
                        <p className="font-medium font-mono">{selectedManager.kyc.bankDetails?.accountNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">IFSC Code:</span>
                        <p className="font-medium font-mono">{selectedManager.kyc.bankDetails?.ifscCode || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Bank Name:</span>
                        <p className="font-medium">{selectedManager.kyc.bankDetails?.bankName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason if rejected */}
                  {selectedManager.kyc.status === 'rejected' && selectedManager.kyc.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-bold text-red-900 mb-2">Rejection Reason</h4>
                      <p className="text-red-800 text-sm">{selectedManager.kyc.rejectionReason}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedManager.kyc.status === 'submitted' && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedManager._id)} 
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <FiCheck /> Approve KYC
                    </button>
                    <button 
                      onClick={() => {
                        setRejectionModal(selectedManager);
                        setSelectedManager(null);
                      }} 
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <FiX /> Reject KYC
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedManager(null)} 
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setRejectionModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reject KYC Application</h3>
            <p className="text-gray-600 mb-4">Please provide a clear reason for rejection. The manager will use this to correct and resubmit.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., PAN card image is not clear, GST number verification failed, bank details do not match..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setRejectionModal(null)} 
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHostelManagers;
