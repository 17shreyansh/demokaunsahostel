import axios from 'axios'

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`

export const nearbyPlacesAPI = {
  getAll: (category) => {
    const url = category ? `${API_BASE_URL}/nearbyplaces?category=${category}` : `${API_BASE_URL}/nearbyplaces`
    return axios.get(url)
  },
  
  getWithDistances: (lat, lng, category) => {
    const url = `${API_BASE_URL}/nearbyplaces/distances?lat=${lat}&lng=${lng}${category ? `&category=${category}` : ''}`
    return axios.get(url)
  }
}