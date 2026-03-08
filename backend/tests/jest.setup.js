import constants from './config/constants.js';
import mongoose from 'mongoose';

beforeAll(() => {
  constants.ACCESS_TOKEN = 'some-valid-token';
  constants.REFRESH_TOKEN = 'some-refresh-token';
});

afterAll(async () => {
  // Close Mongoose connection (prevents "worker failed to exit" when API tests run)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  // Close Redis if it was loaded (e.g. by jobHelpers, controllers)
  try {
    const redis = (await import('../src/config/redis.js')).default;
    if (redis?.disconnect) await redis.disconnect();
  } catch {
    // Redis may not be loaded in this worker
  }
});
