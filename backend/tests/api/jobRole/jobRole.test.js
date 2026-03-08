import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import { JobRole } from '../../../src/models/JobRole.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

describe('JobRole Module Tests', () => {
  jest.setTimeout(30000);
  const testSuperAdmin = {
    email: `jobroleadmin${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Role Admin',
    authMethod: 'local',
    isEmailVerified: true,
    role: 'user',
  };
  let roleId;

  beforeAll(async () => {
    await connectDB();
    const user = new User(testSuperAdmin);
    await user.save();

    await User.findByIdAndUpdate(user._id, { role: 'super-admin' });
    const updatedUser = await User.findById(user._id);
    constants.ACCESS_TOKEN = updatedUser.generateAccessToken();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testSuperAdmin.email });
    if (roleId) await JobRole.deleteOne({ _id: roleId });
    await disconnectDB();
  });

  it('should create a new job role (super-admin only)', async () => {
    const roleData = {
      name: `Software Engineer ${Date.now()}`,
    };
    const res = await axios.post('/api/v1/job-role', roleData);
    expect(res.status).toBe(201);
    expect(res.data._id).toBeDefined();
    roleId = res.data._id;
  });

  it('should get all job roles', async () => {
    const res = await axios.get('/api/v1/job-role');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
