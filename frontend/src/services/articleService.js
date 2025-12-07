import axios from 'axios'

// API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Article service with real API calls
export const articleService = {
  // Get all articles
  getAll: async () => {
    const response = await axios.get(`${API_URL}/articles`)
    return response.data
  },

  // Get article by ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/articles/${id}`)
    return response.data
  },
}
