import { articleService } from '../services/articleService.js';
import { renderTemplate } from '../utils/templateRenderer.js';

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles();

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const articlesHtml = articles.map(article => `
        <div class="article-card">
          <div class="article-header">
            <h2 class="article-title">${article.title}</h2>
            <span class="article-id">#${article.id}</span>
          </div>
          <p class="article-excerpt">${article.excerpt}</p>
          <div class="article-meta">
            <span class="meta-item">👤 ${article.author}</span>
            <span class="meta-item">📅 ${new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="article-tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <a href="/api/articles/${article.id}" class="read-more">Read More →</a>
        </div>
      `).join('');

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
