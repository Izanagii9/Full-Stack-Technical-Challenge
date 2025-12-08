import express from 'express';
import { getAllArticles, getArticleById, generateArticle } from '../controllers/articleController.js';

const router = express.Router();

// GET /api/articles - Get all articles
router.get('/', getAllArticles);

// POST /api/articles/generate - Generate new article with AI
router.post('/generate', generateArticle);

// GET /api/articles/:id - Get single article by ID
router.get('/:id', getArticleById);

export default router;
