// import axios from 'axios';

// const countries = ['gb']; // UK
// const options = {
//   method: 'GET',
//   url: 'https://jsearch.p.rapidapi.com/search',
//   params: {
//     query: 'react in ireland',
//     page: '1',
//     num_pages: '1',
//     country: '',
//     date_posted: 'all',
//   },
//   headers: {
//     'x-rapidapi-key': 'b68b2dbc79mshe6eb5e027a616d6p1a5579jsn632805d91faa',
//     'x-rapidapi-host': 'jsearch.p.rapidapi.com',
//   },
// };

// async function fetchJobsByCountry() {
//   // === 1. GLOBAL TEST (No country filter) ===
//   console.log('\n🌍 GLOBAL SEARCH (No country)');
//   try {
//     const globalRes = await axios.request({
//       ...options,
//       params: { ...options.params, country: '' },
//     });
//     const jobs = globalRes.data.data || [];
//     const total = globalRes.data.total || 0;

//     console.log(`   Total jobs available: ${total}`);
//     console.log(`   Jobs returned: ${jobs.length}`);
//     if (jobs.length > 0) {
//       console.log(
//         `   Sample: "${jobs[0].job_title}" at ${jobs[0].employer_name}`,
//       );
//     } else {
//       console.log('   No jobs returned. Possible quota or API issue.');
//     }
//   } catch (err) {
//     console.log('   Error:', err.response?.data?.message || err.message);
//   }

//   // === 2. PER COUNTRY ===
//   for (const country of countries) {
//     console.log(`\n🇬🇧 COUNTRY: ${country.toUpperCase()}`);
//     try {
//       const res = await axios.request({
//         ...options,
//         params: { ...options.params, country },
//       });
//       const jobs = res.data.data || [];
//       const total = res.data.total || 0;

//       console.log(`   Total available: ${total}`);
//       console.log(`   Jobs returned: ${jobs.length}`);

//       if (jobs.length > 0) {
//         jobs.slice(0, 3).forEach((job, i) => {
//           console.log(`   ${i + 1}. ${job.job_title}`);
//           console.log(`      Company: ${job.employer_name}`);
//           console.log(
//             `      Location: ${job.job_city || 'N/A'}, ${job.job_country}`,
//           );
//         });
//       } else {
//         console.log('   No jobs found for this country.');
//       }
//     } catch (err) {
//       console.log('   Error:', err.response?.data?.message || err.message);
//     }

//     // Rate limit delay
//     await new Promise((r) => setTimeout(r, 1000));
//   }
// }
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function extractText(res) {
  // 1. SDK helper (sometimes present)
  if (res?.response && typeof res.response.text === 'function') {
    try {
      return res.response.text();
    } catch {}
  }

  // 2. Top-level "text" (unlikely, but safe)
  if (typeof res?.text === 'string') return res.text;

  // 3. candidates -> content -> text (common)
  if (Array.isArray(res?.candidates) && res.candidates.length) {
    const cand = res.candidates[0];
    const content = cand?.content;

    // content can be an array of parts or an object
    if (Array.isArray(content) && content.length) {
      for (const part of content) {
        if (typeof part === 'string') return part;
        if (part?.text) return part.text;
        if (part?.type === 'output_text' && part?.text) return part.text;
      }
    }

    // single object form
    if (content && typeof content === 'object') {
      if (content.text) return content.text;
      // sometimes content has "parts" or nested arrays
      if (Array.isArray(content.parts) && content.parts[0]?.text)
        return content.parts[0].text;
      if (Array.isArray(content.parts) && typeof content.parts[0] === 'string')
        return content.parts[0];
    }
  }

  // 4. fallback: search the object for any key named "text"
  try {
    const json = JSON.stringify(res);
    const match = json.match(/"text"\s*:\s*"([^"]{1,2000})"/);
    if (match) return JSON.parse(`"${match[1]}"`);
  } catch {}

  // 5. absolute fallback
  return JSON.stringify(res, null, 2);
}

async function main() {
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Explain how AI works in a few words',
  });

  const text = extractText(res);
  console.log('=== GENERATED TEXT ===\n', text);

  // optional: print compact usage info
  if (res?.usageMetadata) {
    console.log('\n=== USAGE ===');
    console.log('prompt tokens:', res.usageMetadata.promptTokenCount);
    console.log('candidate tokens:', res.usageMetadata.candidatesTokenCount);
    console.log('total tokens:', res.usageMetadata.totalTokenCount);
  }
}

main().catch((err) => {
  console.error('Error:', err);
});
