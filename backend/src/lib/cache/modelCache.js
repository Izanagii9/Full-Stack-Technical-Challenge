import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, 'models.json');
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_FAILURES = 3; // Remove model after 3 consecutive failures
const SCORE_DECAY = 0.95; // Decay factor for success score (slightly reduced)

/**
 * Model cache structure:
 * {
 *   models: [
 *     {
 *       id: 'Qwen/Qwen2.5-7B-Instruct',
 *       successCount: 10,
 *       failureCount: 2,
 *       lastSuccess: timestamp,
 *       lastFailure: timestamp,
 *       score: 0.85,
 *       consecutiveFailures: 0
 *     }
 *   ],
 *   lastFetch: timestamp
 * }
 */

/**
 * Load model cache from disk
 * @returns {Object} Cache object with models and metadata
 */
export function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load model cache: ${error.message}`);
  }

  return {
    models: [],
    lastFetch: 0
  };
}

/**
 * Save model cache to disk
 * @param {Object} cache - Cache object to save
 */
export function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.error(`❌ Failed to save model cache: ${error.message}`);
  }
}

/**
 * Check if cache is stale and needs refresh
 * @param {Object} cache - Cache object
 * @returns {boolean} True if cache should be refreshed
 */
export function isCacheStale(cache) {
  const age = Date.now() - cache.lastFetch;
  return age > CACHE_DURATION;
}

/**
 * Update cache with fresh models from Hub API
 * @param {string[]} modelIds - Array of model IDs from Hub API
 * @returns {Object} Updated cache
 */
export function updateCacheWithFreshModels(modelIds) {
  const cache = loadCache();
  const now = Date.now();

  // Create a map of existing models for quick lookup
  const existingModels = new Map(
    cache.models.map(m => [m.id, m])
  );

  // Update or create model entries
  const updatedModels = modelIds.map(id => {
    const existing = existingModels.get(id);

    if (existing) {
      // Keep existing stats, just update last fetch
      return existing;
    } else {
      // New model discovered
      return {
        id,
        successCount: 0,
        failureCount: 0,
        lastSuccess: null,
        lastFailure: null,
        score: 0.5, // Neutral starting score
        consecutiveFailures: 0
      };
    }
  });

  cache.models = updatedModels;
  cache.lastFetch = now;

  saveCache(cache);
  console.log(`💾 Updated model cache with ${updatedModels.length} models`);

  return cache;
}

/**
 * Record successful model generation
 * @param {string} modelId - Model that succeeded
 */
export function recordSuccess(modelId) {
  const cache = loadCache();
  const model = cache.models.find(m => m.id === modelId);

  if (model) {
    model.successCount++;
    model.lastSuccess = Date.now();
    model.consecutiveFailures = 0;

    // Increase score (max 1.0)
    model.score = Math.min(1.0, model.score + 0.1);

    saveCache(cache);
    console.log(`✅ Recorded success for ${modelId} (score: ${model.score.toFixed(2)})`);
  }
}

/**
 * Record failed model generation
 * @param {string} modelId - Model that failed
 */
export function recordFailure(modelId) {
  const cache = loadCache();
  const model = cache.models.find(m => m.id === modelId);

  if (model) {
    model.failureCount++;
    model.lastFailure = Date.now();
    model.consecutiveFailures++;

    // Decrease score (min 0.0)
    model.score = Math.max(0.0, model.score - 0.2);

    // Remove model if it has too many consecutive failures
    if (model.consecutiveFailures >= MAX_FAILURES) {
      console.warn(`🗑️  Removing ${modelId} (${MAX_FAILURES} consecutive failures)`);
      cache.models = cache.models.filter(m => m.id !== modelId);
    }

    saveCache(cache);
    console.log(`❌ Recorded failure for ${modelId} (score: ${model.score.toFixed(2)}, consecutive: ${model.consecutiveFailures})`);
  }
}

/**
 * Calculate recency bonus - models not tried recently get higher priority
 * @param {number} lastAttempt - Timestamp of last attempt (success or failure)
 * @returns {number} Bonus score (0.0 to 0.3)
 */
function calculateRecencyBonus(lastAttempt) {
  if (!lastAttempt) return 0.3; // Never tried = maximum bonus

  const daysSinceAttempt = (Date.now() - lastAttempt) / (24 * 60 * 60 * 1000);

  // Linear bonus: 0.01 per day, max 0.3 (30 days)
  return Math.min(0.3, daysSinceAttempt * 0.01);
}

/**
 * Get sorted models by score (best first) with recency-based exploration
 * Models not tried recently get a bonus to encourage exploration
 * @returns {string[]} Array of model IDs sorted by performance + recency
 */
export function getSortedModels() {
  const cache = loadCache();
  const now = Date.now();
  const thirtyDaysAgo = now - CACHE_DURATION;

  // Calculate final scores with recency bonus
  const modelsWithScores = cache.models.map(model => {
    let finalScore = model.score;

    // Apply score decay over time (models that haven't been used in 30 days get lower scores)
    if (model.lastSuccess && model.lastSuccess < thirtyDaysAgo) {
      finalScore *= SCORE_DECAY;
    }

    // Add recency bonus to encourage trying models not attempted recently
    const lastAttempt = Math.max(model.lastSuccess || 0, model.lastFailure || 0);
    const recencyBonus = calculateRecencyBonus(lastAttempt);
    finalScore += recencyBonus;

    // Cap at 1.0
    finalScore = Math.min(1.0, finalScore);

    return {
      id: model.id,
      baseScore: model.score,
      recencyBonus,
      finalScore,
      lastAttempt
    };
  });

  // Sort by final score (highest first)
  const sorted = modelsWithScores
    .sort((a, b) => b.finalScore - a.finalScore)
    .map(m => {
      // Log scoring details for top 3
      const rank = modelsWithScores.indexOf(m) + 1;
      if (rank <= 3) {
        const daysSince = m.lastAttempt
          ? Math.floor((now - m.lastAttempt) / (24 * 60 * 60 * 1000))
          : 'never';
        console.log(`   #${rank} ${m.id}: base=${m.baseScore.toFixed(2)}, recency=+${m.recencyBonus.toFixed(2)}, final=${m.finalScore.toFixed(2)} (last: ${daysSince} days)`);
      }
      return m.id;
    });

  return sorted;
}

