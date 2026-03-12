import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import { Student } from './src/models/students/student.model.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zobsai');
  const u1 = await User.findById('6933cae6f103bd587d5af085').lean();
  console.log('User 1 limits:', u1?.usageLimits, u1?.usageCounters);
  
  const s1 = await Student.findById('6933cae6f103bd587d5af085').lean();
  console.log('Student 1 prefs:', s1?.settings?.autopilotLimit);
  
  process.exit(0);
}
test();
