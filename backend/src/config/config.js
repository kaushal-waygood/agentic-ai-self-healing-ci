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
    '481481f3c2msh0f834e29ff85a12p112cf0jsnf6269e369239',
  rapidApiHost: 'jsearch.p.rapidapi.com',

  redisHost: process.env.REDIS_HOST || '144.91.114.195',
  redisPort: process.env.REDIS_PORT || 6379,
};
