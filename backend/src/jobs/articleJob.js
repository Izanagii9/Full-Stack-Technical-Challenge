import cron from 'node-cron';
import { articleService } from '../services/articleService.js';
import { getRandomTopic } from '../services/aiService.js';

/**
 * Schedule automatic article generation
 * Runs once per day at midnight (00:00)
 */
export const startArticleGeneration = () => {
  // Run every day at midnight
  // Cron format: second minute hour day month weekday
  // '0 0 * * *' means: at 00:00 every day

  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled article generation...');

    try {
      const topic = getRandomTopic();
      console.log(`Generating daily article about: ${topic}`);

      const newArticle = await articleService.createArticle(topic);

      console.log(`✓ Daily article generated successfully: ${newArticle.title}`);
    } catch (error) {
      console.error('✗ Error generating daily article:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('📅 Article generation scheduled: Daily at 00:00 UTC');
};

/**
 * For testing: Generate article every minute
 * Uncomment this and comment out the daily schedule above for testing
 */
export const startArticleGenerationTest = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running TEST article generation (every minute)...');

    try {
      const topic = getRandomTopic();
      console.log(`Generating test article about: ${topic}`);

      const newArticle = await articleService.createArticle(topic);

      console.log(`✓ Test article generated: ${newArticle.title}`);
    } catch (error) {
      console.error('✗ Error generating test article:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('🧪 TEST MODE: Article generation every minute');
};
