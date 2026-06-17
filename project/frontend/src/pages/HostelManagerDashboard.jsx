import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Alert, Button, List, Typography, Skeleton } from 'antd';
import { hostelManagerAPI } from '../services/api';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { 
  FiHome, FiStar, FiMessageSquare, FiCheckCircle, 
  FiAlertCircle, FiClock, FiArrowRight, FiFileText, FiShield
} from 'react-icons/fi';

const { Title, Text } = Typography;

const HostelManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { manager } = useHostelManager();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, reviewsRes] = await Promise.all([
          hostelManagerAPI.getDashboard(),
          hostelManagerAPI.getReviews()
        ]);
        setStats(dashboardRes.data);
        setRecentReviews(reviewsRes.data.reviews?.slice(0, 5) || []);
      } catch (error) {
        console.error('Dashboard sync failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kycStatus = manager?.kyc?.status || 'pending';

  // --------------------------------------------------------------------------
  // MEMOIZED CONFIGURATIONS (Prevents array reallocation on re-renders)
  // --------------------------------------------------------------------------

  const kycAlertProps = useMemo(() => {
    const configs = {
      verified: {
        type: 'success',
        icon: <FiCheckCircle size={20} />,
        title: 'Account Verified',
        message: 'Your business account is fully verified. You have unrestricted access to all platform features.',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800'
      },
      submitted: {
        type: 'info',
        icon: <FiClock size={20} />,
        title: 'Verification Under Review',
        message: 'Your KYC documents are currently being reviewed by our compliance team. Expected resolution: 24-48 hours.',
        color: 'border-blue-200 bg-blue-50 text-blue-800'
      },
      rejected: {
        type: 'error',
        icon: <FiAlertCircle size={20} />,
        title: 'Verification Rejected',
        message: manager?.kyc?.rejectionReason || 'Your previous document submission did not meet our compliance standards. Please review and resubmit.',
        action: <Button type="primary" danger onClick={() => navigate('/hostel-manager/kyc')}>Resubmit Documents</Button>,
        color: 'border-red-200 bg-red-50 text-red-800'
      },
      pending: {
        type: 'warning',
        icon: <FiShield size={20} />,
        title: 'Action Required: Verify Your Business',
        message: 'You must complete the KYC verification process before listing properties or accepting bookings.',
        action: <Button type="primary" className="bg-amber-500 hover:bg-amber-600 border-0" onClick={() => navigate('/hostel-manager/kyc')}>Start Verification</Button>,
        color: 'border-amber-200 bg-amber-50 text-amber-800'
      }
    };
    return configs[kycStatus] || configs.pending;
  }, [kycStatus, manager?.kyc?.rejectionReason, navigate]);

  const statCards = useMemo(() => [
    {
      title: 'Active Properties',
      value: stats?.totalHostels || 0,
      icon: <FiHome className="text-blue-600" size={24} />,
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      icon: <FiMessageSquare className="text-indigo-600" size={24} />,
      bg: 'bg-indigo-50'
    },
    {
      title: 'Average Rating',
      value: stats?.avgRating || '0.0',
      suffix: '/ 5',
      icon: <FiStar className="text-amber-500" size={24} />,
      bg: 'bg-amber-50'
    }
  ], [stats]);

  const quickActions = useMemo(() => [
    {
      title: 'List New Property',
      description: 'Add a new hostel or PG to your portfolio',
      icon: <FiHome size={20} />,
      link: '/hostel-manager/hostels/add',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      enabled: kycStatus === 'verified'
    },
    {
      title: 'Manage Listings',
      description: 'Update pricing, availability, and details',
      icon: <FiFileText size={20} />,
      link: '/hostel-manager/hostels',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      enabled: true
    },
    {
      title: 'Review Feedback',
      description: 'Read and respond to guest reviews',
      icon: <FiMessageSquare size={20} />,
      link: '/hostel-manager/reviews',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      enabled: true
    },
    {
      title: 'Compliance & KYC',
      description: 'Update business documents and identity',
      icon: <FiShield size={20} />,
      link: '/hostel-manager/kyc',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      enabled: true
    }
  ], [kycStatus]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <HostelManagerLayout>
        <div className="space-y-6">
          <Skeleton active paragraph={{ rows: 2 }} />
          <Row gutter={16}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>
            ))}
          </Row>
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="space-y-8 pb-8">
        
        {/* Compliance Banner */}
        <div className={`p-5 rounded-xl border ${kycAlertProps.color} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">{kycAlertProps.icon}</div>
            <div>
              <h3 className="font-bold text-base m-0 leading-tight">{kycAlertProps.title}</h3>
              <p className="text-sm mt-1 mb-0 opacity-90">{kycAlertProps.message}</p>
            </div>
          </div>
          {kycAlertProps.action && (
            <div className="flex-shrink-0 w-full sm:w-auto">
              {kycAlertProps.action}
            </div>
          )}
        </div>

        {/* Primary Metrics Grid */}
        <div>
          <Title level={4} className="!mb-4 text-slate-800">Business Overview</Title>
          <Row gutter={[16, 16]}>
            {statCards.map((stat, index) => (
              <Col xs={24} sm={12} xl={6} key={index}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <Text className="text-slate-500 font-medium">{stat.title}</Text>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 leading-none">{stat.value}</span>
                    {stat.suffix && <span className="text-sm font-bold text-slate-400">{stat.suffix}</span>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Action Center & Activity Feed */}
        <Row gutter={[24, 24]}>
          
          {/* Quick Actions */}
          <Col xs={24} xl={14}>
            <Title level={4} className="!mb-4 text-slate-800">Workspace</Title>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Link 
                    to={action.enabled ? action.link : '#'}
                    onClick={(e) => !action.enabled && e.preventDefault()}
                    className="block h-full"
                  >
                    <Card 
                      hoverable={action.enabled}
                      className={`h-full border border-slate-200 shadow-sm transition-all transform-gpu ${
                        action.enabled ? 'hover:-translate-y-1 hover:border-slate-300' : 'opacity-60 cursor-not-allowed bg-slate-50'
                      }`}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-4 ${action.color}`}>
                          {action.icon}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">{action.title}</h4>
                        <p className="text-sm text-slate-500 mb-4 flex-grow">{action.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          {action.enabled ? (
                            <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group">
                              Access tool <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                              Requires KYC
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Activity Feed */}
          <Col xs={24} xl={10}>
            <Card 
              title={<span className="text-lg font-bold text-slate-800">Recent Reviews</span>} 
              bordered={false} 
              className="shadow-sm h-full"
              bodyStyle={{ padding: '0 20px 20px 20px' }}
            >
              {recentReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FiMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={recentReviews}
                  renderItem={(review) => (
                    <List.Item 
                      className="py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer group"
                      onClick={() => navigate('/hostel-manager/reviews')}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <FiStar size={20} />
                          </div>
                        }
                        title={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{review.hostel?.name || 'Unknown Property'}</span>
                            <span className="text-amber-500 font-bold">{review.rating}/5</span>
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-sm text-slate-600 line-clamp-1 mb-1">{review.comment || 'No comment'}</p>
                            <span className="text-xs text-slate-500">by {review.user?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        }
                      />
                      <FiArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerDashboard;