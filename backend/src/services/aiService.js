import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

/**
 * Default model for article generation
 * Router API handles load balancing and failover for the specified model
 */
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

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
 * Generate blog article using HuggingFace Router API
 *
 * The Router API provides load balancing and automatic failover for the
 * specified model, ensuring high availability.
 *
 * @param {string|null} topic - Optional topic for the article. If null, AI chooses.
 * @returns {Promise<Object>} Article object with title, content, excerpt, and tags
 * @throws {Error} If API call fails
 */
export const generateArticle = async (topic = null) => {
  console.log('🤖 Starting AI article generation...');
  console.log(`📝 Topic: ${topic || '(AI will choose)'}`);

  const userPrompt = buildUserPrompt(topic);

  try {
    const article = await callHuggingFaceRouter(userPrompt);

    console.log(`✅ Article generated successfully`);
    console.log(`📄 Title: ${article.title}`);

    return article;

  } catch (error) {
    console.error(`❌ Failed to generate article: ${error.message}`);
    throw new Error('AI service unavailable. Please try again later.');
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
 * Call HuggingFace Router API
 * Router provides load balancing and failover for the model
 *
 * @param {string} userPrompt - User message content
 * @returns {Promise<Object>} Parsed article data
 * @throws {Error} If API call fails or response is invalid
 */
async function callHuggingFaceRouter(userPrompt) {
  const response = await axios.post(
    HUGGINGFACE_ROUTER_URL,
    {
      model: DEFAULT_MODEL,
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
