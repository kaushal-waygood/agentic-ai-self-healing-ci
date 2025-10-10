/** @format */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Import routes
import userRoutes from './routes/user.route.js';
import jobRoleRoutes from './routes/jobRole.route.js';
import organizationRoutes from './routes/organization.route.js';
import jobRoutes from './routes/job.route.js';
import studentRoutes from './routes/student.route.js';
import aiRoutes from './routes/ai.route.js';
import agentRoutes from './routes/autopilotAgent.route.js';
import planRoutes from './routes/plan.route.js';
import formRoutes from './routes/form.route.js';
import { handleStripeWebhook } from './controllers/plan.controller.js';

const app = express();

// 1. Security Middleware
app.use(helmet());
app.use(compression());

// 2. Rate Limiting Middleware  👈 ADD THIS SECTION
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// 3. CORS Configuration (was 2)
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://144.91.114.195:30090',
      // 👇 CORRECTED THIS SECTION 👇
      'https://dev.zobsai.com', // ✅ ADD the frontend development URL
      'https://www.zobsai.com', // ✅ ADD the production frontend URL (good practice)
      'https://zobsai.com', // ✅ ADD the production frontend URL without www
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

// This route uses a raw body parser to ensure the Stripe signature can be verified.
app.post(
  '/api/v1/plan/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// 4. Request Parsing Middleware (was 3)
app.use(express.json({ limit: '1000mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

// 5. Other Middleware (was 4)
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

// 6. Route Middleware (was 5)
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job-role', jobRoleRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/students', aiRoutes);
app.use('/api/v1/pilotagent', agentRoutes);
app.use('/api/v1/plan', planRoutes);
app.use('/api/v1/form', formRoutes);

// 7. 404 Handler (was 6)
app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// 8. Error Handling Middleware (was 7)
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
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
