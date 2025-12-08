import { generateArticle } from './aiService.js';

// Articles storage - will be replaced with database in Phase 4
let articles = [
  {
    id: 1,
    title: 'The Future of Artificial Intelligence in 2025',
    excerpt: 'Exploring the latest trends and developments in AI technology, from machine learning to neural networks and beyond.',
    content: `Artificial Intelligence continues to evolve at an unprecedented pace. In 2025, we're seeing remarkable advances in natural language processing, computer vision, and autonomous systems.

Machine learning models are becoming more sophisticated, with improved accuracy and efficiency. Neural networks are now capable of understanding context and nuance in ways that were previously impossible.

The integration of AI into everyday applications is transforming how we work, communicate, and solve complex problems. From healthcare diagnostics to financial forecasting, AI is making a significant impact across industries.`,
    author: 'AI Assistant',
    createdAt: '2025-01-15T10:00:00Z',
    tags: ['AI', 'Technology', 'Machine Learning']
  },
  {
    id: 2,
    title: 'Building Scalable Web Applications with React',
    excerpt: 'A comprehensive guide to creating performant and maintainable React applications using modern best practices.',
    content: `React has revolutionized how we build user interfaces. With its component-based architecture and virtual DOM, developers can create highly interactive and performant web applications.

Key principles for building scalable React applications include proper state management, code splitting, and performance optimization. Using tools like Redux Toolkit and React Router helps maintain clean architecture as your application grows.

Modern React development also embraces hooks, which provide a more intuitive way to manage component lifecycle and state. Combined with TypeScript, React applications become more robust and maintainable.`,
    author: 'AI Assistant',
    createdAt: '2025-01-14T14:30:00Z',
    tags: ['React', 'Web Development', 'JavaScript']
  },
  {
    id: 3,
    title: 'DevOps Best Practices for Modern Teams',
    excerpt: 'Learn how to implement effective DevOps workflows that improve collaboration and accelerate software delivery.',
    content: `DevOps has become essential for organizations looking to deliver software quickly and reliably. By breaking down silos between development and operations teams, companies can achieve faster deployment cycles and improved product quality.

Continuous Integration and Continuous Deployment (CI/CD) pipelines automate the testing and deployment process, reducing human error and increasing confidence in releases. Tools like Docker and Kubernetes enable consistent environments across development, staging, and production.

Monitoring and observability are crucial components of a successful DevOps strategy. By tracking metrics and logs, teams can quickly identify and resolve issues before they impact users.`,
    author: 'AI Assistant',
    createdAt: '2025-01-13T09:15:00Z',
    tags: ['DevOps', 'CI/CD', 'Docker']
  }
];

// Service methods
export const articleService = {
  // Get all articles
  getAllArticles: async () => {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return articles;
  },

  // Get article by ID
  getArticleById: async (id) => {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const article = articles.find(article => article.id === parseInt(id));

    if (!article) {
      throw new Error('Article not found');
    }

    return article;
  },

  // Create new AI-generated article
  createArticle: async (topic) => {
    // Generate article using AI
    const aiContent = await generateArticle(topic);

    // Get next ID
    const nextId = articles.length > 0
      ? Math.max(...articles.map(a => a.id)) + 1
      : 1;

    // Create new article object
    const newArticle = {
      id: nextId,
      title: aiContent.title,
      excerpt: aiContent.excerpt,
      content: aiContent.content,
      author: 'AI Assistant',
      createdAt: new Date().toISOString(),
      tags: aiContent.tags
    };

    // Add to articles array
    articles.unshift(newArticle); // Add to beginning so newest appears first

    return newArticle;
  }
};
