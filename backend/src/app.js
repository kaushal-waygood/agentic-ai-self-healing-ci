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
import { handleStripeWebhook } from './controllers/plan.controller.js';

import newFeatureRoutes from './routes/newFeature.route.js';
import { config } from './config/config.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(limiter);

app.use(
  cors({
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3003',
      'https://dev.zobsai.com',
      'https://www.zobsai.com',
      'https://zobsai.com',
      'chrome-extension://obfphahhgennnkhdhpkjnbadgcaolkbk',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  }),
);

// 4) Stripe webhook must come BEFORE express.json, using raw body
app.post(
  '/api/v1/plan/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api', (req, res) => res.send('Hello from the server!'));

app.get('/health-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    data: Date.now().toString(),
  });
});

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

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
