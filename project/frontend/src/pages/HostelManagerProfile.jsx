import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Avatar, Tag, Descriptions, Divider } from 'antd';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiCheckCircle, 
  FiClock, FiAlertCircle, FiShield, FiBriefcase, FiHash 
} from 'react-icons/fi';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const HostelManagerProfile = () => {
  const { manager } = useHostelManager();

  // --------------------------------------------------------------------------
  // STRICT DATA MEMOIZATION (Zero layout thrashing on re-renders)
  // --------------------------------------------------------------------------

  const kycConfig = useMemo(() => {
    const status = manager?.kyc?.status || 'pending';
    const configs = {
      verified: { color: 'success', icon: <FiCheckCircle />, text: 'Verified', bg: 'bg-emerald-50' },
      submitted: { color: 'processing', icon: <FiClock />, text: 'Under Review', bg: 'bg-blue-50' },
      rejected: { color: 'error', icon: <FiAlertCircle />, text: 'Rejected', bg: 'bg-red-50' },
      pending: { color: 'warning', icon: <FiAlertCircle />, text: 'Action Required', bg: 'bg-amber-50' }
    };
    return configs[status] || configs.pending;
  }, [manager?.kyc?.status]);

  const memberSince = useMemo(() => {
    if (!manager?.createdAt) return 'N/A';
    return new Date(manager.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  }, [manager?.createdAt]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <HostelManagerLayout>
      <div className="max-w-5xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="mb-8">
          <Title level={3} className="!m-0 text-slate-900">Partner Profile</Title>
          <Text type="secondary" className="font-medium text-slate-500">
            Manage your personal identity and business compliance records.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Identity Card (Replaces the consumer gradient banner) */}
          <Col xs={24}>
            <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar 
                  size={96} 
                  icon={<FiUser />} 
                  className="bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 m-0 truncate">
                        {manager?.name || 'Unknown Partner'}
                      </h2>
                      <p className="text-slate-500 font-medium m-0 flex items-center gap-2 mt-1">
                        <FiBriefcase className="text-slate-400" /> Account Manager
                      </p>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-100 ${kycConfig.bg}`}>
                      <FiShield className={kycConfig.color === 'success' ? 'text-emerald-500' : 'text-slate-400'} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Compliance</span>
                        <Tag color={kycConfig.color} icon={kycConfig.icon} className="m-0 border-0 font-bold uppercase tracking-wide">
                          {kycConfig.text}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} lg={10}>
            <Card 
              title={<span className="text-lg font-bold text-slate-800">Contact Details</span>} 
              bordered={false} 
              className="shadow-sm border border-slate-200 rounded-2xl h-full"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">Email Address</Text>
                    <Text strong className="text-slate-900 text-base">{manager?.email || 'N/A'}</Text>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">Phone Number</Text>
                    <Text strong className="text-slate-900 text-base">{manager?.phone || 'Not provided'}</Text>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">Partner Since</Text>
                    <Text strong className="text-slate-900">{memberSince}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Business & KYC Information */}
          <Col xs={24} lg={14}>
            <Card 
              title={<span className="text-lg font-bold text-slate-800">Business Registration</span>} 
              bordered={false} 
              className="shadow-sm border border-slate-200 rounded-2xl h-full"
            >
              {manager?.kyc?.status !== 'pending' ? (
                <Descriptions 
                  layout="vertical" 
                  column={{ xs: 1, sm: 2, md: 2 }}
                  labelStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}
                  contentStyle={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', paddingBottom: '24px' }}
                >
                  <Descriptions.Item label="Registered Entity Name" span={2}>
                    {manager?.kyc?.companyDetails?.companyName || 'N/A'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Entity Structure">
                    <span className="capitalize">{manager?.kyc?.companyDetails?.companyType?.replace('-', ' ') || 'N/A'}</span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="GST Identification">
                    <span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {manager?.kyc?.companyDetails?.gstNumber || 'N/A'}
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Settlement Bank" span={2}>
                    <div className="flex items-center gap-2">
                      <FiHash className="text-slate-400" />
                      {manager?.kyc?.bankDetails?.bankName || 'N/A'}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FiShield className="text-4xl text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No Compliance Data Found</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    You have not submitted your business registration details. Complete KYC to unlock all platform features.
                  </p>
                </div>
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerProfile;