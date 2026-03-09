import constants from './config/constants.js';
import mongoose from 'mongoose';

// Mock Redis so unit tests don't connect (no Redis in CI)
jest.mock('../src/config/redis.js', () => {
  const noop = () => Promise.resolve();
  const mockClient = {
    get: () => Promise.resolve(null),
    set: noop,
    del: noop,
    keys: () => Promise.resolve([]),
    scanKeys: () => Promise.resolve([]),
    mget: () => Promise.resolve([]),
    mset: noop,
    withCache: async (_key, _ttl, callback) => callback(),
    invalidateJobCache: noop,
    invalidateStudentCache: noop,
    invalidateUserCache: noop,
    invalidateJobCacheForStudent: noop,
    invalidateAllJobsCache: noop,
    disconnect: noop,
  };
  return { __esModule: true, default: mockClient };
});

beforeAll(() => {
  constants.ACCESS_TOKEN = 'some-valid-token';
  constants.REFRESH_TOKEN = 'some-refresh-token';
});

afterAll(async () => {
  // Close Mongoose connection (prevents "worker failed to exit" when API tests run)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
