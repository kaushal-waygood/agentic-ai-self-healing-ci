const cron = require('node-cron');
const { GoogleGenAI } = require('@google/genai');
const AiCourse = require('@waygood/common/models/AiCourse');
const AiUniversity = require('@waygood/common/models/AiUniversity');

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let isCronRunning = false;
let apiKeyIndex = 0;

// Helper to get next API key from .env (comma separated GEMINI_API_KEYS)
const getNextApiKey = () => {
  const keysStr = process.env.GEMINI_API_KEYS;
  if (!keysStr) return null;
  const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) return null;

  const key = keys[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % keys.length;
  return key;
};

// Clean the response text to find raw JSON block
const extractJson = (text) => {
  try {
    // Attempt parsing directly
    return JSON.parse(text);
  } catch (err) {
    // If not direct, look for standard ```json ... ``` markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        throw new Error("Failed to parse extracted JSON block");
      }
    }
    // Final fallback: try finding first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch (e) {
        throw new Error("Failed to parse bracket extracted JSON");
      }
    }

    throw new Error("Could not locate valid JSON in Gemini response.");
  }
};

const processUniversities = async () => {
  // Fetch up to 2 PENDING universities to keep processing under ~20-30s per minute check
  const unis = await AiUniversity.find({ status: { $in: ['PENDING', 'FAILED'] } }).limit(2);

  if (unis.length === 0) return 0;

  for (const uni of unis) {
    uni.status = 'PROCESSING';
    await uni.save();

    const apiKey = getNextApiKey();
    if (!apiKey) {
      console.error("GEMINI_API_KEYS not found in .env");
      uni.status = 'FAILED';
      uni.errorReason = 'API key missed';
      await uni.save();
      break;
    }

    try {
      const prompt = `
### SYSTEM INSTRUCTION
Act as a Senior Data Researcher and SEO Specialist. Your goal is to conduct a deep-search to extract highly accurate, student-friendly, and SEO-optimized data for the university specified. You must return the output ONLY as a valid JSON object. 

### CONTEXT & SEO REQUIREMENTS
- **University Bio**: Write a 150-200 word bio. Use a professional yet welcoming tone. Incorporate SEO keywords: "top-ranked programs," "global recognition," "campus facilities," and "career prospects." 
- **Data Currency**: Prioritize 2026 rankings (QS/THE) and the most recent available tuition data.
- **Null Handling**: Use \`null\` for missing numerical values and \`"N/A"\` for missing strings. Do not invent data.

### TARGET UNIVERSITY: ${uni.universityName} (Campus: ${uni.campus}, URL: ${uni.uniWebsiteUrl})

### JSON SCHEMA
{
  "universityName": "string",
  "countryName": "string",
  "stateName": "string",
  "cityName": "string",
  "addressLine1": "string",
  "addressLine2": "string",
  "email": "string",
  "contactNumber": "string",
  "usRanking": "number or null",
  "qsRanking": "number or null",
  "theRanking": "number or null",
  "arwuRanking": "number or null",
  "universityType": "PRIVATE or PUBLIC",
  "applicationFeeWaived": "FULL, PARTIAL, or NONE",
  "universityWebsite": "url",
  "universityInfo": "string (SEO optimized bio)",
  "applicationFeeRange": {
    "min": "number",
    "max": "number",
    "currencyName": "string (e.g. USD)"
  },
  "yearTuitionFee": {
    "min": "number",
    "max": "number",
    "currencyName": "string (e.g. USD)"
  },
  "OpenIntakesYears": Array [2026,2027],
  "OpenIntakesMonths": Array of strings ["January","February","March"],
  "courseLevel": Array of strings ["Bachelor","Master","PhD"],
  "CostOfLiving": "string (SEO optimized info)",
  "Scholarship": "string (SEO optimized info)",
  "EntryRequirements": "string (SEO optimized info)",
  "applicationProcess": "string (SEO optimized info)",
  "diversity": {
    "internationalStudents": "number",
    "localStudents": "number",
    "studentFacultyRatio": "string"
  },
  "mapCordinates": "string (e.g. 40.7128,-74.0060) or null",
  "TotalEstimatedPerYear": [
    {
      "title": "string",
      "icon": "string (iconify icon name eg - ic:baseline-accessibility)",
      "note": "string",
      "amount": "number",
      "currencyName": "string (e.g. USD)"
    }
  ]
}
      `.trim();

      const client = new GoogleGenAI({ apiKey: apiKey });

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.0
        }
      });

      const responseText = response.text;

      if (!responseText) throw new Error("Empty response from AI");

      const jsonData = extractJson(responseText);

      uni.aiData = jsonData;
      uni.status = 'COMPLETED';
      uni.errorReason = null;
      await uni.save();

      console.log(`[AiUniversity] Successfully processed ${uni.universityName}`);

    } catch (err) {
      uni.status = 'FAILED';
      uni.errorReason = err.response?.data?.error?.message || err.message;
      await uni.save();
      console.error(`[AiUniversity] Failed processing ${uni.universityName}: `, uni.errorReason);
    }

    // 15 seconds gap requested
    await delay(15000);
  }

  return unis.length;
};

