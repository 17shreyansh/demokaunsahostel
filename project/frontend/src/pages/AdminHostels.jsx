import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelAPI } from '../services/api';
import { stateManager, invalidateData } from '../utils/stateManager';
import { forceRefresh } from '../utils/cacheManager';
import { 
  Row, Col, Card, Button, Input, Tag, Spin, message, Empty, Tooltip, Statistic 
} from 'antd';
import { 
  FiPlus, FiRefreshCw, FiEdit2, FiEye, FiTrash2, FiHome, 
  FiCheckCircle, FiAlertCircle, FiXCircle 
} from 'react-icons/fi';

const { Search } = Input;

const AdminHostels = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Safe Network Fetching
  const fetchHostels = useCallback(async (force = false, abortSignal) => {
    try {
      setLoading(true);
      if (force) hostelAPI.clearCache();
      
      const response = await hostelAPI.getAll({ signal: abortSignal });
      
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

  // Derived State (Eliminates the need for a separate filteredHostels state)
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

  return (
    <div className="pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0 leading-tight">My Properties</h1>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Last synced: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            icon={<FiRefreshCw />} 
            onClick={handleForceRefresh}
            loading={loading}
          >
            Force Sync
          </Button>
          <Button 
            type="primary" 
            icon={<FiPlus />} 
            onClick={handleAdd}
            className="bg-blue-600"
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Total Properties" 
              value={stats.total} 
              prefix={<FiHome className="text-blue-500 mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Available" 
              value={stats.available} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<FiCheckCircle className="mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Limited" 
              value={stats.limited} 
              valueStyle={{ color: '#faad14' }}
              prefix={<FiAlertCircle className="mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Full" 
              value={stats.full} 
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<FiXCircle className="mr-2" />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <Search
          placeholder="Search properties by name or location..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          className="shadow-sm"
        />
      </div>

      {/* Properties Grid */}
      <Spin spinning={loading} size="large">
        {filteredHostels.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16">
            <Empty 
              description={<span className="text-slate-500 font-medium">No properties found</span>} 
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredHostels.map((hostel) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={hostel._id}>
                <Card
                  hoverable
                  className="h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  cover={
                    <div className="h-48 bg-slate-100 relative group">
                      {hostel.images?.[0] ? (
                        <img 
                          src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${hostel.images[0]}`} 
                          alt={hostel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <FiHome size={48} />
                        </div>
                      )}
                      {/* Price Badge Overlay */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg font-semibold border border-white/10 shadow-lg">
                        ₹{Number(hostel.price || 0).toLocaleString()}/{hostel.priceType || 'mo'}
                      </div>
                    </div>
                  }
                  actions={[
                    <Tooltip title="Edit Property">
                      <Button type="text" icon={<FiEdit2 />} onClick={() => handleEdit(hostel)} />
                    </Tooltip>,
                    <Tooltip title="View Live">
                      <Button type="text" icon={<FiEye />} onClick={() => handleView(hostel)} />
                    </Tooltip>,
                    <Tooltip title="Delete">
                      <Button 
                        type="text" 
                        danger 
                        icon={<FiTrash2 />} 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                            handleDelete(hostel._id);
                          }
                        }} 
                      />
                    </Tooltip>
                  ]}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-slate-900 text-lg m-0 truncate" title={hostel.name}>
                      {hostel.name}
                    </h3>
                    <Tag 
                      color={
                        hostel.availability === 'Available' ? 'success' : 
                        hostel.availability === 'Limited' ? 'warning' : 'error'
                      }
                      className="m-0 border-0"
                    >
                      {hostel.availability}
                    </Tag>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-3 truncate" title={hostel.location}>
                    {hostel.location}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-yellow-500">★</span>
                    <span className="text-slate-600">{hostel.rating || 'New'}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default AdminHostels;