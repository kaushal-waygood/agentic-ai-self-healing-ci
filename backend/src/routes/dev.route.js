// src/api/routes/dev.routes.js

import express from 'express';
// Import the specific task functions you want to test
import { task1, task2 } from '../config/cron-config.js';

// import autopilotTriggerQueue from '../queues/jobDiscoveryQueue.js';
import {
  runAutopilotTask,
  scheduleAutopilotTriggers,
} from '../config/autopilotCron.js';
import { findAndProcessJobs } from '../worker/autopilotWorker.js';

const router = express.Router();

// This entire router will only be active in a development environment
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  router.get('/task1', async (req, res) => {
    try {
      await task1();
      res.status(200).send('Task 1 executed successfully');
    } catch (error) {
      console.error('Error executing task 1:', error);
      res.status(500).send('Error executing task 1');
    }
  });

  router.get('/task2', async (req, res) => {
    try {
      await task2();
      res.status(200).send('Task 2 executed successfully');
    } catch (error) {
      console.error('Error executing task 2:', error);
      res.status(500).send('Error executing task 2');
    }
  });

  router.get('/trigger-autopilot', async (req, res) => {
    try {
      // Call the task function directly to run the job NOW
      await runAutopilotTask();
      res.status(200).send('Autopilot task executed successfully');
    } catch (error) {
      console.error('Error executing autopilot task:', error);
      res.status(500).send('Error executing autopilot task');
    }
  });

  router.get('/trigger-autopilot-worker', async (req, res) => {
    try {
      const result = await findAndProcessJobs();
      res.status(200).json({
        success: true,
        message: 'Autopilot worker executed',
        processed: result?.processed ?? 0,
      });
    } catch (error) {
      console.error('Error executing autopilot worker:', error);
      res.status(500).send('Error executing autopilot worker');
    }
  });
}

export default router;
