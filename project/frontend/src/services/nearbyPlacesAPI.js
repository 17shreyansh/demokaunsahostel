import apiClient from './apiClient'

export const nearbyPlacesAPI = {
  getAll: async (category) => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      const queryString = params.toString()
      return await apiClient.get(`/nearbyplaces${queryString ? `?${queryString}` : ''}`)
    } catch (error) {
      console.error('Error fetching nearby places:', error)
      throw error
    }
  },
  
  getWithDistances: async (lat, lng, category) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString()
      })
      if (category) params.append('category', category)
      return await apiClient.get(`/nearbyplaces/distances?${params.toString()}`)
    } catch (error) {
      console.error('Error fetching nearby places with distances:', error)
      throw error
    }
  }
}