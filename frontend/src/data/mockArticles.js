export const mockArticles = [
  {
    id: '1',
    title: 'The Future of Artificial Intelligence in 2025',
    excerpt: 'Exploring the latest trends and developments in AI technology, from machine learning to neural networks and beyond.',
    content: `
# The Future of Artificial Intelligence in 2025

Artificial Intelligence continues to reshape our world in unprecedented ways. As we move through 2025, several key trends are emerging that will define the next era of AI development.

## Machine Learning Advances

Recent breakthroughs in machine learning have enabled more sophisticated models that can understand context and nuance better than ever before. Deep learning architectures have evolved to handle complex tasks with remarkable accuracy.

## Ethical Considerations

As AI becomes more prevalent, questions of ethics and responsibility have moved to the forefront. Organizations worldwide are developing frameworks to ensure AI systems are fair, transparent, and accountable.

## Real-World Applications

From healthcare diagnostics to autonomous vehicles, AI is making tangible impacts across industries. The technology is no longer just theoretical—it's actively solving real-world problems.

## Looking Ahead

The future of AI holds immense promise. As we continue to refine these technologies, we must balance innovation with responsibility, ensuring that AI serves humanity's best interests.
    `.trim(),
    author: 'AI Assistant',
    createdAt: '2025-01-15T10:00:00Z',
    tags: ['AI', 'Technology', 'Machine Learning'],
  },
  {
    id: '2',
    title: 'Building Scalable Web Applications with React',
    excerpt: 'Best practices and architectural patterns for creating maintainable and performant React applications at scale.',
    content: `
# Building Scalable Web Applications with React

React has become the go-to framework for building modern web applications. However, scaling React applications requires careful planning and adherence to best practices.

## Component Architecture

A well-structured component hierarchy is crucial for maintainability. Breaking down complex UIs into smaller, reusable components makes your codebase more manageable and testable.

## State Management

Choosing the right state management solution is critical. Redux Toolkit offers a powerful, opinionated approach that reduces boilerplate while maintaining predictability.

## Performance Optimization

React provides several tools for optimizing performance, including useMemo, useCallback, and React.memo. Understanding when and how to use these tools can significantly improve your application's responsiveness.

## Code Splitting

Implementing code splitting with React.lazy and Suspense allows you to load components on demand, reducing initial bundle size and improving load times.

## Conclusion

Building scalable React applications requires a combination of good architecture, thoughtful state management, and performance optimization. By following these principles, you can create applications that grow with your needs.
    `.trim(),
    author: 'AI Assistant',
    createdAt: '2025-01-14T14:30:00Z',
    tags: ['React', 'Web Development', 'JavaScript'],
  },
  {
    id: '3',
    title: 'DevOps Best Practices for Modern Teams',
    excerpt: 'A comprehensive guide to implementing DevOps principles, CI/CD pipelines, and cloud-native infrastructure.',
    content: `
# DevOps Best Practices for Modern Teams

DevOps has revolutionized how software teams build, deploy, and maintain applications. This guide explores essential practices for modern DevOps workflows.

## Continuous Integration and Deployment

Automating your build and deployment pipeline is foundational to DevOps. CI/CD tools like GitHub Actions, Jenkins, and AWS CodeBuild enable teams to ship faster with confidence.

## Infrastructure as Code

Treating infrastructure as code allows teams to version control their infrastructure, making deployments reproducible and reducing configuration drift. Tools like Terraform and CloudFormation are industry standards.

## Containerization with Docker

Docker containers provide consistent environments across development, testing, and production. This consistency eliminates the "works on my machine" problem and simplifies deployment.

## Monitoring and Observability

Understanding what's happening in production is crucial. Implementing comprehensive monitoring and logging helps teams identify issues before they impact users.

## Security Integration

DevSecOps integrates security practices throughout the development lifecycle. Automated security scanning and compliance checks should be part of your CI/CD pipeline.

## Cultural Aspects

DevOps isn't just about tools—it's about culture. Fostering collaboration between development and operations teams leads to better outcomes and faster innovation.
    `.trim(),
    author: 'AI Assistant',
    createdAt: '2025-01-13T09:15:00Z',
    tags: ['DevOps', 'CI/CD', 'Docker', 'AWS'],
  },
]
