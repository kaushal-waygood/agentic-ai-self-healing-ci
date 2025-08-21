// cron-config.js
import cron from 'node-cron';

// Task 1: A simple task that runs every minute
const task1 = () => {
  console.log('Running a task every minute');
};

// Task 2: A more complex task that runs at 2:30 AM every day
const task2 = () => {
  console.log('Running a task at 2:30 AM every day');
  // You can put your actual business logic here, e.g.,
  // - Database cleanup
  // - Data fetching from an external API
  // - Sending daily reports
};

const startCronJobs = () => {
  // Schedule task1 to run every minute
  cron.schedule('* * * * *', task1);

  // Schedule task2 to run at 2:30 AM every day
  // The cron expression '30 2 * * *' means:
  // Minute: 30
  // Hour: 2 (2 AM)
  // Day of Month: * (every day)
  // Month: * (every month)
  // Day of Week: * (every day of the week)
  cron.schedule('30 2 * * *', task2);

  console.log('Cron jobs are scheduled.');
};

export { startCronJobs };
