import dotenv from 'dotenv';
dotenv.config({ quiet: true, override: true, path: ['.env'] }); // No need for silent:true in this setup

// --- Function to get a required environment variable ---
const getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing critical environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

// --- Application Configuration ---
export const config = {
  // General
  port: process.env.PORT || 8080,
  mongoUrl: getEnv('MONGO_URL'),
  nodeEnv: process.env.NODE_ENV,
  accessTokenSecret: getEnv('ACCESS_TOKEN_SECRET'),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15s',
  refreshTokenExpiry: '7d',

  // External APIs
  rapidJobApi: 'https://jsearch.p.rapidapi.com/search',
  rapidApiKey: getEnv('RAPID_API_KEY'),
  rapidApiHost: 'jsearch.p.rapidapi.com',
  geminiAPI: getEnv('GOOGLE_GENERATIVE_AI_KEY'),

  // Redis
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT || 6379,

  // Stripe
  stripeSecretKey: getEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),

  // Email
  emailUser: getEnv('EMAIL_USER'),
  emailPassword: getEnv('EMAIL_PASSWORD'),

  // Admin alert for repeated 500 errors
  adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER,
  errorAlertThreshold: parseInt(process.env.ERROR_ALERT_THRESHOLD) || 3,
  errorAlertCooldownMs:
    parseInt(process.env.ERROR_ALERT_COOLDOWN_MIN) * 60 * 1000 ||
    30 * 60 * 1000,
};
