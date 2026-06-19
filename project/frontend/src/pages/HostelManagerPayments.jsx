import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, List, Typography, Skeleton, Segmented, Avatar, Button, Modal, Input, message, Image } from 'antd';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HostelManagerPayments = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Rejection Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(null);

  const { manager } = useHostelManager();
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchPaymentRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await axios.get(`${API_URL}/api/hostel-manager/payments/payment-requests`, {
        params,
        withCredentials: true
      });
      setPaymentRequests(data.requests || []);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  }, [filter, API_URL]);

  useEffect(() => {
    fetchPaymentRequests();
  }, [fetchPaymentRequests]);

  const handleApprove = async (requestId) => {
    Modal.confirm({
      title: 'Approve Payment',
      content: 'Are you sure you want to approve this payment?',
      okText: 'Approve',
      cancelText: 'Cancel',
      okButtonProps: { className: 'bg-emerald-500 hover:bg-emerald-600 border-none' },
      onOk: async () => {
        try {
          setApproving(requestId);
          await axios.patch(
            `${API_URL}/api/hostel-manager/payments/payment-requests/${requestId}/approve`,
            {},
            { withCredentials: true }
          );
          message.success('Payment approved successfully!');
          fetchPaymentRequests();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to approve payment');
        } finally {
          setApproving(null);
        }
      }
    });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.warning('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(true);
      await axios.patch(
        `${API_URL}/api/hostel-manager/payments/payment-requests/${selectedRequest}/reject`,
        { reason: rejectionReason },
        { withCredentials: true }
      );
      message.success('Payment rejected');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchPaymentRequests();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setRejecting(false);
    }
  };

  const stats = useMemo(() => {
    const total = paymentRequests.length;
    const approved = paymentRequests.filter(r => r.status === 'approved').length;
    const pending = paymentRequests.filter(r => r.status === 'pending').length;
    const rejected = paymentRequests.filter(r => r.status === 'rejected').length;

    return { total, approved, pending, rejected };
  }, [paymentRequests]);

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending': return <Tag color="warning" className="m-0 font-bold uppercase tracking-wide">Pending</Tag>;
      case 'approved': return <Tag color="success" className="m-0 font-bold uppercase tracking-wide">Approved</Tag>;
      case 'rejected': return <Tag color="error" className="m-0 font-bold uppercase tracking-wide">Rejected</Tag>;
      default: return <Tag className="m-0 font-bold uppercase tracking-wide">{status}</Tag>;
    }
  };

  if (loading && paymentRequests.length === 0) {
    return (
      <HostelManagerLayout>
        <div className="space-y-8 pb-8">
          <Row gutter={16}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>
            ))}
          </Row>
          <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="space-y-8 pb-8">
        
        {/* Header Section */}
        <div>
          <Title level={3} className="!m-0 text-slate-900">Payment Requests</Title>
          <Text type="secondary" className="font-medium text-slate-500">Manage manual payment submissions from your students.</Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Total Requests</span>} 
                value={stats.total} 
                prefix={<FiDollarSign className="text-blue-500 mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Pending Review</span>} 
                value={stats.pending} 
                valueStyle={{ color: '#f59e0b' }}
                prefix={<FiClock className="mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Approved</span>} 
                value={stats.approved} 
                valueStyle={{ color: '#10b981' }}
                prefix={<FiCheckCircle className="mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Rejected</span>} 
                value={stats.rejected} 
                valueStyle={{ color: '#ef4444' }}
                prefix={<FiXCircle className="mr-2" />} 
              />
            </Card>
          </Col>
        </Row>

        {/* List Section */}
        <Card 
          bordered={false} 
          className="shadow-sm border border-slate-100"
          bodyStyle={{ padding: 0 }}
        >
          {/* Filtering Controls */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Segmented 
              options={[
                { label: 'All Requests', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ]}
              value={filter}
              onChange={setFilter}
              size="large"
              className="shadow-sm font-medium"
            />
          </div>

          {/* Ant Design List Engine */}
          <List
            dataSource={paymentRequests}
            loading={loading}
            locale={{ emptyText: <div className="py-12 text-slate-400 font-medium text-lg">No payment requests found for this filter.</div> }}
            renderItem={(request) => (
              <List.Item className="p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors block">
                
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 w-full">
                  
                  {/* Left Column: User & Property Info */}
                  <div className="flex-1 space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <Avatar size="large" className="bg-slate-800 text-yellow-500 font-bold">
                        {request.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight m-0">
                          {request.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium m-0">{request.user?.email} • {request.user?.phone}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">Property</Text>
                        <Text className="font-medium">{request.hostel?.name || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">Transaction ID</Text>
                        <Text className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{request.upiTransactionId}</Text>
                      </div>
                      {request.sharingType && (
                        <div>
                          <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">Sharing Type</Text>
                          <Text className="font-medium capitalize">{request.sharingType}</Text>
                        </div>
                      )}
                      <div>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">Submitted At</Text>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <FiCalendar className="text-slate-400" />
                          <span>{new Date(request.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">Additional Notes</Text>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700">
                          {request.notes}
                        </div>
                      </div>
                    )}
                    
                    {/* Status specific messages */}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-2">
                        <Text type="danger" className="text-xs uppercase font-bold tracking-wider mb-1 block">Rejection Reason</Text>
                        <Text className="text-red-700">{request.rejectionReason}</Text>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Payment & Actions */}
                  <div className="w-full lg:w-72 flex flex-col gap-4">
                    
                    {/* Amount & Status Card */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center shadow-sm">
                      <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Amount Paid</p>
                      <p className="text-3xl font-black text-emerald-600 mb-3">₹{request.amount?.toLocaleString('en-IN')}</p>
                      {getStatusTag(request.status)}
                    </div>

                    {/* Screenshot Preview */}
                    {request.screenshot && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm group relative">
                        <Image
                          src={`${API_URL}/uploads/payments/${request.screenshot}`}
                          alt="Payment Screenshot"
                          className="w-full h-32 object-cover cursor-pointer"
                          preview={{
                            mask: <span className="font-medium tracking-wide">Click to Enlarge</span>
                          }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 w-full mt-2">
                        <Button 
                          type="primary" 
                          icon={<FiCheckCircle />} 
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 border-none shadow-md font-bold h-10"
                          onClick={() => handleApprove(request._id)}
                          loading={approving === request._id}
                        >
                          Approve
                        </Button>
                        <Button 
                          danger 
                          icon={<FiXCircle />} 
                          className="flex-1 font-bold h-10 border-red-200 text-red-500 hover:bg-red-50"
                          onClick={() => setSelectedRequest(request._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Rejection Modal */}
        <Modal
          title={<span className="flex items-center gap-2 text-red-600 font-bold"><FiXCircle /> Reject Payment</span>}
          open={!!selectedRequest}
          onCancel={() => {
            setSelectedRequest(null);
            setRejectionReason('');
          }}
          onOk={handleReject}
          confirmLoading={rejecting}
          okText="Confirm Rejection"
          okButtonProps={{ danger: true, className: 'font-bold shadow-sm' }}
          cancelButtonProps={{ className: 'font-medium' }}
          destroyOnClose
        >
          <div className="py-4">
            <p className="text-slate-600 mb-3 font-medium">Please provide a reason for rejecting this payment submission. The student will see this reason.</p>
            <TextArea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Transaction ID mismatch, incomplete screenshot, insufficient amount..."
              className="rounded-lg shadow-sm"
              autoFocus
            />
          </div>
        </Modal>

      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerPayments;
