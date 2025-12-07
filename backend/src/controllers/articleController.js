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
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 40px 20px;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              color: white;
              margin-bottom: 40px;
            }
            .header h1 {
              font-size: 42px;
              margin-bottom: 8px;
            }
            .header p {
              font-size: 18px;
              opacity: 0.9;
            }
            .back-link {
              display: inline-block;
              color: white;
              text-decoration: none;
              margin-bottom: 20px;
              padding: 8px 16px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              transition: background 0.2s;
              outline: none;
            }
            .back-link:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .back-link:focus-visible {
              outline: 2px solid white;
              outline-offset: 2px;
              background: rgba(255, 255, 255, 0.3);
            }
            .articles-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
              gap: 24px;
            }
            .article-card {
              background: white;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s, box-shadow 0.2s;
              display: flex;
              flex-direction: column;
            }
            .article-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            .article-card:has(.read-more:focus-visible) {
              transform: translateY(-4px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            .article-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 12px;
            }
            .article-title {
              color: #1a202c;
              font-size: 20px;
              line-height: 1.4;
              flex: 1;
              margin-right: 12px;
            }
            .article-id {
              background: #667eea;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .article-excerpt {
              color: #4a5568;
              line-height: 1.6;
              margin-bottom: 16px;
              flex: 1;
            }
            .article-meta {
              display: flex;
              gap: 16px;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .meta-item {
              color: #718096;
              font-size: 14px;
            }
            .article-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 20px;
            }
            .tag {
              background: rgba(102, 126, 234, 0.15);
              color: #5a67d8;
              padding: 6px 14px;
              border-radius: 16px;
              font-size: 13px;
              font-weight: 500;
            }
            .read-more {
              color: #5a67d8;
              text-decoration: none;
              font-weight: 500;
              align-self: flex-start;
              margin-top: 4px;
              outline: none;
            }
            .read-more:focus-visible {
              outline: 2px solid #5a67d8;
              outline-offset: 4px;
            }
          </style>
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
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 40px 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .back-link {
              display: inline-block;
              color: white;
              text-decoration: none;
              margin-bottom: 20px;
              padding: 8px 16px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              transition: background 0.2s;
              outline: none;
            }
            .back-link:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .back-link:focus-visible {
              outline: 2px solid white;
              outline-offset: 2px;
              background: rgba(255, 255, 255, 0.3);
            }
            .article {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            .article-id {
              background: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 16px;
            }
            .article-title {
              color: #1a202c;
              font-size: 32px;
              line-height: 1.3;
              margin-bottom: 20px;
            }
            .article-meta {
              display: flex;
              gap: 20px;
              padding-bottom: 20px;
              margin-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
            }
            .meta-item {
              color: #718096;
              font-size: 14px;
            }
            .article-content {
              color: #2d3748;
              line-height: 1.8;
              font-size: 16px;
              white-space: pre-line;
              margin-bottom: 24px;
            }
            .article-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .tag {
              background: rgba(102, 126, 234, 0.15);
              color: #5a67d8;
              padding: 6px 16px;
              border-radius: 16px;
              font-size: 14px;
              font-weight: 500;
            }
          </style>
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
