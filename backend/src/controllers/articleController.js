import { articleService } from '../services/articleService.js';
import { renderTemplate, renderPartial } from '../utils/templateRenderer.js';

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles();

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const articlesHtml = articles.map(article =>
        renderPartial('article-card', {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          author: article.author,
          date: new Date(article.createdAt).toLocaleDateString(),
          tags: article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        })
      ).join('');

      const html = renderTemplate('articles', {
        articlesCount: articles.length,
        articlesHtml
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
      const tagsHtml = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

      const html = renderTemplate('article-detail', {
        id: article.id,
        title: article.title,
        author: article.author,
        date: new Date(article.createdAt).toLocaleDateString(),
        content: article.content,
        tagsHtml
      });
      res.send(html);
    } else {
      res.json(article);
    }
  } catch (error) {
    next(error);
  }
};
