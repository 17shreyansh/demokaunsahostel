import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Popconfirm, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

export default function AdminBlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadBlogs();
    loadStats();
  }, [pagination.page, filters]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search || undefined
      };
      const res = await axios.get('/api/blog', { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data.blogs);
      setPagination(prev => ({ ...prev, total: res.data.pagination.total }));
    } catch (error) {
      message.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/blog/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/blog/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Blog deleted');
      loadBlogs();
    } catch (error) {
      message.error('Failed to delete blog');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`/api/blog/admin/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Blog duplicated');
      navigate(`/admin/blog/edit/${res.data.data._id}`);
    } catch (error) {
      message.error('Failed to duplicate blog');
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`/api/blog/admin/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Blog published');
      loadBlogs();
    } catch (error) {
      message.error('Failed to publish blog');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">/blog/{record.slug}</div>
        </div>
      )
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: author => author?.name
    },
    {
      title: 'Category',
      dataIndex: 'categories',
      key: 'categories',
      render: categories => categories?.map(c => <Tag key={c._id} color={c.color}>{c.name}</Tag>)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const colors = {
          draft: 'default',
          review: 'blue',
          scheduled: 'orange',
          published: 'green',
          archived: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: true
    },
    {
      title: 'Date',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: date => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => window.open(`/blog/${record.slug}`, '_blank')} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/blog/edit/${record._id}`)} />
          <Button size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(record._id)} />
          {record.status !== 'published' && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handlePublish(record._id)} />
          )}
          <Popconfirm title="Delete blog?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/blog/new')}>
          New Post
        </Button>
      </div>

      {stats && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Total Posts" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Published" value={stats.published} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Drafts" value={stats.drafts} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Total Views" value={stats.totalViews} />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Space className="mb-4">
          <Search
            placeholder="Search blogs..."
            onSearch={value => setFilters(prev => ({ ...prev, search: value }))}
            style={{ width: 300 }}
          />
          <Select
            value={filters.status}
            onChange={value => setFilters(prev => ({ ...prev, status: value }))}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="draft">Draft</Option>
            <Option value="review">Review</Option>
            <Option value="published">Published</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: page => setPagination(prev => ({ ...prev, page }))
          }}
        />
      </Card>
    </div>
  );
}
