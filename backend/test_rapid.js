import {
  fetchExternalJobs,
  transformRapidApiJob,
  applyFilters,
  normalizeEmploymentTypeForApi,
} from './src/utils/jobHelpers.js';
import connectDB, { disconnectDB } from './src/config/db.js';

async function testApi() {
  await connectDB();
  const q = 'frontend developer';
  const country = 'IN';
  const employmentType = 'Internship';

  console.log(
    'Normalized Employment Type going to API:',
    normalizeEmploymentTypeForApi(employmentType),
  );

  const externalRaw = await fetchExternalJobs(
    q,
    country,
    null,
    null,
    null,
    normalizeEmploymentTypeForApi(employmentType),
    null,
    1,
  );

  console.log('Raw got:', externalRaw.length);

  const formatted = externalRaw.map((j) => transformRapidApiJob(j, q));
  console.log('Formatted got:', formatted.length);

  const context = {
    filters: { country, employmentType },
    interactions: { applied: new Set(), saved: new Set(), views: {} },
  };

  const filtered = applyFilters(formatted, context);
  console.log('Filtered got:', filtered.length);

  console.log('If 0, testing why...');
  for (let job of formatted) {
    console.log(
      `Checking Job: ${job.title}, Types: ${job.jobTypes}, Remote: ${job.remote}, Country: ${job.country}, Loc:`,
      job.location,
    );
  }

  await disconnectDB();
  process.exit(0);
}

testApi();
