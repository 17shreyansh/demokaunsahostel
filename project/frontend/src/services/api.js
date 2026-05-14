import axios from 'axios'
import { cacheManager } from '../utils/cacheManager'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Cache for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Register cache with cache manager
cacheManager.register('api', cache)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Request interceptor for caching (only cache GET requests)
api.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      config.adapter = () => Promise.resolve(cached.response)
    }
  }
  
  return config
})

// Response interceptor for caching (only cache GET responses)
api.interceptors.response.use((response) => {
  // Only cache GET responses
  if (response.config.method === 'get') {
    const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`
    cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    })
  }
  return response
})

// Separate config for file uploads with no timeout
const uploadAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout for uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity
})

// Auth interceptor for both APIs
const authInterceptor = (config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error))
uploadAPI.interceptors.request.use(authInterceptor, (error) => Promise.reject(error))

// Clear cache function
const clearCache = () => {
  console.log('Clearing API cache...')
  cache.clear()
  cacheManager.clearAll()
}

export const hostelAPI = {
  getAll: async (params = {}) => {
    // Add timestamp to bypass cache
    const allParams = { ...params, _t: Date.now() }
    const queryString = new URLSearchParams(allParams).toString()
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
    // Add timestamp to bypass cache
    return await api.get(`/hostels/${id}?_t=${Date.now()}`)
  },
  getBySlug: async (slug) => {
    return await api.get(`/hostels/slug/${slug}`)
  },
  create: async (data) => {
    const result = await uploadAPI.post('/hostels', data)
    clearCache() // Clear cache after create
    return result
  },
  update: async (id, data) => {
    const result = await uploadAPI.put(`/hostels/${id}`, data)
    clearCache() // Clear cache after update
    return result
  },
  updateFeatured: async (id, featured) => {
    const result = await api.patch(`/hostels/${id}/featured`, { featured })
    clearCache() // Clear cache after featured update
    return result
  },
  getFeatured: async () => {
    return await api.get('/hostels/featured/homepage')
  },
  delete: async (id) => {
    const result = await api.delete(`/hostels/${id}`)
    clearCache() // Clear cache after delete
    return result
  },
  clearCache
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