import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import blogAPI from '../../services/blogAPI';
import { 
  Plus, Edit2, Trash2, Eye, Copy, Send, 
  Search, Loader2, FileText, CheckCircle, Edit3, TrendingUp
} from 'lucide-react';
import { message } from 'antd'; // Retained strictly for imperative toast notifications

export default function AdminBlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadBlogs();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search || undefined
      };
      const res = await blogAPI.get('/', { params });
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
      const res = await blogAPI.get('/admin/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This cannot be undone.')) return;
    
    try {
      await blogAPI.delete(`/admin/${id}`);
      message.success('Blog deleted');
      loadBlogs();
    } catch (error) {
      message.error('Failed to delete blog');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await blogAPI.post(`/admin/${id}/duplicate`);
      message.success('Blog duplicated');
      navigate(`/admin/blog/edit/${res.data.data._id}`);
    } catch (error) {
      message.error('Failed to duplicate blog');
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm('Are you sure you want to publish this post?')) return;

    try {
      await blogAPI.post(`/admin/${id}/publish`);
      message.success('Blog published');
      loadBlogs();
    } catch (error) {
      message.error('Failed to publish blog');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-blue-100 text-blue-700',
      scheduled: 'bg-orange-100 text-orange-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 m-0">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage, publish, and track your blog posts.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/blog/new')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors focus:outline-none active:scale-[0.98]"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Flat Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Published</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.published}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.drafts}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Views</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts (Press Enter)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400 font-medium"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filters.status}
              onChange={e => {
                setFilters(prev => ({ ...prev, status: e.target.value }));
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600 transition-colors text-gray-700 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Flat Table */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 -[1px]">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Title & Slug</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Author</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Categories</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Views</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 tracking-tight">Publish Date</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-900 tracking-tight">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {blogs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <p className="text-gray-500 font-medium">No blog posts found.</p>
                    </td>
                  </tr>
                ) : (
                  blogs.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 text-base">{record.title}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">/blog/{record.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                        {record.author?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {record.categories?.map(c => (
                            <span 
                              key={c._id} 
                              className="px-2 py-0.5 text-xs font-bold rounded"
                              style={{ 
                                backgroundColor: c.color || '#e5e7eb', 
                                color: '#ffffff'
                              }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                        {record.views?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                        {record.publishDate ? new Date(record.publishDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => window.open(`/blog/${record.slug}`, '_blank')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none"
                            title="View Live"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/blog/edit/${record._id}`)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
                            title="Edit Post"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDuplicate(record._id)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
                            title="Duplicate Post"
                          >
                            <Copy size={18} />
                          </button>
                          {record.status !== 'published' && (
                            <button 
                              onClick={() => handlePublish(record._id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors focus:outline-none"
                              title="Publish Post"
                            >
                              <Send size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(record._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none"
                            title="Delete Post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flat Pagination Footer */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page <span className="font-bold text-gray-900">{pagination.page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page === totalPages}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
}