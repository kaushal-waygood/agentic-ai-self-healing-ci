import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User, * as UserModule from '../../../src/models/User.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

// #region agent log
fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix',hypothesisId:'H1',location:'tests/api/auth/auth.test.js:6',message:'Auth test imported User binding',data:{type:typeof User,isFunction:typeof User==='function',name:User?.name??null,keys:User&&typeof User==='object'?Object.keys(User).slice(0,8):[]},timestamp:Date.now()})}).catch(()=>{});
// #endregion
// #region agent log
console.log('[agent-debug auth import]', {
  userType: typeof User,
  userIsFunction: typeof User === 'function',
  defaultUserType: typeof UserModule.default,
  defaultUserIsFunction: typeof UserModule.default === 'function',
  moduleKeys: Object.keys(UserModule).slice(0, 8),
  moduleUserType: typeof UserModule?.User,
  moduleDefaultType: typeof UserModule?.default,
  defaultKeys:
    UserModule?.default && typeof UserModule.default === 'object'
      ? Object.keys(UserModule.default).slice(0, 8)
      : [],
});
// #endregion

describe('Auth Tests', () => {
  jest.setTimeout(30000);
  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'Help@123',
    fullName: 'Test User',
    authMethod: 'local',
    isEmailVerified: true,
    role: 'user',
  };

  beforeAll(async () => {
    await connectDB();
    // #region agent log
    await fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-2',hypothesisId:'H1',location:'tests/api/auth/auth.test.js:23',message:'Auth beforeAll using User binding and module namespace',data:{userType:typeof User,userIsFunction:typeof User==='function',userHasDeleteOne:typeof User?.deleteOne==='function',moduleKeys:Object.keys(UserModule).slice(0,8),moduleUserType:typeof UserModule?.User,moduleUserIsFunction:typeof UserModule?.User==='function',sameBinding:User===UserModule?.User},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    console.log('[agent-debug auth beforeAll]', {
      userType: typeof User,
      userIsFunction: typeof User === 'function',
      userHasDeleteOne: typeof User?.deleteOne === 'function',
      userHasFindOne: typeof User?.findOne === 'function',
      defaultUserType: typeof UserModule.default,
      defaultUserIsFunction: typeof UserModule.default === 'function',
      defaultUserHasDeleteOne: typeof UserModule.default?.deleteOne === 'function',
      moduleKeys: Object.keys(UserModule).slice(0, 8),
      moduleUserType: typeof UserModule?.User,
      moduleDefaultType: typeof UserModule?.default,
      moduleDefaultHasUser:
        !!UserModule?.default && Object.prototype.hasOwnProperty.call(UserModule.default, 'User'),
    });
    // #endregion
    const user = new User(testUser);
    await user.save();
    constants.ACCESS_TOKEN = user.generateAccessToken();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
    await disconnectDB();
  });

  it('should get user profile', async () => {
    const res = await axios.get('/api/v1/user/me');
    expect(res.status).toBe(200);
    expect(res.data.email).toBe(testUser.email);
  });

  it('should signup a new user and return 201', async () => {
    const newUser = {
      email: `signup${Date.now()}@test.com`,
      password: 'Help@123',
      confirmPassword: 'Help@123',
      fullName: 'Signup Test',
    };
    try {
      const res = await axios.post('/api/v1/user/signup', newUser);
      expect(res.status).toBe(201);
      expect(res.data.email).toBe(newUser.email.toLowerCase());
      expect(res.data.message).toContain('Verification OTP');
    } finally {
      await User.deleteOne({ email: newUser.email.toLowerCase() });
    }
  });

  it('should signout', async () => {
    const res = await axios.get('/api/v1/user/signout');
    expect(res.status).toBe(200);
  });
});
