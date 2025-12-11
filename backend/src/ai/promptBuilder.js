/**
 * AI prompt construction utilities
 */

/**
 * Diverse topic categories to ensure variety in article generation
 * Each category has different subtopics to prevent repetition
 */
const TOPIC_CATEGORIES = [
  // Software Development
  'web development frameworks and best practices',
  'mobile app development trends',
  'software architecture patterns',
  'API design and RESTful services',
  'microservices vs monolithic architecture',

  // Programming Languages & Tools
  'modern JavaScript features and ecosystem',
  'Python for data science and automation',
  'Rust for systems programming',
  'DevOps tools and CI/CD pipelines',
  'version control and Git workflows',

  // Emerging Tech
  'edge computing and IoT applications',
  'augmented reality in everyday life',
  'virtual reality gaming and entertainment',
  '5G networks and telecommunications',
  'renewable energy and smart grids',

  // Data & AI
  'machine learning model deployment',
  'natural language processing applications',
  'computer vision use cases',
  'big data analytics platforms',
  'data privacy and GDPR compliance',

  // Cloud & Infrastructure
  'serverless architecture benefits',
  'Kubernetes and container orchestration',
  'cloud migration strategies',
  'infrastructure as code',
  'multi-cloud deployment',

  // Security & Privacy
  'zero trust security architecture',
  'password managers and authentication',
  'VPN technology and online privacy',
  'secure coding practices',
  'penetration testing methodologies',

  // Business & Productivity
  'remote work collaboration tools',
  'project management software',
  'automation in business workflows',
  'digital transformation strategies',
  'SaaS vs self-hosted solutions',

  // Hardware & Gadgets
  'smartphone camera technology',
  'laptop performance and battery life',
  'gaming hardware trends',
  'wearable fitness trackers',
  'smart home devices and ecosystems',

  // Internet & Networking
  'Content Delivery Networks (CDNs)',
  'DNS and domain name management',
  'network protocols and HTTP/3',
  'mesh networking technology',
  'internet censorship and freedom',

  // User Experience
  'responsive web design principles',
  'mobile-first design approach',
  'accessibility in web applications',
  'dark mode implementation',
  'user interface animation best practices'
];

/**
 * Select a random topic category for article generation
 * @returns {string} Random topic from the categories list
 */
function getRandomTopic() {
  const randomIndex = Math.floor(Math.random() * TOPIC_CATEGORIES.length);
  return TOPIC_CATEGORIES[randomIndex];
}

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
