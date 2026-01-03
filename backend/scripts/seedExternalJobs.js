// scripts/seedExternalJobs.js
import mongoose from 'mongoose';
import {
  fetchExternalJobsCached,
  transformRapidApiJob,
  upsertExternalJobs,
  dedupeByTitleCompany,
  normalizeEmploymentTypeForApi,
} from '../src/utils/jobHelpers.js';

import { UNIVERSAL_JOB_TITLES, COUNTRIES, MAX_PAGES } from './jobSeedConfig.js';
import { config } from '../src/config/config.js';

async function seedJobs() {
  console.log('🚀 Starting external job seeding');

  await mongoose.connect(config.mongoUrl);
  console.log('✅ Mongo connected');

  let totalFetched = 0;
  let totalSaved = 0;

  for (const country of COUNTRIES) {
    for (const query of UNIVERSAL_JOB_TITLES) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        console.log(`🔍 Fetching "${query}" | ${country} | page ${page}`);

        const apiJobs = await fetchExternalJobsCached(
          query,
          country,
          undefined,
          undefined,
          undefined,
          normalizeEmploymentTypeForApi('FULLTIME,INTERNSHIP,CONTRACT'),
          undefined,
          page,
        );

        if (!apiJobs.length) break;

        totalFetched += apiJobs.length;

        const transformed = apiJobs.map((j) => transformRapidApiJob(j, query));

        const deduped = dedupeByTitleCompany(transformed);

        await upsertExternalJobs(deduped);

        totalSaved += deduped.length;

        // Respect RapidAPI rate limits
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  console.log('🎯 Seeding complete');
  console.log({
    totalFetched,
    totalSaved,
  });

  process.exit(0);
}

seedJobs().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
