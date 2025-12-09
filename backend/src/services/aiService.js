import { buildUserPrompt } from '../ai/promptBuilder.js';
import { getModelsToTry } from '../ai/modelDiscovery.js';
import { callHuggingFaceRouter } from '../ai/huggingfaceClient.js';
import { recordSuccess, recordFailure } from '../lib/cache/modelCache.js';

/**
 * AI Article Generation Service
 *
 * Main orchestration layer for AI-powered article generation.
 * Coordinates model discovery, API calls, and adaptive learning.
 */

/**
 * Generate blog article using HuggingFace Router API
 *
 * Intelligent model selection with adaptive learning:
 * 1. Uses cached models sorted by performance score
 * 2. Refreshes cache from Hub API when stale (24h)
 * 3. Records successes and failures for each model
 * 4. Automatically removes consistently failing models
 * 5. Falls back to hardcoded list if all else fails
 *
 * @param {string|null} topic - Optional topic for the article. If null, AI chooses.
 * @returns {Promise<Object>} Article object with title, content, excerpt, and tags
 * @throws {Error} If all models fail
 */
export const generateArticle = async (topic = null) => {
  console.log('🤖 Starting AI article generation...');
  console.log(`📝 Topic: ${topic || '(AI will choose)'}`);

  const userPrompt = buildUserPrompt(topic);

  // Get models with intelligent caching and scoring
  const models = await getModelsToTry();

  // Try each model in order until one succeeds
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const isLastModel = i === models.length - 1;

    try {
      console.log(`🔄 Attempting model: ${model} (${i + 1}/${models.length})`);

      const article = await callHuggingFaceRouter(model, userPrompt);

      // Record success for adaptive learning
      recordSuccess(model);

      console.log(`✅ Article generated successfully using: ${model}`);
      console.log(`📄 Title: ${article.title}`);

      return article;

    } catch (error) {
      console.error(`❌ Model failed: ${model}`);
      console.error(`   Error: ${error.message}`);

      // Record failure for adaptive learning
      recordFailure(model);

      // If this was the last model, throw error
      if (isLastModel) {
        throw new Error(
          'All AI models failed to generate article. Please try again later.'
        );
      }

      console.log('⏭️  Trying next model...\n');
    }
  }
};
