import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Typography, Card, Tag, Button, Segmented, Table, Modal, Input, 
  message, Avatar, Space, Tooltip
} from 'antd';
import { 
  FiCheckCircle, FiXCircle, FiClock, FiInfo, FiFileText, 
  FiUser, FiMail, FiMapPin, FiEye, FiHome
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AdminChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/api/admin/change-requests`, {
        params,
        withCredentials: true
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Failed to fetch change requests');
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

  const handleApprove = async (requestId) => {
    Modal.confirm({
      title: 'Approve Change Request',
      content: 'Are you sure you want to approve these property changes? This will immediately apply the updates to the live platform.',
      okText: 'Yes, Approve',
      cancelText: 'Cancel',
      okButtonProps: { className: 'bg-emerald-600 border-none hover:bg-emerald-700' },
      onOk: async () => {
        try {
          const hideLoading = message.loading('Approving...', 0);
          await axios.post(`${API_URL}/api/admin/change-requests/${requestId}/approve`, {}, {
            withCredentials: true
          });
          hideLoading();
          message.success('Change request approved successfully!');
          fetchRequests();
        } catch (error) {
          console.error('Error approving request:', error);
          message.error(error.response?.data?.message || 'Failed to approve request');
        }
      }
    });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.warning('Please provide a rejection reason so the owner knows what to fix.');
      return;
    }

    try {
      setProcessing(true);
      await axios.post(`${API_URL}/api/admin/change-requests/${selectedRequest._id}/reject`, {
        reason: rejectionReason
      }, {
        withCredentials: true
      });
      message.success('Change request rejected and owner notified.');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      title: 'Property / Request',
      key: 'property',
      width: 300,
      render: (_, record) => {
        const isCreate = record.requestType === 'create';
        return (
          <div className="flex gap-3 items-center">
            {record.changeData?.images?.[0] ? (
              <Avatar size={50} src={`${API_URL}/uploads/${record.changeData.images[0]}`} shape="square" className="rounded-lg shadow-sm" />
            ) : (
              <Avatar size={50} shape="square" className="bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                <FiFileText size={20} />
              </Avatar>
            )}
            <div>
              <div className="font-bold text-slate-900 text-base">{record.changeData?.name || 'Unnamed Property'}</div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <FiMapPin /> {record.changeData?.location || 'No location'}
              </div>
              <Tag color={isCreate ? 'blue' : 'purple'} className="mt-1.5 font-bold text-[10px] uppercase tracking-wider m-0">
                {isCreate ? 'New Listing' : 'Property Edit'}
              </Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Submitted By',
      key: 'manager',
      render: (_, record) => (
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <FiUser className="text-slate-400" /> {record.manager?.name || 'Unknown'}
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <FiMail className="text-slate-400" /> {record.manager?.email || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Key Details',
      key: 'details',
      render: (_, record) => (
        <div className="text-sm">
          <div><Text type="secondary" className="font-medium mr-1">Price:</Text> <Text strong>₹{record.changeData?.price || 0}</Text></div>
          <div><Text type="secondary" className="font-medium mr-1">Gender:</Text> <Text strong>{record.changeData?.gender || 'Co-ed'}</Text></div>
          <div><Text type="secondary" className="font-medium mr-1">Type:</Text> <Text strong>{record.changeData?.type || 'PG'}</Text></div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (record.status === 'pending') return <Tag color="warning" className="font-bold border-amber-200 text-amber-700 bg-amber-50">Under Review</Tag>;
        if (record.status === 'approved') return <Tag color="success" className="font-bold border-emerald-200 text-emerald-700 bg-emerald-50">Approved</Tag>;
        if (record.status === 'rejected') return <Tag color="error" className="font-bold border-red-200 text-red-700 bg-red-50">Rejected</Tag>;
        return <Tag>{record.status}</Tag>;
      }
    },
    {
      title: 'Submission Date',
      key: 'date',
      render: (_, record) => (
        <div className="text-sm font-medium text-slate-600">
          {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          <div className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleTimeString('en-US', { timeStyle: 'short' })}</div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        if (record.status !== 'pending') return (
          <Text type="secondary" className="text-xs font-medium">
            Reviewed {new Date(record.reviewedAt).toLocaleDateString('en-GB')}
          </Text>
        );
        
        return (
          <Space>
            <Button 
              type="text" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
              onClick={() => {
                setSelectedRequest(record);
                setShowRejectModal(true);
              }}
            >
              Reject
            </Button>
            <Button 
              type="primary" 
              className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-sm"
              onClick={() => handleApprove(record._id)}
            >
              Approve
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Title level={3} className="!m-0 text-slate-900 flex items-center gap-2">
            <FiCheckCircle className="text-blue-600" /> Property Change Requests
          </Title>
          <Text type="secondary" className="font-medium text-slate-500">
            Review and approve new property listings and edits submitted by hostel owners.
          </Text>
        </div>
      </div>

      {/* Filter Section */}
      <Card bordered={false} className="shadow-sm mb-6 rounded-2xl" bodyStyle={{ padding: '16px 24px' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Segmented
            options={[
              { label: 'Pending Review', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'All Requests', value: 'all' },
            ]}
            value={filter}
            onChange={setFilter}
            size="large"
            className="bg-slate-100/80 p-1 font-medium"
          />
          <div className="flex gap-4">
            <div className="text-center px-4 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-xs font-bold text-amber-600 uppercase">Pending</div>
              <div className="text-lg font-black text-amber-700">{stats.pending}</div>
            </div>
            <div className="text-center px-4 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-xs font-bold text-emerald-600 uppercase">Approved</div>
              <div className="text-lg font-black text-emerald-700">{stats.approved}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <div className="py-12 text-slate-400 font-medium">No {filter !== 'all' ? filter : ''} requests found.</div> }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="py-2 px-6 bg-slate-50 border border-slate-100 border-l-4 border-l-blue-500 rounded-lg m-2">
                <Text strong className="block mb-2 text-blue-800">Extended Details Overview</Text>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <Text type="secondary" className="text-xs uppercase font-bold tracking-wider block mb-1">Description</Text>
                    <Text className="text-sm line-clamp-3" title={record.changeData?.description}>{record.changeData?.description || 'No description provided'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase font-bold tracking-wider block mb-1">Amenities</Text>
                    <Text className="text-sm font-medium">{(record.changeData?.amenities || []).length} Included</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase font-bold tracking-wider block mb-1">Contact Phone</Text>
                    <Text className="text-sm font-medium">{record.changeData?.contactInfo?.phone || 'N/A'}</Text>
                  </div>
                  {record.status === 'rejected' && record.rejectionReason && (
                    <div className="col-span-2 md:col-span-4 bg-red-50 p-3 rounded border border-red-100 mt-2">
                      <Text type="secondary" className="text-xs uppercase font-bold text-red-600 tracking-wider block mb-1">Rejection Reason</Text>
                      <Text className="text-sm text-red-800 font-medium">{record.rejectionReason}</Text>
                    </div>
                  )}
                </div>
              </div>
            ),
            rowExpandable: (record) => true,
          }}
          className="custom-table"
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <FiXCircle size={20} /> Reject Change Request
          </div>
        }
        open={showRejectModal}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }}
        onOk={handleReject}
        confirmLoading={processing}
        okText="Confirm Rejection"
        okButtonProps={{ className: 'bg-red-600 hover:bg-red-700 border-none shadow-md', disabled: !rejectionReason.trim() }}
        cancelButtonProps={{ className: 'border-slate-200' }}
        destroyOnClose
      >
        <div className="py-4 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            {selectedRequest?.changeData?.images?.[0] ? (
              <Avatar size={40} src={`${API_URL}/uploads/${selectedRequest.changeData.images[0]}`} shape="square" className="rounded" />
            ) : (
              <Avatar size={40} shape="square" className="bg-slate-200 text-slate-500 rounded"><FiHome /></Avatar>
            )}
            <div>
              <div className="font-bold text-slate-800">{selectedRequest?.changeData?.name}</div>
              <div className="text-xs text-slate-500">{selectedRequest?.manager?.name}</div>
            </div>
          </div>
          
          <div>
            <Text className="font-bold text-slate-700 block mb-2">Please provide a reason for rejection <span className="text-red-500">*</span></Text>
            <TextArea 
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Images are blurry, price doesn't match location, missing valid contact info..."
              className="text-base"
            />
            <Text type="secondary" className="text-xs mt-2 block">
              This message will be visible to the hostel owner so they can fix the issues and resubmit.
            </Text>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AdminChangeRequests;
