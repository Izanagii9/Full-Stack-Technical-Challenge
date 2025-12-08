import pool from '../config/database.js';

const initialArticles = [
  {
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

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Check if articles already exist
    const checkResult = await pool.query('SELECT COUNT(*) FROM articles');
    const count = parseInt(checkResult.rows[0].count);

    if (count > 0) {
      console.log(`Database already has ${count} articles. Skipping seed.`);
      process.exit(0);
    }

    // Insert initial articles
    for (const article of initialArticles) {
      await pool.query(
        `INSERT INTO articles (title, excerpt, content, author, created_at, tags)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          article.title,
          article.excerpt,
          article.content,
          article.author,
          article.createdAt,
          article.tags
        ]
      );
      console.log(`✓ Added: ${article.title}`);
    }

    console.log(`\n✓ Successfully seeded ${initialArticles.length} articles!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
