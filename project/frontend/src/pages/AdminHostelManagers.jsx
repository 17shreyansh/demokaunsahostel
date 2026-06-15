import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminHostelManagers = () => {
  const [managers, setManagers] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this KYC?')) return;
    try {
      await axios.post(`/api/admin/managers/${id}/kyc/approve`, {}, { withCredentials: true });
      alert('KYC approved successfully');
      fetchData();
      setSelectedManager(null);
    } catch (error) {
      alert('Failed to approve KYC');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.post(`/api/admin/managers/${id}/kyc/reject`, { reason }, { withCredentials: true });
      alert('KYC rejected');
      fetchData();
      setSelectedManager(null);
    } catch (error) {
      alert('Failed to reject KYC');
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

  if (loading) return <div className="p-6">Loading...</div>;

  const displayList = selectedTab === 'all' ? managers : pendingKYC;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Hostel Manager Management</h2>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setSelectedTab('all')} className={`px-4 py-2 rounded ${selectedTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          All Managers ({managers.length})
        </button>
        <button onClick={() => setSelectedTab('pending')} className={`px-4 py-2 rounded ${selectedTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Pending KYC ({pendingKYC.length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostels</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayList.map((manager) => (
              <tr key={manager._id}>
                <td className="px-6 py-4 whitespace-nowrap">{manager.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    manager.kyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                    manager.kyc.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    manager.kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {manager.kyc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.hostels?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleStatus(manager._id)} className={`px-2 py-1 text-xs rounded ${manager.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {manager.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => setSelectedManager(manager)} className="text-blue-600 hover:underline mr-2">View</button>
                  {manager.kyc.status === 'submitted' && (
                    <>
                      <button onClick={() => handleApprove(manager._id)} className="text-green-600 hover:underline mr-2">Approve</button>
                      <button onClick={() => handleReject(manager._id)} className="text-red-600 hover:underline">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedManager(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Manager Details</h3>
            <div className="space-y-3">
              <div><strong>Name:</strong> {selectedManager.name}</div>
              <div><strong>Email:</strong> {selectedManager.email}</div>
              <div><strong>Phone:</strong> {selectedManager.phone}</div>
              
              {selectedManager.kyc.status !== 'pending' && (
                <>
                  <h4 className="font-bold mt-4">Company Details</h4>
                  <div><strong>Company Name:</strong> {selectedManager.kyc.companyDetails?.companyName}</div>
                  <div><strong>Company Type:</strong> {selectedManager.kyc.companyDetails?.companyType}</div>
                  <div><strong>GST Number:</strong> {selectedManager.kyc.companyDetails?.gstNumber}</div>
                  
                  <h4 className="font-bold mt-4">Documents</h4>
                  <div>
                    <strong>PAN Card:</strong>
                    {selectedManager.kyc.documents?.panCard && (
                      <a href={`${import.meta.env.VITE_BACKEND_URL}${selectedManager.kyc.documents.panCard}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        View Document
                      </a>
                    )}
                  </div>
                  <div>
                    <strong>Bank Proof:</strong>
                    {selectedManager.kyc.documents?.bankProof && (
                      <a href={`${import.meta.env.VITE_BACKEND_URL}${selectedManager.kyc.documents.bankProof}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        View Document
                      </a>
                    )}
                  </div>
                  
                  <h4 className="font-bold mt-4">Bank Details</h4>
                  <div><strong>Account Holder:</strong> {selectedManager.kyc.bankDetails?.accountHolderName}</div>
                  <div><strong>Account Number:</strong> {selectedManager.kyc.bankDetails?.accountNumber}</div>
                  <div><strong>IFSC Code:</strong> {selectedManager.kyc.bankDetails?.ifscCode}</div>
                  <div><strong>Bank Name:</strong> {selectedManager.kyc.bankDetails?.bankName}</div>
                </>
              )}
              
              <div className="flex gap-2 mt-6">
                {selectedManager.kyc.status === 'submitted' && (
                  <>
                    <button onClick={() => handleApprove(selectedManager._id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      Approve KYC
                    </button>
                    <button onClick={() => handleReject(selectedManager._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                      Reject KYC
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedManager(null)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHostelManagers;
