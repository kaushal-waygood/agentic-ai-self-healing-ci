import axios from 'axios';

const countries = ['gb']; // UK
const options = {
  method: 'GET',
  url: 'https://jsearch.p.rapidapi.com/search',
  params: {
    query: 'react in ireland',
    page: '1',
    num_pages: '1',
    country: '',
    date_posted: 'all',
  },
  headers: {
    'x-rapidapi-key': 'b68b2dbc79mshe6eb5e027a616d6p1a5579jsn632805d91faa',
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
  },
};

async function fetchJobsByCountry() {
  // === 1. GLOBAL TEST (No country filter) ===
  console.log('\n🌍 GLOBAL SEARCH (No country)');
  try {
    const globalRes = await axios.request({
      ...options,
      params: { ...options.params, country: '' },
    });
    const jobs = globalRes.data.data || [];
    const total = globalRes.data.total || 0;

    console.log(`   Total jobs available: ${total}`);
    console.log(`   Jobs returned: ${jobs.length}`);
    if (jobs.length > 0) {
      console.log(
        `   Sample: "${jobs[0].job_title}" at ${jobs[0].employer_name}`,
      );
    } else {
      console.log('   No jobs returned. Possible quota or API issue.');
    }
  } catch (err) {
    console.log('   Error:', err.response?.data?.message || err.message);
  }

  // === 2. PER COUNTRY ===
  for (const country of countries) {
    console.log(`\n🇬🇧 COUNTRY: ${country.toUpperCase()}`);
    try {
      const res = await axios.request({
        ...options,
        params: { ...options.params, country },
      });
      const jobs = res.data.data || [];
      const total = res.data.total || 0;

      console.log(`   Total available: ${total}`);
      console.log(`   Jobs returned: ${jobs.length}`);

      if (jobs.length > 0) {
        jobs.slice(0, 3).forEach((job, i) => {
          console.log(`   ${i + 1}. ${job.job_title}`);
          console.log(`      Company: ${job.employer_name}`);
          console.log(
            `      Location: ${job.job_city || 'N/A'}, ${job.job_country}`,
          );
        });
      } else {
        console.log('   No jobs found for this country.');
      }
    } catch (err) {
      console.log('   Error:', err.response?.data?.message || err.message);
    }

    // Rate limit delay
    await new Promise((r) => setTimeout(r, 1000));
  }
}

fetchJobsByCountry();
