import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pageAPI = {
  // Public
  getPage: (slug) => api.get(`/pages/${slug}`),
  
  // Admin
  getAllPages: () => api.get('/pages/admin'),
  createPage: (data) => api.post('/pages', data),
  updatePage: (id, data) => api.put(`/pages/${id}`, data),
  deletePage: (id) => api.delete(`/pages/${id}`)
};