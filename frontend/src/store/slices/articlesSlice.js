import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { articleService } from '../../services/articleService'
import { Article } from '../../models/Article'

const initialState = {
  articles: [],
  selectedArticle: null,
  loading: false,
  error: null,
}

// Async thunks for API calls
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (_, { rejectWithValue }) => {
    try {
      const data = await articleService.getAll()
      // Convert API response to Article entities
      return data.map(article => Article.fromAPI(article))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await articleService.getById(id)
      // Convert API response to Article entity
      return Article.fromAPI(data)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearSelectedArticle: (state) => {
      state.selectedArticle = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false
        state.articles = action.payload
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch article by ID
      .addCase(fetchArticleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedArticle = action.payload
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearSelectedArticle, clearError } = articlesSlice.actions

export default articlesSlice.reducer

// Selectors
export const selectAllArticles = (state) => state.articles.articles
export const selectSelectedArticle = (state) => state.articles.selectedArticle
export const selectArticlesLoading = (state) => state.articles.loading
export const selectArticlesError = (state) => state.articles.error
