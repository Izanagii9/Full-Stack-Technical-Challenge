import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

/**
 * Generate blog article using HuggingFace API
 * @param {string} topic - The topic for the article
 * @returns {Promise<Object>} Generated article with title, content, excerpt, and tags
 */
export const generateArticle = async (topic) => {
  // For now, generate mock AI content since HuggingFace API has changed
  // TODO: Update to use new HuggingFace Router API or alternative
  console.log(`Generating article about: ${topic}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const title = topic;
  const content = generateMockContent(topic);
  const excerpt = content.substring(0, 150).trim() + '...';
  const tags = generateTags(topic);

  return {
    title,
    content,
    excerpt,
    tags
  };
};

/**
 * Generate mock content for article (placeholder until real AI integration)
 * @param {string} topic - Article topic
 * @returns {string} Generated content
 */
function generateMockContent(topic) {
  const templates = [
    `${topic} represents a significant advancement in modern technology. As we continue to push the boundaries of innovation, understanding these concepts becomes increasingly important for developers and technology professionals.

The landscape of technology is constantly evolving, and staying ahead requires continuous learning and adaptation. This article explores the key aspects of ${topic} and how they impact our daily work and future developments.

By examining current trends and best practices, we can better prepare for the challenges and opportunities that lie ahead. The integration of new methodologies and tools continues to reshape how we approach problem-solving in the tech industry.

Looking forward, ${topic} will play a crucial role in shaping the next generation of technological solutions. Embracing these changes while maintaining a solid foundation in core principles ensures sustainable growth and innovation.`,

    `In today's rapidly changing technological landscape, ${topic} has emerged as a critical area of focus. Organizations and individuals alike are recognizing the importance of understanding and implementing these concepts effectively.

The evolution of ${topic} reflects broader shifts in how we approach technology and innovation. From theoretical foundations to practical applications, the journey has been marked by continuous improvement and learning.

Modern implementations of ${topic} demonstrate the power of combining traditional methodologies with cutting-edge approaches. This balance enables teams to deliver robust solutions while remaining agile and responsive to change.

As we move forward, the principles underlying ${topic} will continue to guide technological advancement. Success in this domain requires not just technical expertise, but also a commitment to ongoing learning and adaptation.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate relevant tags based on topic
 * @param {string} topic - Article topic
 * @returns {Array<string>} Array of tags
 */
function generateTags(topic) {
  const topicLower = topic.toLowerCase();
  const tags = [];

  // Technology-related tags
  if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
    tags.push('AI', 'Technology', 'Machine Learning');
  } else if (topicLower.includes('web') || topicLower.includes('frontend') || topicLower.includes('backend')) {
    tags.push('Web Development', 'Programming', 'Technology');
  } else if (topicLower.includes('cloud') || topicLower.includes('aws') || topicLower.includes('docker')) {
    tags.push('Cloud', 'DevOps', 'Infrastructure');
  } else if (topicLower.includes('data') || topicLower.includes('database')) {
    tags.push('Data Science', 'Database', 'Technology');
  } else {
    // Default tags
    tags.push('Technology', 'Innovation', 'Trends');
  }

  return tags;
}

/**
 * Get a random topic for article generation
 * @returns {string} Random topic
 */
export const getRandomTopic = () => {
  const topics = [
    'The Future of Web Development in 2025',
    'Cloud Computing and Serverless Architecture',
    'Machine Learning Applications in Business',
    'Cybersecurity Best Practices for Developers',
    'The Evolution of JavaScript Frameworks',
    'Microservices Architecture Patterns',
    'GraphQL vs REST API Design',
    'Container Orchestration with Kubernetes',
    'Progressive Web Applications',
    'Database Design and Optimization',
    'Functional Programming Concepts',
    'Test-Driven Development Strategies',
    'CI/CD Pipeline Automation',
    'Mobile App Development Trends',
    'Blockchain Technology Applications'
  ];

  return topics[Math.floor(Math.random() * topics.length)];
};
