import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, List, Typography, Skeleton, Segmented, Avatar } from 'antd';
import { 
  FiMessageSquare, FiCheckCircle, FiClock, FiStar, 
  FiUser, FiCalendar 
} from 'react-icons/fi';
import { hostelManagerAPI } from '../services/api';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS                                                              */
/* -------------------------------------------------------------------------- */

const STARS = [1, 2, 3, 4, 5];

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const HostelManagerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // --------------------------------------------------------------------------
  // NETWORK & LIFECYCLE
  // --------------------------------------------------------------------------

  const fetchReviews = useCallback(async (abortSignal) => {
    try {
      setLoading(true);
      const res = await hostelManagerAPI.getReviews({ signal: abortSignal });
      if (!abortSignal?.aborted) {
        setReviews(res.data?.reviews || []);
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to fetch reviews:', error);
      }
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchReviews(abortController.signal);
    return () => abortController.abort();
  }, [fetchReviews]);

  // --------------------------------------------------------------------------
  // STRICT DATA MEMOIZATION (Zero layout thrashing on re-renders)
  // --------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.isApproved).length;
    const pending = total - approved;
    const avgRating = total > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1) 
      : '0.0';

    return { total, approved, pending, avgRating };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter(r => filter === 'approved' ? r.isApproved : !r.isApproved);
  }, [reviews, filter]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (loading) {
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
          <Title level={3} className="!m-0 text-slate-900">Review Management</Title>
          <Text type="secondary" className="font-medium text-slate-500">Monitor and track feedback across all your properties.</Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Total Reviews</span>} 
                value={stats.total} 
                prefix={<FiMessageSquare className="text-blue-500 mr-2" />} 
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
                title={<span className="text-slate-500 font-medium">Pending Moderation</span>} 
                value={stats.pending} 
                valueStyle={{ color: '#f59e0b' }}
                prefix={<FiClock className="mr-2" />} 
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">Average Rating</span>} 
                value={stats.avgRating} 
                suffix="/ 5.0"
                prefix={<FiStar className="text-yellow-500 mr-2" />} 
              />
            </Card>
          </Col>
        </Row>

        {/* Review List Section */}
        <Card 
          bordered={false} 
          className="shadow-sm border border-slate-100"
          bodyStyle={{ padding: 0 }}
        >
          {/* Filtering Controls */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Segmented 
              options={[
                { label: `All Reviews (${stats.total})`, value: 'all' },
                { label: `Approved (${stats.approved})`, value: 'approved' },
                { label: `Pending (${stats.pending})`, value: 'pending' },
              ]}
              value={filter}
              onChange={setFilter}
              size="large"
              className="shadow-sm font-medium"
            />
          </div>

          {/* Ant Design List Engine */}
          <List
            dataSource={filteredReviews}
            locale={{ emptyText: <div className="py-12 text-slate-400">No reviews found for this filter.</div> }}
            renderItem={(review) => (
              <List.Item className="p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors block">
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                  
                  {/* Property & User Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      {review.hostel?.name || 'Unknown Property'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Avatar size="small" className="bg-slate-200 text-slate-600 font-bold">
                          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <span>{review.user?.name || 'Anonymous User'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-l pl-4 border-slate-200">
                        <FiCalendar className="text-slate-400" />
                        <span>{new Date(review.createdAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Status Badges */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                      <div className="flex gap-0.5">
                        {STARS.map((star) => (
                          <FiStar
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1.5 font-bold text-slate-800">{Number(review.rating || 0).toFixed(1)}</span>
                    </div>
                    
                    <Tag 
                      color={review.isApproved ? 'success' : 'warning'}
                      className="m-0 font-bold tracking-wide uppercase text-[10px]"
                    >
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Tag>
                  </div>
                  
                </div>

                {/* Review Content */}
                <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-slate-700 leading-relaxed">
                  {review.comment || 'No written feedback provided.'}
                </div>
                
              </List.Item>
            )}
          />
        </Card>

      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerReviews;