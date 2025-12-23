import cron from 'node-cron';

// Task 1: A simple task that runs every minute
export const task1 = () => {
  console.log('[Cron] Running a simple task every minute');
};

export const task2 = () => {
  console.log(
    '[Cron] Executing daily maintenance task (originally scheduled for 2:30 AM)',
  );
};

const startGeneralCronJobs = () => {
  cron.schedule('* * * * *', task1);
  cron.schedule('30 2 * * *', task2);
  console.log('🗓️  General cron jobs are scheduled.');
};

export { startGeneralCronJobs };
