import dotenv from 'dotenv';
dotenv.config({ quiet: true, override: true, path: ['.env'] }); // No need for silent:true in this setup

// --- Function to get a required environment variable ---
const getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing critical environment variable: ${key}`);
    process.exit(1); // Exit the process with an error code
  }
  return value;
};

// --- Application Configuration ---
export const config = {
  // General
  port: process.env.PORT || 8080,

  // Database
  mongoUrl: getEnv('MONGO_URL'),

  // JWT Tokens
  accessTokenSecret: getEnv('ACCESS_TOKEN_SECRET'),
  accessTokenExpiry: '7d', // ✅ Longer-lived access token

  // refreshTokenSecret: getEnv('REFRESH_TOKEN_SECRET'),
  refreshTokenExpiry: '7d', // ✅ Longer-lived refresh token

  // External APIs
  rapidJobApi: 'https://jsearch.p.rapidapi.com/search',
  rapidApiKey: getEnv('RAPID_API_KEY'),
  rapidApiHost: 'jsearch.p.rapidapi.com',
  geminiAPI: getEnv('GOOGLE_GENERATIVE_AI_KEY'),

  // Redis
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: process.env.REDIS_PORT || 6379,
};
