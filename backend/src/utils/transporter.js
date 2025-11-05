// transporter.js
import nodemailer from 'nodemailer';
import { isValidEmail } from './validators.js';
import { config as dotenv } from 'dotenv';

dotenv({ quiet: true, override: true });

const env = process.env.NODE_ENV || 'development';
const isLocal = env === 'development' || env === 'local' || env === 'test';

let transporter = null;
let verified = false;
let verifying = null; // in-process lock to avoid duplicate verify storms

function assertProdCreds() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      'SMTP credentials missing: set EMAIL_USER and EMAIL_APP_PASSWORD',
    );
  }
}

export function getTransporter() {
  if (transporter) return transporter;

  if (isLocal) {
    // Don’t touch Gmail in dev. Log messages to console.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  // Gmail: prefer App Passwords. 465 = SMTPS with secure: true
  assertProdCreds();
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD,
    },
    // Connection pool + light rate limiting to play nice with Gmail
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    rateDelta: 1000, // window
    rateLimit: 5, // msgs per window
  });

  return transporter;
}

/**
 * Verify once, with exponential backoff.
 * If Gmail returns 454/“Too many login attempts”, stop immediately.
 */
export async function verifyTransporter({ maxAttempts = 3 } = {}) {
  if (isLocal) {
    // Nothing to verify in dev
    verified = true;
    return true;
  }
  if (verified) return true;
  if (verifying) return verifying;

  const tx = getTransporter();

  verifying = (async () => {
    let attempt = 0;
    let delay = 1000; // 1s, doubles each time up to 15s

    while (attempt < maxAttempts) {
      try {
        await tx.verify();
        verified = true;
        return true;
      } catch (err) {
        const msg = String(
          (err && (err.code || err.response || err.message)) || '',
        );
        attempt += 1;

        // Hard stop for Gmail rate-limit
        if (
          msg.includes('4.7.0') ||
          msg.toLowerCase().includes('too many login attempts') ||
          msg.includes('454')
        ) {
          throw new Error(
            'Gmail rate-limited SMTP logins (454 4.7.0). Wait ~15 minutes or rotate credentials.',
          );
        }

        if (attempt >= maxAttempts) throw err;
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, 15000);
      }
    }
  })();

  try {
    return await verifying;
  } finally {
    verifying = null;
  }
}

/**
 * Send with retries for transient errors only.
 * Does NOT retry on auth/rate-limit/invalid-recipient.
 */
export async function sendEmailWithRetry(mailOptions, { maxRetries = 3 } = {}) {
  if (!mailOptions || !isValidEmail(mailOptions.to)) {
    throw new Error(`Invalid recipient email: ${mailOptions?.to}`);
  }

  const tx = getTransporter();
  if (!verified && !isLocal) {
    // Best-effort: verify before first real send in prod
    await verifyTransporter().catch(() => {}); // don’t block sends if verify flakes
  }

  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      const info = await tx.sendMail({
        ...mailOptions,
        from:
          mailOptions.from ||
          `"HelpStudyAbroad" <${
            process.env.EMAIL_USER || 'no-reply@example.com'
          }>`,
      });
      return info;
    } catch (err) {
      const msg = String(
        (err && (err.code || err.response || err.message)) || '',
      );
      lastError = err;
      attempt += 1;

      // Non-retryable classes
      const nonRetryable =
        msg.includes('5.7.0') || // auth/permissions
        msg.includes('Invalid login') ||
        msg.includes('Authentication failed') ||
        msg.includes('Too many login attempts') ||
        msg.includes('454 4.7.0') ||
        msg.toLowerCase().includes('invalid recipient');

      if (nonRetryable || attempt >= maxRetries) break;

      // simple backoff: 1s, 2s, 4s...
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError || new Error('Email sending failed');
}
