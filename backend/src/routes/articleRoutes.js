import express from 'express';
import { getAllArticles, getArticleById } from '../controllers/articleController.js';

const router = express.Router();

// GET /api/articles - Get all articles
router.get('/', getAllArticles);

// GET /api/articles/:id - Get single article by ID
router.get('/:id', getArticleById);

export default router;
