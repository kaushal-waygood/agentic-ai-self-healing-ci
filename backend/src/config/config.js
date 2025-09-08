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
    'ac604e5de3msh7ca8160c3a74f81p1cc1a1jsn7f7db4c40d75',
  rapidApiHost: 'jsearch.p.rapidapi.com',

  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: process.env.REDIS_PORT || 6379,
};
