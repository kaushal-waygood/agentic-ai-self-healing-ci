import connectDB, { disconnectDB } from './config/db.js';
import { Job } from './models/jobs.model.js';
import { fetchAndSaveJobsService } from './utils/fetchAndSaveJobsService.js';
import { config } from 'dotenv';

dotenv.config({ quiet: true, override: true, path: ['.env'] });
// --- Configuration ---
const KEYWORDS_TO_SEED = ['backend developer'];

const TARGET_JOB_COUNT = 2;
const MAX_PAGES_PER_KEYWORD = 2; // Safety limit to prevent excessive API calls
const DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedDatabaseWithKeywords = async () => {
  console.log('🚀 Starting targeted database seeding process...');
  for (const keyword of KEYWORDS_TO_SEED) {
    try {
      console.log(`----------------------------------------`);
      console.log(`🔍 Processing keyword: "${keyword}"`);
      let currentPage = 1;
      while (currentPage <= MAX_PAGES_PER_KEYWORD) {
        const currentJobCount = await Job.countDocuments({ queries: keyword });
        if (currentJobCount >= TARGET_JOB_COUNT) {
          console.log(
            `✅ Goal of ${TARGET_JOB_COUNT} jobs met for "${keyword}". (${currentJobCount} found).`,
          );
          break;
        }
        console.log(
          `  - Found ${currentJobCount}/${TARGET_JOB_COUNT} jobs. Fetching page ${currentPage}...`,
        );
        const newJobsCount = await fetchAndSaveJobsService(
          keyword,
          currentPage,
        );

        console.log(
          `  - Found ${newJobsCount} new jobs on page ${currentPage}.`,
        );
        if (newJobsCount === 0) {
          console.log(
            `  - API returned no new jobs. Finished with "${keyword}".`,
          );
          break;
        }
        currentPage++;
        if (currentPage <= MAX_PAGES_PER_KEYWORD) {
          console.log(
            `  - Waiting for ${DELAY_BETWEEN_REQUESTS / 1000} seconds...`,
          );
          await delay(DELAY_BETWEEN_REQUESTS);
        }
      }
    } catch (error) {
      console.error(
        `❌ A critical error occurred for keyword "${keyword}":`,
        error.message,
      );
    }
  }
  console.log('🎉 Targeted database seeding process completed!');
};

const run = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully.');
    await seedDatabaseWithKeywords();
  } catch (error) {
    console.error('❌ A fatal error occurred during the script execution.');
  } finally {
    await disconnectDB();
    console.log('🔌 Database disconnected.');
    process.exit(0);
  }
};

run();
