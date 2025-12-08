import { generateArticle } from './aiService.js';
import pool from '../config/database.js';
import { Article } from '../models/Article.js';

// Service methods using PostgreSQL
export const articleService = {
  // Get all articles
  getAllArticles: async () => {
    const result = await pool.query(
      'SELECT * FROM articles ORDER BY created_at DESC'
    );

    // Convert database rows to Article entities
    return result.rows.map(row => Article.fromDatabase(row).toJSON());
  },

  // Get article by ID
  getArticleById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Article not found');
    }

    // Convert database row to Article entity
    return Article.fromDatabase(result.rows[0]).toJSON();
  },

  // Create new AI-generated article
  createArticle: async (topic) => {
    // Generate article using AI
    const aiContent = await generateArticle(topic);

    // Create Article entity and validate
    const article = new Article({
      title: aiContent.title,
      excerpt: aiContent.excerpt,
      content: aiContent.content,
      author: 'AI Assistant',
      tags: aiContent.tags
    });

    const validation = article.validate();
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Insert article into database
    const result = await pool.query(
      `INSERT INTO articles (title, excerpt, content, author, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        article.title,
        article.excerpt,
        article.content,
        article.author,
        article.tags
      ]
    );

    // Convert database row to Article entity
    return Article.fromDatabase(result.rows[0]).toJSON();
  }
};
