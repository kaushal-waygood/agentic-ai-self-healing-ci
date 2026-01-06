import fs from 'fs';
import path from 'path';

export function logToFile(data, meta = {}, logFile = 'prompt.txt') {
  const LOG_DIR = path.resolve(process.cwd(), 'logs');
  const LOG_FILE = path.join(LOG_DIR, logFile);
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const entry = `
==============================
TIMESTAMP: ${new Date().toISOString()}
USER_ID: ${meta.userId || 'N/A'}
ENDPOINT: ${meta.endpoint || 'N/A'}
==============================
${data}

`;

    fs.appendFile(LOG_FILE, entry, () => {});
  } catch {
    // Silent failure. Logging must never break generation.
  }
}
