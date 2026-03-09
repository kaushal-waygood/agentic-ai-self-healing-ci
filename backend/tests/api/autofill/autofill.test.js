import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import { Student } from '../../../src/models/student.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

// #region agent log
fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix',hypothesisId:'H3',location:'tests/api/autofill/autofill.test.js:7',message:'Autofill test imported model bindings',data:{userType:typeof User,userIsFunction:typeof User==='function',studentType:typeof Student,userKeys:User&&typeof User==='object'?Object.keys(User).slice(0,8):[]},timestamp:Date.now()})}).catch(()=>{});
// #endregion

jest.mock('../../../src/config/gemini.js', () => {
  return {
    __esModule: true,
    default: jest.fn(async () => {
      return JSON.stringify({
        studentId: 'MOCKED_ID',
        outputs: [{ inputKey: 'name', value: 'AI Generated Name' }],
      });
    }),
    genAI: jest.fn(async () => {
      return JSON.stringify({
        studentId: 'MOCKED_ID',
        outputs: [{ inputKey: 'name', value: 'AI Generated Name' }],
      });
    }),
    generateContent: jest.fn(async () => {
      return JSON.stringify({
        studentId: 'MOCKED_ID',
        outputs: [{ inputKey: 'name', value: 'AI Generated Name' }],
      });
    }),
  };
});

describe('Autofill Module Tests', () => {
  jest.setTimeout(30000);
  const testStudentUser = {
    email: `autofill${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Autofill Student',
    authMethod: 'local',
    isEmailVerified: true,
    accountType: 'student',
    role: 'user',
  };
  let studentId;

  beforeAll(async () => {
    await connectDB();
    // #region agent log
    fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix',hypothesisId:'H3',location:'tests/api/autofill/autofill.test.js:49',message:'Autofill beforeAll using User binding',data:{type:typeof User,isFunction:typeof User==='function',hasDeleteOne:typeof User?.deleteOne==='function'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const user = new User(testStudentUser);
    await user.save();

    const student = await Student.create({
      _id: user._id,
      email: testStudentUser.email,
      fullName: testStudentUser.fullName,
      firstName: 'Autofill',
      lastName: 'Student',
      jobRole: 'Tester',
    });
    studentId = student._id;

    constants.ACCESS_TOKEN = user.generateAccessToken();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testStudentUser.email });
    if (studentId) await Student.deleteOne({ _id: studentId });
    await disconnectDB();
  });

  it('should autofill form inputs (fallback logic verified)', async () => {
    const inputs = [
      {
        inputKey: 'name',
        label: 'Full Name',
        type: 'text',
        options: [],
      },
    ];

    const res = await axios.post('/api/v1/autofill', {
      studentId,
      inputs,
    });

    expect(res.status).toBe(200);
    expect(res.data.outputs).toBeDefined();
    const nameOutput = res.data.outputs.find((o) => o.inputKey === 'name');
    expect(nameOutput).toBeDefined();
    expect(nameOutput.value).toBe(testStudentUser.fullName);
  });

  it('should handle deterministic fallback for email field', async () => {
    const inputs = [
      {
        inputKey: 'email',
        label: 'Email Address',
        type: 'email',
        options: [],
      },
    ];

    const res = await axios.post('/api/v1/autofill', {
      studentId,
      inputs,
    });

    expect(res.status).toBe(200);
    const emailOutput = res.data.outputs.find((o) => o.inputKey === 'email');
    expect(emailOutput).toBeDefined();
    expect(emailOutput.value).toBe(testStudentUser.email);
  });
});
