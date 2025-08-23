// Legacy API - Use apiClient.js for new implementations
import apiClient from './apiClient'
import { fallbackHostels, fallbackFilterOptions, fallbackSearchSuggestions } from '../data/fallbackData'

// Fallback handling for when backend is unavailable
let isBackendAvailable = true

const checkBackendStatus = async () => {
  try {
    await apiClient.health()
    isBackendAvailable = true
  } catch (error) {
    isBackendAvailable = false
  }
}

// Check backend status on app load
checkBackendStatus()

export const hostelAPI = {
  getAll: async (params = {}) => {
    try {
      return await apiClient.hostels.getAll(params)
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
      return await apiClient.hostels.getAll(params)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      let filteredHostels = [...fallbackHostels]
      
      // Apply all filters in a single pass for better performance
      filteredHostels = filteredHostels.filter(h => {
        // Search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          const matchesSearch = h.name.toLowerCase().includes(searchLower) ||
                              h.location.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }
        
        // Location filter
        if (params.location && !h.location.includes(params.location)) {
          return false
        }
        
        // Gender filter
        if (params.gender && !(h.gender === params.gender || h.gender === 'Co-ed')) {
          return false
        }
        
        // Type filter
        if (params.type && h.type !== params.type) {
          return false
        }
        
        // Availability filter
        if (params.availability && h.availability !== params.availability) {
          return false
        }
        
        // Price range filters
        if (params.minPrice && h.price < parseInt(params.minPrice)) {
          return false
        }
        
        if (params.maxPrice && h.price > parseInt(params.maxPrice)) {
          return false
        }
        
        return true
      })
      
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
      return await apiClient.hostels.getSuggestions(query)
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
      return await apiClient.hostels.getFilterOptions()
    } catch (error) {
      console.warn('Backend unavailable, using fallback filter options')
      return { data: fallbackFilterOptions }
    }
  },
  getById: async (id) => {
    try {
      return await apiClient.hostels.getById(id)
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
      return await apiClient.hostels.getBySlug(slug)
    } catch (error) {
      console.warn('Backend unavailable, using fallback data')
      const hostel = fallbackHostels.find(h => h.slug === slug)
      if (hostel) {
        return { data: hostel }
      }
      throw new Error('Hostel not found')
    }
  },
  create: (data) => apiClient.hostels.create(data),
  update: (id, data) => apiClient.hostels.update(id, data),
  updateFeatured: (id, featured) => apiClient.hostels.updateFeatured(id, featured),
  getFeatured: () => apiClient.hostels.getFeatured(),
  delete: (id) => apiClient.hostels.delete(id)
}

export const enquiryAPI = {
  create: async (data) => {
    try {
      return await apiClient.enquiries.create(data)
    } catch (error) {
      console.warn('Backend unavailable, enquiry stored locally')
      const enquiries = JSON.parse(localStorage.getItem('pendingEnquiries') || '[]')
      enquiries.push({ ...data, timestamp: new Date().toISOString() })
      localStorage.setItem('pendingEnquiries', JSON.stringify(enquiries))
      return { data: { message: 'Enquiry saved. Will be sent when connection is restored.' } }
    }
  },
  getAll: () => apiClient.enquiries.getAll(),
  updateStatus: (id, status) => apiClient.enquiries.updateStatus(id, status)
}

export const authAPI = {
  login: (credentials) => apiClient.auth.login(credentials),
  register: (data) => apiClient.auth.register(data)
}

export const leadAPI = {
  createEnquiry: async (data) => {
    try {
      return await apiClient.leads.createEnquiry(data)
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
      return await apiClient.leads.createContact(data)
    } catch (error) {
      console.warn('Backend unavailable, contact stored locally')
      const contacts = JSON.parse(localStorage.getItem('pendingContacts') || '[]')
      contacts.push({ ...data, type: 'contact', timestamp: new Date().toISOString() })
      localStorage.setItem('pendingContacts', JSON.stringify(contacts))
      return { data: { message: 'Message saved. Will be sent when connection is restored.' } }
    }
  },
  getAll: (params = {}) => apiClient.leads.getAll(params),
  updateStatus: (id, status) => apiClient.leads.updateStatus(id, status),
  addNote: (id, text) => apiClient.leads.addNote(id, text),
  delete: (id) => apiClient.leads.delete(id)
}

export const pageAPI = {
  getPageContent: (page) => apiClient.pages.getContent(page),
  updatePageContent: (page, data) => apiClient.pages.updateContent(page, data),
  getAllPageContent: () => apiClient.pages.getAllContent()
}

export default apiClient