// scripts/seedExternalJobs.js
import mongoose from 'mongoose';
import redisClient from '../src/config/redis.js';

import {
  fetchExternalJobsCached,
  transformRapidApiJob,
  upsertExternalJobs,
  dedupeByTitleCompany,
  normalizeEmploymentTypeForApi,
} from '../src/utils/jobHelpers.js';

import { UNIVERSAL_JOB_TITLES, COUNTRIES, MAX_PAGES } from './jobSeedConfig.js';
import { config } from '../src/config/config.js';

// --------------------
// CONFIG
// --------------------
const STOP_AT_REMAINING = 500;
const RATE_DELAY_MS = 1200;

// --------------------
// LOCATION EXPANSION
// --------------------
const COUNTRY_LOCATION_MAP = {
  IN: {
    metros: [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Pune',
      'Chennai',
      'Lucknow',
      'Kolkata',
      'Ahmedabad',
      'Surat',
      'Visakhapatnam',
      'Jaipur',
      'Bengalore',
      'Indore',
      'Noida',
      'Pune',
      'Hyderabad',
      'Visakhapatnam',
      'Lucknow',
      'Surat',
      'Jaipur',
      'Indore',
      'Noida',
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Pune',
      'Chennai',
      'Lucknow',
      'Kolkata',
      'Ahmedabad',
      'Surat',
      'Visakhapatnam',
      'Jaipur',
      'Indore',
      'Noida',
    ],
    states: [
      'Maharashtra',
      'Karnataka',
      'Delhi',
      'Telangana',
      'Tamil Nadu',
      'Uttar Pradesh',
      'Gujarat',
      'Rajasthan',
      'Kerala',
      'West Bengal',
      'Haryana',
      'Madhya Pradesh',
      'Andhra Pradesh',
      'Odisha',
      'Punjab',
      'Chhattisgarh',
      'Jharkhand',
      'Arunachal Pradesh',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Sikkim',
      'Tripura',
    ],
  },
};

// --------------------
// HELPERS
// --------------------
async function shouldStopSeeding() {
  const raw = await redisClient.get('rapidapi:last_usage');
  if (!raw) return false;

  const { remaining } = JSON.parse(raw);
  if (remaining <= STOP_AT_REMAINING) {
    console.warn(`🛑 Stopping seeding. Remaining=${remaining}`);
    return true;
  }
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --------------------
// MAIN
// --------------------
async function seedJobs() {
  console.log('🚀 Starting controlled job seeding');

  await mongoose.connect(config.mongoUrl);
  console.log('✅ Mongo connected');

  let totalFetched = 0;
  let totalSaved = 0;

  const seen = new Set(); // strong dedupe

  for (const country of COUNTRIES) {
    const locationCfg = COUNTRY_LOCATION_MAP[country] || {};
    const metros = locationCfg.metros || [];
    const states = locationCfg.states || [];

    for (const title of UNIVERSAL_JOB_TITLES) {
      if (await shouldStopSeeding()) break;

      // 1️⃣ Try metro cities
      for (const city of metros) {
        if (await shouldStopSeeding()) break;

        const found = await runQuery({
          title,
          country,
          city,
          state: undefined,
          seen,
        });

        totalFetched += found.fetched;
        totalSaved += found.saved;

        if (found.fetched > 0) break; // stop drilling deeper if city works
      }

      // 2️⃣ Try state if metros failed
      for (const state of states) {
        if (await shouldStopSeeding()) break;

        const found = await runQuery({
          title,
          country,
          city: undefined,
          state,
          seen,
        });

        totalFetched += found.fetched;
        totalSaved += found.saved;

        if (found.fetched > 0) break;
      }

      // 3️⃣ Fallback: country only
      if (await shouldStopSeeding()) break;

      const found = await runQuery({
        title,
        country,
        city: undefined,
        state: undefined,
        seen,
      });

      totalFetched += found.fetched;
      totalSaved += found.saved;
    }
  }

  console.log('🎯 Seeding finished');
  console.log({ totalFetched, totalSaved });

  process.exit(0);
}

// --------------------
// QUERY RUNNER
// --------------------
async function runQuery({ title, country, city, state, seen }) {
  let fetched = 0;
  let saved = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (await shouldStopSeeding()) break;

    console.log(
      `🔍 ${title} | ${country} | ${city || state || 'ANY'} | page ${page}`,
    );

    const apiJobs = await fetchExternalJobsCached(
      title,
      country,
      state,
      city,
      undefined,
      normalizeEmploymentTypeForApi('FULLTIME,INTERNSHIP,CONTRACT'),
      undefined,
      page,
      undefined,
      'seeding', // 👈 feature budget
    );

    if (!apiJobs.length) break;

    fetched += apiJobs.length;

    const transformed = apiJobs
      .map((j) => transformRapidApiJob(j, title))
      .filter((j) => {
        const key = `${j.jobId || j.title}|${j.company}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (transformed.length) {
      const deduped = dedupeByTitleCompany(transformed);
      await upsertExternalJobs(deduped);
      saved += deduped.length;
    }

    await sleep(RATE_DELAY_MS);
  }

  return { fetched, saved };
}

// --------------------
seedJobs().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
