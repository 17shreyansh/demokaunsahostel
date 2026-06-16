import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Eye, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, Building2, Landmark, User, ShieldAlert } from 'lucide-react';

const AdminHostelManagers = () => {
  const [managers, setManagers] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // --------------------------------------------------------------------------
  // BUSINESS LOGIC (Unchanged)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // UI HELPERS
  // --------------------------------------------------------------------------
  const getKycBadge = (status) => {
    const styles = {
      verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      submitted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20'
    };
    const icons = {
      verified: <CheckCircle2 size={14} />,
      submitted: <Clock size={14} />,
      rejected: <XCircle size={14} />
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset capitalize ${styles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Loading managers...</p>
      </div>
    );
  }

  const displayList = selectedTab === 'all' ? managers : pendingKYC;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Hostel Owner Management</h2>
        <p className="text-sm text-gray-500 mt-1">Manage hostel owners and review KYC submissions.</p>
      </div>

      {/* Sleek Segmented Control Tabs */}
      <div className="flex mb-6">
        <div className="inline-flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
          <button 
            onClick={() => setSelectedTab('all')} 
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
              selectedTab === 'all' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Owners
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedTab === 'all' ? 'bg-gray-100' : 'bg-gray-200/50'}`}>
              {managers.length}
            </span>
          </button>
          <button 
            onClick={() => setSelectedTab('pending')} 
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none relative ${
              selectedTab === 'pending' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending KYC
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedTab === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200/50'}`}>
              {pendingKYC.length}
            </span>
            {pendingKYC.length > 0 && selectedTab !== 'pending' && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Owner</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Contact</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">KYC Status</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Hostels</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Account Status</th>
                <th className="px-6 py-3.5 text-right font-semibold text-gray-900 tracking-tight">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                        <AlertCircle className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-900">No owners found</p>
                      <p className="text-xs text-gray-500 mt-1">There are currently no records in this view.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayList.map((manager) => (
                  <tr key={manager._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {manager.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{manager.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {manager._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{manager.email}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{manager.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getKycBadge(manager.kyc.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {manager.hostels?.length || 0} listings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(manager._id)} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          manager.isActive 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100' 
                            : 'bg-gray-50 text-gray-600 ring-gray-500/20 hover:bg-gray-100'
                        }`}
                        title={manager.isActive ? "Deactivate Account" : "Activate Account"}
                      >
                        {manager.isActive ? <><Check size={14} /> Active</> : <><X size={14} /> Suspended</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedManager(manager)} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {manager.kyc.status === 'submitted' && (
                          <>
                            <button 
                              onClick={() => handleApprove(manager._id)} 
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              title="Approve KYC"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setRejectionModal(manager);
                                setRejectionReason('');
                              }} 
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                              title="Reject KYC"
                            >
                              <X size={18} />
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
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" 
          onClick={() => setSelectedManager(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200 custom-scrollbar" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">Owner Profile & KYC</h3>
                <p className="text-gray-500 text-sm mt-1">Review applicant details and verified documents.</p>
              </div>
              <button 
                onClick={() => setSelectedManager(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              
              {/* Basic Info */}
              <section>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  <User size={16} className="text-blue-500" /> Personal Details
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Full Name</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedManager.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Email Address</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedManager.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Phone Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedManager.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">KYC Status</dt>
                    <dd className="text-sm font-semibold text-gray-900">{getKycBadge(selectedManager.kyc.status)}</dd>
                  </div>
                </dl>
              </section>
              
              {selectedManager.kyc.status !== 'pending' && (
                <>
                  {/* Company Details */}
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                      <Building2 size={16} className="text-purple-500" /> Business Information
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                      <div>
                        <dt className="text-xs font-medium text-gray-500 mb-1">Company Name</dt>
                        <dd className="text-sm font-semibold text-gray-900">{selectedManager.kyc.companyDetails?.companyName || 'Not Provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 mb-1">Entity Type</dt>
                        <dd className="text-sm font-semibold text-gray-900 capitalize">{selectedManager.kyc.companyDetails?.companyType || 'Not Provided'}</dd>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <dt className="text-xs font-medium text-gray-500 mb-1">GST Number</dt>
                        <dd className="text-sm font-semibold text-gray-900 font-mono tracking-wide">{selectedManager.kyc.companyDetails?.gstNumber || 'Not Provided'}</dd>
                      </div>
                    </dl>
                  </section>
                  
                  {/* Bank Details */}
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                      <Landmark size={16} className="text-emerald-500" /> Banking Information
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                      <div className="col-span-1 sm:col-span-2">
                        <dt className="text-xs font-medium text-gray-500 mb-1">Account Holder Name</dt>
                        <dd className="text-sm font-semibold text-gray-900">{selectedManager.kyc.bankDetails?.accountHolderName || 'Not Provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 mb-1">Account Number</dt>
                        <dd className="text-sm font-semibold text-gray-900 font-mono tracking-wide">{selectedManager.kyc.bankDetails?.accountNumber || 'Not Provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 mb-1">IFSC Code</dt>
                        <dd className="text-sm font-semibold text-gray-900 font-mono tracking-wide">{selectedManager.kyc.bankDetails?.ifscCode || 'Not Provided'}</dd>
                      </div>
                      <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-200">
                        <dt className="text-xs font-medium text-gray-500 mb-1">Bank Name</dt>
                        <dd className="text-sm font-semibold text-gray-900">{selectedManager.kyc.bankDetails?.bankName || 'Not Provided'}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Documents */}
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                      <FileText size={16} className="text-amber-500" /> Verification Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PAN Card */}
                      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <FileText size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">PAN Card</p>
                            <p className="text-xs text-gray-500">{selectedManager.kyc.documents?.panCard ? 'Uploaded' : 'Missing'}</p>
                          </div>
                        </div>
                        {selectedManager.kyc.documents?.panCard && (
                          <a 
                            href={`http://localhost:5000${selectedManager.kyc.documents.panCard}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="View Document"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                      </div>

                      {/* Bank Proof */}
                      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Landmark size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Bank Proof</p>
                            <p className="text-xs text-gray-500">{selectedManager.kyc.documents?.bankProof ? 'Uploaded' : 'Missing'}</p>
                          </div>
                        </div>
                        {selectedManager.kyc.documents?.bankProof && (
                          <a 
                            href={`http://localhost:5000${selectedManager.kyc.documents.bankProof}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="View Document"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Rejection Reason if rejected */}
                  {selectedManager.kyc.status === 'rejected' && selectedManager.kyc.rejectionReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mt-6">
                      <h4 className="flex items-center gap-2 font-semibold text-rose-900 mb-2">
                        <ShieldAlert size={16} /> Prior Rejection Reason
                      </h4>
                      <p className="text-rose-800 text-sm leading-relaxed">{selectedManager.kyc.rejectionReason}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                {selectedManager.kyc.status === 'submitted' && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedManager._id)} 
                      className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                      <Check size={16} /> Approve Verification
                    </button>
                    <button 
                      onClick={() => {
                        setRejectionModal(selectedManager);
                        setSelectedManager(null);
                      }} 
                      className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                    >
                      <X size={16} /> Reject Application
                    </button>
                  </>
                )}
                {selectedManager.kyc.status !== 'submitted' && (
                  <button 
                    onClick={() => setSelectedManager(null)} 
                    className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 ml-auto"
                  >
                    Close Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200" 
          onClick={() => setRejectionModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Reject Application</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 mt-2">
              Please provide a clear reason for rejection. The owner will use this feedback to correct and resubmit their documents.
            </p>
            
            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection <span className="text-rose-500">*</span></label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., PAN card image is blurred, GST verification failed..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors resize-none text-sm outline-none"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setRejectionModal(null)} 
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-rose-600 text-white px-4 py-2.5 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:bg-rose-600 disabled:cursor-not-allowed font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHostelManagers;