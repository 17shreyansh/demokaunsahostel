import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Tag, Spin, Empty, Statistic, Tooltip, message, Modal } from 'antd';
import { 
  FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome, 
  FiCheckCircle, FiAlertCircle, FiXCircle 
} from 'react-icons/fi';
import { hostelManagerAPI } from '../services/api';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { confirm } = Modal;

const HostelManagerHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { manager } = useHostelManager();
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // NETWORK & STATE MANAGEMENT
  // --------------------------------------------------------------------------

  const fetchHostels = useCallback(async (abortSignal) => {
    try {
      setLoading(true);
      const res = await hostelManagerAPI.getHostels({ signal: abortSignal });
      if (!abortSignal?.aborted) {
        setHostels(res.data?.hostels || []);
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        message.error('Failed to load properties');
        if (error.response?.status === 403) {
          navigate('/hostel-manager/dashboard');
        }
      }
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchHostels(abortController.signal);
    return () => abortController.abort();
  }, [fetchHostels]);

  // Optimistic UI Deletion
  const handleDelete = useCallback((id) => {
    confirm({
      title: 'Delete Property',
      content: 'Are you sure you want to permanently delete this property? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const originalHostels = [...hostels];
        setHostels(prev => prev.filter(h => h._id !== id)); // Optimistic remove
        
        try {
          await hostelManagerAPI.deleteHostel(id);
          message.success('Property deleted successfully');
        } catch (error) {
          setHostels(originalHostels); // Revert on failure
          message.error('Failed to delete property. Please try again.');
        }
      }
    });
  }, [hostels]);

  // --------------------------------------------------------------------------
  // MEMOIZED DERIVED STATE
  // --------------------------------------------------------------------------

  const stats = useMemo(() => ({
    total: hostels.length,
    available: hostels.filter(h => h.availability === 'Available').length,
    limited: hostels.filter(h => h.availability === 'Limited').length,
    full: hostels.filter(h => h.availability === 'Full').length
  }), [hostels]);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`;
  }, []);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <HostelManagerLayout>
      <div className="pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0 leading-tight">Property Portfolio</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 mb-0">Manage and monitor all your listings</p>
          </div>
          
          <Button 
            type="primary" 
            icon={<FiPlus />} 
            size="large"
            onClick={() => navigate('/hostel-manager/hostels/add')}
            className="bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all transform-gpu hover:-translate-y-0.5"
          >
            Add New Property
          </Button>
        </div>

        {/* Statistics Cards (Ant Design Native) */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={12} md={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Total Properties</span>} 
                value={stats.total} 
                prefix={<FiHome className="text-blue-500 mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Available</span>} 
                value={stats.available} 
                valueStyle={{ color: '#52c41a' }}
                prefix={<FiCheckCircle className="mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Limited</span>} 
                value={stats.limited} 
                valueStyle={{ color: '#faad14' }}
                prefix={<FiAlertCircle className="mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Full</span>} 
                value={stats.full} 
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<FiXCircle className="mr-2" />} 
              />
            </Card>
          </Col>
        </Row>

        {/* Property Grid */}
        <Spin spinning={loading} size="large">
          {hostels.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FiHome className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven't added any properties to your portfolio. Start listing to attract verified students.
              </p>
              <Button 
                type="primary" 
                icon={<FiPlus />} 
                onClick={() => navigate('/hostel-manager/hostels/add')}
                className="bg-blue-600"
              >
                Create First Listing
              </Button>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {hostels.map((hostel) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={hostel._id}>
                  <Card
                    hoverable
                    className="h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform-gpu hover:-translate-y-1 will-change-transform border-slate-200"
                    bodyStyle={{ padding: '20px' }}
                    cover={
                      <div className="h-48 bg-slate-100 relative group overflow-hidden">
                        {hostel.images?.[0] ? (
                          <img 
                            src={getImageUrl(hostel.images[0])} 
                            alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FiHome size={40} />
                          </div>
                        )}
                        {/* Price Tag Overlay */}
                        <div className="absolute bottom-3 right-3 bg-slate-900/85  text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg border border-white/10">
                          ₹{Number(hostel.price || 0).toLocaleString()}
                          <span className="text-[10px] font-medium text-slate-300 ml-1">/{hostel.priceType || 'mo'}</span>
                        </div>
                      </div>
                    }
                    actions={[
                      <Tooltip title="Edit Details">
                        <Button 
                          type="text" 
                          icon={<FiEdit2 />} 
                          onClick={() => navigate(`/hostel-manager/hostels/edit/${hostel._id}`)}
                          className="text-slate-500 hover:text-blue-600"
                        />
                      </Tooltip>,
                      <Tooltip title="Delete Property">
                        <Button 
                          type="text" 
                          danger 
                          icon={<FiTrash2 />} 
                          onClick={() => handleDelete(hostel._id)} 
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
                        className="m-0 border-0 font-semibold"
                      >
                        {hostel.availability || 'Available'}
                      </Tag>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3 truncate" title={hostel.location}>
                      <FiMapPin className="flex-shrink-0" />
                      <span className="truncate">{hostel.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm font-bold bg-slate-50 w-max px-2 py-1 rounded-md border border-slate-100">
                      <span className="text-yellow-500">★</span>
                      <span className="text-slate-700">{hostel.rating || 'New'}</span>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerHostels;