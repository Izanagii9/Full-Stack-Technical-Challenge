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
 */
const FALLBACK_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-3B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'Qwen/Qwen2.5-1.5B-Instruct',
  'mistralai/Mistral-Nemo-12B-Instruct'
];

/**
 * Fetch popular chat/text-generation models from HuggingFace Hub API
 * @returns {Promise<string[]>} Array of model IDs
 */
async function fetchFreshModels() {
  try {
    const response = await axios.get(HUGGINGFACE_HUB_API, {
      params: {
        pipeline_tag: 'text-generation',
        sort: 'downloads',
        limit: 15,
        filter: 'conversational'
      },
      timeout: 5000
    });

    // Extract model IDs and filter for Instruct-tuned models
    const models = response.data
      .filter(model => model.id.includes('Instruct'))
      .map(model => model.id);

    console.log(`📥 Fetched ${models.length} available models from Hub`);
    return models.length > 0 ? models : FALLBACK_MODELS;

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
