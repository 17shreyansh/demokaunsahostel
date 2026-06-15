import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Row, Col, Card, Statistic, Tag, List, Avatar, Button, Progress, message, Spin, Typography } from 'antd';
import { 
  FiHome, FiMessageSquare, FiEye, FiActivity, 
  FiTrendingUp, FiCheckCircle, FiClock, FiStar 
} from 'react-icons/fi';
import { hostelAPI, enquiryAPI, leadAPI } from '../services/api';
import { stateManager, invalidateData } from '../utils/stateManager';
import MapStatsWidget from '../components/MapStatsWidget';

const { Title, Text } = Typography;

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const MiniBarChart = memo(({ data, color = '#1677ff' }) => {
  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  
  return (
    <div className="flex items-end justify-between h-24 mt-4 px-1 gap-1">
      {data.map((item, index) => {
        const height = Math.max(((item.value || 0) / maxValue) * 100, 4);
        return (
          <div key={index} className="flex flex-col items-center flex-1 group relative">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              {item.value}
            </div>
            <div 
              className="w-full max-w-[12px] rounded-t-sm transition-all duration-300 group-hover:opacity-80"
              style={{ 
                height: `${height}%`, 
                backgroundColor: item.value > 0 ? color : '#f0f0f0'
              }}
            />
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter hidden sm:block">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});
MiniBarChart.displayName = 'MiniBarChart';

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD COMPONENT                                                   */
/* -------------------------------------------------------------------------- */

const AdminDashboard = () => {
  const [hostels, setHostels] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Network Fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hostelsRes, enquiriesRes, leadsRes] = await Promise.all([
        hostelAPI.getAll().catch(() => ({ data: { hostels: [] } })),
        enquiryAPI.getAll().catch(() => ({ data: [] })),
        leadAPI.getAll().catch(() => ({ data: [] }))
      ]);
      
      setHostels(hostelsRes.data?.hostels || hostelsRes.data || []);
      setEnquiries(enquiriesRes.data || []);
      setLeads(leadsRes.data || []);
    } catch (error) {
      message.error('Failed to sync dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return stateManager.subscribe('dashboard', fetchData);
  }, [fetchData]);

  // --------------------------------------------------------------------------
  // HEAVY MATH MEMOIZATION (Zero layout thrashing on re-renders)
  // --------------------------------------------------------------------------
  const { stats, charts, topViewed, featuredList } = useMemo(() => {
    const now = new Date();
    
    // Growth Math
    const thisMonth = enquiries.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = enquiries.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    const allInteractions = [...enquiries, ...(Array.isArray(leads) ? leads : [])];

    // Chart Generation Helpers
    const getLast7Days = (dataset, multiplier = 1) => Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const count = dataset.filter(item => new Date(item.createdAt).toDateString() === d.toDateString()).length;
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: count * multiplier };
    });

    const getLast6Months = (dataset) => Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const count = dataset.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear();
      }).length;
      return { label: d.toLocaleDateString('en', { month: 'short' }), value: count };
    });

    return {
      stats: {
        totalProperties: hostels.length,
        totalEnquiries: enquiries.length,
        totalViews: hostels.reduce((sum, h) => sum + (h.views || 0), 0),
        pendingRequests: enquiries.filter(e => e.status === 'Pending').length,
        responseRate: enquiries.length > 0 
          ? Math.round((enquiries.filter(e => e.status !== 'Pending').length / enquiries.length) * 100) 
          : 0,
        monthlyGrowth: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0
      },
      charts: {
        traffic: getLast7Days(allInteractions, 2), // Mocking pageViews
        bookings: getLast7Days(enquiries),
        growth: getLast6Months(enquiries)
      },
      topViewed: [...hostels].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
      featuredList: hostels.filter(h => h.featured === true)
    };
  }, [hostels, enquiries, leads]);

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const toggleFeaturedHostel = useCallback(async (hostelId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Validate constraint
    if (newStatus && featuredList.length >= 6) {
      message.warning('Maximum 6 featured properties allowed.');
      return;
    }

    // Optimistic UI Update
    setHostels(prev => prev.map(h => h._id === hostelId ? { ...h, featured: newStatus } : h));

    try {
      const response = await hostelAPI.updateFeatured(hostelId, newStatus);
      if (response.data.success) {
        message.success(newStatus ? 'Property featured' : 'Property removed from featured');
        invalidateData('homepage');
      } else {
        throw new Error();
      }
    } catch (error) {
      // Revert on failure
      setHostels(prev => prev.map(h => h._id === hostelId ? { ...h, featured: currentStatus } : h));
      message.error('Failed to update featured status');
    }
  }, [featuredList.length]);

  const handleRefresh = useCallback(() => {
    invalidateData();
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Dashboard Overview</Title>
          <Text type="secondary">Monitor your properties, lead generation, and system analytics.</Text>
        </div>
        <Button onClick={handleRefresh} icon={<FiActivity />} loading={loading}>
          Sync Data
        </Button>
      </div>

      <Spin spinning={loading} size="large">
        
        {/* TOP STATS */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Total Properties</span>} 
                value={stats.totalProperties} 
                prefix={<FiHome className="text-blue-500 mr-2" />} 
              />
              <div className="mt-2 text-xs">
                <Text type="success">Active listings</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Total Enquiries</span>} 
                value={stats.totalEnquiries} 
                prefix={<FiMessageSquare className="text-indigo-500 mr-2" />} 
              />
              <div className="mt-2 text-xs flex items-center gap-1">
                {stats.monthlyGrowth >= 0 ? <FiTrendingUp className="text-green-500"/> : <FiActivity className="text-red-500"/>}
                <Text type={stats.monthlyGrowth >= 0 ? "success" : "danger"}>
                  {Math.abs(stats.monthlyGrowth)}% vs last month
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Property Views</span>} 
                value={stats.totalViews} 
                prefix={<FiEye className="text-purple-500 mr-2" />} 
              />
              <div className="mt-2 text-xs">
                <Text type="secondary">Across all listings</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Response Rate</span>} 
                value={stats.responseRate} 
                suffix="%"
                prefix={<FiCheckCircle className="text-emerald-500 mr-2" />} 
              />
              <div className="mt-2">
                <Progress 
                  percent={stats.responseRate} 
                  size="small" 
                  showInfo={false} 
                  strokeColor={stats.responseRate >= 80 ? '#52c41a' : stats.responseRate >= 50 ? '#faad14' : '#ff4d4f'}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* MINI CHARTS */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={8}>
            <Card title="Traffic (7 Days)" bordered={false} className="shadow-sm h-full" size="small">
              <MiniBarChart data={charts.traffic} color="#8b5cf6" />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Enquiries (7 Days)" bordered={false} className="shadow-sm h-full" size="small">
              <MiniBarChart data={charts.bookings} color="#3b82f6" />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Growth (6 Months)" bordered={false} className="shadow-sm h-full" size="small">
              <MiniBarChart data={charts.growth} color="#10b981" />
            </Card>
          </Col>
        </Row>

        {/* MIDDLE SECTION: MAP & LISTS */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} xl={16}>
            <Card title="Geographic Distribution" bordered={false} className="shadow-sm h-full">
              {/* Map Widget sits cleanly inside the Antd Card */}
              <MapStatsWidget />
            </Card>
          </Col>
          
          <Col xs={24} xl={8}>
            <Card 
              title="Top Viewed Properties" 
              bordered={false} 
              className="shadow-sm h-full"
              bodyStyle={{ padding: '0 24px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={topViewed}
                renderItem={(item, index) => {
                  const maxViews = Math.max(...topViewed.map(h => h.views || 0), 1);
                  return (
                    <List.Item className="border-b-0 py-3">
                      <List.Item.Meta
                        avatar={<Avatar className={index < 3 ? 'bg-slate-800' : 'bg-slate-300'}>{index + 1}</Avatar>}
                        title={<Text strong className="truncate block w-40">{item.name}</Text>}
                        description={
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              percent={Math.round(((item.views || 0) / maxViews) * 100)} 
                              showInfo={false} 
                              size="small"
                              className="m-0"
                            />
                            <span className="text-xs text-slate-400 whitespace-nowrap">{item.views} views</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* BOTTOM SECTION: DATA TABLES/LISTS */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title="Recent Properties" 
              extra={<Tag color="blue">{hostels.length} Total</Tag>}
              bordered={false} 
              className="shadow-sm"
              bodyStyle={{ padding: 0 }}
            >
              <List
                dataSource={hostels.slice(0, 5)}
                renderItem={item => (
                  <List.Item 
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    actions={[
                      <Button 
                        size="small" 
                        type={item.featured ? "default" : "dashed"}
                        danger={item.featured}
                        icon={<FiStar />}
                        onClick={() => toggleFeaturedHostel(item._id, item.featured)}
                      >
                        {item.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{item.name}</Text>}
                      description={item.location}
                    />
                    <div className="text-right">
                      <div className="font-semibold">₹{item.price}/mo</div>
                      <Tag color={
                        item.availability === 'Available' ? 'success' : 
                        item.availability === 'Limited' ? 'warning' : 'error'
                      }>
                        {item.availability}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title="Pending Enquiries" 
              extra={<Tag color="warning">{stats.pendingRequests} New</Tag>}
              bordered={false} 
              className="shadow-sm"
              bodyStyle={{ padding: 0 }}
            >
              <List
                dataSource={enquiries.slice(0, 5)}
                renderItem={item => (
                  <List.Item className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <List.Item.Meta
                      avatar={<Avatar className="bg-indigo-100 text-indigo-600"><FiClock /></Avatar>}
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <span className="text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()} • {item.phone}
                        </span>
                      }
                    />
                    <Tag color={
                      item.status === 'Pending' ? 'warning' : 
                      item.status === 'Contacted' ? 'processing' : 'success'
                    }>
                      {item.status}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;