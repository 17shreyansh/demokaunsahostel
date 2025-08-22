import axios from 'axios'
import { fallbackHostels, fallbackFilterOptions, fallbackSearchSuggestions } from '../data/fallbackData'

const API_BASE_URL = __API_BASE_URL__

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
})

// Check if backend is available
let isBackendAvailable = true

const checkBackendStatus = async () => {
  try {
    await api.get('/health')
    isBackendAvailable = true
  } catch (error) {
    isBackendAvailable = false
  }
}

// Check backend status on app load
checkBackendStatus()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const hostelAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      return await api.get(`/hostels${queryString ? `?${queryString}` : ''}`)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      return {
        data: {
          hostels: fallbackHostels.slice(0, 6),
          pagination: { current: 1, pages: 1, total: fallbackHostels.length }
        }
      }
    }
  },
  search: async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      return await api.get(`/hostels?${queryString}`)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      let filteredHostels = [...fallbackHostels]
      
      // Apply basic filtering
      if (params.search) {
        filteredHostels = filteredHostels.filter(h => 
          h.name.toLowerCase().includes(params.search.toLowerCase()) ||
          h.location.toLowerCase().includes(params.search.toLowerCase())
        )
      }
      if (params.location) {
        filteredHostels = filteredHostels.filter(h => h.location.includes(params.location))
      }
      if (params.gender) {
        filteredHostels = filteredHostels.filter(h => h.gender === params.gender || h.gender === 'Co-ed')
      }
      if (params.type) {
        filteredHostels = filteredHostels.filter(h => h.type === params.type)
      }
      if (params.availability) {
        filteredHostels = filteredHostels.filter(h => h.availability === params.availability)
      }
      if (params.minPrice) {
        filteredHostels = filteredHostels.filter(h => h.price >= parseInt(params.minPrice))
      }
      if (params.maxPrice) {
        filteredHostels = filteredHostels.filter(h => h.price <= parseInt(params.maxPrice))
      }
      
      return {
        data: {
          hostels: filteredHostels,
          pagination: { current: 1, pages: 1, total: filteredHostels.length }
        }
      }
    }
  },
  getSuggestions: async (query) => {
    try {
      return await api.get(`/hostels/search/suggestions?q=${query}`)
    } catch (error) {
      console.warn('Backend unavailable, using fallback suggestions')
      const filtered = fallbackSearchSuggestions.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      return { data: filtered }
    }
  },
  getFilterOptions: async () => {
    try {
      return await api.get('/hostels/filters/options')
    } catch (error) {
      console.warn('Backend unavailable, using fallback filter options')
      return { data: fallbackFilterOptions }
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/hostels/${id}`)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      const hostel = fallbackHostels.find(h => h._id === id)
      if (hostel) {
        return { data: hostel }
      }
      throw new Error('Hostel not found')
    }
  },
  getBySlug: async (slug) => {
    try {
      return await api.get(`/hostels/slug/${slug}`)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      const hostel = fallbackHostels.find(h => h.slug === slug)
      if (hostel) {
        return { data: hostel }
      }
      throw new Error('Hostel not found')
    }
  },
  create: (data) => api.post('/hostels', data),
  update: (id, data) => api.put(`/hostels/${id}`, data),
  updateFeatured: (id, featured) => api.patch(`/hostels/${id}/featured`, { featured }),
  getFeatured: () => api.get('/hostels/featured/homepage'),
  delete: (id) => api.delete(`/hostels/${id}`)
}

export const enquiryAPI = {
  create: async (data) => {
    try {
      return await api.post('/enquiries', data)
    } catch (error) {
      console.warn('Backend unavailable, enquiry stored locally')
      // Store in localStorage for when backend comes back online
      const enquiries = JSON.parse(localStorage.getItem('pendingEnquiries') || '[]')
      enquiries.push({ ...data, timestamp: new Date().toISOString() })
      localStorage.setItem('pendingEnquiries', JSON.stringify(enquiries))
      return { data: { message: 'Enquiry saved. Will be sent when connection is restored.' } }
    }
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
    try {
      return await api.post('/leads/enquiry', data)
    } catch (error) {
      console.warn('Backend unavailable, enquiry stored locally')
      const enquiries = JSON.parse(localStorage.getItem('pendingEnquiries') || '[]')
      enquiries.push({ ...data, type: 'enquiry', timestamp: new Date().toISOString() })
      localStorage.setItem('pendingEnquiries', JSON.stringify(enquiries))
      return { data: { message: 'Enquiry saved. Will be sent when connection is restored.' } }
    }
  },
  createContact: async (data) => {
    try {
      return await api.post('/leads/contact', data)
    } catch (error) {
      console.warn('Backend unavailable, contact stored locally')
      const contacts = JSON.parse(localStorage.getItem('pendingContacts') || '[]')
      contacts.push({ ...data, type: 'contact', timestamp: new Date().toISOString() })
      localStorage.setItem('pendingContacts', JSON.stringify(contacts))
      return { data: { message: 'Message saved. Will be sent when connection is restored.' } }
    }
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