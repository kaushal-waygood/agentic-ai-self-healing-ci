// __tests__/auth.test.js
import mongoose from 'mongoose';
import app from '../src/app.js';
import request from 'supertest';

let server;

beforeAll(async () => {
  // Use a different database for testing
  await mongoose.connect(process.env.MONGO_URL.replace('yourdbname', 'testdb'));
  server = app.listen(0); // Start server on random port
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  server.close();
});

describe('POST /api/v1/user/signup', () => {
  it('should register a new user', async () => {
    const res = await request(server) // Use the server instance here
      .post('/api/v1/user/signup')
      .send({
        accountType: 'individual',
        fullName: 'John Doe',
        email: 'jane.den@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        jobRole: 'Software Developer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });
});
