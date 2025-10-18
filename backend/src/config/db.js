import mongoose from 'mongoose';
// import { scheduleAutopilotTriggers } from './autopilotCron.js';
import { config } from './config.js'; // Make sure this is the secure config we built

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUrl);

    console.log(`✅ Database connected`);

    // scheduleAutopilotTriggers();
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
