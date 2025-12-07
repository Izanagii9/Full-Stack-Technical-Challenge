import { articleService } from '../services/articleService.js';

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

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Articles - Auto-Generated Blog API</title>
          <link rel="stylesheet" href="/css/articles.css">
        </head>
        <body>
          <div class="container">
            <a href="/health" class="back-link">← Back to Health Check</a>
            <div class="header">
              <h1>📚 All Articles</h1>
              <p>Auto-Generated Blog API - ${articles.length} articles available</p>
            </div>
            <div class="articles-grid">
              ${articlesHtml}
            </div>
          </div>
        </body>
        </html>
      `);
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
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${article.title} - Auto-Generated Blog API</title>
          <link rel="stylesheet" href="/css/article-detail.css">
        </head>
        <body>
          <div class="container">
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
              <a href="/health" class="back-link">← Health Check</a>
              <a href="/api/articles" class="back-link">← All Articles</a>
            </div>
            <div class="article">
              <span class="article-id">#${article.id}</span>
              <h1 class="article-title">${article.title}</h1>
              <div class="article-meta">
                <span class="meta-item">👤 ${article.author}</span>
                <span class="meta-item">📅 ${new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="article-content">${article.content}</div>
              <div class="article-tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      res.json(article);
    }
  } catch (error) {
    next(error);
  }
};
