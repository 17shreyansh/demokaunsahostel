import axios from 'axios'

const API_BASE_URL = __API_BASE_URL__

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const hostelAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/hostels${queryString ? `?${queryString}` : ''}`)
  },
  search: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/hostels?${queryString}`)
  },
  getSuggestions: (query) => api.get(`/hostels/search/suggestions?q=${query}`),
  getFilterOptions: () => api.get('/hostels/filters/options'),
  getById: (id) => api.get(`/hostels/${id}`),
  getBySlug: (slug) => api.get(`/hostels/slug/${slug}`),
  create: (data) => api.post('/hostels', data),
  update: (id, data) => api.put(`/hostels/${id}`, data),
  delete: (id) => api.delete(`/hostels/${id}`)
}

export const enquiryAPI = {
  create: (data) => api.post('/enquiries', data),
  getAll: () => api.get('/enquiries'),
  updateStatus: (id, status) => api.put(`/enquiries/${id}/status`, { status })
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data)
}

export const leadAPI = {
  createEnquiry: (data) => api.post('/leads/enquiry', data),
  createContact: (data) => api.post('/leads/contact', data),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/leads${queryString ? `?${queryString}` : ''}`)
  },
  updateStatus: (id, status) => api.put(`/leads/${id}/status`, { status }),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  delete: (id) => api.delete(`/leads/${id}`)
}

export default api