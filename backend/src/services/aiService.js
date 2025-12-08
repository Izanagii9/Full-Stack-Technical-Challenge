import axios from 'axios';
import dotenv from 'dotenv';
import {
  loadCache,
  isCacheStale,
  updateCacheWithFreshModels,
  recordSuccess,
  recordFailure,
  getSortedModels,
  cleanupPoorPerformers
} from '../cache/modelCache.js';

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
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
 * System prompt for AI article generation
 * Instructs the model to return structured JSON with article data
 */
const SYSTEM_PROMPT = `You are an expert technology writer.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Article title",
  "content": "Full article content with paragraphs separated by \\n\\n",
  "excerpt": "Brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}

Requirements:
- Content must be at least 4 well-written paragraphs
- Separate paragraphs with double newlines (\\n\\n)
- Excerpt should summarize the main points in 2-3 sentences
- Include 3-5 relevant tags
- Use professional, engaging writing style
- No markdown formatting, code blocks, or extra explanations
- Return ONLY the JSON object`;

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
async function getModelsToTry() {
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

/**
 * Build user prompt based on whether topic is provided
 * @param {string|null} topic - Optional article topic
 * @returns {string} Formatted user prompt
 */
function buildUserPrompt(topic) {
  if (topic) {
    return `Write a comprehensive blog article about: ${topic}`;
  }

  return `Choose an interesting and current technology topic, then write a comprehensive blog article about it. The title should reflect your chosen topic.`;
}

/**
 * Call HuggingFace Router API with specified model
 * @param {string} model - Model identifier
 * @param {string} userPrompt - User message content
 * @returns {Promise<Object>} Parsed article data
 * @throws {Error} If API call fails or response is invalid
 */
async function callHuggingFaceRouter(model, userPrompt) {
  const response = await axios.post(
    HUGGINGFACE_ROUTER_URL,
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.8
    },
    {
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    }
  );

  const aiText = response.data.choices[0].message.content;

  // Parse and validate the JSON response
  const article = parseArticleResponse(aiText);

  return article;
}

/**
 * Parse and validate AI response
 * @param {string} aiText - Raw AI response text
 * @returns {Object} Validated article object
 * @throws {Error} If JSON is invalid or missing required fields
 */
function parseArticleResponse(aiText) {
  // Try to parse JSON response
  const article = JSON.parse(aiText);

  // Validate required fields
  if (!article.title || !article.content || !article.excerpt || !article.tags) {
    throw new Error('AI response missing required fields');
  }

  // Ensure content has proper paragraph formatting
  article.content = formatParagraphs(article.content);

  // Ensure tags is an array
  if (!Array.isArray(article.tags)) {
    article.tags = [article.tags];
  }

  return article;
}

/**
 * Format article content with proper paragraph breaks
 * @param {string} content - Article content
 * @returns {string} Formatted content with paragraph breaks
 */
function formatParagraphs(content) {
  // If already has paragraph breaks, return as-is
  if (content.includes('\n\n')) {
    return content.trim();
  }

  // Split by periods and group into paragraphs
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const paragraphs = [];

  // Group sentences into paragraphs (approximately 3-4 sentences each)
  for (let i = 0; i < sentences.length; i += 3) {
    const paragraph = sentences
      .slice(i, i + 3)
      .join(' ')
      .trim();

    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }

  return paragraphs.join('\n\n');
}