/**
 * Clean up models with consistently poor performance
 */
export function cleanupPoorPerformers() {
  const cache = loadCache();
  const initialCount = cache.models.length;

  // Remove models with very low scores and multiple failures
  cache.models = cache.models.filter(model => {
    const shouldKeep = model.score > 0.1 || model.successCount > 0;
    if (!shouldKeep) {
      console.log(`🗑️  Removing low-performing model: ${model.id}`);
    }
    return shouldKeep;
  });

  const removedCount = initialCount - cache.models.length;
  if (removedCount > 0) {
    saveCache(cache);
    console.log(`🧹 Cleaned up ${removedCount} poor-performing models`);
  }
}

/**
 * Get cache statistics for monitoring
 * @returns {Object} Statistics about cached models
 */
export function getCacheStats() {
  const cache = loadCache();
  const now = Date.now();

  // Calculate final scores for all models (same logic as getSortedModels)
  const modelsWithScores = cache.models.map(model => {
    const lastAttempt = Math.max(model.lastSuccess || 0, model.lastFailure || 0);
    const recencyBonus = calculateRecencyBonus(lastAttempt);
    const finalScore = Math.min(1.0, model.score + recencyBonus);

    const daysSinceAttempt = lastAttempt
      ? Math.floor((now - lastAttempt) / (24 * 60 * 60 * 1000))
      : null;

    return {
      id: model.id,
      baseScore: parseFloat(model.score.toFixed(2)),
      recencyBonus: parseFloat(recencyBonus.toFixed(2)),
      finalScore: parseFloat(finalScore.toFixed(2)),
      successCount: model.successCount,
      failureCount: model.failureCount,
      daysSinceLastAttempt: daysSinceAttempt
    };
  });

  return {
    totalModels: cache.models.length,
    lastFetch: new Date(cache.lastFetch).toISOString(),
    cacheAge: Date.now() - cache.lastFetch,
    isStale: isCacheStale(cache),
    topModels: modelsWithScores
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5)
  };
}
