import axios from 'axios';
import dotenv from 'dotenv';
import { SYSTEM_PROMPT } from './promptBuilder.js';
import { parseArticleResponse } from './responseParser.js';

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

/**
 * HuggingFace API client
 */

/**
 * Call HuggingFace Router API with specified model
 * @param {string} model - Model identifier
 * @param {string} userPrompt - User message content
 * @returns {Promise<Object>} Parsed article data
 * @throws {Error} If API call fails or response is invalid
 *   - Throws error with 'AUTH_ERROR' type for authentication issues
 *   - Throws error with 'MODEL_ERROR' type for model-specific issues
 */
export async function callHuggingFaceRouter(model, userPrompt) {
  try {
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
  } catch (error) {
    // Check if it's an authentication error (401, 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const authError = new Error('Authentication failed: Invalid or missing API key');
      authError.type = 'AUTH_ERROR';
      authError.isUserFault = true;
      throw authError;
    }

    // Check for rate limiting (429)
    if (error.response && error.response.status === 429) {
      const rateError = new Error('Rate limit exceeded');
      rateError.type = 'RATE_LIMIT';
      rateError.isUserFault = true;
      throw rateError;
    }

    // All other errors are model-specific
    const modelError = new Error(error.message || 'Model failed to generate article');
    modelError.type = 'MODEL_ERROR';
    modelError.isUserFault = false;
    throw modelError;
  }
}
