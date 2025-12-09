import { getCacheStats as getCacheStatsFromCache } from '../lib/cache/modelCache.js';
import { renderTemplate } from '../lib/templateRenderer.js';

/**
 * Get model cache statistics
 * Displays performance metrics for all cached AI models
 */
export const getCacheStats = async (req, res, next) => {
  try {
    const stats = getCacheStatsFromCache();

    // Return HTML if browser request, JSON if API request
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml) {
      const html = renderTemplate('cache-stats', {
        totalModels: stats.totalModels,
        lastFetch: new Date(stats.lastFetch).toLocaleString(),
        cacheAge: Math.floor(stats.cacheAge / (1000 * 60 * 60 * 24)), // days
        staleText: stats.isStale ? 'Stale' : 'Fresh',
        staleClass: stats.isStale ? 'badge-warning' : 'badge-success',
        topModelsJson: JSON.stringify(stats.topModels, null, 2),
        topModelsJsArray: JSON.stringify(stats.topModels)
      });
      res.send(html);
    } else {
      res.json(stats);
    }
  } catch (error) {
    next(error);
  }
};
