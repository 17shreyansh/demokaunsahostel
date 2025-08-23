import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true, // Enable cookies for JWT
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request interceptor for adding auth headers if needed
    this.client.interceptors.request.use(
      (config) => {
        // Ensure credentials are included for all requests
        config.withCredentials = true
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.client.get(url, config)
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config)
  }

  // Auth methods
  auth = {
    login: (credentials) => this.post('/auth/login', credentials),
    logout: () => this.post('/auth/logout'),
    register: (data) => this.post('/auth/register', data),
    getProfile: () => this.get('/auth/profile')
  }

  // Hostel methods
  hostels = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.get(`/hostels${queryString ? `?${queryString}` : ''}`)
    },
    getById: (id) => this.get(`/hostels/${id}`),
    getBySlug: (slug) => this.get(`/hostels/slug/${slug}`),
    getFeatured: () => this.get('/hostels/featured/homepage'),
    getSuggestions: (query) => this.get(`/hostels/search/suggestions?q=${encodeURIComponent(query)}`),
    getFilterOptions: () => this.get('/hostels/filters/options'),
    create: (data) => this.post('/hostels', data),
    update: (id, data) => this.put(`/hostels/${id}`, data),
    updateFeatured: (id, featured) => this.patch(`/hostels/${id}/featured`, { featured }),
    delete: (id) => this.delete(`/hostels/${id}`)
  }

  // Enquiry methods
  enquiries = {
    getAll: () => this.get('/enquiries'),
    create: (data) => this.post('/enquiries', data),
    updateStatus: (id, status) => this.put(`/enquiries/${id}/status`, { status })
  }

  // Lead methods
  leads = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.get(`/leads${queryString ? `?${queryString}` : ''}`)
    },
    createEnquiry: (data) => this.post('/leads/enquiry', data),
    createContact: (data) => this.post('/leads/contact', data),
    updateStatus: (id, status) => this.put(`/leads/${id}/status`, { status }),
    addNote: (id, text) => this.post(`/leads/${id}/notes`, { text }),
    delete: (id) => this.delete(`/leads/${id}`)
  }

  // Page content methods
  pages = {
    getContent: (page) => this.get(`/page-content/${page}`),
    updateContent: (page, data) => this.put(`/page-content/${page}`, data),
    getAllContent: () => this.get('/page-content')
  }

  // Settings methods
  settings = {
    getAll: () => this.get('/settings'),
    update: (data) => this.put('/settings', data)
  }

  // Nearby places methods
  nearbyPlaces = {
    getAll: () => this.get('/nearbyplaces'),
    create: (data) => this.post('/nearbyplaces', data),
    update: (id, data) => this.put(`/nearbyplaces/${id}`, data),
    delete: (id) => this.delete(`/nearbyplaces/${id}`)
  }

  // Health check
  health = () => this.get('/health')
}

export default new ApiClient()