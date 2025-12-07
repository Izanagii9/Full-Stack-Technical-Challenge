import { mockArticles } from '../data/mockArticles'

// This service will handle all article-related data fetching
// Currently uses mock data, will be replaced with API calls later

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const articleService = {
  // Get all articles
  getAll: async () => {
    // Simulate API delay
    await delay(500)
    return mockArticles
  },

  // Get article by ID
  getById: async (id) => {
    // Simulate API delay
    await delay(300)
    const article = mockArticles.find(article => article.id === id)
    if (!article) {
      throw new Error('Article not found')
    }
    return article
  },
}

// When backend is ready, replace with:
/*
import axios from 'axios'

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api'

export const articleService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/articles`)
    return response.data
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/articles/${id}`)
    return response.data
  },
}
*/
