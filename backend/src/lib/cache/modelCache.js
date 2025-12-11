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
 * @returns {number} Bonus score (0.0 to 0.5)
 */
function calculateRecencyBonus(lastAttempt) {
  if (!lastAttempt) return 0.5; // Never tried = maximum bonus

  const daysSinceAttempt = (Date.now() - lastAttempt) / (24 * 60 * 60 * 1000);

  // Linear bonus: 0.02 per day, max 0.5 (25 days)
  return Math.min(0.5, daysSinceAttempt * 0.02);
}

/**
 * Calculate performance score based on success/failure ratio
 * This is the "quality" score used for ranking and deletion
 * @param {Object} model - Model object with success/failure counts
 * @returns {number} Performance score (0.0 to 1.0)
 */
function calculatePerformanceScore(model) {
  const now = Date.now();
  const thirtyDaysAgo = now - CACHE_DURATION;

  let performanceScore = model.score;

  // Apply score decay over time (models that haven't been used in 30 days get lower scores)
  if (model.lastSuccess && model.lastSuccess < thirtyDaysAgo) {
    performanceScore *= SCORE_DECAY;
  }

  return performanceScore;
}

/**
 * Weighted random selection based on priority scores
 * Higher priority = higher chance of being selected
 * @param {Array} modelsWithScores - Array of models with scores
 * @returns {string[]} Array of model IDs in weighted random order
 */
function weightedRandomSort(modelsWithScores) {
  const result = [];
  const remaining = [...modelsWithScores];

  while (remaining.length > 0) {
    // Calculate total priority of remaining models
    const totalPriority = remaining.reduce((sum, m) => sum + m.priorityScore, 0);

    // Pick random number between 0 and total priority
    let random = Math.random() * totalPriority;

    // Select model based on weighted probability
    let selectedIndex = 0;
    for (let i = 0; i < remaining.length; i++) {
      random -= remaining[i].priorityScore;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    // Add selected model to result and remove from remaining
    const selected = remaining.splice(selectedIndex, 1)[0];
    result.push(selected);
  }

  return result;
}

/**
 * Get models sorted by weighted random selection based on priority
 * Higher priority = higher chance of being first, but it's randomized
 * Performance score is separate and used only for deletion
 * @returns {string[]} Array of model IDs in weighted random order
 */
export function getSortedModels() {
  const cache = loadCache();
  const now = Date.now();

  // Calculate both performance and priority scores
  const modelsWithScores = cache.models.map(model => {
    // Performance score (for deletion/ranking) - pure success/failure ratio
    const performanceScore = calculatePerformanceScore(model);

    // Priority score (for selection) - performance + recency bonus
    const lastAttempt = Math.max(model.lastSuccess || 0, model.lastFailure || 0);
    const recencyBonus = calculateRecencyBonus(lastAttempt);
    const priorityScore = Math.max(0.01, performanceScore + recencyBonus); // Min 0.01 for weighted random

    return {
      id: model.id,
      performanceScore,    // Shown score, used for deletion
      recencyBonus,
      priorityScore,       // Used for weighted random selection
      lastAttempt
    };
  });

  // Sort by weighted random selection based on priority scores
  const sorted = weightedRandomSort(modelsWithScores);

  // Log selection probabilities for top 3
  const totalPriority = modelsWithScores.reduce((sum, m) => sum + m.priorityScore, 0);
  sorted.slice(0, 3).forEach((m, index) => {
    const probability = ((m.priorityScore / totalPriority) * 100).toFixed(1);
    const daysSince = m.lastAttempt
      ? Math.floor((now - m.lastAttempt) / (24 * 60 * 60 * 1000))
      : 'never';
    console.log(`   #${index + 1} ${m.id}: performance=${m.performanceScore.toFixed(2)}, priority=${m.priorityScore.toFixed(2)}, chance=${probability}% (last: ${daysSince} days)`);
  });

  return sorted.map(m => m.id);
}

/**
 * Clean up models with consistently poor PERFORMANCE (not priority)
 * Uses performance score only - recency doesn't save bad models from deletion
 */
export function cleanupPoorPerformers() {
  const cache = loadCache();
  const initialCount = cache.models.length;

  // Remove models with very low PERFORMANCE scores and multiple failures
  // Note: We use model.score (performance), not priority score
  cache.models = cache.models.filter(model => {
    const performanceScore = calculatePerformanceScore(model);

    // Keep if: performance > 0.1 OR has at least one success
    const shouldKeep = performanceScore > 0.1 || model.successCount > 0;

    if (!shouldKeep) {
      console.log(`🗑️  Removing low-performing model: ${model.id} (performance: ${performanceScore.toFixed(2)})`);
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
 * Shows both performance (quality) and priority (selection order) scores
 * @returns {Object} Statistics about cached models
 */
export function getCacheStats() {
  const cache = loadCache();
  const now = Date.now();

  // Calculate both performance and priority scores (same logic as getSortedModels)
  const modelsWithScores = cache.models.map(model => {
    const performanceScore = calculatePerformanceScore(model);
    const lastAttempt = Math.max(model.lastSuccess || 0, model.lastFailure || 0);
    const recencyBonus = calculateRecencyBonus(lastAttempt);
    const priorityScore = Math.min(1.5, performanceScore + recencyBonus);

    const daysSinceAttempt = lastAttempt
      ? Math.floor((now - lastAttempt) / (24 * 60 * 60 * 1000))
      : null;

    return {
      id: model.id,
      performanceScore: parseFloat(performanceScore.toFixed(2)),  // Quality/ranking score
      recencyBonus: parseFloat(recencyBonus.toFixed(2)),
      priorityScore: parseFloat(priorityScore.toFixed(2)),        // Selection order score
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
    topModelsByPriority: modelsWithScores
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5),
    topModelsByPerformance: modelsWithScores
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5)
  };
}
