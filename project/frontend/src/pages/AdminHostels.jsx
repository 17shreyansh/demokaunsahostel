import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelAPI } from '../services/api';
import { stateManager, invalidateData } from '../utils/stateManager';
import { forceRefresh } from '../utils/cacheManager';
import { message } from 'antd'; // Retained strictly for imperative toast notifications
import { 
  Plus, RefreshCw, Pencil, Eye, Trash2, Home, 
  CheckCircle2, AlertCircle, XCircle, Search, X, Loader2, MapPin, Star, UserCircle
} from 'lucide-react';

const AdminHostels = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [assigningManager, setAssigningManager] = useState(false);

  // Safe Network Fetching (Logic retained completely)
  const fetchHostels = useCallback(async (force = false, abortSignal) => {
    try {
      setLoading(true);
      if (force) hostelAPI.clearCache();
      
      const response = await hostelAPI.getAll({ limit: 1000, signal: abortSignal });
      
      if (!abortSignal?.aborted) {
        setHostels(response.data?.hostels || response.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to fetch hostels:', error);
        message.error('Failed to load properties');
      }
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchHostels(false, abortController.signal);

    const unsubscribe = stateManager.subscribe('hostels', () => fetchHostels(true));

    return () => {
      abortController.abort();
      unsubscribe();
    };
  }, [fetchHostels]);

  // Derived State
  const filteredHostels = useMemo(() => {
    if (!searchText) return hostels;
    const lowercasedSearch = searchText.toLowerCase();
    return hostels.filter(hostel => 
      hostel.name?.toLowerCase().includes(lowercasedSearch) ||
      hostel.location?.toLowerCase().includes(lowercasedSearch)
    );
  }, [hostels, searchText]);

  const stats = useMemo(() => ({
    total: hostels.length || 0,
    available: hostels.filter(h => h.availability === 'Available').length || 0,
    limited: hostels.filter(h => h.availability === 'Limited').length || 0,
    full: hostels.filter(h => h.availability === 'Full').length || 0
  }), [hostels]);

  // Actions
  const handleAdd = () => navigate('/admin/hostels/new');
  const handleEdit = (record) => navigate(`/admin/hostels/${record._id}`);
  const handleView = (record) => window.open(`/hostel/${record.slug || record._id}`, '_blank');

  const handleDelete = async (id) => {
    const originalHostels = [...hostels];
    
    // Optimistic update
    setHostels(prev => prev.filter(h => h._id !== id));
    
    try {
      await hostelAPI.delete(id);
      invalidateData('homepage');
      invalidateData('dashboard');
      message.success('Property deleted successfully');
    } catch (error) {
      // Revert on error
      setHostels(originalHostels);
      message.error('Failed to delete property');
    }
  };

  const handleForceRefresh = () => {
    forceRefresh();
    hostelAPI.clearCache();
    fetchHostels(true);
  };

  // Manager Assignment
  const fetchManagers = async () => {
    setLoadingManagers(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/managers`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setManagers(data.managers);
      }
    } catch (error) {
      message.error('Failed to load managers');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAssignManager = (hostel) => {
    setSelectedHostel(hostel);
    setShowAssignModal(true);
    fetchManagers();
  };

  const assignManager = async (managerId) => {
    setAssigningManager(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/hostels/${selectedHostel._id}/assign-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ managerId })
      });
      const data = await response.json();
      
      if (data.success) {
        message.success(data.message);
        setShowAssignModal(false);
        fetchHostels(true);
      } else {
        message.error(data.message || 'Failed to assign manager');
      }
    } catch (error) {
      message.error('Failed to assign manager');
    } finally {
      setAssigningManager(false);
    }
  };

  const unassignManager = async (hostelId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/hostels/${hostelId}/unassign-manager`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        message.success(data.message);
        fetchHostels(true);
      } else {
        message.error(data.message || 'Failed to unassign manager');
      }
    } catch (error) {
      message.error('Failed to unassign manager');
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    const styles = {
      'Available': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'Limited': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'Full': 'bg-rose-50 text-rose-700 ring-rose-600/20',
    };
    return `inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${styles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`;
  };

  return (
    <div className="relative pb-8 min-h-[80vh] font-sans text-gray-900">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 m-0 leading-tight">My Properties</h1>
          {lastUpdated && (
            <p className="text-sm font-medium text-gray-500 mt-1">
              Last synced: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <button 
            onClick={handleForceRefresh}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Force Sync</span>
          </button>
          <button 
            onClick={handleAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={16} />
            Add Property
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
              <Home className="w-4 h-4 text-blue-600" />
            </div>
            Total Properties
          </div>
          <div className="text-3xl font-semibold tracking-tight text-gray-900">
            {stats.total}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            Available
          </div>
          <div className="text-3xl font-semibold tracking-tight text-emerald-600">
            {stats.available}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mr-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            Limited
          </div>
          <div className="text-3xl font-semibold tracking-tight text-amber-500">
            {stats.limited}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mr-3">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            Full
          </div>
          <div className="text-3xl font-semibold tracking-tight text-rose-600">
            {stats.full}
          </div>
        </div>
      </section>

      {/* Toolbar / Search */}
      <section className="mb-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
            placeholder="Search properties by name or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Properties Grid Area */}
      <main className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 -[2px] rounded-xl transition-all duration-300">
            <div className="bg-white p-4 rounded-full shadow-lg border border-gray-100">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        )}

        {filteredHostels.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search criteria or add a new property.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHostels.map((hostel) => (
              <article 
                key={hostel._id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image & Overlay */}
                <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                  {hostel.images?.[0] ? (
                    <img 
                      src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel.images[0]}`} 
                      alt={hostel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Home size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 bg-gray-900/80  text-white px-2.5 py-1 rounded-lg text-sm font-semibold border border-white/10 shadow-lg tracking-tight">
                    ₹{Number(hostel.price || 0).toLocaleString()} <span className="text-gray-300 font-medium text-xs">/{hostel.priceType || 'mo'}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-base m-0 line-clamp-1 flex-1" title={hostel.name}>
                      {hostel.name}
                    </h3>
                    <div className="flex-shrink-0">
                      <span className={getStatusBadge(hostel.availability)}>
                        {hostel.availability}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4 line-clamp-1" title={hostel.location}>
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{hostel.location}</span>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-1.5 text-sm font-medium">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-gray-700">{hostel.rating || 'New'}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => handleEdit(hostel)}
                    className="flex flex-col items-center justify-center py-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500"
                    title="Edit Property"
                    aria-label="Edit Property"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleView(hostel)}
                    className="flex flex-col items-center justify-center py-2.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-emerald-500"
                    title="View Live Page"
                    aria-label="View Live Page"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleAssignManager(hostel)}
                    className="flex flex-col items-center justify-center py-2.5 text-gray-500 hover:text-purple-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-purple-500"
                    title="Assign Manager"
                    aria-label="Assign Manager"
                  >
                    <UserCircle size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                        handleDelete(hostel._id);
                      }
                    }}
                    className="flex flex-col items-center justify-center py-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-rose-500"
                    title="Delete Property"
                    aria-label="Delete Property"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Assign Manager Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assign Manager</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedHostel?.name}</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingManagers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : managers.length === 0 ? (
                <div className="text-center py-12">
                  <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No managers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {managers.map((manager) => (
                    <div
                      key={manager._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{manager.name}</h3>
                        <p className="text-sm text-gray-500">{manager.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {manager.hostels?.length || 0} hostel(s) assigned
                        </p>
                      </div>
                      <button
                        onClick={() => assignManager(manager._id)}
                        disabled={assigningManager}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {assigningManager ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHostels;