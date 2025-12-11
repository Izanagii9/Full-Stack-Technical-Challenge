/**
 * AI prompt construction utilities
 */

/**
 * System prompt for AI article generation
 * Instructs the model to return structured JSON with article data
 */
export const SYSTEM_PROMPT = `You are an expert technology writer.

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
 * Build user prompt based on whether topic is provided
 * @param {string|null} topic - Optional article topic
 * @returns {string} Formatted user prompt
 */
export function buildUserPrompt(topic) {
  if (topic) {
    return `Write a comprehensive blog article about: ${topic}`;
  }

  // Let AI choose truly random topics with safety guidelines
  console.log(`🎲 AI choosing completely random topic`);

  return `Choose any interesting topic you want to write about, then write a comprehensive blog article about it.

IMPORTANT: Pick a DIFFERENT topic each time. Avoid repeating topics from previous articles.

Guidelines:
- Can be about ANYTHING: technology, science, hobbies, lifestyle, culture, entertainment, sports, nature, travel, food, art, music, gaming, pets, education, health, fashion, history, philosophy, etc.
- Should be appropriate for general audience (no adult content, violence, or dark themes)
- Can be fun, quirky, or unexpected topics (dolls, collecting, origami, coffee brewing, bird watching, stargazing, puzzles, etc.)
- Pick something genuinely interesting and engaging
- BE CREATIVE - don't default to popular tech topics
- Make the title creative and specific to your chosen topic`;
}
