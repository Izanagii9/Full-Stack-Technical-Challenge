import { renderTemplate } from '../utils/templateRenderer.js';

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const errorData = {
    error: {
      message,
      status
    }
  };

  // Return HTML if browser request, JSON if API request
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    const html = renderTemplate('error', {
      status,
      message,
      errorJson: JSON.stringify(errorData, null, 2)
    });
    res.status(status).send(html);
  } else {
    res.status(status).json(errorData);
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  const errorData = {
    error: {
      message: 'Route not found',
      status: 404
    }
  };

  // Return HTML if browser request, JSON if API request
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    const html = renderTemplate('error', {
      status: 404,
      message: 'Route not found',
      errorJson: JSON.stringify(errorData, null, 2)
    });
    res.status(404).send(html);
  } else {
    res.status(404).json(errorData);
  }
};
