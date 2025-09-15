/** @format */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import helmet from 'helmet';

// Import routes
import userRoutes from './routes/user.route.js';
import jobRoleRoutes from './routes/jobRole.route.js';
import organizationRoutes from './routes/organization.route.js';
import jobRoutes from './routes/job.route.js';
import studentRoutes from './routes/student.route.js';
import aiRoutes from './routes/ai.route.js';
import agentRoutes from './routes/autopilotAgent.route.js';
import planRoutes from './routes/plan.route.js';

const app = express();

// 1. Security Middleware
app.use(helmet());

// 2. CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://144.91.114.195:30090',
      'https://zobsai.com',
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

// 3. Request Parsing Middleware
app.use(express.json({ limit: '1000mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

// 4. Other Middleware
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

// 5. Route Middleware
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job-role', jobRoleRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/students', aiRoutes);
app.use('/api/v1/pilotagent', agentRoutes);
app.use('/api/v1/plan', planRoutes);

// 6. 404 Handler
app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// 7. Error Handling Middleware
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
