import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, Table, Typography, Skeleton, Input, Avatar, message } from 'antd';
import { FiUsers, FiHome, FiCheckCircle, FiClock, FiCalendar, FiSearch, FiPhone, FiMail } from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;

const HostelManagerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { manager } = useHostelManager();
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/hostel-manager/students`, {
        withCredentials: true
      });
      setStudents(data.students || []);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch assigned students');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const stats = useMemo(() => {
    const total = students.length;
    
    // Determine how many unique properties have students
    const propertyIds = new Set(students.map(s => s.hostel?._id).filter(Boolean));
    const activeProperties = propertyIds.size;
    
    // Determine how many students are using hostel payments vs admin payments
    const hostelPayments = students.filter(s => s.useHostelPayment).length;

    return { total, activeProperties, hostelPayments };
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    
    return students.filter(student => 
      student.user?.name?.toLowerCase().includes(query) ||
      student.user?.email?.toLowerCase().includes(query) ||
      student.user?.phone?.toLowerCase().includes(query) ||
      student.hostel?.name?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  if (loading && students.length === 0) {
    return (
      <HostelManagerLayout>
        <div className="space-y-8 pb-8">
          <Row gutter={16}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>
            ))}
          </Row>
          <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="space-y-8 pb-8">
        
        {/* Header Section */}
        <div>
          <Title level={3} className="!m-0 text-slate-900">My Users</Title>
          <Text type="secondary" className="font-medium text-slate-500">View and manage users assigned to your properties.</Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={8}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/50 rounded-2xl">
              <Statistic 
                title={<span className="text-blue-600 font-bold uppercase tracking-wider text-xs">Total Assigned Users</span>} 
                value={stats.total} 
                valueStyle={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}
                prefix={<FiUsers className="text-blue-500 mr-3 opacity-80" />} 
              />
            </Card>
          </Col>
          <Col xs={12} lg={8}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/50 rounded-2xl">
              <Statistic 
                title={<span className="text-emerald-600 font-bold uppercase tracking-wider text-xs">Properties with Users</span>} 
                value={stats.activeProperties} 
                valueStyle={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}
                prefix={<FiHome className="text-emerald-500 mr-3 opacity-80" />} 
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50/80 to-white border border-purple-100/50 rounded-2xl">
              <Statistic 
                title={<span className="text-purple-600 font-bold uppercase tracking-wider text-xs">Using Direct Property Payments</span>} 
                value={stats.hostelPayments} 
                valueStyle={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}
                prefix={<FiCheckCircle className="text-purple-500 mr-3 opacity-80" />} 
                suffix={<span className="text-slate-400 font-medium text-xl">/ {stats.total}</span>}
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
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <Input
              size="large"
              placeholder="Search by user name, email, phone, or property name..."
              prefix={<FiSearch className="text-slate-400 mr-2" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl shadow-sm rounded-lg"
              allowClear
            />
          </div>

          {/* Ant Design Data Table */}
          <Table
            columns={[
              {
                title: 'User',
                key: 'user',
                render: (_, record) => (
                  <div className="flex items-center gap-3">
                    {record.user?.profilePicture ? (
                      <Avatar size={48} src={`${API_URL}/uploads/${record.user.profilePicture}`} className="shadow-sm" />
                    ) : (
                      <Avatar size={48} className="bg-blue-600 text-white font-bold text-lg shadow-sm">
                        {record.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    )}
                    <div>
                      <div className="font-bold text-base text-slate-900">{record.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><FiMail /> {record.user?.email || 'N/A'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><FiPhone /> {record.user?.phone || 'N/A'}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Property',
                key: 'property',
                render: (_, record) => <span className="font-semibold text-slate-800 text-base">{record.hostel?.name || 'N/A'}</span>,
              },
              {
                title: 'Sharing Type',
                dataIndex: 'selectedSharingType',
                key: 'selectedSharingType',
                render: (text) => <Tag color="blue" className="capitalize font-bold px-3 py-1">{text || 'Not Selected'}</Tag>,
              },
              {
                title: 'Payment Route',
                key: 'paymentRoute',
                render: (_, record) => (
                  <Tag color={record.useHostelPayment ? "purple" : "default"} className="font-bold px-3 py-1">
                    {record.useHostelPayment ? 'Direct to Property' : 'Via Admin'}
                  </Tag>
                ),
              },
              {
                title: 'Assigned On',
                key: 'assignedOn',
                render: (_, record) => (
                  <div className="text-slate-600 font-medium flex items-center gap-2">
                    <FiCalendar className="text-slate-400" />
                    {new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                ),
              },
            ]}
            dataSource={filteredStudents}
            loading={loading}
            rowKey="_id"
            locale={{ emptyText: <div className="py-16 text-slate-400 font-medium text-lg">No users found matching your criteria.</div> }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            className="w-full custom-table"
          />
        </Card>

      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerStudents;
