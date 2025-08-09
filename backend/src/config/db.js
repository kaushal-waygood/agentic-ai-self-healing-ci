/** @format */

import mongoose from 'mongoose';
import runAutopilotCron from './autopilotCron.js';

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Database is connected');

    // Start cron jobs
    runAutopilotCron();
  } catch (error) {
    console.log(error);
  }
};

export default db;
