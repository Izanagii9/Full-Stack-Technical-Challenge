import axios from 'axios';
import {
  loadCache,
  isCacheStale,
  updateCacheWithFreshModels,
  getSortedModels,
  cleanupPoorPerformers
} from '../lib/cache/modelCache.js';

const HUGGINGFACE_HUB_API = 'https://huggingface.co/api/models';

/**
 * Fallback models in priority order (if cache and fetch both fail)
 * Based on HuggingFace Hub download stats and Instruct-tuned capabilities
 * All models are FREE on HuggingFace Router API
 */
const FALLBACK_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-3B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'Qwen/Qwen2.5-1.5B-Instruct',
  'mistralai/Mistral-Nemo-12B-Instruct'
];

/**
 * Known FREE model patterns on HuggingFace Router API
 * These organizations provide models that are free to use via the Router API
 */
const FREE_MODEL_PATTERNS = [
  /^Qwen\//,           // Qwen/Alibaba models (free)
  /^meta-llama\//,     // Meta Llama models (free)
  /^mistralai\//,      // Mistral AI models (free)
  /^google\//,         // Google models (Gemma, etc) (free)
  /^microsoft\//,      // Microsoft Phi models (free)
  /^bigscience\//,     // BigScience models (free)
  /^tiiuae\//,         // Technology Innovation Institute (Falcon) (free)
];

/**
 * Check if a model is free to use on HuggingFace Router API
 * @param {string} modelId - Model ID to check
 * @returns {boolean} True if model is free
 */
function isFreeModel(modelId) {
  return FREE_MODEL_PATTERNS.some(pattern => pattern.test(modelId));
}

/**
 * Fetch popular chat/text-generation models from HuggingFace Hub API
 * Only returns FREE models to prevent unexpected costs
 * @returns {Promise<string[]>} Array of free model IDs
 */
async function fetchFreshModels() {
  try {
    const response = await axios.get(HUGGINGFACE_HUB_API, {
      params: {
        pipeline_tag: 'text-generation',
        sort: 'downloads',
        limit: 30,  // Fetch more to filter
        filter: 'conversational'
      },
      timeout: 5000
    });

    // Filter for Instruct-tuned models AND free models only
    const allModels = response.data
      .filter(model => model.id.includes('Instruct'))
      .map(model => model.id);

    const freeModels = allModels
      .filter(isFreeModel)
      .slice(0, 15);  // Limit to 15 after filtering

    const paidModelsFiltered = allModels.length - freeModels.length;

    console.log(`📥 Fetched ${freeModels.length} FREE models from Hub (filtered out ${paidModelsFiltered} paid models)`);
    return freeModels.length > 0 ? freeModels : FALLBACK_MODELS;

  } catch (error) {
    console.warn(`⚠️  Failed to fetch models from Hub: ${error.message}`);
    return [];
  }
}

/**
 * Get models to use for generation (with intelligent caching)
 * @returns {Promise<string[]>} Array of model IDs sorted by performance
 */
export async function getModelsToTry() {
  const cache = loadCache();

  // Check if we should refresh the cache
  if (isCacheStale(cache) || cache.models.length === 0) {
    console.log('🔄 Cache is stale or empty, fetching fresh models...');

    const freshModels = await fetchFreshModels();

    if (freshModels.length > 0) {
      updateCacheWithFreshModels(freshModels);
      // Clean up poor performers after update
      cleanupPoorPerformers();
    }
  }

  // Get models sorted by score (best performers first)
  let models = getSortedModels();

  // If cache is empty, use fallback
  if (models.length === 0) {
    console.warn('📋 No cached models, using fallback list');
    models = FALLBACK_MODELS;
  }

  console.log(`🎯 Using ${models.length} models (top: ${models[0]})`);
  return models;
}
