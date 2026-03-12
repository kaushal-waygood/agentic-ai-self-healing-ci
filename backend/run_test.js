const { execSync } = require('child_process');
try {
  execSync('npx jest tests/worker/autopilotWorker.test.js --coverage=false -t "skips student when plan limit reached"', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
