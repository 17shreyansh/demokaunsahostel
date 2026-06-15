import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hostelManagerAPI } from '../services/api';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiHome, FiStar, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp, FiEye, FiUsers, FiDollarSign, FiArrowRight } from 'react-icons/fi';

const HostelManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { manager } = useHostelManager();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await hostelManagerAPI.getDashboard();
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HostelManagerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </HostelManagerLayout>
    );
  }

  const kycStatus = manager?.kyc?.status;
  const needsKYC = kycStatus === 'pending' || kycStatus === 'rejected';

  const getKYCAlert = () => {
    if (kycStatus === 'verified') {
      return {
        type: 'success',
        icon: <FiCheckCircle className="w-6 h-6" />,
        title: 'KYC Verified',
        message: 'Your account is fully verified. You can now manage your properties seamlessly.',
        action: null,
        gradient: 'from-green-500 to-emerald-600'
      };
    }
    if (kycStatus === 'submitted') {
      return {
        type: 'info',
        icon: <FiClock className="w-6 h-6" />,
        title: 'KYC Under Review',
        message: "Your KYC documents are being verified. You'll be notified once approved (24-48 hours).",
        action: null,
        gradient: 'from-blue-500 to-indigo-600'
      };
    }
    if (kycStatus === 'rejected') {
      return {
        type: 'error',
        icon: <FiAlertCircle className="w-6 h-6" />,
        title: 'KYC Rejected',
        message: manager?.kyc?.rejectionReason || 'Please resubmit your KYC documents.',
        action: { label: 'Resubmit KYC', link: '/hostel-manager/kyc' },
        gradient: 'from-red-500 to-rose-600'
      };
    }
    return {
      type: 'warning',
      icon: <FiAlertCircle className="w-6 h-6" />,
      title: 'KYC Verification Required',
      message: 'Complete your KYC to start adding and managing hostels on our platform.',
      action: { label: 'Complete KYC', link: '/hostel-manager/kyc' },
      gradient: 'from-yellow-500 to-orange-600'
    };
  };

  const kycAlert = getKYCAlert();

  const statCards = [
    {
      title: 'Total Properties',
      value: stats?.totalHostels || 0,
      icon: <FiHome className="w-8 h-8" />,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      icon: <FiMessageSquare className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Average Rating',
      value: stats?.avgRating || '0.0',
      icon: <FiStar className="w-8 h-8" />,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      suffix: '⭐',
      change: '+0.3',
      changeType: 'positive'
    },
    {
      title: 'Total Views',
      value: '1.2K',
      icon: <FiEye className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      change: '+24%',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new hostel or PG on the platform',
      icon: <FiHome className="w-6 h-6" />,
      link: '/hostel-manager/hostels/add',
      gradient: 'from-blue-500 to-indigo-600',
      enabled: kycStatus === 'verified'
    },
    {
      title: 'Manage Properties',
      description: 'View and edit your existing listings',
      icon: <FiHome className="w-6 h-6" />,
      link: '/hostel-manager/hostels',
      gradient: 'from-purple-500 to-pink-600',
      enabled: true
    },
    {
      title: 'View Reviews',
      description: 'Check customer feedback and ratings',
      icon: <FiMessageSquare className="w-6 h-6" />,
      link: '/hostel-manager/reviews',
      gradient: 'from-orange-500 to-red-600',
      enabled: true
    },
    {
      title: 'KYC Status',
      description: 'Manage your verification documents',
      icon: <FiCheckCircle className="w-6 h-6" />,
      link: '/hostel-manager/kyc',
      gradient: 'from-green-500 to-teal-600',
      enabled: true
    }
  ];

  return (
    <HostelManagerLayout>
      <div className="space-y-6">
        {/* KYC Alert Banner */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${kycAlert.gradient} p-1 shadow-xl`}>
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${kycAlert.gradient} text-white shadow-lg`}>
                {kycAlert.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{kycAlert.title}</h3>
                <p className="text-gray-600 mb-3">{kycAlert.message}</p>
                {kycAlert.action && (
                  <Link
                    to={kycAlert.action.link}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r ${kycAlert.gradient} text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium`}
                  >
                    {kycAlert.action.label}
                    <FiArrowRight />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  {stat.change && (
                    <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                      stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <FiTrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && <span className="text-2xl ml-1">{stat.suffix}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
                  !action.enabled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                onClick={(e) => !action.enabled && e.preventDefault()}
              >
                <div className="p-6">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 gap-1 transition-all">
                    <span>Go to page</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                {!action.enabled && (
                  <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                      KYC Required
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New review received</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerDashboard;
