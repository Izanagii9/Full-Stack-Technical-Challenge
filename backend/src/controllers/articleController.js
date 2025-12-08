import { articleService } from '../services/articleService.js';
import { renderTemplate } from '../utils/templateRenderer.js';
import { getRandomTopic } from '../services/aiService.js';

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles();

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const html = renderTemplate('articles', {
        articlesCount: articles.length,
        articlesHtml: JSON.stringify(articles, null, 2)
      });
      res.send(html);
    } else {
      res.json(articles);
    }
  } catch (error) {
    next(error);
  }
};

// Get single article by ID
export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const html = renderTemplate('article-detail', {
        id: article.id,
        articleJson: JSON.stringify(article, null, 2)
      });
      res.send(html);
    } else {
      res.json(article);
    }
  } catch (error) {
    next(error);
  }
};

// Generate new article with AI
export const generateArticle = async (req, res, next) => {
  try {
    // Get topic from request body or use random topic
    const topic = req.body?.topic || getRandomTopic();

    console.log(`Generating article about: ${topic}`);

    // Create article using AI
    const newArticle = await articleService.createArticle(topic);

    console.log(`Article generated successfully: ${newArticle.title}`);

    // Return the newly created article
    res.status(201).json({
      success: true,
      message: 'Article generated successfully',
      article: newArticle
    });
  } catch (error) {
    console.error('Error generating article:', error.message);
    next(error);
  }
};
