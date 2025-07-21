/** @format */

export const config = {
  port: process.env.PORT || 8080,
  accessTokenSecret:
    process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m', // 15 minutes
  // Refresh token configuration
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/mydatabase',
  rapidApiKey: process.env.RAPID_API_KEY || 'your_rapid_api_key',
  rapidApiHost: 'jsearch.p.rapidapi.com',
};