const processCourses = async () => {
  // Fetch up to 2 PENDING courses
  const courses = await AiCourse.find({ status: { $in: ['PENDING', 'FAILED'] } }).limit(2);

  if (courses.length === 0) return 0;

  for (const course of courses) {
    course.status = 'PROCESSING';
    await course.save();

    const apiKey = getNextApiKey();
    if (!apiKey) {
      console.error("GEMINI_API_KEYS not found in .env");
      course.status = 'FAILED';
      course.errorReason = 'API key missed';
      await course.save();
      break;
    }

    try {
      const prompt = `
### SYSTEM INSTRUCTION
Act as an Elite Academic Research Intelligence and SEO Content Strategist. Your mission is to conduct a multi-layered search to extract a complete data profile for the following entity: ${course.courseName} at ${course.universityCampus} - ${course.universityName} (${course.uniWebsiteUrl}). 

### EXECUTION PROTOCOL
1. **Search Verification**: Use Google Search to cross-reference the official university website and 2026 rankings.
2. **SEO Optimization**: 
   - 'university_bio_seo': 150 words using "top-ranked programs," "global recognition," and "campus life."
   - 'course_career_outcomes_seo': 100 words using "career trajectory," "accredited excellence," and "industry-standard."
3. **Data Integrity**: 
   - Standardize all currency to ISO codes (e.g., AED, GBP, USD).
   - If a numerical value is unknown, return \`null\`. If a string is unknown, return \`"N/A"\`.
   - Ensure 2026 rankings (QS/THE) are prioritized.

### OUTPUT REQUIREMENT
Return ONLY a valid JSON object. Do not include introductory text or markdown formatting.

### JSON SCHEMA
{
  "courseName": "string",
  "universityName": "string",
  "campusName": "Array of strings which which campuses of university provide this paricular course eg - ["UAE", "UK"] or null",
  "universityCourseCode": "string (if university assigned some unique id to this course) or null",
  "courseLevel": "string (e.g. Bachelors, Masters, PhD)",
  "universityDepartment": "string (e.g. Computer Science, Business, etc.)",
  "attendanceType": "FULL-TIME, PART-TIME, PART-TIME-ONLINE, ONLINE, or MIXED",
  "firstYearTuitionFees": {
    "amount": "number",
    "currencyName": "string (e.g. USD)"
  },
  "totalTuitionFee": {
    "amount": "number",
    "currencyName": "string (e.g. USD)"
  },
  "duration": "string (e.g. 3 years)",
  "durationInMonths": "number (e.g. 36)",
  "courseURL": "string",
  "applicationFeeWaived": "boolean",
  "applicationFeeAmount": {
    "amount": "number",
    "currencyName": "string (e.g. USD)"
  },
  "courseDescription": "string (SEO optimized course description / career outcomes)",
  "internationalApplicationDeadline": "YYYY-MM-DD date string or null",
  "domesticApplicationDeadline": "YYYY-MM-DD date string or null",
  "ftRanking": "number or null",
  "acceptanceRate": "number or null",
  "entry_requirements": "string",
  "courseStudyMajor": "string (e.g. Computer Science & IT)",
  "courseSpecialization": "string (e.g. Information Technology)",
  "courseDiscipline": "string (e.g. Data Analytics)",
  "courseSubDiscipline": "string (e.g. Data Science)",
  "courseTaughtLanguages": "Array of strings (e.g. English, Arabic, etc.)",
  "requirements": "Array of objects (e.g. [ { "masterId": "string", "requiredOverall": "number", "requiredSections": { "string": "number" } } ])",
  "requiredDocuments": "Array of objects (e.g. [ { "documentName": "string (e.g. High School Diploma, Graduation Degree, etc.)", "required": "boolean", "note": "string" } ])",
  "intakeYears": [
      {
        month: [
          "January",
          "September"
        ],
        year: "2026",
      },
    ],
}

### TARGET ENTITY
Course: ${course.courseName}
University: ${course.universityCampus} ${course.universityName}
      `.trim();

      const client = new GoogleGenAI({ apiKey: apiKey });

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.0
        }
      });

      const responseText = response.text;

      if (!responseText) throw new Error("Empty response from AI");

      const jsonData = extractJson(responseText);

      course.aiData = jsonData;
      course.status = 'COMPLETED';
      course.errorReason = null;
      await course.save();

      console.log(`[AiCourse] Successfully processed ${course.courseName}`);

    } catch (err) {
      course.status = 'FAILED';
      course.errorReason = err.response?.data?.error?.message || err.message;
      await course.save();
      console.error(`[AiCourse] Failed processing ${course.courseName}: `, course.errorReason);
    }

    // 15 seconds gap
    await delay(15000);
  }

  return courses.length;
};

const runAiProcessor = async () => {
  if (isCronRunning) return;
  isCronRunning = true;

  try {
    const uniLength = await processUniversities();

    // Only process courses if we didn't just process max universities (to spread load)
    if (uniLength === 0) {
      await processCourses();
    }
  } catch (error) {
    console.error("Error in AI Processor Cron: ", error.message);
  } finally {
    isCronRunning = false;
  }
};

const start = () => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    runAiProcessor();
  });
  console.log("AI Data Populator Cron initialized.");
};

module.exports = {
  start,
};
