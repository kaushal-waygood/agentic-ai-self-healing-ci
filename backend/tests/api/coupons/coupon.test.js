import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import { Coupon } from '../../../src/models/coupon.model.js';
import { Plan } from '../../../src/models/Plans.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

describe('Coupon Module Tests', () => {
  jest.setTimeout(30000);
  const testAdmin = {
    email: `couponadmin${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Coupon Admin',
    role: 'super-admin',
    authMethod: 'local',
    isEmailVerified: true,
  };
  const testUser = {
    email: `couponuser${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Coupon User',
    role: 'user',
    authMethod: 'local',
    isEmailVerified: true,
  };

  let adminToken;
  let userToken;
  let couponId;
  let planId;
  const couponCode = `TEST${Date.now()}`;

  beforeAll(async () => {
    await connectDB();

    const admin = new User(testAdmin);
    await admin.save();
    await User.findByIdAndUpdate(admin._id, { role: 'super-admin' });
    const updatedAdmin = await User.findById(admin._id);
    adminToken = updatedAdmin.generateAccessToken();

    const user = new User(testUser);
    await user.save();
    userToken = user.generateAccessToken();

    constants.ACCESS_TOKEN = adminToken;

    await Plan.deleteOne({ planType: 'Enterprise' });

    const plan = await Plan.create({
      planType: 'Enterprise',
      displayOrder: 9999,
      billingVariants: [
        {
          period: 'Monthly',
          price: {
            effective: { usd: 100, inr: 1000 },
            actual: { usd: 100, inr: 1000 },
          },
          features: [{ name: 'Support', value: 'Priority' }],
        },
      ],
    });
    planId = plan._id;
  });

  afterAll(async () => {
    await User.deleteMany({
      email: { $in: [testAdmin.email, testUser.email] },
    });
    if (planId) await Plan.deleteOne({ _id: planId });
    await Coupon.deleteMany({ code: couponCode });
    await disconnectDB();
  });

  it('should create a new coupon (super-admin)', async () => {
    const couponData = {
      code: couponCode,
      name: 'Test Coupon',
      discountType: 'percentage',
      discountValue: 20,
      expiresAt: new Date(Date.now() + 86400000),
      maxUses: 100,
    };

    const res = await axios.post('/api/v1/coupons/admin/create', couponData);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toBeDefined();
    couponId = res.data.data._id;
  });

  it('should list coupons (super-admin)', async () => {
    const res = await axios.get('/api/v1/coupons/admin');
    expect(res.status).toBe(200);
    expect(res.data.data).toBeDefined();
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it('should validate coupon (user)', async () => {
    constants.ACCESS_TOKEN = userToken;

    const res = await axios.get(
      `/api/v1/coupons/validate?code=${couponCode}&planId=${planId}&period=Monthly`,
    );
    expect(res.status).toBe(200);
    expect(res.data.isValid).toBe(true);
    expect(res.data.coupon.code).toBe(couponCode);
  });

  it('should redeem coupon (user)', async () => {
    constants.ACCESS_TOKEN = userToken;
    const res = await axios.post('/api/v1/coupons/redeem-coupon', {
      code: couponCode,
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });

  it('should delete coupon (super-admin)', async () => {
    constants.ACCESS_TOKEN = adminToken;

    const res = await axios.delete(`/api/v1/coupons/admin/${couponId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});
