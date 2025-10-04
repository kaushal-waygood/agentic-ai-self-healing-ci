/** @format */

export const config = {
  port: process.env.PORT || 8080,
  accessTokenSecret:
    process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '7d',
  // Refresh token configuration
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/mydatabase',
  rapidJobApi: 'https://jsearch.p.rapidapi.com/search',
  rapidApiKey:
    process.env.RAPID_API_KEY ||
    'e181f48f77msh3138245c94a6f01p197d40jsn0ae1e0afe85c',
  rapidApiHost: 'jsearch.p.rapidapi.com',

  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: process.env.REDIS_PORT || 6379,
};
