import fs from 'fs';
import path from 'path';

export function logToFile(data, logFile) {
  const LOG_DIR = path.resolve(process.cwd(), 'logs');
  const LOG_FILE = path.join(LOG_DIR, logFile);
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const entry = `
==============================
TIMESTAMP: ${new Date().toISOString()}
==============================
${data}

`;

    fs.appendFile(LOG_FILE, entry, () => {});
  } catch {
    console.log('Failed to log to file');
  }
}
