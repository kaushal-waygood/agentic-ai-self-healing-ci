import nodemailer from 'nodemailer';
import { isValidEmail } from './validators.js';
import { config } from 'dotenv';

config({ quiet: true, override: true }); // No need for silent:true in this setup

const validateEnvVars = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP credentials are missing in environment variables');
  }
};

const createTransporter = () => {
  validateEnvVars();

  return nodemailer.createTransport({
    service: 'gmail',
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    // connectionTimeout: 10000, // 10 seconds
    // greetingTimeout: 5000, // 5 seconds
    // socketTimeout: 10000, // 10 seconds
  });
};

const transporter = createTransporter();

const verifyTransporter = async (maxAttempts = 3) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      attempts++;
      console.error(
        `SMTP verification failed (attempt ${attempts}):`,
        error.message,
      );

      if (attempts >= maxAttempts) {
        throw new Error(
          `Failed to verify SMTP connection after ${maxAttempts} attempts`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000 * attempts));
    }
  }
};

verifyTransporter().catch((err) => {
  console.error('Critical SMTP initialization error:', err);
  process.exit(1); // Exit if email service is critical for your app
});

export const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  if (!isValidEmail(mailOptions.to)) {
    throw new Error(`Invalid recipient email: ${mailOptions.to}`);
  }

  let attempts = 0;
  let lastError = null;

  while (attempts < maxRetries) {
    try {
      const info = await transporter.sendMail({
        ...mailOptions,
        from:
          mailOptions.from || `"HelpStudyAbroad" <${process.env.EMAIL_USER}>`,
      });

      return info;
    } catch (error) {
      attempts++;
      lastError = error;
      console.error(`Email send failed (attempt ${attempts}):`, error.message);

      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempts));
      }
    }
  }

  throw lastError || new Error('Email sending failed');
};

export { transporter };
