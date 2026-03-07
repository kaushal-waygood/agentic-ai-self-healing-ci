import { sendEmailWithRetry } from './transporter.js';
import { config } from '../config/config.js';
import { Student } from '../models/students/student.model.js';

const endpointErrors = new Map();

const THRESHOLD = config.errorAlertThreshold;
const COOLDOWN_MS = config.errorAlertCooldownMs;

function getEndpointKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function extractUserInfo(req) {
  const user = req.user;
  if (!user) return null;
  return {
    userId: user._id?.toString() || 'N/A',
    fullName: user.fullName || 'N/A',
    email: user.email || 'N/A',
    role: user.role || 'N/A',
    accountType: user.accountType || 'N/A',
  };
}

async function enrichWithStudentDetails(userInfo) {
  if (!userInfo?.userId || userInfo.userId === 'N/A') return userInfo;
  try {
    const student = await Student.findById(userInfo.userId)
      .select('phone location jobRole')
      .lean();
    if (student) {
      userInfo.phone = student.phone || 'N/A';
      userInfo.location = student.location || 'N/A';
      userInfo.jobRole = student.jobRole || 'N/A';
    }
  } catch {
    // Student lookup is best-effort; don't block the alert
  }
  return userInfo;
}

function buildUserRows(userInfo) {
  if (!userInfo) {
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User</td>
        <td style="padding: 8px; border: 1px solid #ddd;">Unauthenticated request</td>
      </tr>`;
  }

  const fields = [
    ['User ID', userInfo.userId],
    ['Full Name', userInfo.fullName],
    ['Email', userInfo.email],
    ['Phone', userInfo.phone],
    ['Role', userInfo.role],
    ['Account Type', userInfo.accountType],
    ['Location', userInfo.location],
    ['Job Role', userInfo.jobRole],
  ];

  return fields
    .filter(([, val]) => val && val !== 'N/A')
    .map(
      ([label, val]) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${val}</td>
      </tr>`,
    )
    .join('');
}

function buildAlertEmail(endpointKey, count, latestError, userInfo) {
  const timestamp = new Date().toISOString();
  const userRows = buildUserRows(userInfo);

  return {
    to: config.adminAlertEmail,
    subject: `[ALERT] Repeated 500 errors on ${endpointKey}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Repeated 500 Error Alert</h2>

        <h3 style="margin: 20px 0 8px;">Error Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Endpoint</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><code>${endpointKey}</code></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Consecutive 500s</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${count}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Latest Error</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${latestError}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Detected At</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Environment</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${config.nodeEnv || 'unknown'}</td>
          </tr>
        </table>

        <h3 style="margin: 20px 0 8px;">Last Requesting User</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
          ${userRows}
        </table>

        <p style="color: #666; font-size: 13px;">
          This alert will not repeat for this endpoint for the next ${COOLDOWN_MS / 60000} minutes.
        </p>
      </div>
    `,
  };
}

export function recordSuccess(req) {
  const key = getEndpointKey(req.method, req.route?.path || req.path);
  const entry = endpointErrors.get(key);
  if (entry) {
    entry.consecutiveCount = 0;
  }
}

export async function recordServerError(err, req) {
  const key = getEndpointKey(req.method, req.route?.path || req.originalUrl);

  let entry = endpointErrors.get(key);
  if (!entry) {
    entry = { consecutiveCount: 0, lastAlertAt: 0 };
    endpointErrors.set(key, entry);
  }

  entry.consecutiveCount += 1;

  if (
    entry.consecutiveCount >= THRESHOLD &&
    Date.now() - entry.lastAlertAt > COOLDOWN_MS
  ) {
    entry.lastAlertAt = Date.now();

    let userInfo = extractUserInfo(req);
    userInfo = await enrichWithStudentDetails(userInfo);

    const mailOptions = buildAlertEmail(
      key,
      entry.consecutiveCount,
      err.message || 'Unknown error',
      userInfo,
    );

    sendEmailWithRetry(mailOptions).catch((emailErr) => {
      console.error(
        '[ErrorAlertMonitor] Failed to send alert email:',
        emailErr.message,
      );
    });

    console.warn(
      `[ErrorAlertMonitor] Alert sent for ${key} (${entry.consecutiveCount} consecutive 500s)`,
    );
  }
}

export function successTracker(req, res, next) {
  const originalEnd = res.end;
  res.end = function (...args) {
    if (res.statusCode < 500) {
      recordSuccess(req);
    }
    originalEnd.apply(res, args);
  };
  next();
}
