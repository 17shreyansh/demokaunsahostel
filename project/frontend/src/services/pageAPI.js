import apiClient from './apiClient'

// Use the centralized API client instead of creating a separate instance

export const pageAPI = {
  // Public
  getPage: (slug) => apiClient.get(`/pages/${slug}`),
  
  // Admin
  getAllPages: () => apiClient.get('/pages/admin'),
  createPage: (data) => apiClient.post('/pages', data),
  updatePage: (id, data) => apiClient.put(`/pages/${id}`, data),
  deletePage: (id) => apiClient.delete(`/pages/${id}`)
}