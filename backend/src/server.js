import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articleRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Pretty print JSON in development
if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2);
}

// Health check endpoint with HTML response
app.get('/health', (req, res) => {
  const data = {
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  };

  // Return HTML if browser request, JSON if API request
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Check - Auto-Generated Blog API</title>
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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .status-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }
          h1 {
            color: #1a202c;
            font-size: 28px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #718096;
            font-size: 16px;
          }
          .info-grid {
            display: grid;
            gap: 16px;
            margin-top: 30px;
          }
          .info-item {
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .info-label {
            color: #718096;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-value {
            color: #1a202c;
            font-size: 16px;
            font-weight: 500;
            font-family: 'Monaco', 'Courier New', monospace;
          }
          .status-ok {
            color: #48bb78;
            font-weight: 700;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
          }
          .api-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .api-link {
            display: block;
            color: #667eea;
            text-decoration: none;
            padding: 8px;
            margin: 4px 0;
            border-radius: 4px;
            transition: background 0.2s;
          }
          .api-link:hover {
            background: #f7fafc;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-icon">✅</div>
            <h1>Server is Running</h1>
            <p class="subtitle">Auto-Generated Blog API</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value status-ok">${data.status.toUpperCase()}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Environment</div>
              <div class="info-value">${data.environment}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Port</div>
              <div class="info-value">${data.port}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Timestamp</div>
              <div class="info-value">${new Date(data.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div class="api-links">
            <div class="info-label" style="margin-bottom: 12px;">API Endpoints</div>
            <a href="/api/articles" class="api-link">📄 GET /api/articles</a>
            <a href="/api/articles/1" class="api-link">📰 GET /api/articles/1</a>
          </div>

          <div class="footer">
            <p>Backend API for Auto-Generated Blog</p>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json(data);
  }
});

// API Routes
app.use('/api/articles', articleRoutes);

// Error handling (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
});
