import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const blogAPI = axios.create({
  baseURL: `${API_URL}/blog`,
  withCredentials: true // Enable cookies
});

export const blogService = {
  // Public
  getPublishedBlogs: (params) => blogAPI.get('/', { params }),
  getBlogBySlug: (slug) => blogAPI.get(`/slug/${slug}`),
  searchBlogs: (query, params) => blogAPI.get('/search', { params: { q: query, ...params } }),
  getFeatured: (limit = 5) => blogAPI.get('/featured', { params: { limit } }),
  getTrending: (limit = 10) => blogAPI.get('/trending', { params: { limit } }),
  getPopular: (days = 30, limit = 10) => blogAPI.get('/popular', { params: { days, limit } }),
  
  // Admin
  getAllBlogs: (params) => blogAPI.get('/admin', { params }),
  getBlogById: (id) => blogAPI.get(`/admin/${id}`),
  createBlog: (data) => blogAPI.post('/admin', data),
  updateBlog: (id, data) => blogAPI.put(`/admin/${id}`, data),
  deleteBlog: (id) => blogAPI.delete(`/admin/${id}`),
  publishBlog: (id) => blogAPI.post(`/admin/${id}/publish`),
  scheduleBlog: (id, scheduledFor) => blogAPI.post(`/admin/${id}/schedule`, { scheduledFor }),
  duplicateBlog: (id) => blogAPI.post(`/admin/${id}/duplicate`),
  autoSave: (id, data) => blogAPI.patch(`/admin/${id}/autosave`, data),
  getStats: () => blogAPI.get('/admin/stats'),
  generateSEO: (data) => blogAPI.post('/admin/seo/generate', data),
  
  // Analytics
  trackEngagement: (blogId, data) => blogAPI.post('/track/engagement', { blogId, ...data }),
  trackShare: (blogId, platform) => blogAPI.post('/track/share', { blogId, platform }),
};

export const categoryService = {
  getAll: () => blogAPI.get('/categories'),
  getTree: () => blogAPI.get('/categories/tree'),
  getBySlug: (slug) => blogAPI.get(`/categories/${slug}`),
  create: (data) => blogAPI.post('/categories/admin', data),
  update: (id, data) => blogAPI.put(`/categories/admin/${id}`, data),
  delete: (id) => blogAPI.delete(`/categories/admin/${id}`)
};

export const tagService = {
  getAll: () => blogAPI.get('/tags'),
  getPopular: () => blogAPI.get('/tags/popular'),
  create: (data) => blogAPI.post('/tags/admin', data),
  update: (id, data) => blogAPI.put(`/tags/admin/${id}`, data),
  delete: (id) => blogAPI.delete(`/tags/admin/${id}`)
};

export const authorService = {
  getAll: () => axios.get(`${API_URL}/blog/authors`),
  getBySlug: (slug) => axios.get(`${API_URL}/blog/authors/${slug}`),
  create: (data) => axios.post(`${API_URL}/blog/authors/admin`, data),
  update: (id, data) => axios.put(`${API_URL}/blog/authors/admin/${id}`, data)
};

export const commentService = {
  getByBlog: (blogId, status = 'approved') => axios.get(`${API_URL}/blog/comments/blog/${blogId}`, { params: { status } }),
  create: (data) => axios.post(`${API_URL}/blog/comments`, data),
  getAll: (params) => axios.get(`${API_URL}/blog/comments/admin`, { params }),
  moderate: (id, status) => axios.patch(`${API_URL}/blog/comments/admin/${id}/moderate`, { status }),
  delete: (id) => axios.delete(`${API_URL}/blog/comments/admin/${id}`)
};

export const mediaService = {
  getAll: (params) => axios.get(`${API_URL}/blog/media`, { params }),
  upload: (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
    return axios.post(`${API_URL}/blog/media/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => axios.put(`${API_URL}/blog/media/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/blog/media/${id}`)
};

export const analyticsService = {
  getBlogAnalytics: (blogId, days = 30) => axios.get(`${API_URL}/blog/analytics/blog/${blogId}`, { params: { days } }),
  getDashboard: (days = 30) => axios.get(`${API_URL}/blog/analytics/dashboard`, { params: { days } }),
  getTopPosts: (limit = 10, days = 30) => axios.get(`${API_URL}/blog/analytics/top-posts`, { params: { limit, days } })
};

export default blogAPI;
