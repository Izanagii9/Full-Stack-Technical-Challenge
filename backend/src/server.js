import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articleRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { renderTemplate } from './lib/templateRenderer.js';
import { startArticleGeneration } from './jobs/articleJob.js';
import { getCacheStats as getCacheStatsController } from './controllers/cacheController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
// In production with nginx reverse proxy, requests come from same origin
// In development, allow localhost origins
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [FRONTEND_URL, 'http://44.196.118.30']
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
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
    const html = renderTemplate('health', {
      status: data.status.toUpperCase(),
      environment: data.environment,
      port: data.port,
      timestamp: new Date(data.timestamp).toLocaleString()
    });
    res.send(html);
  } else {
    res.json(data);
  }
});

// API Routes
app.use('/api/articles', articleRoutes);

// Cache stats endpoint
app.get('/cache-stats', getCacheStatsController);

// Error handling (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`📱 Access from network: http://<your-ip>:${PORT}`);

  // Start automated article generation (daily at midnight)
  startArticleGeneration();
});
