import express from 'express';
import { getAllArticles, getArticleById, generateArticle, getGenerateInfo } from '../controllers/articleController.js';

const router = express.Router();

// GET /api/articles - Get all articles
router.get('/', getAllArticles);

// GET /api/articles/generate - Show documentation for generate endpoint
router.get('/generate', getGenerateInfo);

// POST /api/articles/generate - Generate new article with AI
router.post('/generate', generateArticle);

// GET /api/articles/:id - Get single article by ID
router.get('/:id', getArticleById);

export default router;
