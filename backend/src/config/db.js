import mongoose from 'mongoose';
// import { scheduleAutopilotTriggers } from './autopilotCron.js';
import { config } from './config.js';
import { removeExpiredUnverifiedUsers } from '../utils/cron.js';

const connectDB = async () => {
  try {
    const db =
      config.nodeEnv === 'production' ? config.mongoUrl : config.devMongoUrl;

    console.log('Mongo URL:', db);
    await mongoose.connect(db);
    console.log('✅ Database connected successfully.');
    // Start cron jobs
    // runAutopilotCron();
    removeExpiredUnverifiedUsers();
  } catch (error) {
    console.error(`❌ Fatal Error: Database connection failed.`);
    console.error(error);
    process.exit(1); // Exit process with failure code
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Database disconnected successfully.');
  } catch (error) {
    console.error(`Error disconnecting from DB: ${error.message}`);
  }
};

export default connectDB;
