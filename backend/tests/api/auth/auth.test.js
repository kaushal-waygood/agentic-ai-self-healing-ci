import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import { User } from '../../../src/models/User.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

describe('Auth Tests', () => {
  jest.setTimeout(30000); // Increase timeout to 30s
  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'password123',
    confirmPassword: 'password123',
    fullName: 'Test User',
    // Additional fields required by signUpUser logic if any
  };

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
    await disconnectDB();
  });

  it('should signup a new user', async () => {
    const res = await axios.post('/api/v1/user/signup', testUser);
    expect(res.status).toBe(201);
    expect(res.data.message).toContain('Verification OTP sent');
    // Signup does NOT return token
  });

  it('should login', async () => {
    // Manually verify user in DB to allow login
    await User.findOneAndUpdate(
      { email: testUser.email },
      { isEmailVerified: true, otp: undefined, otpExpires: undefined },
    );

    const res = await axios.post('/api/v1/user/signin', {
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
    constants.ACCESS_TOKEN = res.data.accessToken;
  });

  it('should get user profile', async () => {
    const res = await axios.get('/api/v1/user/me');

    expect(res.status).toBe(200);
    expect(res.data.email).toBe(testUser.email);
  });

  it('should signout', async () => {
    const res = await axios.get('/api/v1/user/signout');
    expect(res.status).toBe(200);
  });
});
