/** @format */

import app from './src/app.js';
import dotenv from 'dotenv';
import connectDb from './src/config/db.js';
import { config } from './src/config/config.js';
import { startCronJobs } from './src/config/cron-config.js';

dotenv.config();

connectDb();

// startCronJobs();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export default app;
