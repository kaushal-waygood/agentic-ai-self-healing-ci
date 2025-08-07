// jest.setup.js
import mongoose from 'mongoose';

beforeAll(async () => {
  // Use a different database name for testing
  process.env.MONGO_URL = process.env.MONGO_URL.replace(
    /(?<=\/)([^/]+)(?=\?|$)/,
    'testdb',
  );
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
