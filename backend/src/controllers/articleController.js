import { articleService } from '../services/articleService.js';
import { renderTemplate } from '../utils/templateRenderer.js';

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles();

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const info = {
        endpoint: 'GET /api/articles',
        description: 'Retrieve all articles',
        method: 'GET',
        parameters: 'None',
        response: articles
      };

      const html = renderTemplate('articles', {
        articlesCount: articles.length,
        infoJson: JSON.stringify(info, null, 2)
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
      const info = {
        endpoint: `GET /api/articles/${id}`,
        description: 'Retrieve a single article by ID',
        method: 'GET',
        parameters: {
          id: 'number (required) - Article ID in URL path'
        },
        response: article
      };

      const html = renderTemplate('article-detail', {
        id: article.id,
        infoJson: JSON.stringify(info, null, 2)
      });
      res.send(html);
    } else {
      res.json(article);
    }
  } catch (error) {
    next(error);
  }
};

// Get generate endpoint documentation
export const getGenerateInfo = async (req, res, next) => {
  try {
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    const info = {
      endpoint: 'POST /api/articles/generate',
      description: 'Generate a new article using AI. Topic is optional - AI will choose an interesting technology topic if not provided.',
      method: 'POST',
      body: {
        topic: 'string (optional) - Article topic. If omitted, AI chooses a random technology topic.'
      },
      example: {
        request: {
          method: 'POST',
          url: '/api/articles/generate',
          body: {
            topic: 'The Future of Web Development'
          }
        },
        response: {
          success: true,
          message: 'Article generated successfully',
          article: {
            id: 4,
            title: 'The Future of Web Development',
            excerpt: '...',
            content: '...',
            author: 'AI Assistant',
            createdAt: '2025-01-01T00:00:00.000Z',
            tags: ['technology', 'web development']
          }
        }
      }
    };

    if (acceptsHtml) {
      const html = renderTemplate('generate-info', {
        infoJson: JSON.stringify(info, null, 2)
      });
      res.send(html);
    } else {
      res.json(info);
    }
  } catch (error) {
    next(error);
  }
};

// Generate new article with AI
export const generateArticle = async (req, res, next) => {
  try {
    // Get topic from request body (optional - AI chooses if not provided)
    const topic = req.body?.topic || null;

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
