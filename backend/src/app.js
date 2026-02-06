import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

import userRoutes from './routes/user.route.js';
import jobRoleRoutes from './routes/jobRole.route.js';
import organizationRoutes from './routes/organization.route.js';
import jobRoutes from './routes/job.route.js';
import studentRoutes from './routes/student.route.js';
import tourguideRoutes from './routes/tourguide.route.js';
import aiRoutes from './routes/ai.route.js';
import agentRoutes from './routes/autopilotAgent.route.js';
import planRoutes from './routes/plan.route.js';
import formRoutes from './routes/form.route.js';
import autofillRoutes from './routes/autofill.route.js';
import couponRoutes from './routes/coupon.route.js';
import socialRouter from './routes/social.js';
import bringZobsRoutes from './routes/bringzobs.route.js';
import notificationRoutes from './routes/notification.route.js';
import sitemapRoutes from './routes/sitemap.js';
import jobApplicationRoutes from './routes/jobApplication.route.js';
import analyticsRoutes from './routes/analytics.route.js';

import { startCronsRenew } from './config/renew-cron/cron.js';

import {
  handleStripeWebhook,
  razorpayWebhook,
} from './controllers/plan.controller.js';

import newFeatureRoutes from './routes/newFeature.route.js';
import { config } from './config/config.js';
import { ensurePlanValidity } from './middlewares/ensurePlanValidity.js';

const app = express();
app.set('trust proxy', 1);

/* ---------------- WEBHOOKS MUST COME FIRST ---------------- */
// No cors, no JSON, no cookie, no ensurePlanValidity here

app.post(
  '/api/v1/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook,
);

app.post(
  '/api/v1/plan/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

/* ---------------- STANDARD MIDDLEWARE ---------------- */

app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Try again later.',
});
app.use(limiter);

app.use(
  cors({
    origin: [
      'https://luminous-sherise-unobtrusively.ngrok-free.dev',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'https://dev.zobsai.com',
      'https://www.zobsai.com',
      'https://zobsai.com',
      'chrome-extension://obfphahhgennnkhdhpkjnbadgcaolkbk',
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(ensurePlanValidity);

/* ---------------- ROUTES ---------------- */

app.get('/api', (req, res) => res.send('Hello from server'));

app.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

startCronsRenew();

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/bring-zobs', bringZobsRoutes);
app.use('/api/v1/job-role', jobRoleRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/students', aiRoutes);
app.use('/api/v1/onboarding', tourguideRoutes);
app.use('/api/v1/pilotagent', agentRoutes);
app.use('/api/v1/plan', planRoutes);
app.use('/api/v1/form', formRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/new-feature', newFeatureRoutes);
app.use('/api/v1/autofill', autofillRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1', sitemapRoutes);
app.use('/api/v1/social', socialRouter);
app.use('/api/v1/job-application', jobApplicationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

/* ---------------- ERRORS ---------------- */

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message,
      ...(config.nodeEnv === 'local' && { stack: err.stack }),
    },
  });
});

export default app;
