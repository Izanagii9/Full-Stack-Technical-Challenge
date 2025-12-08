/**
 * Text formatting utilities
 */

/**
 * Format article content with proper paragraph breaks
 * @param {string} content - Article content
 * @returns {string} Formatted content with paragraph breaks
 */
export function formatParagraphs(content) {
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
