// utils/transporter.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

// utils/transporter.js
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'f41f47fefc4d53',
    pass: process.env.EMAIL_PASS || '6a93f67c18f8a7',
  },
  // Add these additional options
  secure: false, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false, // For development only
  },
  debug: true, // This will show detailed logs
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});
