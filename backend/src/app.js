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
import aiRoutes from './routes/ai.route.js';
import agentRoutes from './routes/autopilotAgent.route.js';
import planRoutes from './routes/plan.route.js';
import formRoutes from './routes/form.route.js';
import notificationRoutes from './routes/notification.route.js'; // 👈 ADD THIS
import { handleStripeWebhook } from './controllers/plan.controller.js';
import taskRoutes from './routes/dev.route.js';
import newFeatureRoutes from './routes/newFeature.route.js';
// import './queues/jobDiscoveryQueue.js';
import { config } from './config/config.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

app.use(limiter);

const prod = ['https://www.zobsai.com'];
const dev = [
  'https://dev.zobsai.com',
  'https://in.indeed.com',
  'https://www.linkedin.com',
];

const local = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3004',
  'http://localhost:3004',
];

const originAllow =
  config.nodeEnv === 'production'
    ? prod
    : config.nodeEnv === 'development'
    ? dev
    : local;

console.log(originAllow);

app.use(
  cors({
    origin: originAllow,
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

app.post(
  '/api/v1/plan/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// 4. Request Parsing Middleware
app.use(express.json({ limit: '1000mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

// 5. Other Middleware
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/heath-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    data: Date.now().toString(),
  });
});

// 6. Route Middleware
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job-role', jobRoleRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/students', aiRoutes);
app.use('/api/v1/pilotagent', agentRoutes);
app.use('/api/v1/plan', planRoutes);
app.use('/api/v1/form', formRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/dev', taskRoutes);
app.use('/api/v1/new-feature', newFeatureRoutes);

// 7. 404 Handler
app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// 8. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send error response
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
