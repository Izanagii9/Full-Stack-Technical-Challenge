import cron from 'node-cron';
import { articleService } from '../services/articleService.js';

/**
 * Retry generation with 5-minute intervals
 * Continues until success or all models are exhausted
 *
 * @param {number} attemptNumber - Current attempt number for logging
 * @returns {Promise<void>}
 */
async function retryGeneration(attemptNumber = 1) {
  console.log(`🔄 Retry attempt ${attemptNumber}...`);

  try {
    const newArticle = await articleService.createArticle();
    console.log(`✓ Article generated successfully on retry ${attemptNumber}: ${newArticle.title}`);
    return; // Success - stop retrying
  } catch (error) {
    console.error(`✗ Retry ${attemptNumber} failed: ${error.message}`);

    // Check if error is "all models failed"
    if (error.message.includes('All AI models failed')) {
      console.log('⏰ All models failed. Scheduling retry in 5 minutes...');

      // Wait 5 minutes then retry
      setTimeout(() => {
        retryGeneration(attemptNumber + 1);
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      // Other error (e.g., database error) - log and stop
      console.error('❌ Non-recoverable error. Stopping retries.');
    }
  }
}

/**
 * Schedule automatic article generation
 * Runs once per day at midnight (00:00)
 * Retries every 5 minutes if all models fail
 */
export const startArticleGeneration = () => {
  // Run every day at midnight
  // Cron format: second minute hour day month weekday
  // '0 0 * * *' means: at 00:00 every day

  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running scheduled article generation...');

    try {
      // Let AI choose the topic
      const newArticle = await articleService.createArticle();

      console.log(`✓ Daily article generated successfully: ${newArticle.title}`);
    } catch (error) {
      console.error('✗ Error generating daily article:', error.message);

      // If all AI models failed, start retry loop
      if (error.message.includes('All AI models failed')) {
        console.log('🔁 Starting retry mechanism (every 5 minutes)...');
        retryGeneration(1);
      }
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('📅 Article generation scheduled: Daily at 00:00 UTC');
  console.log('🔁 Retry mechanism: Every 5 minutes if all models fail');
};

/**
 * For testing: Generate article every minute
 * Uncomment this and comment out the daily schedule above for testing
 */
export const startArticleGenerationTest = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running TEST article generation (every minute)...');

    try {
      // Let AI choose the topic
      const newArticle = await articleService.createArticle();

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
