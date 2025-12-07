import { articleService } from '../services/articleService.js';
import { renderTemplate } from '../utils/templateRenderer.js';

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
