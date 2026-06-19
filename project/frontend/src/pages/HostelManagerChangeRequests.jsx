import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Tag, Button, Segmented, Row, Col, Skeleton, Empty, Modal, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiClock, FiCheckCircle, FiXCircle, 
  FiPlus, FiMapPin, FiInfo, FiExternalLink
} from 'react-icons/fi';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const HostelManagerChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/api/hostel-manager/change-requests`, {
        params,
        withCredentials: true
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const stats = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': return { color: 'warning', icon: <FiClock />, text: 'Under Review', bg: 'bg-amber-50 border-amber-200 text-amber-700' };
      case 'approved': return { color: 'success', icon: <FiCheckCircle />, text: 'Approved', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
      case 'rejected': return { color: 'error', icon: <FiXCircle />, text: 'Rejected', bg: 'bg-red-50 border-red-200 text-red-700' };
      default: return { color: 'default', icon: <FiInfo />, text: 'Unknown', bg: 'bg-slate-50 border-slate-200 text-slate-700' };
    }
  };

  return (
    <HostelManagerLayout>
      <div className="max-w-6xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Title level={3} className="!m-0 text-slate-900 flex items-center gap-2">
              <FiFileText className="text-blue-600" /> My Change Requests
            </Title>
            <Text type="secondary" className="font-medium text-slate-500">
              Track the approval status of your new properties and edits.
            </Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<FiPlus />}
            onClick={() => navigate('/hostel-manager/hostels/add')}
            className="bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Submit New Property
          </Button>
        </div>

        {/* Filter Section */}
        <Card bordered={false} className="shadow-sm mb-8 rounded-2xl" bodyStyle={{ padding: '16px 24px' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Segmented
              options={[
                { label: 'All Requests', value: 'all' },
                { label: 'Under Review', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ]}
              value={filter}
              onChange={setFilter}
              size="large"
              className="bg-slate-100/80 p-1"
            />
            <div className="flex gap-4">
              <div className="text-center px-4 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase">Pending</div>
                <div className="text-lg font-black text-amber-600">{stats.pending}</div>
              </div>
              <div className="text-center px-4 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase">Approved</div>
                <div className="text-lg font-black text-emerald-600">{stats.approved}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map(i => (
              <Col xs={24} key={i}>
                <Card className="rounded-2xl border border-slate-100 shadow-sm"><Skeleton active avatar paragraph={{ rows: 2 }} /></Card>
              </Col>
            ))}
          </Row>
        ) : requests.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-2xl border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 text-center shadow-none">
              <Empty 
                description={<span className="text-slate-500 font-medium text-lg">No {filter !== 'all' ? filter : ''} requests found.</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/hostel-manager/hostels/add')} className="mt-4 bg-blue-600">
                  Create Your First Listing
                </Button>
              </Empty>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {requests.map((request, index) => {
                const statusConfig = getStatusConfig(request.status);
                const isCreate = request.requestType === 'create';
                
                return (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      bordered={false} 
                      className="shadow-sm hover:shadow-md transition-shadow border border-slate-100 rounded-2xl overflow-hidden group"
                      bodyStyle={{ padding: 0 }}
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        
                        {/* Image Section */}
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 relative shrink-0">
                          {request.changeData?.images?.[0] ? (
                            <img 
                              src={`${API_URL}/uploads/${request.changeData.images[0]}`}
                              alt="Property"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FiHome size={40} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Tag color={isCreate ? 'blue' : 'purple'} className="m-0 border-none shadow-sm font-bold backdrop-blur-md bg-white/90 text-slate-800">
                              {isCreate ? 'NEW LISTING' : 'UPDATE REQUEST'}
                            </Tag>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                                  {request.changeData?.name || 'Unnamed Property'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                  <FiMapPin className="text-slate-400" /> {request.changeData?.location || 'No location provided'}
                                </p>
                              </div>
                              <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-sm ${statusConfig.bg}`}>
                                {statusConfig.icon}
                                <span className="uppercase tracking-wider text-xs">{statusConfig.text}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-0.5">Price</Text>
                                <Text className="font-black text-slate-800 text-lg leading-none">₹{request.changeData?.price || 0}</Text>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-0.5">Gender</Text>
                                <Text className="font-bold text-slate-700">{request.changeData?.gender || 'Co-ed'}</Text>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-0.5">Type</Text>
                                <Text className="font-bold text-slate-700">{request.changeData?.type || 'PG'}</Text>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-0.5">Submitted On</Text>
                                <Text className="font-bold text-slate-700">{new Date(request.createdAt).toLocaleDateString('en-GB')}</Text>
                              </div>
                            </div>
                          </div>

                          {/* Action / Feedback Section */}
                          <div className="mt-6 pt-4 border-t border-slate-100">
                            {request.status === 'rejected' && request.rejectionReason ? (
                              <div className="flex items-start gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                                <FiXCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                  <p className="text-sm font-bold text-red-900 m-0">Admin Feedback</p>
                                  <p className="text-sm text-red-700 mt-0.5 m-0">{request.rejectionReason}</p>
                                </div>
                              </div>
                            ) : request.status === 'approved' && request.reviewedAt ? (
                              <div className="flex items-center justify-between">
                                <Text type="secondary" className="text-sm font-medium">
                                  Approved on {new Date(request.reviewedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </Text>
                                {request.hostel && (
                                  <Button 
                                    type="link" 
                                    icon={<FiExternalLink />} 
                                    onClick={() => navigate(`/hostels/${request.hostel._id || request.hostel}`)}
                                    className="font-bold p-0"
                                  >
                                    View Live Listing
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Text type="secondary" className="text-sm italic">
                                Your request is currently in the queue. Most requests are reviewed within 24 hours.
                              </Text>
                            )}
                          </div>
                        </div>

                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerChangeRequests;
