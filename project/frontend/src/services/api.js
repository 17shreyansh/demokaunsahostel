import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Cache for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Request interceptor for caching
api.interceptors.request.use((config) => {
  const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    config.adapter = () => Promise.resolve(cached.response)
  }
  
  return config
})

// Response interceptor for caching
api.interceptors.response.use((response) => {
  const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`
  cache.set(cacheKey, {
    response,
    timestamp: Date.now()
  })
  return response
})

// Separate config for file uploads with no timeout
const uploadAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout for uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity
})

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

export const hostelAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/hostels${queryString ? `?${queryString}` : ''}`)
  },
  search: async (params) => {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/hostels?${queryString}`)
  },
  getSuggestions: async (query) => {
    return await api.get(`/hostels/search/suggestions?q=${query}`)
  },
  getFilterOptions: async () => {
    return await api.get('/hostels/filters/options')
  },
  getById: async (id) => {
    return await api.get(`/hostels/${id}`)
  },
  getBySlug: async (slug) => {
    return await api.get(`/hostels/slug/${slug}`)
  },
  create: (data) => api.post('/hostels', data),
  update: (id, data) => api.put(`/hostels/${id}`, data),
  updateFeatured: (id, featured) => api.patch(`/hostels/${id}/featured`, { featured }),
  getFeatured: async () => {
    return await api.get('/hostels/featured/homepage')
  },
  delete: (id) => api.delete(`/hostels/${id}`)
}

export const enquiryAPI = {
  create: async (data) => {
    return await api.post('/enquiries', data)
  },
  getAll: () => api.get('/enquiries'),
  updateStatus: (id, status) => api.put(`/enquiries/${id}/status`, { status })
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data)
}

export const leadAPI = {
  createEnquiry: async (data) => {
    return await api.post('/leads/enquiry', data)
  },
  createContact: async (data) => {
    return await api.post('/leads/contact', data)
  },
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/leads${queryString ? `?${queryString}` : ''}`)
  },
  updateStatus: (id, status) => api.put(`/leads/${id}/status`, { status }),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  delete: (id) => api.delete(`/leads/${id}`)
}

export const pageAPI = {
  getPageContent: (page) => api.get(`/page-content/${page}`),
  updatePageContent: (page, data) => api.put(`/page-content/${page}`, data),
  getAllPageContent: () => api.get('/page-content')
}

export default api