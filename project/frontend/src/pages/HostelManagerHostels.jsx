import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiDollarSign, FiStar } from 'react-icons/fi';

const HostelManagerHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { manager } = useHostelManager();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hostel-manager/hostels', { withCredentials: true });
      setHostels(res.data.hostels);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        navigate('/hostel-manager/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;
    
    try {
      await axios.delete(`/api/hostel-manager/hostels/${id}`, { withCredentials: true });
      setHostels(hostels.filter(h => h._id !== id));
      alert('Hostel deleted successfully');
    } catch (error) {
      alert('Failed to delete hostel');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    }
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`;
  };

  if (loading) {
    return (
      <HostelManagerLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your hostels...</p>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h2>
              <p className="text-gray-600">Manage all your hostel listings in one place</p>
            </div>
            {manager?.kyc?.status === 'verified' && (
              <Link
                to="/hostel-manager/hostels/add"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add New Property</span>
              </Link>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <p className="text-sm text-gray-600 mb-1">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{hostels.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-700">
                {hostels.filter(h => h.availability === 'Available').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50">
              <p className="text-sm text-gray-600 mb-1">Limited</p>
              <p className="text-2xl font-bold text-yellow-700">
                {hostels.filter(h => h.availability === 'Limited').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50">
              <p className="text-sm text-gray-600 mb-1">Full</p>
              <p className="text-2xl font-bold text-red-700">
                {hostels.filter(h => h.availability === 'Full').length}
              </p>
            </div>
          </div>
        </div>

        {hostels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't added any hostels yet. Start by adding your first property to the platform.
            </p>
            {manager?.kyc?.status === 'verified' ? (
              <Link
                to="/hostel-manager/hostels/add"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Your First Property</span>
              </Link>
            ) : (
              <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-xl">
                <p className="font-medium">Complete KYC verification to add properties</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <div
                key={hostel._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  {hostel.images?.[0] ? (
                    <img
                      src={getImageUrl(hostel.images[0])}
                      alt={hostel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-md shadow-lg ${
                      hostel.availability === 'Available'
                        ? 'bg-green-500/90 text-white'
                        : hostel.availability === 'Limited'
                        ? 'bg-yellow-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {hostel.availability || 'Available'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{hostel.name}</h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <FiMapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{hostel.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{hostel.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/{hostel.priceType || 'month'}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{hostel.rating || '0.0'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/hostel-manager/hostels/edit/${hostel._id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(hostel._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerHostels;
