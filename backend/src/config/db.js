import mongoose from 'mongoose';
import runAutopilotCron from './autopilotCron.js';
import { config } from './config.js';

const db = async () => {
  try {
    await mongoose.connect(config.dbURI);
    console.log('Database is connected');

    // Start cron jobs
    // runAutopilotCron();
  } catch (error) {
    console.log(error);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(`Error disconnecting from DB: ${error.message}`);
  }
};

export default db;
