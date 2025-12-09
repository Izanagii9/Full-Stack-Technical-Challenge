import { formatParagraphs } from '../lib/textFormatter.js';

/**
 * AI response parsing and validation
 */

/**
 * Parse and validate AI response
 * @param {string} aiText - Raw AI response text
 * @returns {Object} Validated article object
 * @throws {Error} If JSON is invalid or missing required fields
 */
export function parseArticleResponse(aiText) {
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
